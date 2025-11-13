#!/usr/bin/env node

/**
 * Video Downsizing Script for LearnFlow
 *
 * This script compresses all video files in the public/videos directory
 * to improve loading performance and reduce bandwidth requirements.
 *
 * Requirements:
 * - ffmpeg must be installed on your system
 * - Run: npm install (to get required dependencies if any)
 *
 * Usage:
 *   node scripts/downsize-videos.js [quality]
 *
 * Quality options:
 *   - high: Better quality, larger file size (CRF 23, ~30-40% reduction)
 *   - medium: Balanced quality and size (CRF 28, ~50-60% reduction) [DEFAULT]
 *   - low: Lower quality, smallest file size (CRF 32, ~70-80% reduction)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const VIDEOS_DIR = path.join(__dirname, '../public/videos');
const BACKUP_DIR = path.join(VIDEOS_DIR, 'originals');

// Quality presets (CRF: Constant Rate Factor - lower = better quality)
const QUALITY_PRESETS = {
  high: {
    crf: 23,
    description: 'High quality, ~30-40% size reduction',
    maxBitrate: '2M'
  },
  medium: {
    crf: 28,
    description: 'Medium quality, ~50-60% size reduction',
    maxBitrate: '1M'
  },
  low: {
    crf: 32,
    description: 'Lower quality, ~70-80% size reduction',
    maxBitrate: '500k'
  }
};

// Get quality preset from command line or use default
const qualityArg = process.argv[2] || 'medium';
const quality = QUALITY_PRESETS[qualityArg] || QUALITY_PRESETS.medium;

console.log('🎬 LearnFlow Video Downsizing Script\n');
console.log(`Quality preset: ${qualityArg}`);
console.log(`Description: ${quality.description}\n`);

// Check if ffmpeg is installed
function checkFFmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.error('❌ Error: ffmpeg is not installed!');
    console.error('\nPlease install ffmpeg:');
    console.error('  - Ubuntu/Debian: sudo apt-get install ffmpeg');
    console.error('  - macOS: brew install ffmpeg');
    console.error('  - Windows: Download from https://ffmpeg.org/download.html\n');
    return false;
  }
}

// Get file size in MB
function getFileSizeMB(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / (1024 * 1024)).toFixed(2);
}

// Create backup directory if it doesn't exist
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`📁 Created backup directory: ${BACKUP_DIR}\n`);
  }
}

// Compress a single video file
function compressVideo(inputPath, outputPath) {
  const ffmpegCommand = `ffmpeg -i "${inputPath}" \
    -c:v libx264 \
    -crf ${quality.crf} \
    -preset slow \
    -maxrate ${quality.maxBitrate} \
    -bufsize ${parseInt(quality.maxBitrate) * 2}k \
    -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" \
    -movflags +faststart \
    -an \
    -y \
    "${outputPath}"`;

  try {
    execSync(ffmpegCommand, { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.error(`❌ Error compressing ${path.basename(inputPath)}:`, error.message);
    return false;
  }
}

// Main execution
async function main() {
  // Check prerequisites
  if (!checkFFmpeg()) {
    process.exit(1);
  }

  // Ensure videos directory exists
  if (!fs.existsSync(VIDEOS_DIR)) {
    console.error(`❌ Error: Videos directory not found: ${VIDEOS_DIR}`);
    process.exit(1);
  }

  // Create backup directory
  ensureBackupDir();

  // Get all video files
  const videoFiles = fs.readdirSync(VIDEOS_DIR)
    .filter(file => /\.(mp4|webm|mov|avi)$/i.test(file))
    .filter(file => file !== 'originals'); // Exclude backup directory

  if (videoFiles.length === 0) {
    console.log('No video files found to compress.');
    process.exit(0);
  }

  console.log(`Found ${videoFiles.length} video file(s) to process:\n`);

  let totalOriginalSize = 0;
  let totalCompressedSize = 0;
  const results = [];

  // Process each video
  for (let i = 0; i < videoFiles.length; i++) {
    const filename = videoFiles[i];
    const originalPath = path.join(VIDEOS_DIR, filename);
    const backupPath = path.join(BACKUP_DIR, filename);
    const tempPath = path.join(VIDEOS_DIR, `temp_${filename}`);

    console.log(`[${i + 1}/${videoFiles.length}] Processing: ${filename}`);

    const originalSize = getFileSizeMB(originalPath);
    console.log(`  Original size: ${originalSize} MB`);

    // Backup original if not already backed up
    if (!fs.existsSync(backupPath)) {
      console.log(`  Creating backup...`);
      fs.copyFileSync(originalPath, backupPath);
    }

    // Compress video
    console.log(`  Compressing... (this may take a minute)`);
    const success = compressVideo(originalPath, tempPath);

    if (success) {
      const compressedSize = getFileSizeMB(tempPath);
      const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1);

      console.log(`  Compressed size: ${compressedSize} MB`);
      console.log(`  Size reduction: ${reduction}%`);

      // Replace original with compressed version
      fs.unlinkSync(originalPath);
      fs.renameSync(tempPath, originalPath);

      totalOriginalSize += parseFloat(originalSize);
      totalCompressedSize += parseFloat(compressedSize);

      results.push({
        filename,
        originalSize: parseFloat(originalSize),
        compressedSize: parseFloat(compressedSize),
        reduction: parseFloat(reduction)
      });

      console.log(`  ✅ Done!\n`);
    } else {
      console.log(`  ⚠️  Skipped due to error\n`);
      // Clean up temp file if it exists
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }
  }

  // Print summary
  console.log('=' .repeat(60));
  console.log('📊 COMPRESSION SUMMARY\n');

  results.forEach(result => {
    console.log(`${result.filename}`);
    console.log(`  ${result.originalSize.toFixed(2)} MB → ${result.compressedSize.toFixed(2)} MB (${result.reduction}% reduction)`);
  });

  console.log('\n' + '='.repeat(60));
  console.log(`Total original size: ${totalOriginalSize.toFixed(2)} MB`);
  console.log(`Total compressed size: ${totalCompressedSize.toFixed(2)} MB`);
  console.log(`Total reduction: ${((1 - totalCompressedSize / totalOriginalSize) * 100).toFixed(1)}%`);
  console.log(`Space saved: ${(totalOriginalSize - totalCompressedSize).toFixed(2)} MB`);
  console.log('=' .repeat(60));
  console.log(`\n✅ All videos compressed successfully!`);
  console.log(`📁 Original videos backed up to: ${BACKUP_DIR}\n`);
}

// Run the script
main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
