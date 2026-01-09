#!/usr/bin/env node
/**
 * Setup script for Visual Feedback Loop
 * 
 * Run this in any project to set up screenshot capabilities:
 *   node setup-visual-feedback.js
 * 
 * What it does:
 *   1. Checks for package.json (needs to be in a Node project)
 *   2. Installs playwright as dev dependency
 *   3. Installs Chromium browser
 *   4. Copies screenshot.js to project's scripts folder
 *   5. Verifies everything works
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const SCRIPT_DIR = __dirname;
const PROJECT_DIR = process.cwd();

function log(msg) {
  console.log(`\n🔧 ${msg}`);
}

function success(msg) {
  console.log(`✅ ${msg}`);
}

function error(msg) {
  console.error(`❌ ${msg}`);
}

function run(cmd, options = {}) {
  console.log(`   $ ${cmd}`);
  try {
    execSync(cmd, { 
      stdio: 'inherit', 
      cwd: PROJECT_DIR,
      ...options 
    });
    return true;
  } catch (e) {
    return false;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  Visual Feedback Loop Setup');
  console.log('═══════════════════════════════════════════════');
  console.log(`  Project: ${PROJECT_DIR}`);

  // Check for package.json
  const packageJsonPath = path.join(PROJECT_DIR, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    error('No package.json found. This needs to be run in a Node.js project.');
    console.log('\n   Run "npm init -y" first to create a package.json');
    process.exit(1);
  }
  success('Found package.json');

  // Check if playwright is already installed
  log('Checking for Playwright...');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const hasPlaywright = 
    (packageJson.devDependencies && packageJson.devDependencies.playwright) ||
    (packageJson.dependencies && packageJson.dependencies.playwright);

  if (hasPlaywright) {
    success('Playwright already in package.json');
  } else {
    log('Installing Playwright...');
    if (!run('npm install -D playwright')) {
      error('Failed to install Playwright');
      process.exit(1);
    }
    success('Playwright installed');
  }

  // Install Chromium browser
  log('Installing Chromium browser (this may take a minute)...');
  if (!run('npx playwright install chromium')) {
    error('Failed to install Chromium');
    console.log('\n   Try running manually: npx playwright install chromium');
    process.exit(1);
  }
  success('Chromium browser installed');

  // Create scripts directory if needed
  const scriptsDir = path.join(PROJECT_DIR, 'scripts');
  if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true });
    success('Created scripts/ directory');
  }

  // Copy screenshot.js
  log('Copying screenshot script...');
  const sourceScript = path.join(SCRIPT_DIR, 'screenshot.js');
  const destScript = path.join(scriptsDir, 'screenshot.js');
  
  if (fs.existsSync(sourceScript)) {
    fs.copyFileSync(sourceScript, destScript);
    success(`Copied to scripts/screenshot.js`);
  } else {
    error(`Source script not found at ${sourceScript}`);
    console.log('   You may need to copy screenshot.js manually');
  }

  // Verify installation
  log('Verifying installation...');
  try {
    require.resolve('playwright', { paths: [PROJECT_DIR] });
    success('Playwright is accessible');
  } catch (e) {
    error('Playwright not accessible - try running npm install again');
  }

  // Done!
  console.log('\n═══════════════════════════════════════════════');
  console.log('  ✅ Setup Complete!');
  console.log('═══════════════════════════════════════════════');
  console.log(`
  Usage:
    1. Start your dev server:
       npm run dev

    2. Capture screenshots:
       node scripts/screenshot.js http://localhost:3000
       node scripts/screenshot.js http://localhost:3000/page page.png
       node scripts/screenshot.js http://localhost:3000 --mobile
       node scripts/screenshot.js http://localhost:3000 --all-viewports

  Options:
    --mobile      Mobile viewport (375x667)
    --tablet      Tablet viewport (768x1024)  
    --desktop     Desktop viewport (1280x720)
    --wide        Wide viewport (1920x1080)
    --full        Full page screenshot
    --all-viewports  All sizes at once
`);
}

main().catch(console.error);

