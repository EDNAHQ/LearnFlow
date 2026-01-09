#!/usr/bin/env node

/**
 * Tab Tracker Service
 * Manages registration and lifecycle of active Claude Code instances
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const LOCK_FILE = path.join(DATA_DIR, '.sessions.lock');
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

class TabTracker {
  constructor() {
    this.ensureDataDir();
    this.sessions = this.loadSessions();
  }

  ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  /**
   * Load sessions from disk with file locking
   */
  loadSessions() {
    let attempts = 0;
    const maxAttempts = 50;

    while (fs.existsSync(LOCK_FILE) && attempts < maxAttempts) {
      // Wait for lock to be released
      const lockAge = Date.now() - fs.statSync(LOCK_FILE).mtimeMs;
      if (lockAge > 5000) {
        // Lock is stale, remove it
        fs.unlinkSync(LOCK_FILE);
        break;
      }
      attempts++;
      // Sleep 10ms
      const start = Date.now();
      while (Date.now() - start < 10) {}
    }

    if (!fs.existsSync(SESSIONS_FILE)) {
      return { sessions: {}, lastChecked: Date.now() };
    }

    try {
      const content = fs.readFileSync(SESSIONS_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Error loading sessions:', e.message);
      return { sessions: {}, lastChecked: Date.now() };
    }
  }

  /**
   * Save sessions to disk with file locking
   */
  saveSessions() {
    // Create lock file
    fs.writeFileSync(LOCK_FILE, Date.now().toString());

    try {
      fs.writeFileSync(
        SESSIONS_FILE,
        JSON.stringify(this.sessions, null, 2)
      );
    } finally {
      // Remove lock file
      if (fs.existsSync(LOCK_FILE)) {
        fs.unlinkSync(LOCK_FILE);
      }
    }
  }

  /**
   * Register a new session
   * @param {Object} metadata - Session metadata
   * @returns {string} Session ID
   */
  registerSession(metadata) {
    const sessionId = metadata.sessionId || crypto.randomUUID();

    const session = {
      id: sessionId,
      transcriptPath: metadata.transcriptPath,
      startTime: Date.now(),
      lastActivity: Date.now(),
      summaryIndex: 0,
      lastAudioGenerated: 0,
      tabLabel: metadata.tabLabel || `Tab ${Object.keys(this.sessions.sessions).length + 1}`,
      status: 'active',
      messageCount: 0,
      ...metadata
    };

    this.sessions.sessions[sessionId] = session;
    this.saveSessions();

    return sessionId;
  }

  /**
   * Update session activity
   */
  updateActivity(sessionId, updates = {}) {
    if (!this.sessions.sessions[sessionId]) {
      return null;
    }

    this.sessions.sessions[sessionId] = {
      ...this.sessions.sessions[sessionId],
      lastActivity: Date.now(),
      status: 'active',
      ...updates
    };

    this.saveSessions();
    return this.sessions.sessions[sessionId];
  }

  /**
   * Get active sessions
   */
  getActiveSessions() {
    const now = Date.now();
    return Object.values(this.sessions.sessions).filter(session => {
      return session.status === 'active' &&
             (now - session.lastActivity) < SESSION_TIMEOUT;
    });
  }

  /**
   * Get all sessions (active and inactive)
   */
  getAllSessions() {
    return Object.values(this.sessions.sessions);
  }

  /**
   * Get session by ID
   */
  getSession(sessionId) {
    return this.sessions.sessions[sessionId];
  }

  /**
   * Mark session as closed
   */
  closeSession(sessionId) {
    if (this.sessions.sessions[sessionId]) {
      this.sessions.sessions[sessionId].status = 'closed';
      this.saveSessions();
    }
  }

  /**
   * Cleanup old/inactive sessions
   */
  cleanup() {
    const now = Date.now();
    const before = Object.keys(this.sessions.sessions).length;

    Object.keys(this.sessions.sessions).forEach(sessionId => {
      const session = this.sessions.sessions[sessionId];
      const inactiveTime = now - session.lastActivity;

      // Remove if inactive for 30+ minutes
      if (inactiveTime > SESSION_TIMEOUT) {
        delete this.sessions.sessions[sessionId];
      }
    });

    if (Object.keys(this.sessions.sessions).length < before) {
      this.saveSessions();
    }

    return {
      before,
      after: Object.keys(this.sessions.sessions).length,
      removed: before - Object.keys(this.sessions.sessions).length
    };
  }

  /**
   * Get session statistics
   */
  getStats() {
    const sessions = Object.values(this.sessions.sessions);
    const active = sessions.filter(s => s.status === 'active').length;

    return {
      total: sessions.length,
      active,
      inactive: sessions.length - active,
      lastUpdated: this.sessions.lastChecked
    };
  }
}

// CLI Interface
if (require.main === module) {
  const command = process.argv[2];
  const tracker = new TabTracker();

  switch (command) {
    case 'register':
      const metadata = {
        sessionId: process.argv[3],
        transcriptPath: process.argv[4],
        tabLabel: process.argv[5] || 'Unknown Tab'
      };
      const id = tracker.registerSession(metadata);
      console.log(JSON.stringify({ success: true, sessionId: id }));
      break;

    case 'update':
      const sessionId = process.argv[3];
      const updates = process.argv[4] ? JSON.parse(process.argv[4]) : {};
      const result = tracker.updateActivity(sessionId, updates);
      console.log(JSON.stringify({ success: !!result, session: result }));
      break;

    case 'list':
      console.log(JSON.stringify(tracker.getActiveSessions(), null, 2));
      break;

    case 'list-all':
      console.log(JSON.stringify(tracker.getAllSessions(), null, 2));
      break;

    case 'get':
      const session = tracker.getSession(process.argv[3]);
      console.log(JSON.stringify(session));
      break;

    case 'close':
      tracker.closeSession(process.argv[3]);
      console.log(JSON.stringify({ success: true }));
      break;

    case 'cleanup':
      const cleanup = tracker.cleanup();
      console.log(JSON.stringify(cleanup));
      break;

    case 'stats':
      console.log(JSON.stringify(tracker.getStats(), null, 2));
      break;

    default:
      console.error('Unknown command:', command);
      process.exit(1);
  }
}

module.exports = TabTracker;
