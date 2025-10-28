#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const FFMPEG_PATH = "C:\\ffmpeg\\ffmpeg-8.0-essentials_build\\bin\\ffmpeg.exe";
const VIDEO_DIR = path.join(__dirname, "../../public/videos");
const BACKUP_DIR = path.join(__dirname, "backups");

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

console.log("=".repeat(50));
console.log("Video Compression Script");
console.log("=".repeat(50));
console.log();

// Get all MP4 files
const videoFiles = fs
  .readdirSync(VIDEO_DIR)
  .filter((f) => f.endsWith(".mp4"))
  .sort();

if (videoFiles.length === 0) {
  console.log("No MP4 files found in", VIDEO_DIR);
  process.exit(1);
}

console.log(`Found ${videoFiles.length} video(s) to compress`);
console.log(`Video directory: ${VIDEO_DIR}`);
console.log(`Backup directory: ${BACKUP_DIR}`);
console.log();

let successCount = 0;
let failedCount = 0;

for (const filename of videoFiles) {
  const inputPath = path.join(VIDEO_DIR, filename);
  const outputPath = path.join(VIDEO_DIR, `temp_${filename}`);
  const backupPath = path.join(BACKUP_DIR, filename);

  console.log(`Processing: ${filename}`);

  // Get original size
  const origSizeMB = fs.statSync(inputPath).size / (1024 * 1024);
  console.log(`  Original size: ${origSizeMB.toFixed(2)} MB`);

  // Backup original
  fs.copyFileSync(inputPath, backupPath);

  // Compress video using H.265 codec for better compression
  const cmd = `"${FFMPEG_PATH}" -i "${inputPath}" -vcodec libx265 -crf 28 -preset fast -acodec aac -b:a 128k -y "${outputPath}"`;

  try {
    execSync(cmd, { stdio: "pipe", timeout: 3600000 });

    if (fs.existsSync(outputPath)) {
      // Replace original with compressed version
      fs.unlinkSync(inputPath);
      fs.renameSync(outputPath, inputPath);

      // Get new file size and calculate reduction
      const newSizeMB = fs.statSync(inputPath).size / (1024 * 1024);
      const reductionPercent = ((origSizeMB - newSizeMB) / origSizeMB) * 100;

      console.log(`  ✓ Compressed to: ${newSizeMB.toFixed(2)} MB (reduced by ${reductionPercent.toFixed(1)}%)`);
      successCount++;
    } else {
      console.log(`  ✗ Failed to create compressed file`);
      // Restore from backup
      fs.copyFileSync(backupPath, inputPath);
      failedCount++;
    }
  } catch (err) {
    console.log(`  ✗ Error: ${err.message.split("\n")[0]}`);
    if (fs.existsSync(outputPath)) {
      try {
        fs.unlinkSync(outputPath);
      } catch (e) {
        // ignore
      }
    }
    // Restore from backup
    try {
      fs.copyFileSync(backupPath, inputPath);
    } catch (e) {
      // ignore
    }
    failedCount++;
  }

  console.log();
}

console.log("=".repeat(50));
console.log("Compression Complete!");
console.log("=".repeat(50));
console.log(`✓ Successfully compressed: ${successCount} video(s)`);
console.log(`✗ Failed: ${failedCount} video(s)`);
console.log(`📁 Backups saved in: ${BACKUP_DIR}`);
console.log();
