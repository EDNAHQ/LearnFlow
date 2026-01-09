#!/usr/bin/env node

/**
 * Subtitle Embedding Script
 *
 * Burn SRT/VTT/ASS subtitles into video files.
 * Integrates with transcription workflow.
 *
 * Usage:
 *   node video-subtitle.js video.mp4 --srt=subtitles.srt [options]
 *   node video-subtitle.js video.mp4 --vtt=subtitles.vtt [options]
 *   node video-subtitle.js ./videos --batch [options]
 *
 * Options:
 *   --srt=file.srt             SRT subtitle file
 *   --vtt=file.vtt             VTT subtitle file
 *   --ass=file.ass             ASS/SSA subtitle file
 *   --output, -o               Output file path (default: video_subtitled.mp4)
 *   --font-size=24             Subtitle font size (default: 24)
 *   --font-color=white         Text color: white|yellow|black|#RRGGBB (default: white)
 *   --bg-color=black           Background color (default: black)
 *   --bg-opacity=0.8           Background opacity 0-1 (default: 0.8)
 *   --position=bottom|top      Vertical position (default: bottom)
 *   --margin=20                Margin from edge in pixels (default: 20)
 *   --batch, -b                Process directory (auto-match .srt files)
 *   --recursive                Include subdirectories (with --batch)
 *   --preview                  Encode only first 30 seconds for testing
 *   --overwrite                Overwrite output if exists
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const MediaUtils = require('../utils/media-utils.js');
const FFmpegBuilder = require('../utils/ffmpeg-builder.js');

const SUPPORTED_VIDEO_FORMATS = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v', '.mpeg', '.mpg'];
const SUBTITLE_FORMATS = ['.srt', '.vtt', '.ass', '.ssa'];

function parseArgs(args) {
  const options = {
    input: null,
    srt: null,
    vtt: null,
    ass: null,
    output: null,
    fontSize: 24,
    fontColor: 'white',
    bgColor: 'black',
    bgOpacity: 0.8,
    position: 'bottom',
    margin: 20,
    batch: false,
    recursive: false,
    preview: false,
    overwrite: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--srt=')) {
      options.srt = arg.split('=')[1];
    } else if (arg.startsWith('--vtt=')) {
      options.vtt = arg.split('=')[1];
    } else if (arg.startsWith('--ass=')) {
      options.ass = arg.split('=')[1];
    } else if (arg === '--output' || arg === '-o') {
      options.output = args[++i];
    } else if (arg.startsWith('--font-size=')) {
      options.fontSize = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--font-color=')) {
      options.fontColor = arg.split('=')[1];
    } else if (arg.startsWith('--bg-color=')) {
      options.bgColor = arg.split('=')[1];
    } else if (arg.startsWith('--bg-opacity=')) {
      options.bgOpacity = parseFloat(arg.split('=')[1]);
    } else if (arg.startsWith('--position=')) {
      options.position = arg.split('=')[1];
    } else if (arg.startsWith('--margin=')) {
      options.margin = parseInt(arg.split('=')[1], 10);
    } else if (arg === '--batch' || arg === '-b') {
      options.batch = true;
    } else if (arg === '--recursive') {
      options.recursive = true;
    } else if (arg === '--preview') {
      options.preview = true;
    } else if (arg === '--overwrite') {
      options.overwrite = true;
    } else if (!arg.startsWith('--') && !arg.startsWith('-') && !options.input) {
      options.input = arg;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
🎬 Subtitle Embedding Script

Burn SRT/VTT/ASS subtitles permanently into video files.

Usage:
  node video-subtitle.js video.mp4 --srt=subtitles.srt [options]
  node video-subtitle.js ./videos --batch [options]

Options:
  --srt=file.srt               SRT subtitle file
  --vtt=file.vtt               VTT subtitle file
  --ass=file.ass               ASS/SSA subtitle file
  --output, -o                 Output file path
  --font-size=24               Subtitle font size (default: 24)
  --font-color=white|yellow    Text color (default: white)
  --bg-color=black             Background color (default: black)
  --bg-opacity=0.8             Background transparency (default: 0.8)
  --position=bottom|top        Vertical position (default: bottom)
  --margin=20                  Margin from edge in pixels (default: 20)
  --batch, -b                  Process directory (auto-match .srt files)
  --preview                    Encode only first 30 seconds for testing
  --overwrite                  Overwrite output if exists

Color Options:
  white, black, yellow, red, blue, green, cyan, magenta
  or custom: #RRGGBB (hex format)

Examples:
  node video-subtitle.js lecture.mp4 --srt=lecture.srt -o lecture-with-subs.mp4
  node video-subtitle.js lecture.mp4 --srt=lecture.srt --font-size=28 --font-color=yellow
  node video-subtitle.js ./videos --batch --preview

`);
}

function colorToHex(colorName) {
  const colors = {
    white: '&HFFFFFF',
    black: '&H000000',
    yellow: '&H00FFFF',
    red: '&H0000FF',
    green: '&H00FF00',
    blue: '&HFF0000',
    cyan: '&HFFFF00',
    magenta: '&HFF00FF'
  };

  if (colors[colorName]) {
    return colors[colorName];
  }

  // Try to parse hex color
  if (colorName.startsWith('#')) {
    const hex = colorName.slice(1);
    if (hex.length === 6) {
      return '&H' + hex.match(/.{2}/g).reverse().join('');
    }
  }

  return colors.white; // Default to white
}

function getSubtitleY(position, videoHeight, fontSize) {{
  const marginPixels = 20;

  if (position === 'bottom') {
    return videoHeight - (fontSize * 2) - marginPixels;
  } else if (position === 'top') {
    return marginPixels;
  } else if (position === 'middle') {
    return videoHeight / 2;
  }

  return videoHeight - (fontSize * 2) - marginPixels; // Default bottom
}

async function embedSubtitles(inputVideo, subtitleFile, outputVideo, options) {
  console.log(`🎬 Embedding subtitles...`);
  console.log(`   Video: ${path.basename(inputVideo)}`);
  console.log(`   Subtitle: ${path.basename(subtitleFile)}`);
  console.log(`   Font size: ${options.fontSize}px`);
  console.log(`   Position: ${options.position}`);
  console.log('');

  // Validate files
  MediaUtils.validateFile(inputVideo, SUPPORTED_VIDEO_FORMATS);
  MediaUtils.validateFile(subtitleFile);

  // Get video info
  const videoInfo = MediaUtils.getVideoInfo(inputVideo);
  if (!videoInfo) {
    throw new Error('Failed to read video file. Make sure FFmpeg is installed.');
  }

  // Prepare subtitle filter
  const subtitlePath = subtitleFile.replace(/\\/g, '\\\\').replace(/:/g, '\\:');
  const fontColor = colorToHex(options.fontColor);
  const bgColor = colorToHex(options.bgColor);
  const bgAlpha = Math.round((1 - options.bgOpacity) * 255);

  const subtitleFilter = `subtitles='${subtitlePath}':force_style='FontSize=${options.fontSize},PrimaryColour=${fontColor},BackColour=${bgColor}&H${bgAlpha.toString(16).padStart(2, '0')},BorderStyle=3,Outline=1,Shadow=2,MarginL=${options.margin},MarginR=${options.margin},MarginV=${options.margin}'`;

  // Build FFmpeg command
  const ffmpegArgs = ['-i', inputVideo];

  // Add duration limit for preview
  if (options.preview) {
    ffmpegArgs.push('-t', '30');
  }

  ffmpegArgs.push('-vf', subtitleFilter);
  ffmpegArgs.push('-c:v', 'libx264', '-preset', 'medium', '-crf', '23');
  ffmpegArgs.push('-c:a', 'aac', '-b:a', '128k');
  ffmpegArgs.push('-movflags', '+faststart');

  if (options.overwrite) {
    ffmpegArgs.push('-y');
  } else {
    ffmpegArgs.push('-n');
  }

  ffmpegArgs.push(outputVideo);

  console.log('⏳ Encoding...');
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', ffmpegArgs, {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true
    });

    ffmpeg.stderr.on('data', (data) => {
      const text = data.toString();
      const timeMatch = text.match(/time=(\d+:\d+:\d+\.\d+)/);

      if (timeMatch) {
        process.stdout.write(`\r   Encoding: ${timeMatch[1]}  `);
      }
    });

    ffmpeg.on('close', (code) => {
      process.stdout.write('\r' + ' '.repeat(40) + '\r');

      if (code === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const stats = fs.statSync(outputVideo);

        console.log('✅ Subtitles embedded successfully!');
        console.log(`   Output: ${path.basename(outputVideo)}`);
        console.log(`   Size: ${MediaUtils.formatSize(stats.size)}`);
        console.log(`   Time: ${elapsed}s`);

        if (options.preview) {
          console.log('   Note: Preview mode (30 seconds only)');
        }

        MediaUtils.sendNotification('Subtitles Embedded', `Created ${path.basename(outputVideo)}`, 'success');
        resolve(outputVideo);
      } else {
        reject(new Error(`FFmpeg failed with code ${code}`));
      }
    });

    ffmpeg.on('error', (error) => {
      reject(error);
    });
  });
}

function findSubtitleFile(videoPath) {
  const videoDir = path.dirname(videoPath);
  const videoName = path.basename(videoPath, path.extname(videoPath));

  // Look for .srt file with same name
  const srtPath = path.join(videoDir, `${videoName}.srt`);
  if (fs.existsSync(srtPath)) {
    return srtPath;
  }

  // Look for .vtt file
  const vttPath = path.join(videoDir, `${videoName}.vtt`);
  if (fs.existsSync(vttPath)) {
    return vttPath;
  }

  return null;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    showHelp();
    return;
  }

  if (!FFmpegBuilder.checkAvailable()) {
    console.error('❌ Error: FFmpeg not found');
    console.error('   Install FFmpeg: https://ffmpeg.org/download.html');
    process.exit(1);
  }

  const options = parseArgs(args);

  // Determine subtitle file
  const subtitleFile = options.srt || options.vtt || options.ass;

  if (!options.input) {
    console.error('❌ Error: Input video required');
    showHelp();
    process.exit(1);
  }

  // Check if input is directory for batch processing
  if (options.batch && fs.statSync(options.input).isDirectory()) {
    const videoFiles = MediaUtils.scanFiles(options.input, SUPPORTED_VIDEO_FORMATS, options.recursive);
    if (videoFiles.length === 0) {
      console.error(`❌ No video files found in ${options.input}`);
      process.exit(1);
    }

    console.log(`Found ${videoFiles.length} video(s) to process\n`);

    let processed = 0;
    for (const videoFile of videoFiles) {
      const foundSubtitles = findSubtitleFile(videoFile);
      if (!foundSubtitles) {
        console.log(`⏭️  Skipped: ${path.basename(videoFile)} (no matching subtitle file)`);
        continue;
      }

      const output = MediaUtils.getOutputPath(videoFile, '_subtitled');

      try {
        await embedSubtitles(videoFile, foundSubtitles, output, options);
        processed++;
      } catch (error) {
        console.error(`❌ Error processing ${path.basename(videoFile)}: ${error.message}`);
      }

      console.log('');
    }

    console.log('📊 Summary:');
    console.log(`   Processed: ${processed}/${videoFiles.length} files`);
  } else {
    // Single video processing
    let subtitle = subtitleFile;

    if (!subtitle) {
      subtitle = findSubtitleFile(options.input);
      if (!subtitle) {
        console.error(`❌ Error: No subtitle file specified or found`);
        showHelp();
        process.exit(1);
      }
    }

    // Determine output path
    if (!options.output) {
      options.output = MediaUtils.getOutputPath(options.input, '_subtitled');
    }

    // Check if output already exists
    if (fs.existsSync(options.output) && !options.overwrite) {
      console.error(`❌ Error: Output file already exists: ${options.output}`);
      console.error('   Use --overwrite to replace');
      process.exit(1);
    }

    try {
      await embedSubtitles(options.input, subtitle, options.output, options);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  }
}

main();
