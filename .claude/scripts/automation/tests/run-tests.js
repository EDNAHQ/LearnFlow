#!/usr/bin/env node

/**
 * Test Runner
 * Runs all test suites and reports results
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const testDir = __dirname;
const testFiles = fs.readdirSync(testDir).filter(f =>
  f.startsWith('test-') && f.endsWith('.js') && f !== 'test-suite.js'
);

let passed = 0;
let failed = 0;
const results = [];

function runTest(testFile) {
  return new Promise((resolve) => {
    console.log(`\nRunning ${testFile}...`);
    console.log('='.repeat(60));

    const proc = spawn('node', [path.join(testDir, testFile)]);
    let output = '';
    let errorOutput = '';

    proc.stdout.on('data', (data) => {
      output += data.toString();
      process.stdout.write(data);
    });

    proc.stderr.on('data', (data) => {
      errorOutput += data.toString();
      process.stderr.write(data);
    });

    proc.on('close', (code) => {
      const success = code === 0;
      results.push({
        file: testFile,
        success,
        output
      });

      if (success) {
        passed++;
      } else {
        failed++;
      }

      resolve();
    });

    proc.on('error', (error) => {
      console.error(`Error running ${testFile}:`, error.message);
      failed++;
      resolve();
    });
  });
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('MULTI-TAB AUDIO SUMMARY SYSTEM - TEST SUITE');
  console.log('='.repeat(60));

  if (testFiles.length === 0) {
    console.log('No tests found');
    process.exit(1);
  }

  // Run all tests sequentially
  for (const testFile of testFiles) {
    await runTest(testFile);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Test Files: ${testFiles.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log('='.repeat(60));

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
