#!/usr/bin/env node
/**
 * Test Impact Analysis Script
 * 
 * Determines which tests are affected by recent code changes.
 * Helps run only relevant tests for faster feedback during TDD.
 * 
 * Usage:
 *   node test-impact.js [options]
 * 
 * Options:
 *   --since=REF            Compare against git ref (default: HEAD~1)
 *   --staged               Only consider staged changes
 *   --all                  Consider all changes (staged + unstaged)
 *   --format=json|list     Output format (default: list)
 *   --run                  Actually run the tests with npm/jest
 *   --runner=jest|vitest   Test runner to use (default: auto-detect)
 *   --verbose              Show detailed analysis
 * 
 * Exit Codes:
 *   0 - Success (tests found or no changes)
 *   1 - Error during analysis
 * 
 * Examples:
 *   node test-impact.js
 *   node test-impact.js --since=main
 *   node test-impact.js --staged --run
 *   node test-impact.js --format=json
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse arguments
function parseArgs(args) {
  const result = {
    since: 'HEAD~1',
    staged: false,
    all: false,
    format: 'list',
    run: false,
    runner: null,
    verbose: false,
  };

  for (const arg of args) {
    if (arg.startsWith('--since=')) {
      result.since = arg.split('=')[1];
    } else if (arg === '--staged') {
      result.staged = true;
    } else if (arg === '--all') {
      result.all = true;
    } else if (arg.startsWith('--format=')) {
      result.format = arg.split('=')[1];
    } else if (arg === '--run') {
      result.run = true;
    } else if (arg.startsWith('--runner=')) {
      result.runner = arg.split('=')[1];
    } else if (arg === '--verbose') {
      result.verbose = true;
    }
  }

  return result;
}

// Get changed files based on options
function getChangedFiles(options) {
  try {
    let cmd;
    if (options.staged) {
      cmd = 'git diff --cached --name-only';
    } else if (options.all) {
      cmd = 'git diff HEAD --name-only';
    } else {
      cmd = `git diff ${options.since} --name-only`;
    }
    
    const output = execSync(cmd, { encoding: 'utf8' });
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    return [];
  }
}

// Find all test files in the project
function findAllTestFiles(rootDir = '.') {
  const testFiles = [];
  const testPatterns = [
    /\.test\.[jt]sx?$/,
    /\.spec\.[jt]sx?$/,
    /__tests__\/.*\.[jt]sx?$/,
    /test\/.*\.[jt]sx?$/,
    /tests\/.*\.[jt]sx?$/,
  ];

  function walk(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        // Skip common non-test directories
        if (entry.name === 'node_modules' || 
            entry.name === '.git' || 
            entry.name === 'dist' ||
            entry.name === 'build' ||
            entry.name === 'coverage' ||
            entry.name.startsWith('.')) {
          continue;
        }

        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.isFile()) {
          const relativePath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
          for (const pattern of testPatterns) {
            if (pattern.test(relativePath)) {
              testFiles.push(relativePath);
              break;
            }
          }
        }
      }
    } catch (e) {
      // Skip directories we can't read
    }
  }

  walk(rootDir);
  return testFiles;
}

// Parse imports from a file
function parseImports(filePath) {
  const imports = new Set();
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // ES6 imports: import X from './module'
    const esImportRegex = /import\s+(?:[\w{},*\s]+\s+from\s+)?['"]([^'"]+)['"]/g;
    let match;
    while ((match = esImportRegex.exec(content)) !== null) {
      imports.add(match[1]);
    }
    
    // CommonJS requires: require('./module')
    const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((match = requireRegex.exec(content)) !== null) {
      imports.add(match[1]);
    }
    
    // Dynamic imports: import('./module')
    const dynamicRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((match = dynamicRegex.exec(content)) !== null) {
      imports.add(match[1]);
    }
  } catch (e) {
    // File doesn't exist or can't be read
  }
  
  return Array.from(imports);
}

// Resolve an import path to a file path
function resolveImportPath(importPath, fromFile) {
  // Skip external packages
  if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
    return null;
  }
  
  const fromDir = path.dirname(fromFile);
  const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', ''];
  
  for (const ext of extensions) {
    // Try direct file
    const directPath = path.join(fromDir, importPath + ext);
    if (fs.existsSync(directPath)) {
      return path.normalize(directPath).replace(/\\/g, '/');
    }
    
    // Try index file
    const indexPath = path.join(fromDir, importPath, 'index' + ext);
    if (fs.existsSync(indexPath)) {
      return path.normalize(indexPath).replace(/\\/g, '/');
    }
  }
  
  return null;
}

// Build dependency graph for test files
function buildTestDependencyGraph(testFiles, verbose) {
  const graph = new Map(); // testFile -> Set of dependencies
  
  for (const testFile of testFiles) {
    const deps = new Set();
    const visited = new Set();
    const queue = [testFile];
    
    while (queue.length > 0) {
      const currentFile = queue.shift();
      
      if (visited.has(currentFile)) continue;
      visited.add(currentFile);
      
      const imports = parseImports(currentFile);
      
      for (const imp of imports) {
        const resolved = resolveImportPath(imp, currentFile);
        if (resolved && !visited.has(resolved)) {
          deps.add(resolved);
          queue.push(resolved);
        }
      }
    }
    
    graph.set(testFile, deps);
    
    if (verbose) {
      console.log(`  ${testFile}: ${deps.size} dependencies`);
    }
  }
  
  return graph;
}

// Find tests affected by changed files
function findAffectedTests(changedFiles, testDependencyGraph, verbose) {
  const affectedTests = new Set();
  
  // Normalize changed files
  const normalizedChanges = new Set(
    changedFiles.map(f => path.normalize(f).replace(/\\/g, '/'))
  );
  
  for (const [testFile, deps] of testDependencyGraph) {
    // Check if test file itself changed
    if (normalizedChanges.has(testFile)) {
      affectedTests.add(testFile);
      if (verbose) {
        console.log(`  ${testFile}: directly changed`);
      }
      continue;
    }
    
    // Check if any dependency changed
    for (const dep of deps) {
      if (normalizedChanges.has(dep)) {
        affectedTests.add(testFile);
        if (verbose) {
          console.log(`  ${testFile}: dependency changed (${dep})`);
        }
        break;
      }
    }
  }
  
  return Array.from(affectedTests);
}

// Detect test runner
function detectTestRunner() {
  try {
    const pkgPath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
      };
      
      if (allDeps.vitest) return 'vitest';
      if (allDeps.jest) return 'jest';
      if (allDeps.mocha) return 'mocha';
      if (allDeps.ava) return 'ava';
      
      // Check scripts
      const testScript = pkg.scripts?.test || '';
      if (testScript.includes('vitest')) return 'vitest';
      if (testScript.includes('jest')) return 'jest';
      if (testScript.includes('mocha')) return 'mocha';
    }
  } catch (e) {
    // Fall through
  }
  
  return 'jest'; // Default
}

// Run tests
function runTests(testFiles, runner) {
  if (testFiles.length === 0) {
    console.log('✅ No tests to run');
    return;
  }

  let cmd;
  
  switch (runner) {
    case 'vitest':
      cmd = `npx vitest run ${testFiles.join(' ')}`;
      break;
    case 'mocha':
      cmd = `npx mocha ${testFiles.join(' ')}`;
      break;
    case 'ava':
      cmd = `npx ava ${testFiles.join(' ')}`;
      break;
    case 'jest':
    default:
      cmd = `npx jest ${testFiles.join(' ')}`;
      break;
  }
  
  console.log(`\n🧪 Running: ${cmd}\n`);
  
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (error) {
    process.exit(1);
  }
}

// Main
function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Test Impact Analysis

Finds which tests are affected by recent code changes.

Usage:
  node test-impact.js [options]

Options:
  --since=REF          Compare against git ref (default: HEAD~1)
  --staged             Only consider staged changes
  --all                Consider all uncommitted changes
  --format=json|list   Output format (default: list)
  --run                Run the affected tests
  --runner=NAME        Test runner (jest, vitest, mocha)
  --verbose            Show detailed analysis

Examples:
  node test-impact.js
  node test-impact.js --since=main --run
  node test-impact.js --staged --verbose
  node test-impact.js --format=json
`);
    return;
  }

  const options = parseArgs(args);
  const startTime = Date.now();

  console.log('\n🔍 Test Impact Analysis\n');

  // Get changed files
  if (options.verbose) {
    console.log('📁 Getting changed files...');
  }
  
  const changedFiles = getChangedFiles(options);
  
  if (changedFiles.length === 0) {
    console.log('ℹ️  No files changed');
    return;
  }

  console.log(`📝 ${changedFiles.length} file(s) changed`);
  
  if (options.verbose) {
    for (const f of changedFiles.slice(0, 10)) {
      console.log(`   ${f}`);
    }
    if (changedFiles.length > 10) {
      console.log(`   ... and ${changedFiles.length - 10} more`);
    }
    console.log('');
  }

  // Find all test files
  if (options.verbose) {
    console.log('🔎 Finding test files...');
  }
  
  const allTestFiles = findAllTestFiles();
  
  if (allTestFiles.length === 0) {
    console.log('ℹ️  No test files found');
    return;
  }

  console.log(`📋 ${allTestFiles.length} test file(s) in project`);

  // Build dependency graph
  if (options.verbose) {
    console.log('\n📊 Building dependency graph...');
  }
  
  const graph = buildTestDependencyGraph(allTestFiles, options.verbose);

  // Find affected tests
  if (options.verbose) {
    console.log('\n🎯 Finding affected tests...');
  }
  
  const affectedTests = findAffectedTests(changedFiles, graph, options.verbose);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  // Output results
  console.log('');
  console.log('─'.repeat(50));
  
  if (affectedTests.length === 0) {
    console.log('\n✅ No tests affected by these changes\n');
  } else {
    const skipped = allTestFiles.length - affectedTests.length;
    const skipPercent = Math.round((skipped / allTestFiles.length) * 100);
    
    console.log(`\n🎯 ${affectedTests.length} test(s) affected (${skipPercent}% skipped)\n`);

    if (options.format === 'json') {
      console.log(JSON.stringify({
        affected: affectedTests,
        total: allTestFiles.length,
        skipped: skipped,
        changedFiles: changedFiles,
        analysisTime: elapsed + 's',
      }, null, 2));
    } else {
      console.log('Affected tests:');
      for (const test of affectedTests) {
        console.log(`  • ${test}`);
      }
    }
  }

  console.log(`\n⏱️  Analysis completed in ${elapsed}s`);

  // Run tests if requested
  if (options.run && affectedTests.length > 0) {
    const runner = options.runner || detectTestRunner();
    console.log(`\n📦 Using ${runner} test runner`);
    runTests(affectedTests, runner);
  } else if (affectedTests.length > 0) {
    const runner = options.runner || detectTestRunner();
    console.log(`\n💡 To run affected tests:`);
    console.log(`   node test-impact.js --run`);
    console.log(`   or: npx ${runner} ${affectedTests.join(' ')}`);
  }

  console.log('');
}

main();

