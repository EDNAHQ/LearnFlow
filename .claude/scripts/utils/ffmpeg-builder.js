#!/usr/bin/env node

/**
 * FFmpeg Command Builder
 *
 * Fluent API for constructing FFmpeg commands with proper progress monitoring.
 * Encapsulates complex filter graphs and encoding options.
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class FFmpegBuilder {
  constructor() {
    this.inputs = [];
    this.filters = [];
    this.complexFilters = [];
    this.outputPath = null;
    this.outputOptions = {};
    this.videoCodec = null;
    this.audioCodec = null;
    this.videoOptions = {};
    this.audioOptions = {};
  }

  /**
   * Add input file
   * @param {string} filePath - Path to input file
   * @param {object} options - Input options (start, duration, fps, etc.)
   * @returns {FFmpegBuilder} For method chaining
   */
  addInput(filePath, options = {}) {
    this.inputs.push({
      path: filePath,
      options: options
    });
    return this;
  }

  /**
   * Add video filter
   * @param {string} filterString - FFmpeg filter (e.g., "scale=1280:720")
   * @returns {FFmpegBuilder} For method chaining
   */
  addVideoFilter(filterString) {
    this.filters.push({ type: 'video', filter: filterString });
    return this;
  }

  /**
   * Add audio filter
   * @param {string} filterString - FFmpeg audio filter
   * @returns {FFmpegBuilder} For method chaining
   */
  addAudioFilter(filterString) {
    this.filters.push({ type: 'audio', filter: filterString });
    return this;
  }

  /**
   * Set complex filter graph
   * @param {string} filterGraph - Complex filter graph
   * @returns {FFmpegBuilder} For method chaining
   */
  setComplexFilter(filterGraph) {
    this.complexFilters.push(filterGraph);
    return this;
  }

  /**
   * Set video codec and options
   * @param {string} codec - Codec (libx264, libx265, libvpx-vp9, libaom-av1)
   * @param {object} options - Codec options (crf, preset, pixelFormat, etc.)
   * @returns {FFmpegBuilder} For method chaining
   */
  setVideoCodec(codec = 'libx264', options = {}) {
    this.videoCodec = codec;
    this.videoOptions = options;
    return this;
  }

  /**
   * Set audio codec and options
   * @param {string} codec - Codec (aac, mp3, libopus)
   * @param {object} options - Codec options (bitrate, sampleRate, channels)
   * @returns {FFmpegBuilder} For method chaining
   */
  setAudioCodec(codec = 'aac', options = {}) {
    this.audioCodec = codec;
    this.audioOptions = options;
    return this;
  }

  /**
   * Add output file
   * @param {string} filePath - Output file path
   * @param {object} options - Output options (overwrite, movflags, etc.)
   * @returns {FFmpegBuilder} For method chaining
   */
  addOutput(filePath, options = {}) {
    this.outputPath = filePath;
    this.outputOptions = options;
    return this;
  }

  /**
   * Build FFmpeg command arguments array
   * @returns {string[]} Array of FFmpeg arguments
   */
  build() {
    const args = [];

    // Add inputs
    for (const input of this.inputs) {
      if (input.options.start) {
        args.push('-ss', String(input.options.start));
      }
      args.push('-i', input.path);
      if (input.options.duration) {
        args.push('-t', String(input.options.duration));
      }
    }

    // Add video filters
    const videoFilters = this.filters
      .filter(f => f.type === 'video')
      .map(f => f.filter);

    if (videoFilters.length > 0) {
      args.push('-vf', videoFilters.join(','));
    }

    // Add audio filters
    const audioFilters = this.filters
      .filter(f => f.type === 'audio')
      .map(f => f.filter);

    if (audioFilters.length > 0) {
      args.push('-af', audioFilters.join(','));
    }

    // Add complex filters
    if (this.complexFilters.length > 0) {
      args.push('-filter_complex', this.complexFilters.join(';'));
    }

    // Add video codec
    if (this.videoCodec) {
      args.push('-c:v', this.videoCodec);

      // Add video codec options
      if (this.videoOptions.crf !== undefined) {
        args.push('-crf', String(this.videoOptions.crf));
      }
      if (this.videoOptions.preset) {
        args.push('-preset', this.videoOptions.preset);
      }
      if (this.videoOptions.pixelFormat) {
        args.push('-pix_fmt', this.videoOptions.pixelFormat);
      }

      // VP9 and AV1 specific options
      if (this.videoCodec === 'libvpx-vp9') {
        if (this.videoOptions.crf !== undefined) {
          args.push('-b:v', '0'); // Constant quality mode
        }
      } else if (this.videoCodec === 'libaom-av1') {
        args.push('-cpu-used', this.videoOptions.cpuUsed || '4');
      }
    }

    // Add audio codec
    if (this.audioCodec) {
      args.push('-c:a', this.audioCodec);

      // Add audio codec options
      if (this.audioOptions.bitrate) {
        args.push('-b:a', `${this.audioOptions.bitrate}k`);
      }
      if (this.audioOptions.sampleRate) {
        args.push('-ar', String(this.audioOptions.sampleRate));
      }
      if (this.audioOptions.channels) {
        args.push('-ac', String(this.audioOptions.channels));
      }
    }

    // Add output options
    if (this.outputOptions.movflags) {
      args.push('-movflags', this.outputOptions.movflags);
    }

    // Overwrite output
    if (this.outputOptions.overwrite) {
      args.push('-y');
    }

    // Add output path
    if (this.outputPath) {
      args.push(this.outputPath);
    }

    return args;
  }

  /**
   * Execute FFmpeg command with progress monitoring
   * @param {function} progressCallback - Callback for progress updates
   * @returns {Promise} Resolves when FFmpeg completes
   */
  execute(progressCallback = null) {
    return new Promise((resolve, reject) => {
      const args = this.build();
      const ffmpeg = spawn('ffmpeg', args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true
      });

      let lastProgress = '';
      let output = '';

      ffmpeg.stderr.on('data', (data) => {
        const text = data.toString();
        output += text;

        // Parse progress
        const timeMatch = text.match(/time=(\d+:\d+:\d+\.\d+)/);
        const fpsMatch = text.match(/fps=\s*(\d+\.?\d*)/);
        const speedMatch = text.match(/speed=\s*([\d.]+)x/);

        if (timeMatch && progressCallback) {
          const progress = {
            time: timeMatch[1],
            fps: fpsMatch ? parseFloat(fpsMatch[1]) : 0,
            speed: speedMatch ? parseFloat(speedMatch[1]) : 0
          };

          if (progress.time !== lastProgress) {
            progressCallback(progress);
            lastProgress = progress.time;
          }
        }
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, output });
        } else {
          reject(new Error(`FFmpeg failed with code ${code}\n${output}`));
        }
      });

      ffmpeg.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Static: Check if FFmpeg is available
   * @returns {boolean} True if FFmpeg is installed
   */
  static checkAvailable() {
    try {
      execSync('ffmpeg -version', { stdio: 'ignore', windowsHide: true });
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Static: Probe video file for metadata
   * @param {string} filePath - Path to video file
   * @returns {object} Video metadata or null if error
   */
  static probe(filePath) {
    try {
      const result = execSync(
        `ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`,
        { encoding: 'utf-8' }
      );
      return JSON.parse(result);
    } catch (e) {
      return null;
    }
  }

  /**
   * Static: Create concat demuxer file for joining videos
   * @param {string[]} filePaths - Array of video file paths
   * @param {string} outputPath - Path to save concat file
   * @returns {string} Path to concat file
   */
  static createConcatFile(filePaths, outputPath) {
    const concatLines = filePaths.map(fp => `file '${fp.replace(/\\/g, '\\\\')}'`);
    const concatContent = concatLines.join('\n');

    const concatFilePath = path.join(path.dirname(outputPath), 'concat-list.txt');
    fs.writeFileSync(concatFilePath, concatContent, 'utf-8');

    return concatFilePath;
  }

  /**
   * Static: Get supported video codecs
   * @returns {object} Codec map with encoder names and file extensions
   */
  static getSupportedCodecs() {
    return {
      h264: { encoder: 'libx264', ext: '.mp4', name: 'H.264' },
      h265: { encoder: 'libx265', ext: '.mp4', name: 'H.265 (HEVC)' },
      vp9: { encoder: 'libvpx-vp9', ext: '.webm', name: 'VP9' },
      av1: { encoder: 'libaom-av1', ext: '.webm', name: 'AV1' }
    };
  }

  /**
   * Static: Get supported resolutions
   * @returns {object} Resolution map with width and height
   */
  static getSupportedResolutions() {
    return {
      '2160p': { width: 3840, height: 2160, name: '4K' },
      '1440p': { width: 2560, height: 1440, name: '2K' },
      '1080p': { width: 1920, height: 1080, name: 'Full HD' },
      '720p': { width: 1280, height: 720, name: 'HD' },
      '480p': { width: 854, height: 480, name: 'SD' },
      '360p': { width: 640, height: 360, name: 'Mobile' },
      '240p': { width: 426, height: 240, name: 'Low' }
    };
  }
}

module.exports = FFmpegBuilder;
