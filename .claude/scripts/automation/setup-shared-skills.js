#!/usr/bin/env node

/**
 * Setup Shared Skills Symlinks
 *
 * Creates symlinks from all projects to EDNA's master skills and scripts directories.
 * Idempotent: safe to run multiple times.
 *
 * Usage:
 *   node setup-shared-skills.js              # Show status and what needs fixing
 *   node setup-shared-skills.js --fix        # Fix all symlinks
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const EDNA_PATH = path.resolve(__dirname, '../../..');  // Up to CascadeProjects/
const EDNA_SKILLS = path.join(EDNA_PATH, 'EDNA-Command-Center/.claude/skills');
const EDNA_SCRIPTS = path.join(EDNA_PATH, 'EDNA-Command-Center/.claude/scripts');
const CASCADE_PROJECTS = EDNA_PATH;

// Auto-detect projects with .claude directories
function findProjectsWithClaude() {
  try {
    const entries = fs.readdirSync(CASCADE_PROJECTS, { withFileTypes: true });
    return entries
      .filter(e => e.isDirectory() && fs.existsSync(path.join(CASCADE_PROJECTS, e.name, '.claude')))
      .map(e => e.name)
      .filter(name => name !== 'EDNA-Command-Center'); // Exclude EDNA itself
  } catch (error) {
    return [];
  }
}

const args = process.argv.slice(2);
const fix = args.includes('--fix');
const PROJECTS_TO_SYNC = findProjectsWithClaude();

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function isWindows() {
  return process.platform === 'win32';
}

function isSymlink(target) {
  try {
    const stats = fs.lstatSync(target);
    return stats.isSymbolicLink();
  } catch {
    return false;
  }
}

function createSymlink(source, target, isDirectory = true) {
  try {
    if (isWindows()) {
      // Windows: use mklink /J for directory junctions (more reliable than /D)
      const cmd = isDirectory
        ? `mklink /J "${target}" "${source}"`
        : `mklink "${target}" "${source}"`;
      execSync(cmd, { stdio: 'pipe' });
    } else {
      // Unix: use ln -s
      const cmd = `ln -s "${source}" "${target}"`;
      execSync(cmd, { stdio: 'pipe' });
    }
    return true;
  } catch (error) {
    if (verbose) log(`  Error creating symlink: ${error.message}`, 'red');
    return false;
  }
}

function removeSymlink(target) {
  try {
    if (isWindows()) {
      execSync(`rmdir "${target}" /s /q`, { stdio: 'pipe' });
    } else {
      execSync(`rm -rf "${target}"`, { stdio: 'pipe' });
    }
    return true;
  } catch (error) {
    if (verbose) log(`  Error removing symlink: ${error.message}`, 'red');
    return false;
  }
}

function processProject(projectName) {
  const projectPath = path.join(CASCADE_PROJECTS, projectName);
  const claudePath = path.join(projectPath, '.claude');
  const skillsPath = path.join(claudePath, 'skills');
  const scriptsPath = path.join(claudePath, 'scripts');

  // Check if .claude exists
  if (!fs.existsSync(claudePath)) {
    return { projectName, status: 'no-claude' };
  }

  const results = { projectName, status: 'ok', changes: [] };

  // Handle skills directory - make idempotent
  const skillsLinked = isSymlink(skillsPath);
  const skillsExists = fs.existsSync(skillsPath);

  if (skillsLinked) {
    results.changes.push('skills: linked ✓');
  } else if (skillsExists) {
    results.status = 'has-local-skills';
    results.changes.push('skills: local directory (keeping)');
  } else {
    if (fix) {
      if (createSymlink(EDNA_SKILLS, skillsPath, true)) {
        results.changes.push('skills: ✓ created');
      } else {
        results.status = 'error';
        results.changes.push('skills: ✗ failed');
      }
    } else {
      results.status = 'needs-fix';
      results.changes.push('skills: missing (run --fix)');
    }
  }

  // Handle scripts directory - make idempotent
  const scriptsLinked = isSymlink(scriptsPath);
  const scriptsExists = fs.existsSync(scriptsPath);

  if (scriptsLinked) {
    results.changes.push('scripts: linked ✓');
  } else if (scriptsExists) {
    results.status = 'has-local-scripts';
    results.changes.push('scripts: local directory (keeping)');
  } else {
    if (fix) {
      if (createSymlink(EDNA_SCRIPTS, scriptsPath, true)) {
        results.changes.push('scripts: ✓ created');
      } else {
        results.status = 'error';
        results.changes.push('scripts: ✗ failed');
      }
    } else {
      results.status = 'needs-fix';
      results.changes.push('scripts: missing (run --fix)');
    }
  }

  return results;
}

function main() {
  log('\nShared Skills Status\n', 'bright');

  const results = [];
  let linkedCount = 0;
  let localCount = 0;
  let needsFixCount = 0;
  let errorCount = 0;

  for (const projectName of PROJECTS_TO_SYNC) {
    const result = processProject(projectName);
    results.push(result);

    let icon = '  ';
    if (result.status === 'ok') {
      linkedCount++;
      icon = '✓';
    } else if (result.status === 'has-local-skills' || result.status === 'has-local-scripts') {
      localCount++;
      icon = '◐';
    } else if (result.status === 'needs-fix') {
      needsFixCount++;
      icon = '○';
    } else if (result.status === 'error') {
      errorCount++;
      icon = '✗';
    } else {
      icon = '⊘';
    }

    const details = result.changes.join(' | ');
    log(`${icon} ${projectName.padEnd(28)} ${details}`);
  }

  // Summary
  log(`\nStatus: ${linkedCount} linked, ${localCount} local, ${needsFixCount} need fix, ${errorCount} errors`, 'gray');

  if (needsFixCount > 0 && !fix) {
    log(`\nRun: node .claude/scripts/setup-shared-skills.js --fix\n`, 'yellow');
  } else if (fix && errorCount === 0) {
    log(`\n✓ Done. All symlinks in place.\n`, 'green');
  } else if (errorCount > 0) {
    log(`\n✗ ${errorCount} error(s) - check permissions and EDNA paths\n`, 'red');
    process.exit(1);
  } else {
    log('');
  }
}

main();
