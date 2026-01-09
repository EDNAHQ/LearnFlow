#!/usr/bin/env node
/**
 * Codebase Context Generator
 * 
 * Generates a structured summary of the codebase for new subagents
 * or for quickly understanding a project's architecture.
 * 
 * Usage:
 *   node codebase-context.js [options]
 * 
 * Options:
 *   --format=markdown|json  Output format (default: markdown)
 *   --output=FILE           Write to file instead of stdout
 *   --depth=N               Directory traversal depth (default: 3)
 *   --include-deps          Include dependency analysis
 *   --include-patterns      Include coding patterns/conventions
 *   --for-subagent          Optimized format for subagent context loading
 *   --focus=PATH            Focus on specific directory
 * 
 * Examples:
 *   node codebase-context.js
 *   node codebase-context.js --for-subagent --output=context.md
 *   node codebase-context.js --focus=src/auth --include-patterns
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse arguments
function parseArgs(args) {
  const result = {
    format: 'markdown',
    output: null,
    depth: 3,
    includeDeps: false,
    includePatterns: false,
    forSubagent: false,
    focus: null,
  };

  for (const arg of args) {
    if (arg.startsWith('--format=')) {
      result.format = arg.split('=')[1];
    } else if (arg.startsWith('--output=')) {
      result.output = arg.split('=')[1];
    } else if (arg.startsWith('--depth=')) {
      result.depth = parseInt(arg.split('=')[1]);
    } else if (arg === '--include-deps') {
      result.includeDeps = true;
    } else if (arg === '--include-patterns') {
      result.includePatterns = true;
    } else if (arg === '--for-subagent') {
      result.forSubagent = true;
      result.includePatterns = true;
    } else if (arg.startsWith('--focus=')) {
      result.focus = arg.split('=')[1];
    }
  }

  return result;
}

// Get project info from package.json
function getProjectInfo() {
  const info = {
    name: null,
    description: null,
    version: null,
    type: 'unknown',
    scripts: {},
    dependencies: [],
    devDependencies: [],
  };

  try {
    const pkgPath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      info.name = pkg.name;
      info.description = pkg.description;
      info.version = pkg.version;
      info.type = 'node';
      info.scripts = pkg.scripts || {};
      info.dependencies = Object.keys(pkg.dependencies || {});
      info.devDependencies = Object.keys(pkg.devDependencies || {});
    }
  } catch (e) {
    // No package.json
  }

  // Try Cargo.toml for Rust
  try {
    const cargoPath = path.join(process.cwd(), 'Cargo.toml');
    if (fs.existsSync(cargoPath)) {
      info.type = 'rust';
      const content = fs.readFileSync(cargoPath, 'utf8');
      const nameMatch = content.match(/name\s*=\s*"([^"]+)"/);
      if (nameMatch) info.name = nameMatch[1];
    }
  } catch (e) {}

  // Try pyproject.toml or setup.py for Python
  try {
    if (fs.existsSync(path.join(process.cwd(), 'pyproject.toml')) ||
        fs.existsSync(path.join(process.cwd(), 'setup.py')) ||
        fs.existsSync(path.join(process.cwd(), 'requirements.txt'))) {
      info.type = 'python';
    }
  } catch (e) {}

  return info;
}

// Get git info
function getGitInfo() {
  const info = {
    branch: null,
    lastCommit: null,
    remoteUrl: null,
    status: null,
  };

  try {
    info.branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    info.lastCommit = execSync('git log -1 --oneline', { encoding: 'utf8' }).trim();
    info.remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    const lines = status.trim().split('\n').filter(Boolean);
    info.status = lines.length > 0 ? `${lines.length} uncommitted changes` : 'clean';
  } catch (e) {
    // Not a git repo or git not available
  }

  return info;
}

// Detect tech stack
function detectTechStack(projectInfo) {
  const stack = {
    language: [],
    framework: [],
    testing: [],
    database: [],
    other: [],
  };

  const deps = [...projectInfo.dependencies, ...projectInfo.devDependencies];

  // Languages
  if (fs.existsSync(path.join(process.cwd(), 'tsconfig.json'))) {
    stack.language.push('TypeScript');
  } else if (deps.some(d => d.includes('babel') || d === 'react')) {
    stack.language.push('JavaScript (ES6+)');
  }

  // Frameworks
  const frameworks = {
    'next': 'Next.js',
    'react': 'React',
    'vue': 'Vue.js',
    'svelte': 'Svelte',
    'express': 'Express.js',
    'fastify': 'Fastify',
    'nest': 'NestJS',
    'hono': 'Hono',
    'koa': 'Koa',
  };

  for (const [key, name] of Object.entries(frameworks)) {
    if (deps.some(d => d.includes(key))) {
      stack.framework.push(name);
    }
  }

  // Testing
  const testingTools = {
    'jest': 'Jest',
    'vitest': 'Vitest',
    'mocha': 'Mocha',
    'playwright': 'Playwright',
    'cypress': 'Cypress',
    'testing-library': 'Testing Library',
  };

  for (const [key, name] of Object.entries(testingTools)) {
    if (deps.some(d => d.includes(key))) {
      stack.testing.push(name);
    }
  }

  // Database
  const databases = {
    'prisma': 'Prisma',
    'drizzle': 'Drizzle',
    'mongoose': 'MongoDB (Mongoose)',
    'pg': 'PostgreSQL',
    'mysql': 'MySQL',
    'sqlite': 'SQLite',
    'redis': 'Redis',
  };

  for (const [key, name] of Object.entries(databases)) {
    if (deps.some(d => d.includes(key))) {
      stack.database.push(name);
    }
  }

  // Other notable tools
  const otherTools = {
    'tailwind': 'Tailwind CSS',
    'styled-components': 'Styled Components',
    'zod': 'Zod',
    'trpc': 'tRPC',
    'graphql': 'GraphQL',
    'socket.io': 'Socket.IO',
  };

  for (const [key, name] of Object.entries(otherTools)) {
    if (deps.some(d => d.includes(key))) {
      stack.other.push(name);
    }
  }

  return stack;
}

// Build directory tree
function buildDirectoryTree(rootDir, maxDepth, currentDepth = 0) {
  const tree = {
    name: path.basename(rootDir),
    type: 'directory',
    children: [],
  };

  if (currentDepth >= maxDepth) {
    tree.truncated = true;
    return tree;
  }

  const skipDirs = [
    'node_modules', '.git', 'dist', 'build', '.next', '.nuxt',
    'coverage', '__pycache__', '.pytest_cache', 'target',
    '.turbo', '.vercel', '.output',
  ];

  try {
    const entries = fs.readdirSync(rootDir, { withFileTypes: true });
    
    // Sort: directories first, then files
    const sorted = entries.sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

    for (const entry of sorted) {
      if (entry.name.startsWith('.') && entry.name !== '.env.example') {
        continue;
      }

      if (entry.isDirectory()) {
        if (skipDirs.includes(entry.name)) {
          continue;
        }
        const childPath = path.join(rootDir, entry.name);
        tree.children.push(buildDirectoryTree(childPath, maxDepth, currentDepth + 1));
      } else {
        tree.children.push({
          name: entry.name,
          type: 'file',
          ext: path.extname(entry.name),
        });
      }
    }
  } catch (e) {
    tree.error = 'Cannot read directory';
  }

  return tree;
}

// Render tree as text
function renderTree(tree, prefix = '', isLast = true) {
  const lines = [];
  const connector = isLast ? '└── ' : '├── ';
  const extension = isLast ? '    ' : '│   ';

  lines.push(prefix + connector + tree.name + (tree.truncated ? ' ...' : ''));

  if (tree.children) {
    for (let i = 0; i < tree.children.length; i++) {
      const child = tree.children[i];
      const childIsLast = i === tree.children.length - 1;
      lines.push(...renderTree(child, prefix + extension, childIsLast));
    }
  }

  return lines;
}

// Detect coding patterns
function detectPatterns(focusDir) {
  const patterns = {
    fileNaming: [],
    componentStructure: null,
    stateManagement: null,
    dataFetching: null,
    styling: null,
  };

  const rootDir = focusDir || process.cwd();

  // Check for common patterns in file structure
  try {
    // Component structure
    if (fs.existsSync(path.join(rootDir, 'src', 'components'))) {
      const components = fs.readdirSync(path.join(rootDir, 'src', 'components'));
      const hasFolders = components.some(c => {
        const p = path.join(rootDir, 'src', 'components', c);
        return fs.statSync(p).isDirectory();
      });
      patterns.componentStructure = hasFolders ? 'folder-per-component' : 'flat';
    }

    // State management
    const deps = getProjectInfo().dependencies;
    if (deps.includes('zustand')) patterns.stateManagement = 'Zustand';
    else if (deps.includes('jotai')) patterns.stateManagement = 'Jotai';
    else if (deps.includes('recoil')) patterns.stateManagement = 'Recoil';
    else if (deps.includes('redux') || deps.includes('@reduxjs/toolkit')) patterns.stateManagement = 'Redux';
    else if (deps.includes('mobx')) patterns.stateManagement = 'MobX';

    // Data fetching
    if (deps.includes('@tanstack/react-query')) patterns.dataFetching = 'TanStack Query';
    else if (deps.includes('swr')) patterns.dataFetching = 'SWR';
    else if (deps.includes('@trpc/client')) patterns.dataFetching = 'tRPC';

    // Styling
    if (deps.includes('tailwindcss')) patterns.styling = 'Tailwind CSS';
    else if (deps.includes('styled-components')) patterns.styling = 'Styled Components';
    else if (deps.includes('@emotion/react')) patterns.styling = 'Emotion';

  } catch (e) {
    // Ignore errors
  }

  return patterns;
}

// Get key files content preview
function getKeyFilePreviews() {
  const keyFiles = [
    'README.md',
    'CONTRIBUTING.md',
    '.env.example',
    'tsconfig.json',
  ];

  const previews = {};

  for (const file of keyFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        // Get first 50 lines or 2000 chars
        const lines = content.split('\n').slice(0, 50);
        let preview = lines.join('\n');
        if (preview.length > 2000) {
          preview = preview.slice(0, 2000) + '\n... (truncated)';
        }
        previews[file] = preview;
      } catch (e) {
        // Skip
      }
    }
  }

  return previews;
}

// Generate markdown output
function generateMarkdown(data, options) {
  const lines = [];

  lines.push('# Codebase Context');
  lines.push('');

  // Project Overview
  lines.push('## Project Overview');
  lines.push('');
  if (data.project.name) {
    lines.push(`**Name:** ${data.project.name}`);
  }
  if (data.project.description) {
    lines.push(`**Description:** ${data.project.description}`);
  }
  if (data.project.version) {
    lines.push(`**Version:** ${data.project.version}`);
  }
  lines.push('');

  // Git Status
  if (data.git.branch) {
    lines.push('## Git Status');
    lines.push('');
    lines.push(`- **Branch:** ${data.git.branch}`);
    lines.push(`- **Last Commit:** ${data.git.lastCommit}`);
    lines.push(`- **Status:** ${data.git.status}`);
    lines.push('');
  }

  // Tech Stack
  lines.push('## Tech Stack');
  lines.push('');
  for (const [category, items] of Object.entries(data.stack)) {
    if (items.length > 0) {
      lines.push(`- **${category.charAt(0).toUpperCase() + category.slice(1)}:** ${items.join(', ')}`);
    }
  }
  lines.push('');

  // Directory Structure
  lines.push('## Directory Structure');
  lines.push('');
  lines.push('```');
  lines.push(data.tree.name);
  for (let i = 0; i < data.tree.children.length; i++) {
    const child = data.tree.children[i];
    const isLast = i === data.tree.children.length - 1;
    lines.push(...renderTree(child, '', isLast));
  }
  lines.push('```');
  lines.push('');

  // NPM Scripts
  if (Object.keys(data.project.scripts).length > 0) {
    lines.push('## Available Scripts');
    lines.push('');
    const importantScripts = ['dev', 'build', 'test', 'lint', 'start'];
    for (const script of importantScripts) {
      if (data.project.scripts[script]) {
        lines.push(`- \`npm run ${script}\`: ${data.project.scripts[script]}`);
      }
    }
    lines.push('');
  }

  // Patterns
  if (options.includePatterns && data.patterns) {
    lines.push('## Coding Patterns');
    lines.push('');
    if (data.patterns.componentStructure) {
      lines.push(`- **Component Structure:** ${data.patterns.componentStructure}`);
    }
    if (data.patterns.stateManagement) {
      lines.push(`- **State Management:** ${data.patterns.stateManagement}`);
    }
    if (data.patterns.dataFetching) {
      lines.push(`- **Data Fetching:** ${data.patterns.dataFetching}`);
    }
    if (data.patterns.styling) {
      lines.push(`- **Styling:** ${data.patterns.styling}`);
    }
    lines.push('');
  }

  // Subagent Instructions
  if (options.forSubagent) {
    lines.push('## Working in This Codebase');
    lines.push('');
    lines.push('### Before Making Changes');
    lines.push('');
    lines.push('1. Review existing patterns in the codebase');
    lines.push('2. Run tests: `npm test`');
    lines.push('3. Check linting: `npm run lint`');
    lines.push('');
    lines.push('### Conventions to Follow');
    lines.push('');
    lines.push('- Match existing code style and patterns');
    lines.push('- Write tests for new functionality');
    lines.push('- Keep commits focused and well-described');
    lines.push('');
  }

  // Key Files
  if (Object.keys(data.keyFiles).length > 0) {
    lines.push('## Key Files');
    lines.push('');
    for (const [file, content] of Object.entries(data.keyFiles)) {
      lines.push(`### ${file}`);
      lines.push('');
      lines.push('```');
      lines.push(content);
      lines.push('```');
      lines.push('');
    }
  }

  return lines.join('\n');
}

// Main
function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Codebase Context Generator

Generates a structured summary of the codebase for understanding
or for loading context into subagents.

Usage:
  node codebase-context.js [options]

Options:
  --format=markdown|json   Output format (default: markdown)
  --output=FILE            Write to file
  --depth=N                Directory depth (default: 3)
  --include-deps           Include dependency analysis
  --include-patterns       Include coding patterns
  --for-subagent           Optimized for subagent context
  --focus=PATH             Focus on specific directory

Examples:
  node codebase-context.js
  node codebase-context.js --for-subagent --output=context.md
  node codebase-context.js --focus=src/auth
`);
    return;
  }

  const options = parseArgs(args);
  const rootDir = options.focus ? path.resolve(options.focus) : process.cwd();

  console.error('📊 Generating codebase context...\n');

  // Gather data
  const data = {
    project: getProjectInfo(),
    git: getGitInfo(),
    stack: detectTechStack(getProjectInfo()),
    tree: buildDirectoryTree(rootDir, options.depth),
    patterns: options.includePatterns ? detectPatterns(options.focus) : null,
    keyFiles: getKeyFilePreviews(),
    generatedAt: new Date().toISOString(),
  };

  // Generate output
  let output;
  if (options.format === 'json') {
    output = JSON.stringify(data, null, 2);
  } else {
    output = generateMarkdown(data, options);
  }

  // Write or print
  if (options.output) {
    fs.writeFileSync(options.output, output);
    console.error(`✅ Context written to: ${options.output}`);
  } else {
    console.log(output);
  }
}

main();

