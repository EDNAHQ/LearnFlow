#!/usr/bin/env node

/**
 * Test Playwright Setup
 *
 * Verifies that Playwright is properly installed and configured.
 * Tests basic launch/close and artifact directory setup.
 */

const {
  config,
  initializeArtifactDirs,
  getArtifactPath,
  generateFilename,
  logger,
  launchBrowser,
} = require('./playwright-config');

async function runTests() {
  logger.info('🧪 Testing Playwright Setup\n');

  try {
    // Test 1: Initialize artifact directories
    logger.info('Test 1: Initializing artifact directories...');
    initializeArtifactDirs();
    logger.success('Artifact directories initialized');
    logger.debug('Base directory:', config.artifacts.baseDir);

    // Test 2: Get artifact paths
    logger.info('\nTest 2: Testing artifact path generation...');
    const screenshotPath = getArtifactPath('screenshots', 'test.png');
    logger.success(`Screenshot path: ${screenshotPath}`);

    // Test 3: Generate filename
    logger.info('\nTest 3: Testing filename generation...');
    const filename = generateFilename('test', '.png');
    logger.success(`Generated filename: ${filename}`);

    // Test 4: Launch browser
    logger.info('\nTest 4: Launching Chromium browser...');
    const browser = await launchBrowser('chromium');

    // Test 5: Create page and navigate
    logger.info('\nTest 5: Creating page and navigating to example.com...');
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('https://example.com', { waitUntil: 'networkidle' });
    logger.success('Successfully navigated to https://example.com');

    // Test 6: Take screenshot
    logger.info('\nTest 6: Taking screenshot...');
    const screenshotFilename = generateFilename('test', '.png');
    const screenshotFullPath = getArtifactPath('screenshots', 'current/' + screenshotFilename);
    await page.screenshot({ path: screenshotFullPath, fullPage: true });
    logger.success(`Screenshot saved to: ${screenshotFilename}`);

    // Test 7: Extract page info
    logger.info('\nTest 7: Extracting page information...');
    const title = await page.title();
    const url = page.url();
    logger.success(`Page title: ${title}`);
    logger.success(`Page URL: ${url}`);

    // Cleanup
    logger.info('\nTest 8: Cleanup...');
    await context.close();
    await browser.close();
    logger.success('Browser closed successfully');

    // Summary
    console.log('\n' + '='.repeat(60));
    logger.success('✓ All Playwright setup tests passed!');
    console.log('='.repeat(60));
    console.log('\nPlaywright is ready to use. Configuration:');
    console.log(`- Headless mode: ${config.browser.headless}`);
    console.log(`- Timeout: ${config.browser.timeout}ms`);
    console.log(`- Artifact directory: ${config.artifacts.baseDir}`);
    console.log('\nYou can now use Playwright in your scripts!');

  } catch (err) {
    console.error('\nFull error:');
    console.error(err);
    process.exit(1);
  }
}

runTests();
