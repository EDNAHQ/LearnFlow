#!/usr/bin/env node

/**
 * Status Dashboard
 * Displays real-time status of multi-tab audio summary system
 */

const fs = require('fs');
const path = require('path');
const TabTracker = require('./tab-tracker');
const AudioQueue = require('./audio-queue');
const MultiTabMonitor = require('./monitor-tabs');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const STATUS_FILE = path.join(DATA_DIR, 'monitor.status');

class StatusDashboard {
  constructor() {
    this.tracker = new TabTracker();
    this.audioQueue = new AudioQueue();
  }

  /**
   * Display the full dashboard
   */
  display() {
    console.clear();
    this.printHeader();
    this.printMonitorStatus();
    this.printActiveSessions();
    this.printAudioQueue();
    this.printStats();
    this.printFooter();
  }

  /**
   * Print header
   */
  printHeader() {
    console.log('\n' + '='.repeat(80));
    console.log('  CLAUDE CODE - MULTI-TAB AUDIO SUMMARY SYSTEM');
    console.log('='.repeat(80) + '\n');
  }

  /**
   * Print monitor status
   */
  printMonitorStatus() {
    const isRunning = MultiTabMonitor.isMonitorRunning();
    const status = this.getMonitorStatus();

    const statusColor = isRunning ? '\x1b[32m' : '\x1b[31m'; // Green or Red
    const resetColor = '\x1b[0m';

    console.log('MONITOR STATUS');
    console.log('-'.repeat(80));
    console.log(`  Status: ${statusColor}${isRunning ? '✓ RUNNING' : '✗ STOPPED'}${resetColor}`);

    if (status) {
      console.log(`  Current Status: ${status.status}`);
      console.log(`  PID: ${status.pid}`);
      console.log(`  Uptime: ${Math.round(status.uptime)}s`);
      console.log(`  Last Update: ${new Date(status.timestamp).toLocaleTimeString()}`);
    }

    console.log();
  }

  /**
   * Print active sessions
   */
  printActiveSessions() {
    const sessions = this.tracker.getActiveSessions();

    console.log('ACTIVE SESSIONS');
    console.log('-'.repeat(80));

    if (sessions.length === 0) {
      console.log('  No active sessions');
      console.log();
      return;
    }

    sessions.forEach((session, index) => {
      const inactiveTime = Date.now() - session.lastActivity;
      const inactiveStr = this.formatTime(inactiveTime);

      console.log(`  ${index + 1}. ${session.tabLabel}`);
      console.log(`     ID: ${session.id.substring(0, 12)}...`);
      console.log(`     Messages: ${session.messageCount || 0}`);
      console.log(`     Summarized up to: ${session.summaryIndex || 0}`);
      console.log(`     Last active: ${inactiveStr} ago`);
      console.log(`     Status: ${session.status}`);
      console.log();
    });
  }

  /**
   * Print audio queue status
   */
  printAudioQueue() {
    const queueStatus = this.audioQueue.getStatus();

    console.log('AUDIO QUEUE');
    console.log('-'.repeat(80));
    console.log(`  Queued: ${queueStatus.queued}`);
    console.log(`  Processing: ${queueStatus.processing ? 'Yes' : 'No'}`);
    console.log(`  Completed: ${queueStatus.completed}`);
    console.log(`  Failed: ${queueStatus.failed}`);
    console.log(`  API Key: ${queueStatus.hasApiKey ? '✓ Configured' : '✗ Not configured'}`);

    if (queueStatus.lastProcessed) {
      const timeSince = Date.now() - queueStatus.lastProcessed;
      console.log(`  Last processed: ${this.formatTime(timeSince)} ago`);
    }

    console.log();
  }

  /**
   * Print statistics
   */
  printStats() {
    const stats = this.tracker.getStats();

    console.log('STATISTICS');
    console.log('-'.repeat(80));
    console.log(`  Total Sessions: ${stats.total}`);
    console.log(`  Active: ${stats.active}`);
    console.log(`  Inactive: ${stats.inactive}`);

    // Count audio files
    const audioDir = path.join(DATA_DIR, 'audio-summaries');
    let totalAudioFiles = 0;

    if (fs.existsSync(audioDir)) {
      try {
        const sessions = fs.readdirSync(audioDir);
        sessions.forEach(session => {
          const sessionPath = path.join(audioDir, session);
          if (fs.statSync(sessionPath).isDirectory()) {
            const files = fs.readdirSync(sessionPath).filter(f => f.endsWith('.mp3'));
            totalAudioFiles += files.length;
          }
        });
      } catch (error) {
        // Ignore
      }
    }

    console.log(`  Total Audio Files: ${totalAudioFiles}`);
    console.log();
  }

  /**
   * Print footer with commands
   */
  printFooter() {
    console.log('COMMANDS');
    console.log('-'.repeat(80));
    console.log('  node status-dashboard.js watch          - Watch status (updates every 2s)');
    console.log('  node status-dashboard.js sessions       - List all sessions (JSON)');
    console.log('  node status-dashboard.js queue          - Show queue status (JSON)');
    console.log('  node status-dashboard.js audios <id>    - List audio files for session');
    console.log();
  }

  /**
   * Get monitor status from file
   */
  getMonitorStatus() {
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
   * Format time duration
   */
  formatTime(ms) {
    if (ms < 1000) {
      return `${Math.round(ms)}ms`;
    }
    if (ms < 60000) {
      return `${Math.round(ms / 1000)}s`;
    }
    if (ms < 3600000) {
      return `${Math.round(ms / 60000)}m`;
    }
    return `${Math.round(ms / 3600000)}h`;
  }

  /**
   * Watch mode - update dashboard every 2 seconds
   */
  watch() {
    setInterval(() => {
      this.display();
    }, 2000);
  }

  /**
   * Display sessions as JSON
   */
  displaySessions() {
    console.log(JSON.stringify(this.tracker.getAllSessions(), null, 2));
  }

  /**
   * Display queue as JSON
   */
  displayQueue() {
    console.log(JSON.stringify(this.audioQueue.getStatus(), null, 2));
  }

  /**
   * Display audio files for a session
   */
  displayAudios(sessionId) {
    const audios = this.audioQueue.getSessionAudios(sessionId);
    console.log(JSON.stringify(audios, null, 2));
  }
}

// CLI Interface
if (require.main === module) {
  const dashboard = new StatusDashboard();
  const command = process.argv[2] || 'display';

  switch (command) {
    case 'display':
      dashboard.display();
      break;

    case 'watch':
      dashboard.display();
      dashboard.watch();
      break;

    case 'sessions':
      dashboard.displaySessions();
      break;

    case 'queue':
      dashboard.displayQueue();
      break;

    case 'audios':
      const sessionId = process.argv[3];
      if (!sessionId) {
        console.error('Please provide a session ID');
        process.exit(1);
      }
      dashboard.displayAudios(sessionId);
      break;

    default:
      console.error('Unknown command:', command);
      process.exit(1);
  }
}

module.exports = StatusDashboard;
