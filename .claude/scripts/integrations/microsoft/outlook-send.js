#!/usr/bin/env node

/**
 * Outlook Email Sender
 * Send emails via Outlook account using Microsoft Graph API
 *
 * Usage:
 *   node outlook-send.js --to email@example.com --subject "Hello" --text "Message"
 *   node outlook-send.js --to email@example.com --subject "Hello" --html "<p>Message</p>"
 *   node outlook-send.js --account=work --to email@example.com --subject "Hello" --text "Message"
 *   node outlook-send.js --to-file recipients.json --subject "Announcement" --html-file template.html
 *   node outlook-send.js --to email@example.com --cc cc@example.com --bcc bcc@example.com --subject "Hello" --text "Message"
 *   node outlook-send.js --to email@example.com --subject "Test" --dry-run
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
  importance: 'normal'
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
📧 Outlook Email Sender

Usage:
  node outlook-send.js [options]

Required Options (one of):
  --to email              Send to single recipient
  --to-file file.json     Send to recipients in JSON file

Email Content (one of):
  --text "message"        Plain text body
  --html "<p>message</p>" HTML body
  --html-file template.html  Read HTML from file

Optional Options:
  --account=alias         Send from specific account (default: primary)
  --cc email              CC recipient(s), comma-separated
  --bcc email             BCC recipient(s), comma-separated
  --subject "text"        Email subject (required)
  --from-name "Name"      Override sender name
  --importance=low|normal|high  Email importance (default: normal)
  --read-receipt          Request read receipt
  --dry-run               Show what would be sent without sending
  --verbose               Verbose output
  --help                  Show this help

Examples:
  # Send simple text email
  node outlook-send.js --to user@example.com --subject "Hello" --text "Hi there!"

  # Send HTML email
  node outlook-send.js --to user@example.com --subject "Welcome" --html "<h1>Welcome!</h1>"

  # Send from work account with CC
  node outlook-send.js \\
    --account=work \\
    --to client@example.com \\
    --cc manager@example.com \\
    --subject "Project Update" \\
    --html-file template.html

  # Send to multiple recipients from file
  node outlook-send.js \\
    --to-file recipients.json \\
    --subject "Announcement" \\
    --html "<p>Important update</p>"

  # Dry run to preview
  node outlook-send.js \\
    --to user@example.com \\
    --subject "Test" \\
    --text "Testing" \\
    --dry-run
`);
}

/**
 * Validate required options
 */
function validateOptions() {
  const hasRecipient = options.to || options['to-file'];
  const hasContent = options.text || options.html || options['html-file'];

  if (!hasRecipient) {
    console.error('❌ Error: Must provide --to or --to-file');
    process.exit(1);
  }

  if (!hasContent) {
    console.error('❌ Error: Must provide --text, --html, or --html-file');
    process.exit(1);
  }

  if (!options.subject) {
    console.error('❌ Error: --subject is required');
    process.exit(1);
  }
}

/**
 * Get recipient list
 */
function getRecipients() {
  if (options.to) {
    // Split by comma for multiple recipients
    return options.to.split(',').map(email => ({ email: email.trim() }));
  }

  if (options['to-file']) {
    const filePath = path.resolve(options['to-file']);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);

      if (Array.isArray(data)) {
        return data.map(item => ({
          email: typeof item === 'string' ? item : item.email,
          name: typeof item === 'object' ? item.name : undefined
        }));
      } else if (typeof data === 'object' && data.email) {
        return [{ email: data.email, name: data.name }];
      } else {
        throw new Error('JSON file must contain an array or object with email field');
      }
    } catch (error) {
      console.error(`❌ Error reading file ${filePath}: ${error.message}`);
      process.exit(1);
    }
  }

  return [];
}

/**
 * Get email body content
 */
function getBodyContent() {
  let content = options.html || options.text;

  if (options['html-file']) {
    try {
      content = fs.readFileSync(path.resolve(options['html-file']), 'utf8');
    } catch (error) {
      console.error(`❌ Error reading HTML file: ${error.message}`);
      process.exit(1);
    }
  }

  if (!content) {
    console.error('❌ Error: No email content provided');
    process.exit(1);
  }

  return content;
}

/**
 * Parse comma-separated email list
 */
function parseEmailList(emailString) {
  if (!emailString) return [];

  return emailString.split(',').map(email => {
    const trimmed = email.trim();
    // Support "Name <email@example.com>" format
    const match = trimmed.match(/^(.+?)\s*<(.+?)>$|^(.+?)$/);
    if (match) {
      return {
        emailAddress: {
          address: match[2] || match[3],
          name: match[1] || match[2] || match[3]
        }
      };
    }
    return {
      emailAddress: {
        address: trimmed
      }
    };
  });
}

/**
 * Build email message object
 */
function buildMessage(recipient, bodyContent, senderEmail, senderName) {
  const contentType = options.html || options['html-file'] ? 'html' : 'text';

  const message = {
    subject: options.subject,
    body: {
      contentType: contentType,
      content: bodyContent
    },
    toRecipients: [
      {
        emailAddress: {
          address: recipient.email,
          name: recipient.name || recipient.email
        }
      }
    ],
    importance: options.importance,
    isReminderOn: false
  };

  // Add CC recipients
  if (options.cc) {
    message.ccRecipients = parseEmailList(options.cc);
  }

  // Add BCC recipients
  if (options.bcc) {
    message.bccRecipients = parseEmailList(options.bcc);
  }

  // Add read receipt request
  if (options['read-receipt']) {
    message.isDeliveryReceiptRequested = true;
  }

  // Add from field (if different from sender)
  if (options['from-name']) {
    message.from = {
      emailAddress: {
        address: senderEmail,
        name: options['from-name']
      }
    };
  }

  return message;
}

/**
 * Make Microsoft Graph API request
 */
function makeGraphRequest(endpoint, accessToken, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const requestBody = body ? JSON.stringify(body) : null;

    const options = {
      hostname: 'graph.microsoft.com',
      path: `/v1.0${endpoint}`,
      method: method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };

    if (requestBody) {
      options.headers['Content-Length'] = Buffer.byteLength(requestBody);
    }

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = data ? JSON.parse(data) : {};
            resolve(parsed);
          } catch (error) {
            resolve({});
          }
        } else {
          reject(new Error(`Graph API error ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);

    if (requestBody) {
      req.write(requestBody);
    }

    req.end();
  });
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
 * Send email
 */
async function sendEmail(recipient, accessToken, bodyContent, senderEmail, senderName) {
  const message = buildMessage(recipient, bodyContent, senderEmail, senderName);

  // Dry run mode
  if (options['dry-run']) {
    console.log(`\n✋ DRY RUN - Email would be sent as follows:\n`);
    console.log(`To:       ${recipient.email}`);
    if (options.cc) console.log(`CC:       ${options.cc}`);
    if (options.bcc) console.log(`BCC:      ${options.bcc}`);
    console.log(`Subject:  ${options.subject}`);
    console.log(`From:     ${senderName} <${senderEmail}>`);
    console.log(`Priority: ${options.importance}`);
    console.log(`\nBody (${message.body.contentType}):`);
    console.log(bodyContent.substring(0, 200) + (bodyContent.length > 200 ? '...' : ''));
    console.log();
    return true;
  }

  try {
    if (options.verbose) {
      console.log(`📤 Sending to: ${recipient.email}`);
    }

    await makeGraphRequest('/me/sendMail', accessToken, 'POST', {
      message: message,
      saveToSentItems: true
    });

    return true;
  } catch (error) {
    console.error(`❌ Failed to send to ${recipient.email}: ${error.message}`);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  if (options.help) {
    showHelp();
    return;
  }

  validateOptions();

  const oauth = new MicrosoftGraphOAuth();

  try {
    // Validate setup
    oauth.validateSetup();

    // Get account
    const accountId = getAccountId(oauth);
    const account = oauth.getAccountById(accountId);

    // Get valid access token
    const accessToken = await oauth.getValidToken(accountId);

    // Get email content
    const bodyContent = getBodyContent();

    // Get recipients
    const recipients = getRecipients();

    if (recipients.length === 0) {
      console.error('❌ Error: No recipients found');
      process.exit(1);
    }

    console.log(`📧 Outlook Email Sender\n`);
    console.log(`From:       ${account.displayName || account.alias} <${account.email}>`);
    console.log(`Recipients: ${recipients.length}`);
    console.log(`Subject:    ${options.subject}`);
    console.log();

    if (options['dry-run']) {
      console.log('🔍 DRY RUN MODE - No emails will be sent\n');
    } else {
      console.log('🚀 Sending emails...\n');
    }

    let successCount = 0;
    let failureCount = 0;

    // Send to each recipient
    for (const recipient of recipients) {
      const success = await sendEmail(
        recipient,
        accessToken,
        bodyContent,
        account.email,
        account.displayName || account.alias
      );

      if (success) {
        successCount++;
        console.log(`✅ ${recipient.email}`);
      } else {
        failureCount++;
        console.log(`❌ ${recipient.email}`);
      }
    }

    console.log(`\n📊 Results:`);
    console.log(`   Sent:   ${successCount}`);
    if (failureCount > 0) {
      console.log(`   Failed: ${failureCount}`);
    }

    if (!options['dry-run'] && failureCount > 0) {
      process.exit(1);
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
