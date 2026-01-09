/**
 * Playwright Configuration & Utilities
 *
 * Centralized configuration for Playwright across all scripts.
 * Handles environment variables, browser setup, waiting conditions, and artifact storage.
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

/**
 * Configuration object with sensible defaults
 */
const config = {
  // Browser configuration
  browser: {
    headless: process.env.PLAYWRIGHT_HEADLESS !== 'false',
    slowMo: parseInt(process.env.PLAYWRIGHT_SLOW_MO || '0'),
    timeout: parseInt(process.env.PLAYWRIGHT_TIMEOUT || '30000'),
    retries: parseInt(process.env.PLAYWRIGHT_RETRIES || '1'),
  },

  // Artifact storage
  artifacts: {
    baseDir: process.env.PLAYWRIGHT_ARTIFACTS_DIR || path.join(process.cwd(), '.claude', 'generated', 'playwright'),
    paths: {
      screenshotBaseline: 'screenshots/baseline',
      screenshotCurrent: 'screenshots/current',
      videos: 'videos',
      traces: 'traces',
      testResults: 'test-results',
      harFiles: 'har-files',
      artifacts: 'artifacts',
    },
  },

  // Wait conditions (common waits)
  waits: {
    navigationTimeout: 30000,
    selectorTimeout: 10000,
    networkIdleTimeout: 30000,
  },

  // Performance & metrics
  performance: {
    collectMetrics: process.env.PLAYWRIGHT_COLLECT_METRICS === 'true',
    recordTrace: process.env.PLAYWRIGHT_RECORD_TRACE === 'true',
    recordVideo: process.env.PLAYWRIGHT_RECORD_VIDEO === 'true',
  },

  // Debug settings
  debug: {
    verbose: process.env.PLAYWRIGHT_DEBUG === 'true',
    logRequests: process.env.PLAYWRIGHT_LOG_REQUESTS === 'true',
  },
};

/**
 * Initialize artifact directories
 */
function initializeArtifactDirs() {
  const dirs = [
    config.artifacts.baseDir,
    path.join(config.artifacts.baseDir, config.artifacts.paths.screenshotBaseline),
    path.join(config.artifacts.baseDir, config.artifacts.paths.screenshotCurrent),
    path.join(config.artifacts.baseDir, config.artifacts.paths.videos),
    path.join(config.artifacts.baseDir, config.artifacts.paths.traces),
    path.join(config.artifacts.baseDir, config.artifacts.paths.testResults),
    path.join(config.artifacts.baseDir, config.artifacts.paths.harFiles),
    path.join(config.artifacts.baseDir, config.artifacts.paths.artifacts),
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  if (config.debug.verbose) {
    console.log(`✓ Artifact directories initialized at: ${config.artifacts.baseDir}`);
  }
}

/**
 * Get full path for artifact storage
 */
function getArtifactPath(type, filename = '') {
  const pathType = `${type.charAt(0).toUpperCase() + type.slice(1)}`;
  const typeKey = type === 'screenshots' ? 'screenshotCurrent' : type;

  let artifactPath;
  if (type === 'baseline') {
    artifactPath = config.artifacts.paths.screenshotBaseline;
  } else if (type === 'screenshots') {
    artifactPath = config.artifacts.paths.screenshotCurrent;
  } else if (config.artifacts.paths[typeKey]) {
    artifactPath = config.artifacts.paths[typeKey];
  } else {
    throw new Error(`Unknown artifact type: ${type}`);
  }

  const fullPath = path.join(config.artifacts.baseDir, artifactPath);
  if (filename) {
    return path.join(fullPath, filename);
  }
  return fullPath;
}

/**
 * Generate filename with timestamp
 */
function generateFilename(prefix = 'artifact', ext = '.png') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const time = new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, '-');
  return `${prefix}-${timestamp}-${time}${ext}`;
}

/**
 * Get viewport sizes for responsive testing
 */
function getViewports() {
  return {
    mobile: { width: 375, height: 667, name: 'mobile' },
    tablet: { width: 768, height: 1024, name: 'tablet' },
    desktop: { width: 1280, height: 720, name: 'desktop' },
    wide: { width: 1920, height: 1080, name: 'wide' },
  };
}

/**
 * Wait conditions helper
 */
const waitConditions = {
  /**
   * Wait for element to be visible
   */
  forElement: async (page, selector, timeout = config.waits.selectorTimeout) => {
    return page.waitForSelector(selector, { timeout, state: 'visible' });
  },

  /**
   * Wait for page to be fully loaded
   */
  forPageLoad: async (page, timeout = config.waits.navigationTimeout) => {
    return page.waitForLoadState('networkidle', { timeout });
  },

  /**
   * Wait for specific URL
   */
  forUrl: async (page, urlPattern, timeout = config.waits.navigationTimeout) => {
    return page.waitForURL(urlPattern, { timeout });
  },

  /**
   * Wait for JavaScript condition
   */
  forFunction: async (page, fn, timeout = config.waits.navigationTimeout) => {
    return page.waitForFunction(fn, { timeout });
  },

  /**
   * Wait fixed time
   */
  forTimeout: async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Wait for navigation to complete
   */
  forNavigation: async (page, timeout = config.waits.navigationTimeout) => {
    return Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout }),
    ]).catch(() => null); // Navigation might not happen, that's ok
  },
};

/**
 * Result formatting helpers
 */
const formatters = {
  /**
   * Format as JSON
   */
  json: (data) => {
    return JSON.stringify(data, null, 2);
  },

  /**
   * Format as markdown
   */
  markdown: (data) => {
    if (Array.isArray(data)) {
      return data.map(item => `- ${item}`).join('\n');
    }
    if (typeof data === 'object') {
      return Object.entries(data)
        .map(([key, value]) => `**${key}:** ${value}`)
        .join('\n');
    }
    return String(data);
  },

  /**
   * Format as table
   */
  table: (data) => {
    if (!Array.isArray(data) || data.length === 0) {
      return 'No data';
    }

    const keys = Object.keys(data[0]);
    const header = `| ${keys.join(' | ')} |`;
    const separator = `| ${keys.map(() => '---').join(' | ')} |`;
    const rows = data
      .map(row => `| ${keys.map(k => row[k] || '').join(' | ')} |`)
      .join('\n');

    return `${header}\n${separator}\n${rows}`;
  },
};

/**
 * Logging utilities
 */
const logger = {
  info: (msg) => {
    if (config.debug.verbose) console.log(`ℹ️  ${msg}`);
  },

  success: (msg) => {
    console.log(`✓ ${msg}`);
  },

  error: (msg, err = null) => {
    console.error(`✗ ${msg}`);
    if (err && config.debug.verbose) {
      console.error(err);
    }
  },

  debug: (msg, data = null) => {
    if (config.debug.verbose) {
      console.log(`🐛 ${msg}`);
      if (data) console.log(data);
    }
  },

  warn: (msg) => {
    console.warn(`⚠️  ${msg}`);
  },
};

/**
 * Browser launcher helper
 */
async function launchBrowser(browserType = 'chromium', options = {}) {
  try {
    const { chromium, firefox, webkit } = require('@playwright/test');

    const browsers = { chromium, firefox, webkit };
    const launcher = browsers[browserType];

    if (!launcher) {
      throw new Error(`Unknown browser type: ${browserType}`);
    }

    const browserOptions = {
      headless: config.browser.headless,
      slowMo: config.browser.slowMo,
      ...options,
    };

    logger.info(`Launching ${browserType}...`);
    const browser = await launcher.launch(browserOptions);
    logger.success(`${browserType} launched`);

    return browser;
  } catch (err) {
    logger.error(`Failed to launch browser: ${err.message}`, err);
    throw err;
  }
}

/**
 * Export all utilities
 */
module.exports = {
  config,
  initializeArtifactDirs,
  getArtifactPath,
  generateFilename,
  getViewports,
  waitConditions,
  formatters,
  logger,
  launchBrowser,
};
