#!/usr/bin/env node

/**
 * Media Utilities
 *
 * Shared utilities for video and image processing scripts.
 * Eliminates code duplication across media operations.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');
const os = require('os');

class MediaUtils {
  /**
   * Format bytes to human-readable size
   * @param {number} bytes - Size in bytes
   * @returns {string} Formatted size (e.g., "45.2 MB")
   */
  static formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = Math.abs(bytes);
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    const sign = bytes < 0 ? '-' : '';
    return `${sign}${size.toFixed(1)} ${units[unitIndex]}`;
  }

  /**
   * Format seconds to HH:MM:SS format
   * @param {number} seconds - Duration in seconds
   * @returns {string} Formatted duration (e.g., "00:05:30")
   */
  static formatDuration(seconds) {
    if (!Number.isFinite(seconds)) return '00:00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  /**
   * Parse time string to seconds
   * Supports: "1:30", "90s", "01:30:00", "1.5"
   * @param {string} timeString - Time string to parse
   * @returns {number} Duration in seconds
   */
  static parseDuration(timeString) {
    if (!timeString) return 0;

    // Handle milliseconds
    if (timeString.endsWith('ms')) {
      return parseInt(timeString, 10) / 1000;
    }

    // Handle seconds
    if (timeString.endsWith('s')) {
      return parseInt(timeString, 10);
    }

    // Handle decimal seconds
    if (!isNaN(parseFloat(timeString))) {
      return parseFloat(timeString);
    }

    // Handle HH:MM:SS
    if (timeString.includes(':')) {
      const parts = timeString.split(':').map(p => parseInt(p, 10));
      if (parts.length === 2) {
        return parts[0] * 60 + parts[1]; // MM:SS
      } else if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2]; // HH:MM:SS
      }
    }

    return 0;
  }

  /**
   * Get video metadata via ffprobe
   * @param {string} filePath - Path to video file
   * @returns {object} Video info: {width, height, duration, fps, codec, bitrate, hasAudio}
   */
  static getVideoInfo(filePath) {
    try {
      const result = execSync(
        `ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`,
        { encoding: 'utf-8' }
      );
      const data = JSON.parse(result);

      const videoStream = data.streams.find(s => s.codec_type === 'video');
      const audioStream = data.streams.find(s => s.codec_type === 'audio');

      return {
        width: videoStream?.width,
        height: videoStream?.height,
        duration: parseFloat(data.format.duration),
        fps: videoStream?.r_frame_rate ?
          parseInt(videoStream.r_frame_rate.split('/')[0]) / parseInt(videoStream.r_frame_rate.split('/')[1]) :
          30,
        codec: videoStream?.codec_name,
        bitrate: parseInt(data.format.bit_rate),
        hasAudio: !!audioStream
      };
    } catch (e) {
      return null;
    }
  }

  /**
   * Get audio metadata via ffprobe
   * @param {string} filePath - Path to audio file
   * @returns {object} Audio info: {duration, codec, bitrate, channels, sampleRate}
   */
  static getAudioInfo(filePath) {
    try {
      const result = execSync(
        `ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`,
        { encoding: 'utf-8' }
      );
      const data = JSON.parse(result);
      const audioStream = data.streams.find(s => s.codec_type === 'audio') || data.streams[0];

      return {
        duration: parseFloat(data.format.duration),
        codec: audioStream?.codec_name,
        bitrate: parseInt(audioStream?.bit_rate || data.format.bit_rate),
        channels: audioStream?.channels,
        sampleRate: audioStream?.sample_rate
      };
    } catch (e) {
      return null;
    }
  }

  /**
   * Recursively scan directory for files with specific extensions
   * @param {string} directory - Directory to scan
   * @param {string|string[]} extensions - Extension(s) to match (e.g., '.mp4' or ['.mp4', '.mkv'])
   * @param {boolean} recursive - Include subdirectories
   * @returns {string[]} Array of file paths
   */
  static scanFiles(directory, extensions, recursive = false) {
    const exts = Array.isArray(extensions) ? extensions : [extensions];
    const files = [];

    function scan(dir) {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory() && recursive) {
            scan(fullPath);
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            if (exts.some(e => e.toLowerCase() === ext)) {
              files.push(fullPath);
            }
          }
        }
      } catch (e) {
        // Skip directories we can't read
      }
    }

    scan(directory);
    return files;
  }

  /**
   * Check if tool is available in PATH
   * @param {string} command - Command to check (e.g., 'ffmpeg')
   * @returns {boolean} True if tool is available
   */
  static checkTool(command) {
    try {
      execSync(`${command} -version`, { stdio: 'ignore', windowsHide: true });
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Generate timestamp for filenames
   * @param {string} format - Format string (YYYY-MM-DD-HHmmss)
   * @returns {string} Formatted timestamp
   */
  static generateTimestamp(format = 'YYYY-MM-DD-HHmmss') {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');

    const replacements = {
      YYYY: now.getFullYear(),
      MM: pad(now.getMonth() + 1),
      DD: pad(now.getDate()),
      HH: pad(now.getHours()),
      mm: pad(now.getMinutes()),
      ss: pad(now.getSeconds()),
    };

    let result = format;
    for (const [key, value] of Object.entries(replacements)) {
      result = result.replace(key, value);
    }
    return result;
  }

  /**
   * Validate that a file exists and matches expected types
   * @param {string} filePath - Path to file
   * @param {string[]} expectedExtensions - Expected extensions (e.g., ['.mp4', '.mkv'])
   * @throws {Error} If file doesn't exist or extension doesn't match
   */
  static validateFile(filePath, expectedExtensions = []) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    if (expectedExtensions.length > 0) {
      const ext = path.extname(filePath).toLowerCase();
      const validExts = expectedExtensions.map(e => e.toLowerCase());
      if (!validExts.includes(ext)) {
        throw new Error(
          `Invalid file type: ${ext}\n` +
          `Expected: ${validExts.join(', ')}`
        );
      }
    }
  }

  /**
   * Send Windows notification
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {string} type - Notification type: 'info', 'success', 'error', 'warning'
   */
  static sendNotification(title, message, type = 'info') {
    if (process.platform !== 'win32') return; // Only on Windows

    try {
      const iconCode = {
        info: 64,
        success: 64,
        error: 16,
        warning: 48
      }[type] || 0;

      const escapedMessage = message.replace(/'/g, "''");
      const escapedTitle = title.replace(/'/g, "''");

      execSync(
        `powershell -Command "[System.Windows.Forms.MessageBox]::Show('${escapedMessage}', '${escapedTitle}', 0, ${iconCode})" -NoProfile`,
        { stdio: 'ignore', windowsHide: true }
      );
    } catch (e) {
      // Silently fail if notification doesn't work
    }
  }

  /**
   * Parse common CLI arguments
   * Handles: --output, -o, --batch, -b, --recursive, --overwrite
   * @param {string[]} args - Command line arguments
   * @param {object} customDefaults - Custom default values
   * @returns {object} Parsed options
   */
  static parseCommonArgs(args, customDefaults = {}) {
    const defaults = {
      input: null,
      output: null,
      batch: false,
      recursive: false,
      overwrite: false,
      ...customDefaults
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg === '--output' || arg === '-o') {
        defaults.output = args[++i];
      } else if (arg === '--batch' || arg === '-b') {
        defaults.batch = true;
      } else if (arg === '--recursive') {
        defaults.recursive = true;
      } else if (arg === '--overwrite') {
        defaults.overwrite = true;
      } else if (!arg.startsWith('--') && !arg.startsWith('-') && !defaults.input) {
        defaults.input = arg;
      }
    }

    return defaults;
  }

  /**
   * Sanitize filename to remove invalid characters
   * @param {string} filename - Original filename
   * @returns {string} Sanitized filename
   */
  static sanitizeFilename(filename) {
    return filename
      .replace(/[<>:"|?*]/g, '_') // Invalid Windows characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/_+/g, '_') // Collapse multiple underscores
      .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
  }

  /**
   * Generate output path based on input and operation
   * @param {string} inputPath - Input file path
   * @param {string} suffix - Suffix to add (e.g., '_subtitled')
   * @param {string} newExtension - New extension (e.g., '.mp4')
   * @returns {string} Output file path
   */
  static getOutputPath(inputPath, suffix, newExtension = null) {
    const dir = path.dirname(inputPath);
    const ext = path.extname(inputPath);
    const name = path.basename(inputPath, ext);
    const finalExt = newExtension || ext;

    return path.join(dir, `${name}${suffix}${finalExt}`);
  }

  /**
   * Get default output directory (Downloads)
   * @returns {string} Downloads directory path
   */
  static getDownloadsDir() {
    return path.join(os.homedir(), 'Downloads');
  }

  /**
   * Format file info for display
   * @param {string} filePath - File path
   * @returns {object} File info: {name, size, ext}
   */
  static getFileInfo(filePath) {
    const stats = fs.statSync(filePath);
    return {
      name: path.basename(filePath),
      size: stats.size,
      ext: path.extname(filePath),
      sizeFormatted: this.formatSize(stats.size)
    };
  }

  /**
   * Ensure directory exists, create if needed
   * @param {string} dirPath - Directory path
   */
  static ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
}

module.exports = MediaUtils;
