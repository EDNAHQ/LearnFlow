#!/usr/bin/env node

/**
 * Outlook Email Reader
 * Fetch and filter emails from Outlook inbox
 *
 * Usage:
 *   node outlook-read.js                              Read latest 10 emails
 *   node outlook-read.js --account=work              Read from specific account
 *   node outlook-read.js --count=50                   Read latest N emails
 *   node outlook-read.js --unread                     Only unread emails
 *   node outlook-read.js --from=sender@example.com   Filter by sender
 *   node outlook-read.js --subject="keyword"         Filter by subject
 *   node outlook-read.js --search="search term"      Search emails
 *   node outlook-read.js --folder="Archive"          Specific folder
 *   node outlook-read.js --format=json               Output as JSON
 *   node outlook-read.js --format=json --output=file.json  Save to file
 *   node outlook-read.js --mark-read                 Mark fetched as read
 *   node outlook-read.js --verbose                   Verbose output
 */

const https = require('https');
const path = require('path');
const fs = require('fs');

// Load environment variables
const rootDir = path.resolve(__dirname, '../../..');
require('dotenv').config({ path: path.join(rootDir, '.env') });
require('dotenv').config({ path: path.join(rootDir, '.env.local') });

// Import OAuth library
const MicrosoftGraphOAuth = require('../lib/microsoft-graph-oauth.js');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  count: 10,
  format: 'text'
};

for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    const key = args[i].substring(2);
    const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
    options[key] = value;
    if (value !== true) i++;
  }
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
📧 Outlook Email Reader

Usage:
  node outlook-read.js [options]

Options:
  --account=alias          Use specific account (default: primary account)
  --count=N                Read N latest emails (default: 10)
  --unread                 Only unread emails
  --from=email             Filter by sender email
  --subject=keyword        Filter by subject keyword
  --search=term            Search email content and subjects
  --folder=name            Read from specific folder
  --format=json|text       Output format (default: text)
  --output=file            Save to file (JSON format)
  --mark-read              Mark fetched emails as read
  --verbose                Verbose output
  --help                   Show this help

Examples:
  # Read latest 10 emails
  node outlook-read.js

  # Read 50 latest emails from work account
  node outlook-read.js --account=work --count=50

  # Get unread emails from boss
  node outlook-read.js --unread --from=boss@company.com

  # Search for emails about "invoice"
  node outlook-read.js --search="invoice" --count=20

  # Get unread emails and save as JSON
  node outlook-read.js --unread --format=json --output=unread.json
`);
}

/**
 * Make Microsoft Graph API request
 */
function makeGraphRequest(endpoint, accessToken, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'graph.microsoft.com',
      path: `/v1.0${endpoint}`,
      method: method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };

    if (options.verbose) {
      console.log(`🔍 Request: ${method} ${endpoint}`);
    }

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error.message}`));
          }
        } else {
          reject(new Error(`Graph API error ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * Build OData filter query
 */
function buildFilterQuery() {
  const filters = [];

  if (options.unread) {
    filters.push("isRead eq false");
  }

  if (options.from) {
    filters.push(`from/emailAddress/address eq '${options.from.replace(/'/g, "''")}'`);
  }

  if (options.subject) {
    filters.push(`contains(subject, '${options.subject.replace(/'/g, "''")}')`);
  }

  if (filters.length === 0) {
    return '';
  }

  return `&$filter=${filters.join(' and ')}`;
}

/**
 * Build search query
 */
function buildSearchQuery() {
  if (!options.search) {
    return '';
  }

  return `&$search="subject:${options.search} OR body:${options.search}"`;
}

/**
 * Format email for text output
 */
function formatEmailText(message) {
  const from = message.from?.emailAddress || {};
  const date = new Date(message.receivedDateTime);
  const status = message.isRead ? 'Read' : 'Unread';

  let preview = message.bodyPreview;
  if (preview.length > 200) {
    preview = preview.substring(0, 200) + '...';
  }

  return `
─────────────────────────────────────────────────────
From:    ${from.name || from.address}
To:      ${message.toRecipients?.map(r => r.emailAddress?.address).join(', ') || 'Unknown'}
Subject: ${message.subject}
Date:    ${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
Status:  ${status}

${preview}
─────────────────────────────────────────────────────`;
}

/**
 * Mark email as read
 */
async function markAsRead(messageId, accessToken) {
  try {
    await makeGraphRequest(
      `/me/messages/${messageId}`,
      accessToken,
      'PATCH'
    );
  } catch (error) {
    if (options.verbose) {
      console.warn(`⚠️  Could not mark ${messageId} as read: ${error.message}`);
    }
  }
}

/**
 * Get account ID from alias or use default
 */
function getAccountId(oauth) {
  if (options.account) {
    const account = oauth.getAccountByAlias(options.account);
    if (!account) {
      throw new Error(`Account not found: ${options.account}`);
    }
    return account.id;
  }

  const defaultAccount = oauth.getDefaultAccount();
  if (!defaultAccount) {
    throw new Error('No default account set. Use: node outlook-auth.js --add');
  }

  return defaultAccount.id;
}

/**
 * Main execution
 */
async function main() {
  if (options.help) {
    showHelp();
    return;
  }

  const oauth = new MicrosoftGraphOAuth();

  try {
    // Validate setup
    oauth.validateSetup();

    // Get account
    const accountId = getAccountId(oauth);
    const account = oauth.getAccountById(accountId);

    // Get valid access token
    const accessToken = await oauth.getValidToken(accountId);

    if (options.verbose) {
      console.log(`🔐 Using account: ${account.alias} (${account.email})\n`);
    }

    // Build request
    let endpoint = '/me/messages?$top=' + options.count;
    endpoint += '&$orderby=receivedDateTime DESC';
    endpoint += '&$select=id,subject,from,toRecipients,receivedDateTime,bodyPreview,isRead,hasAttachments,importance';

    // Add filters
    endpoint += buildFilterQuery();
    endpoint += buildSearchQuery();

    if (options.verbose) {
      console.log(`📍 Endpoint: ${endpoint}\n`);
    }

    console.log(`🔍 Fetching emails...`);

    // Fetch emails
    const response = await makeGraphRequest(endpoint, accessToken);
    const messages = response.value || [];

    console.log(`✅ Retrieved ${messages.length} email(s)\n`);

    // Process output
    if (options.format === 'json') {
      const output = {
        account: {
          alias: account.alias,
          email: account.email
        },
        count: messages.length,
        filters: {
          unread: options.unread || false,
          from: options.from || null,
          subject: options.subject || null,
          search: options.search || null
        },
        messages: messages.map((msg) => ({
          id: msg.id,
          subject: msg.subject,
          from: msg.from?.emailAddress || {},
          to: msg.toRecipients?.map(r => r.emailAddress) || [],
          receivedDateTime: msg.receivedDateTime,
          bodyPreview: msg.bodyPreview,
          isRead: msg.isRead,
          hasAttachments: msg.hasAttachments,
          importance: msg.importance
        }))
      };

      const jsonString = JSON.stringify(output, null, 2);

      if (options.output) {
        fs.writeFileSync(options.output, jsonString);
        console.log(`💾 Saved to: ${options.output}`);
      } else {
        console.log(jsonString);
      }
    } else {
      // Text format
      if (messages.length === 0) {
        console.log('📭 No emails found matching criteria');
      } else {
        console.log(`📧 Outlook Emails (${account.alias}: ${account.email})\n`);
        console.log(`Found ${messages.length} email(s)\n`);

        messages.forEach((msg, index) => {
          console.log(formatEmailText(msg));
        });

        // Mark as read if requested
        if (options['mark-read']) {
          console.log('\n🔄 Marking emails as read...');
          for (const msg of messages) {
            await markAsRead(msg.id, accessToken);
          }
          console.log('✅ Emails marked as read');
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`❌ Error: ${error.message}`);
  process.exit(1);
});
