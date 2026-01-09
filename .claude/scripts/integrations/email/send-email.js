#!/usr/bin/env node

/**
 * Mailgun Email Integration
 * Send emails from EDNA command center directly to customers
 * Always uses enterprise-dna-email.html template (can be overridden with --html-file)
 *
 * Usage:
 *   node send-email.js --to user@email.com --subject "Hello"
 *   node send-email.js --to-file customers.json --subject "Announcement" --html-file custom.html
 *   node send-email.js --to user@email.com --subject "Test" --html "<p>Custom HTML</p>"
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Load .env from project root
const rootDir = path.resolve(__dirname, '../../..');
require('dotenv').config({ path: path.join(rootDir, '.env') });
require('dotenv').config({ path: path.join(rootDir, '.env.local') });

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};

for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    const key = args[i].substring(2);
    const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
    options[key] = value;
    if (value !== true) i++;
  }
}

// Embed logo in HTML (base64 data URI)
function embedLogo(html) {
  if (!html) return html;

  // Try to find logo - prefer horizontal_white_colour, fall back to others
  const logoPaths = [
    path.resolve(__dirname, '../../branding/logos/horizontal_white_colour.png'),
    path.resolve(__dirname, '../../branding/logos/logo_long_white_colour.png'),
  ];

  for (const logoPath of logoPaths) {
    if (fs.existsSync(logoPath)) {
      try {
        const logoBuffer = fs.readFileSync(logoPath);
        const logoBase64 = logoBuffer.toString('base64');
        const logoDataUri = `data:image/png;base64,${logoBase64}`;

        // Replace {{LOGO}} placeholder
        html = html.replace(/\{\{LOGO\}\}/g, logoDataUri);

        // Replace SVG logo placeholder with img tag
        html = html.replace(
          /<svg class="logo"[\s\S]*?<\/svg>/g,
          `<img src="${logoDataUri}" alt="Enterprise DNA" style="max-width: 160px; height: auto; display: block;" />`
        );

        return html;
      } catch (error) {
        console.warn(`⚠️  Warning: Could not read logo from ${logoPath}`);
        continue;
      }
    }
  }

  return html;
}

// Load HTML from file if provided, otherwise use enterprise-dna-email.html as default
function loadHtmlFromFile() {
  const filePath = options['html-file']
    ? path.resolve(options['html-file'])
    : path.resolve(__dirname, '../../../.claude/templates/enterprise-dna-email.html');

  try {
    let html = fs.readFileSync(filePath, 'utf8');
    return embedLogo(html);
  } catch (error) {
    console.error(`❌ Error reading HTML file ${filePath}:`, error.message);
    process.exit(1);
  }
}

// Validate required options
function validateOptions() {
  const hasRecipient = options.to || options['to-file'];

  if (!hasRecipient) {
    console.error('❌ Error: Must provide --to or --to-file');
    process.exit(1);
  }

  if (!options.subject) {
    console.error('❌ Error: Must provide --subject');
    process.exit(1);
  }

  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;

  if (!apiKey || !domain) {
    console.error('❌ Error: MAILGUN_API_KEY and MAILGUN_DOMAIN not found in environment');
    console.error('   Add to .env or .env.local:');
    console.error('   MAILGUN_API_KEY=key-xxxxx');
    console.error('   MAILGUN_DOMAIN=your-domain.mailgun.org');
    process.exit(1);
  }
}

// Get recipient list
function getRecipients() {
  if (options.to) {
    return [{ email: options.to }];
  }

  if (options['to-file']) {
    const filePath = path.resolve(options['to-file']);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      console.error(`❌ Error reading file ${filePath}:`, error.message);
      process.exit(1);
    }
  }

  return [];
}

// Send email via Mailgun API
async function sendEmail(recipientEmail) {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;

  // Build form data using URLSearchParams for proper encoding
  const params = new URLSearchParams();
  params.append('from', options.from || `Sam - Enterprise DNA <noreply@${domain}>`);
  params.append('to', recipientEmail);
  params.append('subject', options.subject);

  // Get HTML content - always use template, support custom HTML or file override
  let htmlContent = options.html;
  if (!htmlContent) {
    htmlContent = loadHtmlFromFile();
  }

  if (htmlContent) {
    htmlContent = embedLogo(htmlContent);
    params.append('html', htmlContent);
  }

  if (options.text) {
    params.append('text', options.text);
  }

  // Dry run mode
  if (options['dry-run']) {
    console.log('🔍 DRY RUN - No emails sent\n');
    console.log(`To: ${recipientEmail}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`From: ${options.from || `noreply@${domain}`}`);
    if (options.text) console.log(`Text preview: ${options.text.substring(0, 100)}...`);
    if (options.html) console.log(`HTML length: ${options.html.length} chars`);
    return true;
  }

  try {
    if (options.verbose) {
      console.log(`🔍 Sending to: ${recipientEmail}`);
      console.log(`   API Key: ${apiKey.substring(0, 10)}...`);
      console.log(`   Domain: ${domain}`);
    }

    const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const responseText = await response.text();

    if (response.ok) {
      if (options.verbose) {
        console.log(`   ✅ Response: ${responseText.substring(0, 100)}`);
      }
      return true;
    } else {
      console.error(`❌ Mailgun API error: ${response.status}`);
      console.error(`   Response: ${responseText}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  validateOptions();

  const recipients = getRecipients();

  if (recipients.length === 0) {
    console.error('❌ Error: No recipients found');
    process.exit(1);
  }

  console.log(`📧 Sending emails via Mailgun...\n`);

  if (options.verbose) {
    console.log(`Subject: ${options.subject}`);
    console.log(`Recipients: ${recipients.length}`);
    console.log(`Domain: ${process.env.MAILGUN_DOMAIN}`);
    console.log('---\n');
  }

  let successCount = 0;
  let failureCount = 0;

  for (const recipient of recipients) {
    const email = typeof recipient === 'string' ? recipient : recipient.email;
    const success = await sendEmail(email);

    if (success) {
      successCount++;
      console.log(`✅ ${email}`);
    } else {
      failureCount++;
      console.log(`❌ ${email}`);
    }
  }

  console.log(`\n📊 Results:`);
  console.log(`   Sent: ${successCount}`);
  if (failureCount > 0) {
    console.log(`   Failed: ${failureCount}`);
  }

  if (failureCount > 0) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
