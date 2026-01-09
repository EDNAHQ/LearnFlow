#!/usr/bin/env node

/**
 * Smart sync script - Updates EDNA changes across all projects
 * Preserves project-specific data (ideas, board, context)
 * Only syncs: commands, skills, scripts
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const EDNA_PATH = path.resolve(__dirname, '..');
const PROJECTS_DIR = path.resolve(EDNA_PATH, '..', '..');

const PROJECTS = [
  'help-genie-consumer',
  'Omni-Intelligence-Main',
  'LearnFlow',
  'LearningPortal',
  'help-genie-marketing',
  'Help-Genie-Mobile',
  'Help-Genie-Voice-1',
  'Help-Genie-Website',
  'Builder-Community',
  'AI-Art-NZ',
  'prompt-array-api',
  'superpower-original',
  'EDNA-HQ-Site',
];

// Files to PRESERVE (project-specific)
const PRESERVE_FILES = [
  '.claude/pm/ideas.md',
  '.claude/pm/board.md',
  '.claude/pm/tasks.md',
  '.claude/context.md',
  '.claude/settings.local.json',
];

function backupFile(filePath) {
  if (fs.existsSync(filePath)) {
    const backupPath = filePath + `.backup.${Date.now()}`;
    fs.copyFileSync(filePath, backupPath);
    return backupPath;
  }
  return null;
}

function syncProject(projectName) {
  const projectPath = path.join(PROJECTS_DIR, projectName);
  const projectClaudePath = path.join(projectPath, '.claude');

  if (!fs.existsSync(projectPath)) {
    console.log(`  ✗ Project not found: ${projectName}`);
    return false;
  }

  console.log(`\n📦 Syncing: ${projectName}`);

  // Backup project-specific files
  const backups = {};
  PRESERVE_FILES.forEach(file => {
    const fullPath = path.join(projectPath, file);
    const backup = backupFile(fullPath);
    if (backup) {
      backups[file] = backup;
      console.log(`   📋 Backed up: ${file}`);
    }
  });

  // Copy EDNA's commands, skills, scripts
  try {
    // Copy commands
    const ednaCommandsPath = path.join(EDNA_PATH, 'commands');
    const projectCommandsPath = path.join(projectClaudePath, 'commands');
    if (fs.existsSync(ednaCommandsPath)) {
      copyDirRecursive(ednaCommandsPath, projectCommandsPath);
      console.log(`   ✓ Synced commands`);
    }

    // Copy scripts
    const ednaScriptsPath = path.join(EDNA_PATH, 'scripts');
    const projectScriptsPath = path.join(projectClaudePath, 'scripts');
    if (fs.existsSync(ednaScriptsPath)) {
      copyDirRecursive(ednaScriptsPath, projectScriptsPath);
      console.log(`   ✓ Synced scripts`);
    }

    // Copy skills
    const ednaSkillsPath = path.join(EDNA_PATH, 'skills');
    const projectSkillsPath = path.join(projectClaudePath, 'skills');
    if (fs.existsSync(ednaSkillsPath)) {
      copyDirRecursive(ednaSkillsPath, projectSkillsPath);
      console.log(`   ✓ Synced skills`);
    }

    // Restore project-specific files
    Object.entries(backups).forEach(([file, backupPath]) => {
      const fullPath = path.join(projectPath, file);
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.copyFileSync(backupPath, fullPath);
      console.log(`   ♻️  Restored: ${file}`);
    });

    // Run setup script
    if (fs.existsSync(path.join(projectClaudePath, 'scripts', 'setup-shared-skills.js'))) {
      try {
        execSync(`cd "${projectPath}" && node .claude/scripts/setup-shared-skills.js --fix`, {
          stdio: 'pipe',
        });
        console.log(`   ✓ Symlinks configured`);
      } catch (e) {
        console.log(`   ⚠️  Symlink setup skipped`);
      }
    }

    console.log(`   ✅ Sync complete`);
    return true;
  } catch (error) {
    console.error(`   ✗ Error: ${error.message}`);
    // Restore from backups on error
    Object.entries(backups).forEach(([file, backupPath]) => {
      const fullPath = path.join(projectPath, file);
      if (fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, fullPath);
      }
    });
    return false;
  }
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    if (fs.lstatSync(srcPath).isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

// Main execution
console.log('🚀 Syncing EDNA changes to all projects...');
console.log(`Source: ${EDNA_PATH}`);

let successCount = 0;
let failureCount = 0;

PROJECTS.forEach(project => {
  if (syncProject(project)) {
    successCount++;
  } else {
    failureCount++;
  }
});

console.log('\n' + '='.repeat(50));
console.log(`✅ Synced: ${successCount} projects`);
if (failureCount > 0) {
  console.log(`❌ Failed: ${failureCount} projects`);
}
console.log('\nPreserved project-specific data:');
PRESERVE_FILES.forEach(file => {
  console.log(`  • ${file}`);
});
console.log('\nUpdated shared files:');
console.log('  • .claude/commands/**');
console.log('  • .claude/skills/**');
console.log('  • .claude/scripts/**');
console.log('\n💡 Backups created with .backup.<timestamp> suffix if needed');
