#!/usr/bin/env node

/**
 * Outlook Account Authentication Manager
 * Manage Outlook accounts with OAuth 2.0 authentication
 *
 * Usage:
 *   node outlook-auth.js --add [--alias=name]      Add new account
 *   node outlook-auth.js --list                     List all accounts
 *   node outlook-auth.js --remove --alias=name      Remove account
 *   node outlook-auth.js --refresh --alias=name     Refresh token
 *   node outlook-auth.js --set-default --alias=name Set default account
 *   node outlook-auth.js --status                   Show account status
 */

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
const options = {};

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
📧 Outlook Account Authentication Manager

Usage:
  node outlook-auth.js --add [--alias=name]      Add new account
  node outlook-auth.js --list                     List all accounts
  node outlook-auth.js --remove --alias=name      Remove account
  node outlook-auth.js --refresh --alias=name     Refresh token
  node outlook-auth.js --set-default --alias=name Set default account
  node outlook-auth.js --status                   Show all account status
  node outlook-auth.js --help                     Show this help

Examples:
  # Add new account with alias
  node outlook-auth.js --add --alias=work

  # List all saved accounts
  node outlook-auth.js --list

  # Set default account for future operations
  node outlook-auth.js --set-default --alias=work

  # Refresh token for account (usually automatic)
  node outlook-auth.js --refresh --alias=work

  # Remove account
  node outlook-auth.js --remove --alias=work

  # Check all accounts and token status
  node outlook-auth.js --status
`);
}

/**
 * Add new account
 */
async function addAccount() {
  const oauth = new MicrosoftGraphOAuth();

  let alias = options.alias;

  if (!alias) {
    // Prompt for alias
    console.log('📝 Enter an alias for this account (e.g., work, personal):');
    alias = await promptUser('Alias: ');
  }

  if (!alias) {
    console.error('❌ Error: Account alias is required');
    process.exit(1);
  }

  // Check if alias already exists
  const registry = oauth.loadAccountRegistry();
  if (registry.accounts.some((acc) => acc.alias === alias)) {
    console.error(`❌ Error: Account with alias "${alias}" already exists`);
    process.exit(1);
  }

  try {
    const account = await oauth.startAuthFlow(alias);

    console.log(`
✅ Account added successfully!

   Alias:  ${account.alias}
   Email:  ${account.email}
   Name:   ${account.displayName}
   ID:     ${account.accountId}

Use --alias=${alias} in other commands to use this account.
`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

/**
 * List all accounts
 */
function listAccounts() {
  const oauth = new MicrosoftGraphOAuth();
  const { accounts, defaultAccount } = oauth.listAccounts();

  if (accounts.length === 0) {
    console.log('📭 No accounts configured.');
    console.log('Run: node outlook-auth.js --add');
    return;
  }

  console.log(`\n📧 Outlook Accounts (${accounts.length})\n`);

  accounts.forEach((account) => {
    const isDefault = account.id === defaultAccount ? ' ⭐ (default)' : '';
    console.log(`  ${account.alias}${isDefault}`);
    console.log(`    Email: ${account.email}`);
    console.log(`    Name:  ${account.displayName}`);
    console.log(`    ID:    ${account.id}`);
    console.log(`    Added: ${new Date(account.createdAt).toLocaleDateString()}`);
    console.log();
  });
}

/**
 * Remove account
 */
function removeAccount() {
  if (!options.alias) {
    console.error('❌ Error: --alias is required');
    console.error('Usage: node outlook-auth.js --remove --alias=work');
    process.exit(1);
  }

  const oauth = new MicrosoftGraphOAuth();
  const account = oauth.getAccountByAlias(options.alias);

  if (!account) {
    console.error(`❌ Error: Account not found: ${options.alias}`);
    process.exit(1);
  }

  try {
    oauth.revokeToken(account.id);
    console.log(`✅ Account removed: ${options.alias}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Refresh token
 */
async function refreshToken() {
  if (!options.alias) {
    console.error('❌ Error: --alias is required');
    console.error('Usage: node outlook-auth.js --refresh --alias=work');
    process.exit(1);
  }

  const oauth = new MicrosoftGraphOAuth();
  const account = oauth.getAccountByAlias(options.alias);

  if (!account) {
    console.error(`❌ Error: Account not found: ${options.alias}`);
    process.exit(1);
  }

  try {
    console.log(`🔄 Refreshing token for ${options.alias}...`);
    await oauth.refreshAccessToken(account.id);
    console.log(`✅ Token refreshed successfully for ${options.alias}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Set default account
 */
function setDefaultAccount() {
  if (!options.alias) {
    console.error('❌ Error: --alias is required');
    console.error('Usage: node outlook-auth.js --set-default --alias=work');
    process.exit(1);
  }

  const oauth = new MicrosoftGraphOAuth();
  const account = oauth.getAccountByAlias(options.alias);

  if (!account) {
    console.error(`❌ Error: Account not found: ${options.alias}`);
    process.exit(1);
  }

  try {
    oauth.setDefaultAccount(account.id);
    console.log(`✅ Default account set to: ${options.alias}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Show account status
 */
function showStatus() {
  const oauth = new MicrosoftGraphOAuth();
  const { accounts, defaultAccount } = oauth.listAccounts();

  if (accounts.length === 0) {
    console.log('📭 No accounts configured.');
    return;
  }

  console.log(`\n🔐 Outlook Account Status\n`);

  accounts.forEach((account) => {
    const isDefault = account.id === defaultAccount ? ' ⭐' : '';
    const tokenFile = path.join(
      rootDir,
      '.claude/data/outlook-tokens',
      `${account.id}.json`
    );

    let tokenStatus = '❓ Unknown';
    if (fs.existsSync(tokenFile)) {
      try {
        const tokenData = JSON.parse(fs.readFileSync(tokenFile, 'utf8'));
        const expiresAt = new Date(tokenData.expiresAt);
        const now = new Date();

        if (now > expiresAt) {
          tokenStatus = '❌ Expired';
        } else {
          const hoursUntilExpire = (expiresAt - now) / (1000 * 60 * 60);
          if (hoursUntilExpire < 1) {
            tokenStatus = '⚠️  Expiring soon';
          } else {
            tokenStatus = `✅ Valid (${Math.floor(hoursUntilExpire)}h remaining)`;
          }
        }
      } catch (error) {
        tokenStatus = '❌ Error reading token';
      }
    }

    console.log(`${account.alias}${isDefault}`);
    console.log(`  Email:  ${account.email}`);
    console.log(`  Status: ${tokenStatus}`);
    console.log();
  });
}

/**
 * Prompt user for input (simple version)
 */
function promptUser(prompt) {
  return new Promise((resolve) => {
    process.stdout.write(prompt);
    process.stdin.setEncoding('utf8');
    process.stdin.once('data', (data) => {
      resolve(data.trim());
    });
  });
}

/**
 * Main execution
 */
async function main() {
  if (options.help || Object.keys(options).length === 0) {
    showHelp();
    return;
  }

  try {
    if (options.add) {
      await addAccount();
    } else if (options.list) {
      listAccounts();
    } else if (options.remove) {
      removeAccount();
    } else if (options.refresh) {
      await refreshToken();
    } else if (options['set-default']) {
      setDefaultAccount();
    } else if (options.status) {
      showStatus();
    } else {
      console.error('❌ Error: Unknown command');
      showHelp();
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
