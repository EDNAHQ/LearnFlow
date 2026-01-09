#!/usr/bin/env node
/**
 * Browser Screenshot Utility for Visual Feedback Loop
 * 
 * Usage:
 *   node screenshot.js <url> [output] [options]
 * 
 * Examples:
 *   node screenshot.js http://localhost:3000
 *   node screenshot.js http://localhost:3000 my-screenshot.png
 *   node screenshot.js http://localhost:3000 screenshot.png --mobile
 *   node screenshot.js http://localhost:3000 screenshot.png --full
 *   node screenshot.js http://localhost:3000 --all-viewports
 * 
 * Options:
 *   --mobile      Use mobile viewport (375x667)
 *   --tablet      Use tablet viewport (768x1024)
 *   --desktop     Use desktop viewport (1280x720) [default]
 *   --wide        Use wide viewport (1920x1080)
 *   --full        Capture full page (scroll)
 *   --all-viewports  Capture all viewport sizes
 *   --wait=N      Wait N milliseconds after load
 *   --selector=X  Wait for selector X before capture
 */

const { chromium } = require('playwright');
const path = require('path');

const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 720 },
  wide: { width: 1920, height: 1080 },
};

async function captureScreenshot(url, outputPath, options = {}) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const viewport = options.viewport || VIEWPORTS.desktop;
  await page.setViewportSize(viewport);
  
  console.log(`📸 Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  
  if (options.waitForSelector) {
    console.log(`⏳ Waiting for selector: ${options.waitForSelector}`);
    await page.waitForSelector(options.waitForSelector, { timeout: 10000 });
  }
  
  if (options.delay) {
    console.log(`⏳ Waiting ${options.delay}ms...`);
    await page.waitForTimeout(options.delay);
  }
  
  await page.screenshot({ 
    path: outputPath, 
    fullPage: options.fullPage || false 
  });
  
  await browser.close();
  console.log(`✅ Screenshot saved: ${outputPath}`);
  return outputPath;
}

async function captureAllViewports(url, baseName) {
  const results = [];
  
  for (const [name, viewport] of Object.entries(VIEWPORTS)) {
    const outputPath = baseName.replace('.png', `-${name}.png`);
    await captureScreenshot(url, outputPath, { viewport });
    results.push({ name, path: outputPath });
  }
  
  console.log('\n📱 All viewports captured:');
  results.forEach(r => console.log(`   ${r.name}: ${r.path}`));
  return results;
}

// Parse CLI arguments
function parseArgs(args) {
  const result = {
    url: 'http://localhost:3000',
    output: 'screenshot.png',
    options: {}
  };
  
  for (const arg of args) {
    if (arg.startsWith('http://') || arg.startsWith('https://')) {
      result.url = arg;
    } else if (arg.endsWith('.png') || arg.endsWith('.jpg')) {
      result.output = arg;
    } else if (arg === '--mobile') {
      result.options.viewport = VIEWPORTS.mobile;
    } else if (arg === '--tablet') {
      result.options.viewport = VIEWPORTS.tablet;
    } else if (arg === '--desktop') {
      result.options.viewport = VIEWPORTS.desktop;
    } else if (arg === '--wide') {
      result.options.viewport = VIEWPORTS.wide;
    } else if (arg === '--full') {
      result.options.fullPage = true;
    } else if (arg === '--all-viewports') {
      result.allViewports = true;
    } else if (arg.startsWith('--wait=')) {
      result.options.delay = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--selector=')) {
      result.options.waitForSelector = arg.split('=')[1];
    }
  }
  
  return result;
}

// Main
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Browser Screenshot Utility

Usage:
  node screenshot.js <url> [output.png] [options]

Options:
  --mobile         375x667 viewport
  --tablet         768x1024 viewport
  --desktop        1280x720 viewport (default)
  --wide           1920x1080 viewport
  --full           Capture full scrollable page
  --all-viewports  Capture all viewport sizes
  --wait=N         Wait N ms after page load
  --selector=X     Wait for CSS selector before capture

Examples:
  node screenshot.js http://localhost:3000
  node screenshot.js http://localhost:5173/login login.png --mobile
  node screenshot.js http://localhost:3000 --all-viewports
`);
    return;
  }
  
  const { url, output, options, allViewports } = parseArgs(args);
  
  try {
    if (allViewports) {
      await captureAllViewports(url, output);
    } else {
      await captureScreenshot(url, output, options);
    }
  } catch (error) {
    console.error('❌ Screenshot failed:', error.message);
    
    if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
      console.error('\n💡 Is your dev server running? Try: npm run dev');
    }
    if (error.message.includes('browserType.launch')) {
      console.error('\n💡 Playwright not installed? Try: npx playwright install chromium');
    }
    
    process.exit(1);
  }
}

main();

