#!/usr/bin/env node

/**
 * Initialize Customer Database
 * Creates a simple JSON-based customer database for email targeting
 */

const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname, '../../data');
const dbFile = path.join(dbDir, 'customers.json');

// Create data directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`✅ Created directory: ${dbDir}`);
}

// Sample customer data
const sampleCustomers = [
  {
    id: 1,
    email: 'john@company1.com',
    name: 'John Smith',
    company: 'Acme Corp',
    tier: 'enterprise',
    signup_date: '2024-06-01',
    last_login: '2026-01-02',
    last_email_sent: null,
    status: 'active',
    features_used: ['automation', 'integrations', 'ai-assistant'],
    usage_score: 85,
    notes: 'Very engaged customer, frequent API user'
  },
  {
    id: 2,
    email: 'jane@company2.com',
    name: 'Jane Doe',
    company: 'Tech Inc',
    tier: 'pro',
    signup_date: '2025-03-15',
    last_login: '2025-12-20',
    last_email_sent: null,
    status: 'active',
    features_used: ['automation'],
    usage_score: 45,
    notes: 'Signed up 10 months ago, minimal activity'
  },
  {
    id: 3,
    email: 'bob@company3.com',
    name: 'Bob Wilson',
    company: 'StartUp Co',
    tier: 'starter',
    signup_date: '2025-11-01',
    last_login: '2025-12-15',
    last_email_sent: null,
    status: 'active',
    features_used: ['ai-assistant'],
    usage_score: 30,
    notes: 'New customer, still in onboarding'
  },
  {
    id: 4,
    email: 'alice@company4.com',
    name: 'Alice Johnson',
    company: 'Enterprise Inc',
    tier: 'enterprise',
    signup_date: '2024-01-10',
    last_login: '2025-10-01',
    last_email_sent: null,
    status: 'inactive',
    features_used: ['automation', 'integrations'],
    usage_score: 10,
    notes: 'Inactive for 3 months, potential churn risk'
  }
];

if (fs.existsSync(dbFile)) {
  console.log(`ℹ️  Database already exists at: ${dbFile}`);
  console.log(`💡 To reset, delete the file and run this script again\n`);

  // Show current database
  const current = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
  console.log(`Current customers (${current.length}):`);
  current.forEach(c => {
    console.log(`  - ${c.name} (${c.email}) - ${c.status}`);
  });
} else {
  // Create new database
  fs.writeFileSync(dbFile, JSON.stringify(sampleCustomers, null, 2), 'utf8');
  console.log(`✅ Created customer database at: ${dbFile}`);
  console.log(`\n📋 Sample customers added:`);
  sampleCustomers.forEach(c => {
    console.log(`  - ${c.name} (${c.email}) - Tier: ${c.tier}`);
  });
  console.log(`\n💡 Tips:`);
  console.log(`  1. Edit ${dbFile} to add your real customer data`);
  console.log(`  2. Use queries.js to filter customers by status, tier, etc.`);
  console.log(`  3. Export filtered lists for targeted email campaigns`);
}

console.log(`\n📚 Next steps:`);
console.log(`  1. Create query script: node .claude/scripts/database/queries/query-customers.js`);
console.log(`  2. Send test email: node .claude/scripts/integrations/email/send-email.js --to your@email.com --subject "Test" --html "<p>Hi</p>"`);
console.log(`  3. Send to segment: node .claude/scripts/database/queries/query-customers.js --status active | node .claude/scripts/integrations/email/send-email.js --to-file - --subject "Hello active users"`);
