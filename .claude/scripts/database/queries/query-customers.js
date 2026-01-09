#!/usr/bin/env node

/**
 * Query Customer Database
 * Filter customers by various criteria for targeted email campaigns
 *
 * Usage:
 *   node query-customers.js --status active
 *   node query-customers.js --tier enterprise
 *   node query-customers.js --inactive-days 30
 *   node query-customers.js --status active --tier enterprise
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const filters = {};

for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    const key = args[i].substring(2);
    const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
    filters[key] = value;
    if (value !== true) i++;
  }
}

// Load customer database
const dbFile = path.join(__dirname, '../../data/customers.json');

if (!fs.existsSync(dbFile)) {
  console.error('❌ Customer database not found. Run: node .claude/scripts/database/init-customer-db.js');
  process.exit(1);
}

const customers = JSON.parse(fs.readFileSync(dbFile, 'utf8'));

// Apply filters
function applyFilters(customers, filters) {
  let result = customers;

  if (filters.status) {
    result = result.filter(c => c.status === filters.status);
  }

  if (filters.tier) {
    result = result.filter(c => c.tier === filters.tier);
  }

  if (filters['inactive-days']) {
    const days = parseInt(filters['inactive-days']);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    result = result.filter(c => {
      const lastLogin = new Date(c.last_login);
      return lastLogin < cutoffDate;
    });
  }

  if (filters['min-score']) {
    const minScore = parseInt(filters['min-score']);
    result = result.filter(c => c.usage_score >= minScore);
  }

  if (filters['max-score']) {
    const maxScore = parseInt(filters['max-score']);
    result = result.filter(c => c.usage_score <= maxScore);
  }

  if (filters.feature) {
    result = result.filter(c => c.features_used.includes(filters.feature));
  }

  return result;
}

// Main execution
const filtered = applyFilters(customers, filters);

console.log(`📊 Query Results: ${filtered.length} customer(s)\n`);

// Display filters applied
if (Object.keys(filters).length > 0) {
  console.log('Filters:');
  Object.entries(filters).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
  console.log('');
}

// Display results
if (filtered.length === 0) {
  console.log('No customers match the filters.');
} else {
  // Show as table
  console.log('Name\t\t\tEmail\t\t\t\tTier\t\tStatus\t\tScore');
  console.log('---\t\t\t-----\t\t\t\t----\t\t------\t\t-----');

  filtered.forEach(c => {
    const name = c.name.padEnd(20);
    const email = c.email.padEnd(30);
    const tier = c.tier.padEnd(10);
    const status = c.status.padEnd(10);
    const score = c.usage_score;

    console.log(`${name}\t${email}\t${tier}\t${status}\t${score}`);
  });

  // Export option
  console.log(`\n💾 Export as JSON:`);
  console.log(`node query-customers.js ${process.argv.slice(3).join(' ')} > filtered-customers.json`);

  console.log(`\n📧 Send email to these customers:`);
  const cmd = `node .claude/scripts/database/queries/query-customers.js ${process.argv.slice(3).join(' ')} > temp.json && node .claude/scripts/integrations/email/send-email.js --to-file temp.json --subject "Your Subject" --html "<p>Your message</p>"`;
  console.log(`${cmd}`);
}

// If output is requested
if (filters.output === 'json') {
  console.log(JSON.stringify(filtered, null, 2));
}
