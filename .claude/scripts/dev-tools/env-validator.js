#!/usr/bin/env node
/**
 * Environment Validator Script
 * 
 * Validates that all required environment variables are set by comparing
 * .env against .env.example (or a custom template file).
 * 
 * Usage:
 *   node env-validator.js [options]
 * 
 * Options:
 *   --template=.env.example    Template file to compare against (default: .env.example)
 *   --env=.env                 Environment file to validate (default: .env)
 *   --strict                   Fail on any missing variable (exit code 1)
 *   --quiet                    Only show errors, not success messages
 *   --show-values              Show actual values (masked for secrets)
 *   --check-empty              Treat empty values as missing
 * 
 * Exit Codes:
 *   0 - All required variables present
 *   1 - Missing required variables (with --strict)
 *   2 - Template file not found
 * 
 * Examples:
 *   node env-validator.js
 *   node env-validator.js --strict --check-empty
 *   node env-validator.js --template=.env.production.example
 */

const fs = require('fs');
const path = require('path');

// Parse arguments
function parseArgs(args) {
  const result = {
    template: '.env.example',
    env: '.env',
    strict: false,
    quiet: false,
    showValues: false,
    checkEmpty: false,
  };

  for (const arg of args) {
    if (arg.startsWith('--template=')) {
      result.template = arg.split('=')[1];
    } else if (arg.startsWith('--env=')) {
      result.env = arg.split('=')[1];
    } else if (arg === '--strict') {
      result.strict = true;
    } else if (arg === '--quiet') {
      result.quiet = true;
    } else if (arg === '--show-values') {
      result.showValues = true;
    } else if (arg === '--check-empty') {
      result.checkEmpty = true;
    }
  }

  return result;
}

// Parse .env file into key-value pairs
function parseEnvFile(filePath) {
  const vars = new Map();
  
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    // Parse KEY=value
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      // Remove quotes if present
      const cleanValue = value.replace(/^["'](.*)["']$/, '$1');
      vars.set(key, cleanValue);
    }
  }

  return vars;
}

// Extract required variables from template
function extractRequiredVars(templatePath) {
  const vars = [];
  
  if (!fs.existsSync(templatePath)) {
    return null;
  }

  const content = fs.readFileSync(templatePath, 'utf8');
  const lines = content.split('\n');

  let currentComment = '';

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Track comments for context
    if (trimmed.startsWith('#')) {
      currentComment = trimmed.slice(1).trim();
      continue;
    }

    if (!trimmed) {
      currentComment = '';
      continue;
    }

    // Parse KEY=value or KEY=
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (match) {
      const [, key, exampleValue] = match;
      const isOptional = currentComment.toLowerCase().includes('optional');
      const isSecret = /key|secret|token|password|credential/i.test(key);
      
      vars.push({
        key,
        exampleValue: exampleValue.replace(/^["'](.*)["']$/, '$1'),
        description: currentComment,
        isOptional,
        isSecret,
      });
      
      currentComment = '';
    }
  }

  return vars;
}

// Mask sensitive values
function maskValue(value, isSecret) {
  if (!value) return '(empty)';
  if (isSecret) {
    if (value.length <= 8) return '****';
    return value.slice(0, 4) + '****' + value.slice(-4);
  }
  if (value.length > 50) {
    return value.slice(0, 47) + '...';
  }
  return value;
}

// Detect placeholder values
function isPlaceholder(value) {
  const placeholders = [
    'your_',
    'your-',
    'xxx',
    'placeholder',
    'changeme',
    'replace',
    'todo',
    'fixme',
    '<',
    '>',
    'example',
  ];
  
  const lower = value.toLowerCase();
  return placeholders.some(p => lower.includes(p));
}

// Main validation
function validate(options) {
  const { template, env, strict, quiet, showValues, checkEmpty } = options;
  
  // Load template
  const requiredVars = extractRequiredVars(template);
  if (!requiredVars) {
    console.error(`❌ Template file not found: ${template}`);
    console.error(`   Create a ${template} file with required variables.`);
    return 2;
  }

  // Load env
  const envVars = parseEnvFile(env);
  if (!envVars) {
    console.error(`❌ Environment file not found: ${env}`);
    console.error(`   Copy ${template} to ${env} and fill in values.`);
    return 1;
  }

  // Validate
  const results = {
    valid: [],
    missing: [],
    empty: [],
    placeholder: [],
    optional: [],
  };

  for (const varInfo of requiredVars) {
    const { key, isOptional, isSecret, description } = varInfo;
    const value = envVars.get(key);
    const hasValue = value !== undefined;
    const isEmpty = hasValue && value === '';
    const hasPlaceholder = hasValue && !isEmpty && isPlaceholder(value);

    if (isOptional) {
      results.optional.push({ ...varInfo, value, hasValue, isEmpty });
    } else if (!hasValue) {
      results.missing.push(varInfo);
    } else if (checkEmpty && isEmpty) {
      results.empty.push(varInfo);
    } else if (hasPlaceholder) {
      results.placeholder.push({ ...varInfo, value });
    } else {
      results.valid.push({ ...varInfo, value, isSecret });
    }
  }

  // Report results
  const hasIssues = results.missing.length > 0 || 
                    results.empty.length > 0 || 
                    results.placeholder.length > 0;

  if (!quiet) {
    console.log('\n📋 Environment Validation Report\n');
    console.log(`   Template: ${template}`);
    console.log(`   Env File: ${env}`);
    console.log('');
  }

  // Valid variables
  if (!quiet && results.valid.length > 0) {
    console.log(`✅ Valid (${results.valid.length}):`);
    for (const v of results.valid) {
      if (showValues) {
        console.log(`   ${v.key} = ${maskValue(v.value, v.isSecret)}`);
      } else {
        console.log(`   ${v.key}`);
      }
    }
    console.log('');
  }

  // Missing variables
  if (results.missing.length > 0) {
    console.log(`❌ Missing (${results.missing.length}):`);
    for (const v of results.missing) {
      console.log(`   ${v.key}`);
      if (v.description) {
        console.log(`      └─ ${v.description}`);
      }
    }
    console.log('');
  }

  // Empty variables
  if (results.empty.length > 0) {
    console.log(`⚠️  Empty (${results.empty.length}):`);
    for (const v of results.empty) {
      console.log(`   ${v.key}`);
      if (v.description) {
        console.log(`      └─ ${v.description}`);
      }
    }
    console.log('');
  }

  // Placeholder values
  if (results.placeholder.length > 0) {
    console.log(`⚠️  Placeholder Values (${results.placeholder.length}):`);
    for (const v of results.placeholder) {
      console.log(`   ${v.key} = ${maskValue(v.value, v.isSecret)}`);
      console.log(`      └─ Looks like a placeholder, please replace`);
    }
    console.log('');
  }

  // Optional (skipped)
  if (!quiet && results.optional.length > 0) {
    const setOptional = results.optional.filter(v => v.hasValue && !v.isEmpty);
    const unsetOptional = results.optional.filter(v => !v.hasValue || v.isEmpty);
    
    if (setOptional.length > 0) {
      console.log(`ℹ️  Optional - Set (${setOptional.length}):`);
      for (const v of setOptional) {
        console.log(`   ${v.key}`);
      }
      console.log('');
    }
    
    if (unsetOptional.length > 0) {
      console.log(`ℹ️  Optional - Not Set (${unsetOptional.length}):`);
      for (const v of unsetOptional) {
        console.log(`   ${v.key}`);
      }
      console.log('');
    }
  }

  // Summary
  const total = requiredVars.length;
  const required = requiredVars.filter(v => !v.isOptional).length;
  const validCount = results.valid.length;

  console.log('─'.repeat(50));
  
  if (!hasIssues) {
    console.log(`\n✅ All ${required} required variables are set!\n`);
    return 0;
  } else {
    const issueCount = results.missing.length + results.empty.length + results.placeholder.length;
    console.log(`\n❌ ${issueCount} issue(s) found with ${required} required variables\n`);
    
    if (results.missing.length > 0) {
      console.log('💡 To fix missing variables:');
      console.log(`   1. Open ${env}`);
      console.log(`   2. Add the missing variables with appropriate values`);
      console.log('');
    }
    
    return strict ? 1 : 0;
  }
}

// Main
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Environment Validator

Validates .env against .env.example to ensure all required variables are set.

Usage:
  node env-validator.js [options]

Options:
  --template=FILE    Template file (default: .env.example)
  --env=FILE         Env file to validate (default: .env)
  --strict           Exit with code 1 if any issues found
  --quiet            Only show errors
  --show-values      Show values (masked for secrets)
  --check-empty      Treat empty values as missing

Examples:
  node env-validator.js
  node env-validator.js --strict
  node env-validator.js --template=.env.production.example --env=.env.production
`);
    return;
  }

  const options = parseArgs(args);
  const exitCode = validate(options);
  process.exit(exitCode);
}

main();

