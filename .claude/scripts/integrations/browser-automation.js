#!/usr/bin/env node

/**
 * Browser Automation CLI
 *
 * Command-line interface for common browser automation tasks.
 * Supports: navigate, click, type, wait, screenshot, extract, and more.
 *
 * Usage:
 *   node browser-automation.js <action> [options]
 *
 * Examples:
 *   node browser-automation.js navigate https://example.com
 *   node browser-automation.js screenshot https://example.com --viewport=desktop
 *   node browser-automation.js click https://example.com "#submit-btn"
 *   node browser-automation.js extract https://example.com ".product-title" --format=json
 */

const {
  config,
  initializeArtifactDirs,
  getArtifactPath,
  generateFilename,
  getViewports,
  waitConditions,
  logger,
  launchBrowser,
} = require('./playwright-config');

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    showUsage();
    process.exit(0);
  }

  const action = args[0];
  const params = {};

  // Simple key=value and --flag parsing
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      params[key] = value || true;
    } else {
      // Positional arguments
      if (!params.positional) params.positional = [];
      params.positional.push(arg);
    }
  }

  return { action, params };
}

/**
 * Show usage information
 */
function showUsage() {
  console.log(`
Browser Automation CLI

Usage: node browser-automation.js <action> [options]

Actions:
  navigate <url>                 Navigate to URL and show status
  screenshot <url>               Take screenshot of page
  click <url> <selector>        Click element on page
  type <url> <selector> <text>  Type text in input
  wait <url> <selector>         Wait for element to appear
  extract <url> <selector>      Extract text from elements
  test-flow <file>              Execute multi-step workflow from JSON file

Options:
  --viewport=<name>              Use viewport size (mobile, tablet, desktop, wide)
  --wait=<ms>                    Wait time in milliseconds
  --format=<format>              Output format (json, markdown, text)
  --headless=<bool>              Run in headless mode (true/false)
  --timeout=<ms>                 Navigation timeout
  --browser=<name>               Browser to use (chromium, firefox, webkit)
  --output=<path>                Save output to file

Examples:
  node browser-automation.js navigate https://google.com
  node browser-automation.js screenshot https://example.com --viewport=mobile
  node browser-automation.js click https://example.com "button[type=submit]"
  node browser-automation.js extract https://example.com ".product-title" --format=json
  node browser-automation.js type https://google.com "input[name=q]" "playwright"
  `);
}

/**
 * Action: Navigate to URL
 */
async function actionNavigate(url, params) {
  const browser = await launchBrowser(params.browser || 'chromium');
  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    logger.info(`Navigating to ${url}...`);
    const response = await page.goto(url, { waitUntil: 'networkidle' });

    const title = await page.title();
    const status = response?.status();

    console.log(`\n✓ Navigation successful`);
    console.log(`  URL: ${page.url()}`);
    console.log(`  Title: ${title}`);
    console.log(`  Status: ${status}`);

    await context.close();
  } finally {
    await browser.close();
  }
}

/**
 * Action: Take screenshot
 */
async function actionScreenshot(url, params) {
  const browser = await launchBrowser(params.browser || 'chromium');
  try {
    const viewportName = params.viewport || 'desktop';
    const viewports = getViewports();
    const viewport = viewports[viewportName];

    if (!viewport) {
      throw new Error(`Unknown viewport: ${viewportName}. Options: ${Object.keys(viewports).join(', ')}`);
    }

    const context = await browser.newContext({ viewport });
    const page = await context.newPage();

    logger.info(`Navigating to ${url} at ${viewportName} (${viewport.width}x${viewport.height})...`);
    await page.goto(url, { waitUntil: 'networkidle' });

    const filename = generateFilename(`screenshot-${viewportName}`, '.png');
    const filepath = getArtifactPath('screenshots', filename);

    logger.info(`Taking screenshot...`);
    await page.screenshot({ path: filepath, fullPage: true });

    console.log(`\n✓ Screenshot saved`);
    console.log(`  File: ${filename}`);
    console.log(`  Path: ${filepath}`);
    console.log(`  Viewport: ${viewportName} (${viewport.width}x${viewport.height})`);

    await context.close();
  } finally {
    await browser.close();
  }
}

/**
 * Action: Click element
 */
async function actionClick(url, selector, params) {
  if (!selector) {
    throw new Error('Selector is required: node browser-automation.js click <url> <selector>');
  }

  const browser = await launchBrowser(params.browser || 'chromium');
  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    logger.info(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle' });

    logger.info(`Waiting for element: ${selector}...`);
    await page.waitForSelector(selector, { timeout: params.timeout || config.browser.timeout });

    logger.info(`Clicking element...`);
    await page.click(selector);

    console.log(`\n✓ Click successful`);
    console.log(`  Selector: ${selector}`);

    await context.close();
  } finally {
    await browser.close();
  }
}

/**
 * Action: Type text
 */
async function actionType(url, selector, text, params) {
  if (!selector || !text) {
    throw new Error('Selector and text are required: node browser-automation.js type <url> <selector> <text>');
  }

  const browser = await launchBrowser(params.browser || 'chromium');
  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    logger.info(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle' });

    logger.info(`Waiting for element: ${selector}...`);
    await page.waitForSelector(selector, { timeout: params.timeout || config.browser.timeout });

    logger.info(`Typing text: "${text}"...`);
    await page.fill(selector, text);

    console.log(`\n✓ Type successful`);
    console.log(`  Selector: ${selector}`);
    console.log(`  Text: "${text}"`);

    await context.close();
  } finally {
    await browser.close();
  }
}

/**
 * Action: Wait for element
 */
async function actionWait(url, selector, params) {
  if (!selector) {
    throw new Error('Selector is required: node browser-automation.js wait <url> <selector>');
  }

  const browser = await launchBrowser(params.browser || 'chromium');
  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    logger.info(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle' });

    logger.info(`Waiting for element: ${selector}...`);
    const startTime = Date.now();
    await page.waitForSelector(selector, { timeout: params.wait || params.timeout || config.browser.timeout });
    const elapsed = Date.now() - startTime;

    console.log(`\n✓ Element appeared`);
    console.log(`  Selector: ${selector}`);
    console.log(`  Elapsed: ${elapsed}ms`);

    await context.close();
  } finally {
    await browser.close();
  }
}

/**
 * Action: Extract data
 */
async function actionExtract(url, selector, params) {
  if (!selector) {
    throw new Error('Selector is required: node browser-automation.js extract <url> <selector>');
  }

  const browser = await launchBrowser(params.browser || 'chromium');
  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    logger.info(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle' });

    logger.info(`Extracting data from: ${selector}...`);
    const elements = await page.$$(selector);
    const data = await Promise.all(
      elements.map(async (el) => ({
        text: await el.textContent(),
        html: await el.innerHTML(),
        className: await el.getAttribute('class'),
        id: await el.getAttribute('id'),
      }))
    );

    const format = params.format || 'json';
    let output;

    if (format === 'json') {
      output = JSON.stringify(data, null, 2);
    } else if (format === 'markdown') {
      output = data.map((item, i) => `**${i + 1}. ${item.text?.trim() || '(empty)'}`).join('\n');
    } else {
      output = data.map((item) => item.text?.trim() || '(empty)').join('\n');
    }

    console.log(`\n✓ Extraction complete`);
    console.log(`  Selector: ${selector}`);
    console.log(`  Found: ${data.length} elements`);
    console.log(`\nData:\n`);
    console.log(output);

    if (params.output) {
      const fs = require('fs');
      fs.writeFileSync(params.output, output);
      console.log(`\n✓ Saved to: ${params.output}`);
    }

    await context.close();
  } finally {
    await browser.close();
  }
}

/**
 * Main entry point
 */
async function main() {
  try {
    initializeArtifactDirs();

    const { action, params } = parseArgs();
    const url = params.positional?.[0];

    switch (action) {
      case 'navigate':
        if (!url) throw new Error('URL is required');
        await actionNavigate(url, params);
        break;

      case 'screenshot':
        if (!url) throw new Error('URL is required');
        await actionScreenshot(url, params);
        break;

      case 'click':
        if (!url) throw new Error('URL is required');
        await actionClick(url, params.positional?.[1], params);
        break;

      case 'type':
        if (!url) throw new Error('URL is required');
        await actionType(url, params.positional?.[1], params.positional?.[2], params);
        break;

      case 'wait':
        if (!url) throw new Error('URL is required');
        await actionWait(url, params.positional?.[1], params);
        break;

      case 'extract':
        if (!url) throw new Error('URL is required');
        await actionExtract(url, params.positional?.[1], params);
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
