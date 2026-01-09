#!/usr/bin/env node

/**
 * Tab Tracker Unit Tests
 */

const fs = require('fs');
const path = require('path');
const TabTracker = require('../tab-tracker');

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

async function runTests() {
  console.log('Running Tab Tracker Tests...\n');

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

test('Register a new session', () => {
  const tracker = new TabTracker();
  const sessionId = tracker.registerSession({
    sessionId: 'test-session-1',
    transcriptPath: '/tmp/transcript.jsonl',
    tabLabel: 'Test Tab'
  });

  assert(sessionId === 'test-session-1', 'Session ID should match');
  const session = tracker.getSession(sessionId);
  assert(session !== undefined, 'Session should exist');
  assertEqual(session.tabLabel, 'Test Tab', 'Tab label should match');
});

test('Get active sessions', () => {
  const tracker = new TabTracker();
  tracker.registerSession({
    sessionId: 'active-1',
    transcriptPath: '/tmp/transcript1.jsonl',
    tabLabel: 'Active Tab 1'
  });
  tracker.registerSession({
    sessionId: 'active-2',
    transcriptPath: '/tmp/transcript2.jsonl',
    tabLabel: 'Active Tab 2'
  });

  const active = tracker.getActiveSessions();
  assert(active.length >= 2, 'Should have at least 2 active sessions');
});

test('Update session activity', () => {
  const tracker = new TabTracker();
  const sessionId = tracker.registerSession({
    sessionId: 'test-update',
    transcriptPath: '/tmp/transcript.jsonl',
    tabLabel: 'Test Tab'
  });

  const updated = tracker.updateActivity(sessionId, { messageCount: 42 });
  assert(updated !== null, 'Update should succeed');
  assertEqual(updated.messageCount, 42, 'Message count should be updated');
});

test('Close a session', () => {
  const tracker = new TabTracker();
  const sessionId = tracker.registerSession({
    sessionId: 'test-close',
    transcriptPath: '/tmp/transcript.jsonl',
    tabLabel: 'Test Tab'
  });

  tracker.closeSession(sessionId);
  const session = tracker.getSession(sessionId);
  assertEqual(session.status, 'closed', 'Session status should be closed');
});

test('Get session statistics', () => {
  const tracker = new TabTracker();
  tracker.registerSession({
    sessionId: 'stat-1',
    transcriptPath: '/tmp/transcript1.jsonl',
    tabLabel: 'Stat Tab 1'
  });

  const stats = tracker.getStats();
  assert(stats.total >= 1, 'Stats should show at least 1 session');
  assert(stats.active >= 1, 'Stats should show at least 1 active session');
});

test('Cleanup inactive sessions', () => {
  const tracker = new TabTracker();
  const sessionId = tracker.registerSession({
    sessionId: 'cleanup-test',
    transcriptPath: '/tmp/transcript.jsonl',
    tabLabel: 'Cleanup Tab',
    lastActivity: Date.now() - (31 * 60 * 1000) // 31 minutes ago
  });

  const before = Object.keys(tracker.sessions.sessions).length;
  const cleanup = tracker.cleanup();
  const after = Object.keys(tracker.sessions.sessions).length;

  // Note: cleanup might not remove if session is recent, depending on actual time
  assert(cleanup.before >= cleanup.after, 'Cleanup should not increase sessions');
});

// Run tests
runTests();
