#!/usr/bin/env node

/**
 * Multi-Tab Monitor
 * Background daemon that monitors all active Claude Code instances
 * Polls for new activity and triggers summary generation
 */

const fs = require('fs');
const path = require('path');
const TabTracker = require('./tab-tracker');
const IncrementalSummarizer = require('./incremental-summarizer');
const AudioQueue = require('./audio-queue');

const POLL_INTERVAL = 5000; // 5 seconds
const MIN_ACTIVITY_THRESHOLD = 100; // milliseconds between checks
const PID_FILE = path.join(__dirname, '..', '..', 'data', 'monitor.pid');
const STATUS_FILE = path.join(__dirname, '..', '..', 'data', 'monitor.status');

class MultiTabMonitor {
  constructor(options = {}) {
    this.tracker = new TabTracker();
    this.summarizer = new IncrementalSummarizer();
    this.audioQueue = new AudioQueue();
    this.isRunning = false;
    this.pollInterval = options.pollInterval || POLL_INTERVAL;
    this.sessionStates = new Map(); // In-memory cache of last known state
  }

  /**
   * Start the monitor daemon
   */
  start() {
    this.isRunning = true;
    this.writePid();
    this.writeStatus('started');

    console.log('[Monitor] Starting multi-tab monitor daemon...');
    console.log(`[Monitor] Poll interval: ${this.pollInterval}ms`);

    // Graceful shutdown handlers
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());

    // Main monitoring loop
    this.mainLoop();
  }

  /**
   * Main monitoring loop
   */
  async mainLoop() {
    while (this.isRunning) {
      try {
        await this.checkActiveSessions();
        await this.sleep(this.pollInterval);
      } catch (error) {
        console.error('[Monitor] Error in main loop:', error.message);
        this.writeStatus(`error: ${error.message}`);
        await this.sleep(this.pollInterval);
      }
    }
  }

  /**
   * Check all active sessions for new activity
   */
  async checkActiveSessions() {
    const sessions = this.tracker.getActiveSessions();

    if (sessions.length === 0) {
      return;
    }

    for (const session of sessions) {
      await this.checkSession(session);
    }

    this.writeStatus(`monitoring ${sessions.length} active sessions`);
  }

  /**
   * Check a single session for new activity
   */
  async checkSession(session) {
    try {
      // Verify transcript file exists
      if (!fs.existsSync(session.transcriptPath)) {
        this.tracker.updateActivity(session.id, { status: 'error' });
        return;
      }

      // Get message count
      const messageCount = this.getMessageCount(session.transcriptPath);

      // Check if there's new activity
      const prevState = this.sessionStates.get(session.id) || { messageCount: 0 };
      const hasNewMessages = messageCount > prevState.messageCount;

      if (hasNewMessages) {
        // Update session activity
        this.tracker.updateActivity(session.id, { messageCount });
        this.sessionStates.set(session.id, { messageCount });

        // Generate summary for new messages
        await this.generateSummaryForSession(session, prevState.messageCount);
      }
    } catch (error) {
      console.error(`[Monitor] Error checking session ${session.id}:`, error.message);
    }
  }

  /**
   * Generate summary for new messages in a session
   */
  async generateSummaryForSession(session, fromIndex = 0) {
    try {
      const summary = this.summarizer.generateSummary(
        session.transcriptPath,
        fromIndex,
        session.tabLabel
      );

      if (summary && summary.text) {
        // Queue audio generation
        const queueId = await this.audioQueue.queueSummary({
          sessionId: session.id,
          tabLabel: session.tabLabel,
          text: summary.text,
          messageIndex: summary.endIndex
        });

        // Update session with queue info
        this.tracker.updateActivity(session.id, {
          summaryIndex: summary.endIndex,
          lastQueued: Date.now()
        });

        console.log(`[Monitor] Queued summary for ${session.tabLabel}: ${queueId}`);
      }
    } catch (error) {
      console.error(`[Monitor] Error generating summary for ${session.id}:`, error.message);
    }
  }

  /**
   * Count messages in transcript file
   */
  getMessageCount(transcriptPath) {
    try {
      if (!fs.existsSync(transcriptPath)) {
        return 0;
      }

      const content = fs.readFileSync(transcriptPath, 'utf-8');
      const lines = content.trim().split('\n').filter(line => line.length > 0);
      return lines.length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Cleanup old sessions
   */
  cleanup() {
    const result = this.tracker.cleanup();
    console.log(`[Monitor] Cleanup: removed ${result.removed} inactive sessions`);

    // Also cleanup in-memory state
    for (const [sessionId] of this.sessionStates) {
      if (!this.tracker.getSession(sessionId)) {
        this.sessionStates.delete(sessionId);
      }
    }
  }

  /**
   * Write PID file
   */
  writePid() {
    const dir = path.dirname(PID_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PID_FILE, process.pid.toString());
  }

  /**
   * Write status file
   */
  writeStatus(status) {
    const dir = path.dirname(STATUS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STATUS_FILE, JSON.stringify({
      status,
      timestamp: Date.now(),
      pid: process.pid,
      uptime: process.uptime()
    }, null, 2));
  }

  /**
   * Shutdown gracefully
   */
  shutdown() {
    console.log('[Monitor] Shutting down...');
    this.isRunning = false;

    // Cleanup
    if (fs.existsSync(PID_FILE)) {
      fs.unlinkSync(PID_FILE);
    }

    process.exit(0);
  }

  /**
   * Sleep helper
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get monitor status
   */
  getStatus() {
    if (!fs.existsSync(STATUS_FILE)) {
      return null;
    }

    try {
      return JSON.parse(fs.readFileSync(STATUS_FILE, 'utf-8'));
    } catch {
      return null;
    }
  }

  /**
   * Check if monitor is running
   */
  static isMonitorRunning() {
    if (!fs.existsSync(PID_FILE)) {
      return false;
    }

    try {
      const pid = parseInt(fs.readFileSync(PID_FILE, 'utf-8'));
      // Try to send signal 0 to check if process exists
      try {
        process.kill(pid, 0);
        return true;
      } catch {
        return false;
      }
    } catch {
      return false;
    }
  }

  /**
   * Stop a running monitor
   */
  static stopMonitor() {
    if (!fs.existsSync(PID_FILE)) {
      return false;
    }

    try {
      const pid = parseInt(fs.readFileSync(PID_FILE, 'utf-8'));
      process.kill(pid, 'SIGTERM');
      return true;
    } catch (error) {
      console.error('Error stopping monitor:', error.message);
      return false;
    }
  }
}

// CLI Interface
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case 'start':
      const monitor = new MultiTabMonitor();
      monitor.start();
      break;

    case 'status':
      const statusCheck = MultiTabMonitor.isMonitorRunning();
      const status = new MultiTabMonitor().getStatus();
      console.log(JSON.stringify({
        running: statusCheck,
        status: status
      }, null, 2));
      break;

    case 'stop':
      const stopped = MultiTabMonitor.stopMonitor();
      console.log(JSON.stringify({ success: stopped }));
      break;

    default:
      console.error('Unknown command:', command);
      console.error('Usage: node monitor-tabs.js [start|status|stop]');
      process.exit(1);
  }
}

module.exports = MultiTabMonitor;
