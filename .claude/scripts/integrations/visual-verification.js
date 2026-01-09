#!/usr/bin/env node

/**
 * Visual Verification & Regression Testing
 *
 * Take screenshots and compare with baselines for visual regression detection.
 *
 * Usage:
 *   node visual-verification.js <action> <url> [options]
 *
 * Actions:
 *   capture <url>           - Capture screenshot(s) of a page
 *   compare <url>           - Compare current with baseline
 *   update-baseline <url>   - Save current as new baseline
 *   list-baselines          - Show all stored baselines
 */

const path = require('path');
const fs = require('fs');
const {
  config,
  initializeArtifactDirs,
  getArtifactPath,
  generateFilename,
  getViewports,
  logger,
  launchBrowser,
} = require('./playwright-config');

/**
 * Parse arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    showUsage();
    process.exit(0);
  }

  const action = args[0];
  const params = {};
  const positional = [];

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      params[key] = value || true;
    } else {
      positional.push(arg);
    }
  }

  return { action, positional, params };
}

/**
 * Show usage
 */
function showUsage() {
  console.log(`
Visual Verification & Regression Testing

Usage: node visual-verification.js <action> [url] [options]

Actions:
  capture <url>              Capture screenshot(s) at multiple viewports
  compare <url>              Compare current screenshot(s) with baselines
  update-baseline <url>      Save current screenshot(s) as new baseline
  list-baselines             Show all stored baseline screenshots

Options:
  --viewport=<name>          Specific viewport (mobile, tablet, desktop, wide)
  --all-viewports            Capture all viewports (default when not specified)
  --baseline-dir=<path>      Custom baseline directory
  --output=<path>            Custom output directory

Examples:
  node visual-verification.js capture https://example.com
  node visual-verification.js capture https://example.com --viewport=mobile
  node visual-verification.js compare https://example.com
  node visual-verification.js update-baseline https://example.com
  node visual-verification.js list-baselines
  `);
}

/**
 * Get baseline filename
 */
function getBaselineFilename(url, viewport) {
  const sanitized = url.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 50);
  return `baseline-${sanitized}-${viewport}.png`;
}

/**
 * Action: Capture screenshot(s)
 */
async function actionCapture(url, params) {
  const browser = await launchBrowser(params.browser || 'chromium');
  try {
    const viewports = getViewports();
    const viewportNames = params.viewport ? [params.viewport] : Object.keys(viewports);

    console.log(`\nCapturing ${viewportNames.length} viewport(s) for: ${url}\n`);

    const results = [];

    for (const name of viewportNames) {
      const viewport = viewports[name];
      if (!viewport) {
        logger.warn(`Unknown viewport: ${name}`);
        continue;
      }

      const context = await browser.newContext({ viewport });
      const page = await context.newPage();

      logger.info(`${name.padEnd(10)} (${viewport.width}x${viewport.height}) - Loading...`);
      const start = Date.now();
      await page.goto(url, { waitUntil: 'networkidle' });
      const loadTime = Date.now() - start;

      const filename = `screenshot-current-${name}.png`;
      const filepath = getArtifactPath('screenshots', filename);
      await page.screenshot({ path: filepath, fullPage: true });

      results.push({
        viewport: name,
        width: viewport.width,
        height: viewport.height,
        loadTime,
        filename,
      });

      logger.success(`${name.padEnd(10)} - ${loadTime}ms`);
      await context.close();
    }

    console.log(`\n✓ Capture complete`);
    console.log(`  URL: ${url}`);
    console.log(`  Viewports: ${viewportNames.join(', ')}`);
    console.log(`  Location: .claude/generated/playwright/screenshots/current/`);

    return results;
  } finally {
    await browser.close();
  }
}

/**
 * Action: Compare with baseline
 */
async function actionCompare(url, params) {
  const viewports = getViewports();
  const viewportNames = params.viewport ? [params.viewport] : Object.keys(viewports);

  console.log(`\nComparing ${viewportNames.length} viewport(s) with baseline...\n`);

  let differences = 0;
  let identical = 0;

  for (const name of viewportNames) {
    const baselineFilename = getBaselineFilename(url, name);
    const baselinePath = getArtifactPath('baseline', baselineFilename);
    const currentPath = getArtifactPath('screenshots', `screenshot-current-${name}.png`);

    const baselineExists = fs.existsSync(baselinePath);
    const currentExists = fs.existsSync(currentPath);

    if (!baselineExists) {
      console.log(`⚠️  ${name.padEnd(10)} - No baseline (run 'update-baseline' to create)`);
      differences++;
    } else if (!currentExists) {
      console.log(`⚠️  ${name.padEnd(10)} - No current screenshot (run 'capture' first)`);
      differences++;
    } else {
      // Compare file sizes as quick metric
      const baselineSize = fs.statSync(baselinePath).size;
      const currentSize = fs.statSync(currentPath).size;
      const diff = Math.abs(baselineSize - currentSize);
      const percentChange = ((diff / baselineSize) * 100).toFixed(1);

      if (diff === 0) {
        console.log(`✓ ${name.padEnd(10)} - Identical`);
        identical++;
      } else {
        console.log(`⚠️  ${name.padEnd(10)} - Changed (${percentChange}% file size difference)`);
        differences++;
      }
    }
  }

  console.log(`\n✓ Comparison complete`);
  console.log(`  Identical: ${identical}`);
  console.log(`  Differences: ${differences}`);

  if (differences === 0) {
    console.log('\n✓ All viewports match baseline!');
  } else {
    console.log(`\n⚠️  ${differences} viewport(s) have differences`);
    console.log('   Review visually or run: update-baseline');
  }
}

/**
 * Action: Update baseline
 */
async function actionUpdateBaseline(url, params) {
  const viewports = getViewports();
  const viewportNames = params.viewport ? [params.viewport] : Object.keys(viewports);

  console.log(`\nUpdating baseline for ${viewportNames.length} viewport(s)...\n`);

  let updated = 0;

  for (const name of viewportNames) {
    const currentPath = getArtifactPath('screenshots', `screenshot-current-${name}.png`);

    if (!fs.existsSync(currentPath)) {
      console.log(`⚠️  ${name.padEnd(10)} - No current screenshot (capture first)`);
      continue;
    }

    const baselineFilename = getBaselineFilename(url, name);
    const baselinePath = getArtifactPath('baseline', baselineFilename);

    // Ensure baseline directory exists
    const baselineDir = getArtifactPath('baseline');
    if (!fs.existsSync(baselineDir)) {
      fs.mkdirSync(baselineDir, { recursive: true });
    }

    // Copy current to baseline
    fs.copyFileSync(currentPath, baselinePath);
    console.log(`✓ ${name.padEnd(10)} - Baseline updated`);
    updated++;
  }

  console.log(`\n✓ Updated ${updated} baseline(s)`);
  console.log('  Location: .claude/generated/playwright/screenshots/baseline/');
}

/**
 * Action: List baselines
 */
async function actionListBaselines() {
  const baselineDir = getArtifactPath('baseline');

  if (!fs.existsSync(baselineDir)) {
    console.log('\nNo baselines stored yet.');
    console.log('Run: visual-verification.js capture <url>');
    console.log('Then: visual-verification.js update-baseline <url>');
    return;
  }

  const files = fs.readdirSync(baselineDir);

  if (files.length === 0) {
    console.log('\nNo baselines stored yet.');
    return;
  }

  console.log('\n✓ Stored Baselines:\n');
  console.log('Filename'.padEnd(60), 'Size'.padEnd(12), 'Modified');
  console.log('-'.repeat(85));

  files.forEach(file => {
    const filepath = path.join(baselineDir, file);
    const stats = fs.statSync(filepath);
    const size = (stats.size / 1024).toFixed(2);
    const modified = stats.mtime.toLocaleString();

    console.log(
      file.padEnd(60),
      `${size} KB`.padEnd(12),
      modified
    );
  });

  console.log(`\nTotal: ${files.length} baseline(s)`);
}

/**
 * Main
 */
async function main() {
  try {
    initializeArtifactDirs();

    const { action, positional, params } = parseArgs();
    const url = positional[0];

    switch (action) {
      case 'capture':
        if (!url) throw new Error('URL is required');
        await actionCapture(url, params);
        break;

      case 'compare':
        if (!url) throw new Error('URL is required');
        await actionCompare(url, params);
        break;

      case 'update-baseline':
        if (!url) throw new Error('URL is required');
        await actionUpdateBaseline(url, params);
        break;

      case 'list-baselines':
        await actionListBaselines();
        break;

      case '--help':
      case '-h':
      case 'help':
        showUsage();
        break;

      default:
        console.error(`Unknown action: ${action}`);
        showUsage();
        process.exit(1);
    }
  } catch (err) {
    logger.error(err.message, err);
    process.exit(1);
  }
}

main();
