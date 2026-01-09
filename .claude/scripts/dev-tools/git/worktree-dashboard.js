#!/usr/bin/env node
/**
 * Git Worktree Dashboard
 * 
 * Display status of all git worktrees in a project.
 * Essential for managing parallel development branches.
 * 
 * Usage:
 *   node worktree-dashboard.js [options]
 * 
 * Options:
 *   --format=table|json|compact   Output format (default: table)
 *   --fetch                       Fetch from remote before showing status
 *   --include-main                Include main/master worktree
 *   --verbose                     Show additional details
 *   --stale=DAYS                  Highlight worktrees older than N days
 * 
 * Exit Codes:
 *   0 - Success
 *   1 - Not a git repository or git error
 * 
 * Examples:
 *   node worktree-dashboard.js
 *   node worktree-dashboard.js --fetch
 *   node worktree-dashboard.js --format=compact
 *   node worktree-dashboard.js --stale=7
 */

const { execSync } = require('child_process');
const path = require('path');

// Parse arguments
function parseArgs(args) {
  const result = {
    format: 'table',
    fetch: false,
    includeMain: false,
    verbose: false,
    staleDays: 14,
  };

  for (const arg of args) {
    if (arg.startsWith('--format=')) {
      result.format = arg.split('=')[1];
    } else if (arg === '--fetch') {
      result.fetch = true;
    } else if (arg === '--include-main') {
      result.includeMain = true;
    } else if (arg === '--verbose') {
      result.verbose = true;
    } else if (arg.startsWith('--stale=')) {
      result.staleDays = parseInt(arg.split('=')[1]);
    }
  }

  return result;
}

// Check if we're in a git repo
function isGitRepo() {
  try {
    execSync('git rev-parse --git-dir', { encoding: 'utf8', stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

// Get list of worktrees
function getWorktrees() {
  try {
    const output = execSync('git worktree list --porcelain', { encoding: 'utf8' });
    const worktrees = [];
    let current = {};

    for (const line of output.split('\n')) {
      if (line.startsWith('worktree ')) {
        if (current.path) {
          worktrees.push(current);
        }
        current = { path: line.slice(9) };
      } else if (line.startsWith('HEAD ')) {
        current.head = line.slice(5);
      } else if (line.startsWith('branch ')) {
        current.branch = line.slice(7).replace('refs/heads/', '');
      } else if (line === 'detached') {
        current.detached = true;
      } else if (line === 'bare') {
        current.bare = true;
      }
    }

    if (current.path) {
      worktrees.push(current);
    }

    return worktrees;
  } catch (error) {
    return [];
  }
}

// Get worktree status details
function getWorktreeStatus(worktreePath) {
  const status = {
    modified: 0,
    staged: 0,
    untracked: 0,
    ahead: 0,
    behind: 0,
    lastCommitDate: null,
    lastCommitMessage: null,
    isClean: true,
    isCurrent: false,
  };

  try {
    // Check if this is current directory
    const cwd = process.cwd();
    status.isCurrent = path.resolve(worktreePath) === path.resolve(cwd);

    // Get status
    const gitStatus = execSync('git status --porcelain=v2 --branch', {
      encoding: 'utf8',
      cwd: worktreePath,
      stdio: 'pipe',
    });

    for (const line of gitStatus.split('\n')) {
      if (line.startsWith('# branch.ab ')) {
        const match = line.match(/\+(\d+) -(\d+)/);
        if (match) {
          status.ahead = parseInt(match[1]);
          status.behind = parseInt(match[2]);
        }
      } else if (line.startsWith('1 ') || line.startsWith('2 ')) {
        // Changed file
        const parts = line.split(' ');
        const xy = parts[1];
        if (xy[0] !== '.') status.staged++;
        if (xy[1] !== '.') status.modified++;
      } else if (line.startsWith('? ')) {
        status.untracked++;
      }
    }

    status.isClean = status.modified === 0 && status.staged === 0 && status.untracked === 0;

    // Get last commit info
    const lastCommit = execSync('git log -1 --format="%ci|%s"', {
      encoding: 'utf8',
      cwd: worktreePath,
      stdio: 'pipe',
    }).trim();

    const [date, ...messageParts] = lastCommit.split('|');
    status.lastCommitDate = new Date(date);
    status.lastCommitMessage = messageParts.join('|').slice(0, 50);

  } catch (error) {
    status.error = true;
  }

  return status;
}

// Fetch from remote
function fetchRemote() {
  try {
    console.log('📡 Fetching from remote...\n');
    execSync('git fetch --all --prune', { encoding: 'utf8', stdio: 'pipe' });
    return true;
  } catch {
    console.log('⚠️  Could not fetch from remote\n');
    return false;
  }
}

// Format relative time
function formatRelativeTime(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

// Get status emoji
function getStatusEmoji(status) {
  if (status.error) return '❓';
  if (!status.isClean) return '🔧';
  if (status.behind > 0) return '⬇️';
  if (status.ahead > 0) return '⬆️';
  return '✅';
}

// Get status text
function getStatusText(status) {
  const parts = [];

  if (status.error) return 'error';
  
  if (status.modified > 0) parts.push(`${status.modified} modified`);
  if (status.staged > 0) parts.push(`${status.staged} staged`);
  if (status.untracked > 0) parts.push(`${status.untracked} untracked`);
  
  if (parts.length > 0) {
    return parts.join(', ');
  }
  
  if (status.ahead > 0 && status.behind > 0) {
    return `↑${status.ahead} ↓${status.behind}`;
  }
  if (status.ahead > 0) return `ahead ${status.ahead}`;
  if (status.behind > 0) return `behind ${status.behind}`;
  
  return 'clean';
}

// Check if worktree is stale
function isStale(status, staleDays) {
  if (!status.lastCommitDate) return false;
  const now = new Date();
  const diffDays = (now - status.lastCommitDate) / (1000 * 60 * 60 * 24);
  return diffDays > staleDays;
}

// Render table format
function renderTable(worktrees, options) {
  // Calculate column widths
  const nameWidth = Math.max(20, ...worktrees.map(w => (w.branch || 'detached').length));
  const statusWidth = 20;
  const timeWidth = 10;
  
  // Header
  console.log('');
  console.log('┌' + '─'.repeat(nameWidth + 2) + '┬' + '─'.repeat(statusWidth + 2) + '┬' + '─'.repeat(timeWidth + 2) + '┐');
  console.log('│ ' + 'Branch'.padEnd(nameWidth) + ' │ ' + 'Status'.padEnd(statusWidth) + ' │ ' + 'Last'.padEnd(timeWidth) + ' │');
  console.log('├' + '─'.repeat(nameWidth + 2) + '┼' + '─'.repeat(statusWidth + 2) + '┼' + '─'.repeat(timeWidth + 2) + '┤');

  // Rows
  for (const wt of worktrees) {
    const branch = wt.branch || 'detached';
    const status = wt.status;
    const emoji = getStatusEmoji(status);
    const statusText = getStatusText(status);
    const timeText = status.lastCommitDate ? formatRelativeTime(status.lastCommitDate) : 'unknown';
    const staleMarker = isStale(status, options.staleDays) ? ' ⚠️' : '';
    const currentMarker = status.isCurrent ? ' ←' : '';

    console.log('│ ' + 
      `${emoji} ${branch}${currentMarker}`.padEnd(nameWidth) + ' │ ' +
      statusText.padEnd(statusWidth) + ' │ ' +
      (timeText + staleMarker).padEnd(timeWidth) + ' │'
    );
  }

  // Footer
  console.log('└' + '─'.repeat(nameWidth + 2) + '┴' + '─'.repeat(statusWidth + 2) + '┴' + '─'.repeat(timeWidth + 2) + '┘');
  console.log('');

  // Legend
  console.log('Legend: ✅ clean  🔧 uncommitted  ⬆️ ahead  ⬇️ behind  ⚠️ stale  ← current');
  console.log('');
}

// Render compact format
function renderCompact(worktrees, options) {
  console.log('');
  
  for (const wt of worktrees) {
    const branch = wt.branch || 'detached';
    const status = wt.status;
    const emoji = getStatusEmoji(status);
    const statusText = getStatusText(status);
    const timeText = status.lastCommitDate ? formatRelativeTime(status.lastCommitDate) : '';
    const currentMarker = status.isCurrent ? ' ← you are here' : '';
    const staleMarker = isStale(status, options.staleDays) ? ' [stale]' : '';

    console.log(`${emoji} ${branch}${currentMarker}`);
    console.log(`   ${statusText} (${timeText})${staleMarker}`);
    
    if (options.verbose && status.lastCommitMessage) {
      console.log(`   "${status.lastCommitMessage}"`);
    }
    if (options.verbose) {
      console.log(`   ${wt.path}`);
    }
    console.log('');
  }
}

// Render JSON format
function renderJson(worktrees) {
  const output = worktrees.map(wt => ({
    branch: wt.branch || null,
    path: wt.path,
    detached: wt.detached || false,
    head: wt.head,
    status: {
      clean: wt.status.isClean,
      modified: wt.status.modified,
      staged: wt.status.staged,
      untracked: wt.status.untracked,
      ahead: wt.status.ahead,
      behind: wt.status.behind,
    },
    lastCommit: {
      date: wt.status.lastCommitDate?.toISOString() || null,
      message: wt.status.lastCommitMessage || null,
    },
    isCurrent: wt.status.isCurrent,
  }));

  console.log(JSON.stringify(output, null, 2));
}

// Main
function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Git Worktree Dashboard

Display status of all git worktrees for managing parallel branches.

Usage:
  node worktree-dashboard.js [options]

Options:
  --format=table|json|compact  Output format (default: table)
  --fetch                      Fetch from remote first
  --include-main               Include main/master worktree
  --verbose                    Show additional details
  --stale=DAYS                 Mark worktrees older than N days (default: 14)

Examples:
  node worktree-dashboard.js
  node worktree-dashboard.js --fetch
  node worktree-dashboard.js --format=compact --verbose
`);
    return;
  }

  // Check git repo
  if (!isGitRepo()) {
    console.error('❌ Not a git repository');
    process.exit(1);
  }

  const options = parseArgs(args);

  // Fetch if requested
  if (options.fetch) {
    fetchRemote();
  }

  // Get worktrees
  let worktrees = getWorktrees();

  if (worktrees.length === 0) {
    console.log('ℹ️  No worktrees found');
    console.log('   Create one with: git worktree add ../my-feature feature-branch');
    return;
  }

  // Filter main worktree if not included
  if (!options.includeMain) {
    const mainBranches = ['main', 'master'];
    // Keep main if it's the only worktree
    if (worktrees.length > 1) {
      worktrees = worktrees.filter(wt => 
        !mainBranches.includes(wt.branch) || wt.bare
      );
    }
  }

  // Get status for each worktree
  console.log('🌳 Git Worktree Dashboard\n');
  
  for (const wt of worktrees) {
    wt.status = getWorktreeStatus(wt.path);
  }

  // Sort: current first, then by last commit date
  worktrees.sort((a, b) => {
    if (a.status.isCurrent) return -1;
    if (b.status.isCurrent) return 1;
    if (!a.status.lastCommitDate) return 1;
    if (!b.status.lastCommitDate) return -1;
    return b.status.lastCommitDate - a.status.lastCommitDate;
  });

  // Render
  switch (options.format) {
    case 'json':
      renderJson(worktrees);
      break;
    case 'compact':
      renderCompact(worktrees, options);
      break;
    case 'table':
    default:
      renderTable(worktrees, options);
      break;
  }

  // Summary
  const cleanCount = worktrees.filter(w => w.status.isClean).length;
  const dirtyCount = worktrees.filter(w => !w.status.isClean).length;
  const staleCount = worktrees.filter(w => isStale(w.status, options.staleDays)).length;

  if (options.format !== 'json') {
    console.log(`📊 ${worktrees.length} worktree(s): ${cleanCount} clean, ${dirtyCount} with changes`);
    if (staleCount > 0) {
      console.log(`⚠️  ${staleCount} worktree(s) have no commits in ${options.staleDays}+ days`);
    }
    console.log('');
  }
}

main();

