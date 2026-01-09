#!/usr/bin/env node
/**
 * Smart Commit Script
 * 
 * Analyzes git diff and generates a conventional commit message.
 * Understands code changes to create meaningful, descriptive commits.
 * 
 * Usage:
 *   node smart-commit.js [options]
 * 
 * Options:
 *   --staged               Only analyze staged changes (default)
 *   --all                  Analyze all changes (staged + unstaged)
 *   --dry-run              Show message without committing
 *   --type=TYPE            Force commit type (feat, fix, etc.)
 *   --scope=SCOPE          Force scope
 *   --breaking             Mark as breaking change
 *   --amend                Amend previous commit
 *   --body                 Include detailed body in commit
 * 
 * Commit Types:
 *   feat     - New feature
 *   fix      - Bug fix
 *   docs     - Documentation only
 *   style    - Formatting, no code change
 *   refactor - Code change that neither fixes bug nor adds feature
 *   perf     - Performance improvement
 *   test     - Adding or fixing tests
 *   chore    - Build process, dependencies, tooling
 * 
 * Examples:
 *   node smart-commit.js
 *   node smart-commit.js --dry-run
 *   node smart-commit.js --type=feat --scope=auth
 */

const { execSync } = require('child_process');
const path = require('path');

// Parse arguments
function parseArgs(args) {
  const result = {
    staged: true,
    all: false,
    dryRun: false,
    type: null,
    scope: null,
    breaking: false,
    amend: false,
    body: false,
  };

  for (const arg of args) {
    if (arg === '--staged') {
      result.staged = true;
      result.all = false;
    } else if (arg === '--all') {
      result.all = true;
      result.staged = false;
    } else if (arg === '--dry-run') {
      result.dryRun = true;
    } else if (arg.startsWith('--type=')) {
      result.type = arg.split('=')[1];
    } else if (arg.startsWith('--scope=')) {
      result.scope = arg.split('=')[1];
    } else if (arg === '--breaking') {
      result.breaking = true;
    } else if (arg === '--amend') {
      result.amend = true;
    } else if (arg === '--body') {
      result.body = true;
    }
  }

  return result;
}

// Get git diff
function getGitDiff(options) {
  try {
    const diffCmd = options.all ? 'git diff HEAD' : 'git diff --cached';
    const diff = execSync(diffCmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    return diff;
  } catch (error) {
    return '';
  }
}

// Get list of changed files
function getChangedFiles(options) {
  try {
    const cmd = options.all 
      ? 'git diff HEAD --name-status'
      : 'git diff --cached --name-status';
    const output = execSync(cmd, { encoding: 'utf8' });
    
    return output.trim().split('\n').filter(Boolean).map(line => {
      const [status, ...pathParts] = line.split('\t');
      const filePath = pathParts.join('\t');
      return { status: status.charAt(0), path: filePath };
    });
  } catch (error) {
    return [];
  }
}

// Analyze file changes to determine type and scope
function analyzeChanges(files, diff) {
  const analysis = {
    types: new Set(),
    scopes: new Set(),
    actions: [],
    isBreaking: false,
  };

  // Analyze file paths
  for (const file of files) {
    const { status, path: filePath } = file;
    const ext = path.extname(filePath);
    const dir = path.dirname(filePath).split(/[/\\]/)[0];
    const filename = path.basename(filePath, ext);

    // Determine scope from directory structure
    if (dir && dir !== '.') {
      // Common directory patterns
      const scopeMap = {
        'src': null, // too generic
        'lib': null,
        'app': null,
        'components': 'ui',
        'pages': 'pages',
        'api': 'api',
        'utils': 'utils',
        'hooks': 'hooks',
        'services': 'services',
        'models': 'models',
        'types': 'types',
        'tests': 'tests',
        '__tests__': 'tests',
        'test': 'tests',
        'docs': 'docs',
        'scripts': 'scripts',
        'config': 'config',
        'styles': 'styles',
        'public': 'assets',
        'assets': 'assets',
      };

      if (scopeMap[dir] !== null && scopeMap[dir]) {
        analysis.scopes.add(scopeMap[dir]);
      } else if (!scopeMap.hasOwnProperty(dir)) {
        analysis.scopes.add(dir);
      }
    }

    // Determine type from file type and changes
    if (filePath.includes('test') || filePath.includes('spec') || filePath.includes('__tests__')) {
      analysis.types.add('test');
    } else if (ext === '.md' || filePath.includes('README') || filePath.includes('docs/')) {
      analysis.types.add('docs');
    } else if (filePath.includes('package.json') || filePath.includes('package-lock.json') || 
               filePath.includes('yarn.lock') || filePath.includes('.config.')) {
      analysis.types.add('chore');
    } else if (filePath.includes('.css') || filePath.includes('.scss') || filePath.includes('.less')) {
      analysis.types.add('style');
    }

    // Action based on status
    const actionMap = {
      'A': 'add',
      'M': 'update',
      'D': 'remove',
      'R': 'rename',
    };
    analysis.actions.push({
      action: actionMap[status] || 'change',
      file: filename + ext,
      path: filePath,
    });
  }

  // Analyze diff content for more context
  if (diff) {
    // Check for common patterns
    if (diff.includes('BREAKING CHANGE') || diff.includes('BREAKING:')) {
      analysis.isBreaking = true;
    }

    // Look for new exports (likely a feature)
    if (diff.includes('+export ') || diff.includes('+module.exports')) {
      analysis.types.add('feat');
    }

    // Look for bug fix patterns
    if (diff.includes('fix') || diff.includes('bug') || diff.includes('issue')) {
      const fixPatterns = [
        /\+.*?fix/i,
        /\+.*?bug/i,
        /\+.*?issue/i,
        /\+.*?correct/i,
        /\+.*?resolve/i,
      ];
      for (const pattern of fixPatterns) {
        if (pattern.test(diff)) {
          analysis.types.add('fix');
          break;
        }
      }
    }

    // Performance patterns
    if (/\+.*?(optimize|performance|perf|cache|memo)/i.test(diff)) {
      analysis.types.add('perf');
    }

    // Refactor patterns (renaming, restructuring without functional change)
    if (/\+.*?(refactor|restructure|reorganize|cleanup|clean up)/i.test(diff)) {
      analysis.types.add('refactor');
    }
  }

  return analysis;
}

// Determine the primary commit type
function determineType(analysis, files) {
  const { types } = analysis;

  // Priority order for types
  const priority = ['feat', 'fix', 'perf', 'refactor', 'test', 'docs', 'style', 'chore'];
  
  for (const type of priority) {
    if (types.has(type)) {
      return type;
    }
  }

  // Default based on file status
  const hasNew = files.some(f => f.status === 'A');
  const hasDeleted = files.some(f => f.status === 'D');
  const hasModified = files.some(f => f.status === 'M');

  if (hasNew && !hasModified && !hasDeleted) {
    return 'feat';
  }
  if (hasDeleted && !hasNew) {
    return 'chore';
  }
  
  // Default to feat for new stuff, fix for modifications
  return hasNew ? 'feat' : 'fix';
}

// Determine scope
function determineScope(analysis) {
  const scopes = Array.from(analysis.scopes);
  
  if (scopes.length === 0) {
    return null;
  }
  if (scopes.length === 1) {
    return scopes[0];
  }
  
  // Multiple scopes - pick most specific or combine
  // Prefer non-generic scopes
  const genericScopes = ['utils', 'types', 'config'];
  const specific = scopes.filter(s => !genericScopes.includes(s));
  
  if (specific.length === 1) {
    return specific[0];
  }
  if (specific.length > 1) {
    return specific.slice(0, 2).join(',');
  }
  
  return scopes[0];
}

// Generate commit subject
function generateSubject(analysis, files, type) {
  const actions = analysis.actions;
  
  if (actions.length === 0) {
    return 'update code';
  }

  // Group by action
  const grouped = {};
  for (const a of actions) {
    if (!grouped[a.action]) {
      grouped[a.action] = [];
    }
    grouped[a.action].push(a);
  }

  // Generate description based on primary action
  const actionVerbs = {
    add: 'add',
    update: 'update',
    remove: 'remove',
    rename: 'rename',
    change: 'update',
  };

  const primaryAction = Object.keys(grouped).sort((a, b) => 
    grouped[b].length - grouped[a].length
  )[0];

  const verb = actionVerbs[primaryAction] || 'update';
  const affectedFiles = grouped[primaryAction];

  // Describe what changed
  if (affectedFiles.length === 1) {
    const file = affectedFiles[0];
    const name = path.basename(file.path, path.extname(file.path));
    
    // Clean up component/module names
    const cleanName = name
      .replace(/\.module$/, '')
      .replace(/\.component$/, '')
      .replace(/\.service$/, '')
      .replace(/\.test$/, '')
      .replace(/\.spec$/, '');
    
    return `${verb} ${cleanName}`;
  }

  // Multiple files
  if (affectedFiles.length <= 3) {
    const names = affectedFiles.map(f => 
      path.basename(f.path, path.extname(f.path))
    );
    return `${verb} ${names.join(', ')}`;
  }

  // Many files - describe the pattern
  const commonDir = findCommonDirectory(affectedFiles.map(f => f.path));
  if (commonDir && commonDir !== '.') {
    return `${verb} ${commonDir} ${affectedFiles.length > 1 ? 'files' : ''}`.trim();
  }

  // Fall back to type-based description
  const typeDescriptions = {
    feat: 'add new functionality',
    fix: 'fix issues',
    docs: 'update documentation',
    test: 'update tests',
    style: 'update styles',
    refactor: 'refactor code',
    perf: 'improve performance',
    chore: 'update configuration',
  };

  return typeDescriptions[type] || 'update code';
}

// Find common directory among paths
function findCommonDirectory(paths) {
  if (paths.length === 0) return null;
  if (paths.length === 1) return path.dirname(paths[0]);

  const parts = paths.map(p => p.split(/[/\\]/));
  const common = [];

  for (let i = 0; i < parts[0].length; i++) {
    const segment = parts[0][i];
    if (parts.every(p => p[i] === segment)) {
      common.push(segment);
    } else {
      break;
    }
  }

  return common.join('/') || null;
}

// Generate commit body
function generateBody(analysis, files) {
  const lines = [];

  // Group files by action
  const grouped = {
    added: files.filter(f => f.status === 'A'),
    modified: files.filter(f => f.status === 'M'),
    deleted: files.filter(f => f.status === 'D'),
    renamed: files.filter(f => f.status === 'R'),
  };

  if (grouped.added.length > 0) {
    lines.push('Added:');
    for (const f of grouped.added.slice(0, 10)) {
      lines.push(`- ${f.path}`);
    }
    if (grouped.added.length > 10) {
      lines.push(`- ... and ${grouped.added.length - 10} more`);
    }
    lines.push('');
  }

  if (grouped.modified.length > 0) {
    lines.push('Modified:');
    for (const f of grouped.modified.slice(0, 10)) {
      lines.push(`- ${f.path}`);
    }
    if (grouped.modified.length > 10) {
      lines.push(`- ... and ${grouped.modified.length - 10} more`);
    }
    lines.push('');
  }

  if (grouped.deleted.length > 0) {
    lines.push('Removed:');
    for (const f of grouped.deleted.slice(0, 10)) {
      lines.push(`- ${f.path}`);
    }
    if (grouped.deleted.length > 10) {
      lines.push(`- ... and ${grouped.deleted.length - 10} more`);
    }
    lines.push('');
  }

  if (analysis.isBreaking) {
    lines.push('BREAKING CHANGE: This commit introduces breaking changes.');
    lines.push('');
  }

  return lines.join('\n');
}

// Main
function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Smart Commit

Analyzes git diff and generates conventional commit messages.

Usage:
  node smart-commit.js [options]

Options:
  --staged       Analyze staged changes only (default)
  --all          Analyze all changes
  --dry-run      Show message without committing
  --type=TYPE    Force commit type (feat, fix, docs, etc.)
  --scope=SCOPE  Force scope
  --breaking     Mark as breaking change
  --amend        Amend previous commit
  --body         Include detailed body

Commit Types:
  feat, fix, docs, style, refactor, perf, test, chore

Examples:
  node smart-commit.js
  node smart-commit.js --dry-run
  node smart-commit.js --type=feat --scope=auth
`);
    return;
  }

  const options = parseArgs(args);

  // Get changes
  const files = getChangedFiles(options);
  const diff = getGitDiff(options);

  if (files.length === 0) {
    console.log('❌ No changes to commit');
    if (options.staged || !options.all) {
      console.log('   (Use --all to include unstaged changes, or stage files with git add)');
    }
    process.exit(1);
  }

  // Analyze
  const analysis = analyzeChanges(files, diff);

  // Determine components
  const type = options.type || determineType(analysis, files);
  const scope = options.scope || determineScope(analysis);
  const subject = generateSubject(analysis, files, type);
  const isBreaking = options.breaking || analysis.isBreaking;

  // Build commit message
  let message = type;
  if (scope) {
    message += `(${scope})`;
  }
  if (isBreaking) {
    message += '!';
  }
  message += `: ${subject}`;

  // Add body if requested
  let fullMessage = message;
  if (options.body) {
    const body = generateBody(analysis, files);
    if (body) {
      fullMessage += '\n\n' + body;
    }
  }

  console.log('\n📝 Generated Commit Message:\n');
  console.log('─'.repeat(50));
  console.log(fullMessage);
  console.log('─'.repeat(50));
  console.log('');
  console.log(`📊 ${files.length} file(s) changed`);

  if (options.dryRun) {
    console.log('\n🔍 Dry run - no commit made');
    console.log('\nTo commit with this message:');
    console.log(`  git commit -m "${message.replace(/"/g, '\\"')}"`);
    return;
  }

  // Commit
  try {
    const commitCmd = options.amend 
      ? `git commit --amend -m "${fullMessage.replace(/"/g, '\\"')}"`
      : `git commit -m "${fullMessage.replace(/"/g, '\\"')}"`;
    
    execSync(commitCmd, { encoding: 'utf8', stdio: 'inherit' });
    console.log('\n✅ Committed successfully!');
  } catch (error) {
    console.error('\n❌ Commit failed');
    process.exit(1);
  }
}

main();

