#!/usr/bin/env node
/**
 * Auto-generate SKILL-INDEX.md from skill and command files
 *
 * Scans all .md files in .claude/skills/ and .claude/commands/,
 * extracts frontmatter, and generates an alphabetized index.
 *
 * Run manually: node .claude/scripts/generate-skill-index.js
 * Runs automatically on session start via hooks
 */

const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join(__dirname, '..', '..', 'skills');
const COMMANDS_DIR = path.join(__dirname, '..', '..', 'commands');
const INDEX_FILE = path.join(SKILLS_DIR, 'SKILL-INDEX.md');
const README_FILE = path.join(SKILLS_DIR, 'README.md');

// Files to ignore (not skills)
const IGNORE_FILES = ['README.md', 'SKILL-INDEX.md'];

// Tags based on skill properties
const TAGS = {
  rigid: ['tdd', 'debugging', 'skill-usage'],
  flexible: ['task-decomposition', 'brainstorming', 'project-templates'],
  autonomous: ['prepare-autonomous-execution', 'autonomous-resilience', 'error-recovery-loop', 'progress-heartbeat', 'rollback-ready'],
  externalApi: ['image-generation', 'audio-generation', 'transcription', 'web-research', 'translation'],
};

// Script mappings
const SCRIPT_MAP = {
  'env-validator': 'scripts/dev-tools/env-validator.js',
  'smart-commit': 'scripts/dev-tools/git/smart-commit.js',
  'test-impact': 'scripts/dev-tools/testing/test-impact.js',
  'codebase-context': 'scripts/dev-tools/codebase-context.js',
  'worktree-dashboard': 'scripts/dev-tools/git/worktree-dashboard.js',
  'visual-feedback-loop': 'scripts/media/screenshot.js',
  'image-generation': 'scripts/ai/image-generation/generate-dalle.js',
  'audio-generation': 'scripts/ai/audio/generate-audio.js',
  'transcription': 'scripts/ai/audio/transcribe.js',
  'web-research': 'scripts/ai/search-web.js',
  'translation': 'scripts/ai/translate.js',
};

// API key requirements
const API_KEYS = {
  'image-generation': 'OPENAI_API_KEY or REPLICATE_API_TOKEN',
  'audio-generation': 'OPENAI_API_KEY or ELEVENLABS_API_KEY',
  'transcription': 'OPENAI_API_KEY or ASSEMBLYAI_API_KEY',
  'web-research': 'TAVILY_API_KEY or PERPLEXITY_API_KEY',
  'translation': 'DEEPL_API_KEY or GOOGLE_TRANSLATE_API_KEY',
};

/**
 * Parse YAML frontmatter from markdown content
 */
function parseFrontmatter(content) {
  // Handle both LF and CRLF line endings
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  
  const frontmatter = {};
  const lines = match[1].split(/\r?\n/);
  
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    
    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();
    
    // Remove quotes
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    
    frontmatter[key] = value;
  }
  
  return frontmatter;
}

/**
 * Recursively find all skill files
 */
function findSkillFiles(dir, baseDir = dir) {
  const skills = [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      skills.push(...findSkillFiles(fullPath, baseDir));
    } else if (entry.isFile() && entry.name.endsWith('.md') && !IGNORE_FILES.includes(entry.name)) {
      const relativePath = path.relative(baseDir, fullPath);
      const category = path.dirname(relativePath);

      const content = fs.readFileSync(fullPath, 'utf-8');
      const frontmatter = parseFrontmatter(content);

      if (frontmatter && frontmatter.name) {
        skills.push({
          name: frontmatter.name,
          description: frontmatter.description || 'No description',
          category: category === '.' ? 'root' : category.replace(/\\/g, '/'),
          file: relativePath.replace(/\\/g, '/'),
        });
      }
    }
  }

  return skills;
}

/**
 * Find all command files
 */
function findCommandFiles(dir, baseDir = dir) {
  const commands = [];

  if (!fs.existsSync(dir)) return commands;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      commands.push(...findCommandFiles(fullPath, baseDir));
    } else if (entry.isFile() && entry.name.endsWith('.md') && !IGNORE_FILES.includes(entry.name)) {
      const relativePath = path.relative(baseDir, fullPath);
      const category = path.dirname(relativePath);
      const commandName = path.basename(entry.name, '.md');

      const content = fs.readFileSync(fullPath, 'utf-8');
      const frontmatter = parseFrontmatter(content);

      if (frontmatter && frontmatter.description) {
        commands.push({
          name: commandName,
          description: frontmatter.description,
          category: category === '.' ? 'root' : category.replace(/\\/g, '/'),
          file: relativePath.replace(/\\/g, '/'),
          command: `/${category === '.' ? '' : category + ':'}${commandName}`,
        });
      }
    }
  }

  return commands;
}

/**
 * Group skills by first letter for alphabetical index
 */
function groupByLetter(skills) {
  const groups = {};
  
  for (const skill of skills) {
    const letter = skill.name[0].toUpperCase();
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(skill);
  }
  
  // Sort within each group
  for (const letter of Object.keys(groups)) {
    groups[letter].sort((a, b) => a.name.localeCompare(b.name));
  }
  
  return groups;
}

/**
 * Generate the markdown content
 */
function generateIndex(skills, commands) {
  const byLetter = groupByLetter(skills);
  const letters = Object.keys(byLetter).sort();

  let md = `# Skill & Command Index

> **Auto-generated** - Do not edit manually. Run \`node .claude/scripts/generate-skill-index.js\` to regenerate.
>
> Last updated: ${new Date().toISOString().split('T')[0]}

Alphabetical quick-reference for all skills and commands. Use Ctrl+F to find what you need.

**Total: ${skills.length} skills, ${commands.length} commands**

---

## Commands

| Command | Category | Description |
|---------|----------|-------------|
`;

  // Sort commands by category then name
  const sortedCommands = [...commands].sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.name.localeCompare(b.name);
  });

  for (const cmd of sortedCommands) {
    md += `| \`${cmd.command}\` | ${cmd.category} | ${cmd.description} |\n`;
  }

  md += `
---

## Skills

`;

  // Alphabetical sections
  for (const letter of letters) {
    md += `## ${letter}\n\n`;
    md += `| Skill | Category | One-Line Description |\n`;
    md += `|-------|----------|---------------------|\n`;
    
    for (const skill of byLetter[letter]) {
      md += `| \`${skill.name}\` | ${skill.category} | ${skill.description} |\n`;
    }
    
    md += '\n';
  }

  // Tags section
  md += `---

## By Tag

### 🔴 Rigid Skills (Follow Exactly)
`;
  for (const name of TAGS.rigid) {
    const skill = skills.find(s => s.name === name);
    if (skill) md += `- \`${name}\` - ${skill.description.split('.')[0]}\n`;
  }

  md += `
### 🟢 Flexible Skills (Adapt to Context)
`;
  for (const name of TAGS.flexible) {
    const skill = skills.find(s => s.name === name);
    if (skill) md += `- \`${name}\` - ${skill.description.split('.')[0]}\n`;
  }

  md += `
### 🤖 Autonomous-Critical
Skills essential for AFK work:
`;
  for (const name of TAGS.autonomous) {
    if (skills.find(s => s.name === name)) {
      md += `- \`${name}\`\n`;
    }
  }

  md += `
### 🔌 External APIs Required
`;
  for (const [name, keys] of Object.entries(API_KEYS)) {
    if (skills.find(s => s.name === name)) {
      md += `- \`${name}\` - ${keys}\n`;
    }
  }

  md += `
### 📜 Has Companion Script
`;
  for (const [skillName, scriptPath] of Object.entries(SCRIPT_MAP)) {
    if (skills.find(s => s.name === skillName)) {
      md += `- \`${skillName}\` → \`${scriptPath}\`\n`;
    }
  }

  // Decision tree
  md += `
---

## Quick Decision Tree

\`\`\`
What do I need?
│
├─ Starting work on a project?
│  └─ project-status → dependency-scout → prepare-autonomous-execution
│
├─ Building a new feature?
│  └─ brainstorming → task-decomposition → tdd → verification
│
├─ Fixing a bug?
│  └─ debugging → root-cause-tracing → tdd → verification
│
├─ Working AFK/autonomously?
│  └─ prepare-autonomous-execution → autonomous-resilience → error-recovery-loop
│
├─ Stuck on an error?
│  └─ error-recovery-loop → context-refresh (if confused)
│
├─ Need external capability?
│  └─ Check integrations/ (image, audio, transcription, web, translation)
│
└─ Managing multiple projects?
   └─ multi-project-dashboard → smart-prioritization → delegation-queue
\`\`\`

---

## All Categories

`;

  // Group by category for summary
  const byCategory = {};
  for (const skill of skills) {
    if (!byCategory[skill.category]) byCategory[skill.category] = [];
    byCategory[skill.category].push(skill);
  }
  
  const categories = Object.keys(byCategory).sort();
  for (const cat of categories) {
    md += `### ${cat}\n`;
    for (const skill of byCategory[cat].sort((a, b) => a.name.localeCompare(b.name))) {
      md += `- \`${skill.name}\`\n`;
    }
    md += '\n';
  }

  return md;
}

/**
 * Get the newest modification time of any skill file
 */
function getNewestSkillMtime(dir) {
  let newest = 0;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const subNewest = getNewestSkillMtime(fullPath);
      if (subNewest > newest) newest = subNewest;
    } else if (entry.isFile() && entry.name.endsWith('.md') && !IGNORE_FILES.includes(entry.name)) {
      const stat = fs.statSync(fullPath);
      if (stat.mtimeMs > newest) newest = stat.mtimeMs;
    }
  }
  
  return newest;
}

// Main execution
function main() {
  // Check if regeneration is needed (skip if index is newer than all skills/commands)
  const forceRegenerate = process.argv.includes('--force');

  if (!forceRegenerate && fs.existsSync(INDEX_FILE)) {
    const indexMtime = fs.statSync(INDEX_FILE).mtimeMs;
    const newestSkillMtime = getNewestSkillMtime(SKILLS_DIR);
    const newestCommandMtime = fs.existsSync(COMMANDS_DIR) ? getNewestSkillMtime(COMMANDS_DIR) : 0;
    const newestMtime = Math.max(newestSkillMtime, newestCommandMtime);

    if (indexMtime > newestMtime) {
      console.log('✓ Skill index is up to date');
      return { skillCount: 0, commandCount: 0, categories: 0, skipped: true };
    }
  }

  console.log('🔍 Scanning skills and commands...');

  const skills = findSkillFiles(SKILLS_DIR);
  console.log(`📚 Found ${skills.length} skills`);

  const commands = findCommandFiles(COMMANDS_DIR);
  console.log(`⚡ Found ${commands.length} commands`);

  const indexContent = generateIndex(skills, commands);

  fs.writeFileSync(INDEX_FILE, indexContent);
  console.log(`✅ Generated ${INDEX_FILE}`);

  // Output summary for hook
  return {
    skillCount: skills.length,
    commandCount: commands.length,
    categories: [...new Set(skills.map(s => s.category))].length,
    skipped: false,
  };
}

const result = main();
if (!result.skipped) {
  console.log(`📊 ${result.skillCount} skills, ${result.commandCount} commands across ${result.categories} categories`);
}

