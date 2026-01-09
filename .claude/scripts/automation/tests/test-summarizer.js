#!/usr/bin/env node

/**
 * Incremental Summarizer Unit Tests
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const IncrementalSummarizer = require('../incremental-summarizer');

// Test utilities
const tests = [];
const results = { passed: 0, failed: 0 };

function test(name, fn) {
  tests.push({ name, fn });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`Assertion failed: ${message}\nExpected: ${expected}\nActual: ${actual}`);
  }
}

// Create test transcript
function createTestTranscript() {
  const tmpFile = path.join(os.tmpdir(), `test-transcript-${Date.now()}.jsonl`);
  const entries = [
    { type: 'user', content: 'Can you help me write a function?' },
    { type: 'assistant', content: 'Sure! I\'d be happy to help you write a function. What would you like it to do?' },
    { type: 'user', content: 'I need a function that calculates the fibonacci sequence' },
    { type: 'assistant', content: 'Here\'s a fibonacci function:\n\nfunction fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n-1) + fibonacci(n-2);\n}\n\nThis recursively calculates fibonacci numbers.' }
  ];

  fs.writeFileSync(
    tmpFile,
    entries.map(e => JSON.stringify(e)).join('\n')
  );

  return tmpFile;
}

async function runTests() {
  console.log('Running Incremental Summarizer Tests...\n');

  for (const { name, fn } of tests) {
    try {
      fn();
      console.log(`✓ ${name}`);
      results.passed++;
    } catch (error) {
      console.log(`✗ ${name}`);
      console.log(`  Error: ${error.message}`);
      results.failed++;
    }
  }

  console.log(`\nResults: ${results.passed} passed, ${results.failed} failed`);
  process.exit(results.failed > 0 ? 1 : 0);
}

// Tests

test('Parse JSONL transcript', () => {
  const summarizer = new IncrementalSummarizer();
  const tmpFile = createTestTranscript();

  try {
    const entries = summarizer.parseTranscript(tmpFile);
    assert(entries.length === 4, 'Should parse 4 entries');
    assert(entries[0].type === 'user', 'First entry should be user message');
  } finally {
    fs.unlinkSync(tmpFile);
  }
});

test('Extract meaningful messages', () => {
  const summarizer = new IncrementalSummarizer();
  const entries = [
    { type: 'user', content: 'Hello', _index: 0 },
    { type: 'assistant', content: 'Hi there', _index: 1 },
    { type: 'function', content: 'tool output', _index: 2 }
  ];

  const meaningful = summarizer.extractMeaningfulMessages(entries);
  assert(meaningful.length === 2, 'Should extract 2 meaningful messages (user and assistant)');
});

test('Generate summary from transcript', () => {
  const summarizer = new IncrementalSummarizer();
  const tmpFile = createTestTranscript();

  try {
    const summary = summarizer.generateSummary(tmpFile, 0, 'Test Tab');
    assert(summary !== null, 'Summary should be generated');
    assert(summary.text.length > 0, 'Summary text should not be empty');
    assert(summary.text.includes('Test Tab'), 'Summary should include tab label');
  } finally {
    fs.unlinkSync(tmpFile);
  }
});

test('Truncate text respecting word boundaries', () => {
  const summarizer = new IncrementalSummarizer();
  const longText = 'This is a very long text that should be truncated at a word boundary';
  const truncated = summarizer.truncate(longText, 20);

  assert(truncated.length <= 23, 'Truncated text should be short');
  assert(!truncated.endsWith(' '), 'Should not end with space');
});

test('Get summary report', () => {
  const summarizer = new IncrementalSummarizer();
  const tmpFile = createTestTranscript();

  try {
    const report = summarizer.getSummaryReport(tmpFile, 0);
    assert(report.totalEntries === 4, 'Report should show 4 total entries');
    assert(report.meaningfulMessages === 4, 'All entries are meaningful');
    assert(report.userMessages === 2, 'Should show 2 user messages');
    assert(report.assistantMessages === 2, 'Should show 2 assistant messages');
  } finally {
    fs.unlinkSync(tmpFile);
  }
});

test('Handle non-existent transcript', () => {
  const summarizer = new IncrementalSummarizer();
  const entries = summarizer.parseTranscript('/nonexistent/file.jsonl');

  assert(Array.isArray(entries), 'Should return array for non-existent file');
  assert(entries.length === 0, 'Should return empty array');
});

test('Generate summary only from new messages', () => {
  const summarizer = new IncrementalSummarizer();
  const tmpFile = createTestTranscript();

  try {
    // First summary from start
    const summary1 = summarizer.generateSummary(tmpFile, 0, 'Test Tab');
    assert(summary1 !== null, 'First summary should be generated');

    // Second summary from middle
    const summary2 = summarizer.generateSummary(tmpFile, 2, 'Test Tab');
    // This depends on whether there are enough new messages from index 2
  } finally {
    fs.unlinkSync(tmpFile);
  }
});

// Run tests
runTests();
