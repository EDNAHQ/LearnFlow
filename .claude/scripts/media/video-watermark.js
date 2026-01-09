#!/usr/bin/env node

/**
 * Video Watermarking Script
 *
 * Add text or image watermarks to videos.
 * Useful for branding, copyright protection, and attribution.
 *
 * Usage:
 *   node video-watermark.js video.mp4 --text="© 2026" [options]
 *   node video-watermark.js video.mp4 --image=logo.png [options]
 *   node video-watermark.js ./videos --batch --text="© Company" [options]
 *
 * Options:
 *   --text="watermark"         Text watermark
 *   --image=logo.png           Image watermark file
 *   --position=corner          Position: top-left|top-right|bottom-left|bottom-right|center|X,Y
 *   --opacity=0.7              Opacity 0-1 (default: 0.7)
 *   --font-size=24             Text font size (default: 24)
 *   --font-color=white         Text color (default: white)
 *   --shadow                   Add shadow to text (default: false)
 *   --timestamp                Add timestamp watermark
 *   --output, -o               Output file path
 *   --batch, -b                Process directory
 *   --recursive                Include subdirectories
 *   --overwrite                Overwrite output if exists
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const MediaUtils = require('../utils/media-utils.js');
const FFmpegBuilder = require('../utils/ffmpeg-builder.js');

const SUPPORTED_VIDEO_FORMATS = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v', '.mpeg', '.mpg'];
const IMAGE_FORMATS = ['.png', '.jpg', '.jpeg', '.gif', '.bmp'];

function parseArgs(args) {
  const options = {
    input: null,
    text: null,
    image: null,
    position: 'bottom-right',
    opacity: 0.7,
    fontSize: 24,
    fontColor: 'white',
    shadow: false,
    timestamp: false,
    output: null,
    batch: false,
    recursive: false,
    overwrite: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--text=')) {
      options.text = arg.split('=').slice(1).join('=');
    } else if (arg.startsWith('--image=')) {
      options.image = arg.split('=')[1];
    } else if (arg.startsWith('--position=')) {
      options.position = arg.split('=')[1];
    } else if (arg.startsWith('--opacity=')) {
      options.opacity = parseFloat(arg.split('=')[1]);
    } else if (arg.startsWith('--font-size=')) {
      options.fontSize = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--font-color=')) {
      options.fontColor = arg.split('=')[1];
    } else if (arg === '--shadow') {
      options.shadow = true;
    } else if (arg === '--timestamp') {
      options.timestamp = true;
    } else if (arg === '--output' || arg === '-o') {
      options.output = args[++i];
    } else if (arg === '--batch' || arg === '-b') {
      options.batch = true;
    } else if (arg === '--recursive') {
      options.recursive = true;
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
🎬 Video Watermarking Script

Add text or image watermarks to videos for branding and copyright protection.

Usage:
  node video-watermark.js video.mp4 --text="© 2026" [options]
  node video-watermark.js video.mp4 --image=logo.png [options]
  node video-watermark.js ./videos --batch --text="© Company" [options]

Options:
  --text="watermark"           Text watermark
  --image=logo.png             Image watermark file
  --position=corner            Position: top-left|top-right|bottom-left|bottom-right|center|X,Y
  --opacity=0.7                Opacity 0-1 (default: 0.7)
  --font-size=24               Text font size (default: 24)
  --font-color=white           Text color (default: white)
  --shadow                     Add shadow to text (default: false)
  --timestamp                  Add timestamp watermark
  --output, -o                 Output file path
  --batch, -b                  Process directory
  --overwrite                  Overwrite output if exists

Positions:
  top-left, top-right, bottom-left, bottom-right, center
  Custom: X,Y (pixel coordinates from top-left)

Examples:
  node video-watermark.js video.mp4 --text="© 2026 EDNA" --position=bottom-right
  node video-watermark.js video.mp4 --image=logo.png --position=top-right --opacity=0.5
  node video-watermark.js video.mp4 --text="My Channel" --shadow --font-size=32

`);
}

function colorToFFmpeg(colorName) {
  const colors = {
    white: '0xFFFFFF',
    black: '0x000000',
    yellow: '0xFFFF00',
    red: '0xFF0000',
    green: '0x00FF00',
    blue: '0x0000FF',
    cyan: '0x00FFFF',
    magenta: '0xFF00FF'
  };

  if (colors[colorName]) {
    return colors[colorName];
  }

  // Try hex color
  if (colorName.startsWith('#')) {
    return '0x' + colorName.slice(1);
  }

  return colors.white;
}

function getWatermarkPosition(position, videoWidth, videoHeight, elementWidth = 100, elementHeight = 50) {
  const margin = 20;

  const positions = {
    'top-left': `${margin}:${margin}`,
    'top-right': `${videoWidth - elementWidth - margin}:${margin}`,
    'bottom-left': `${margin}:${videoHeight - elementHeight - margin}`,
    'bottom-right': `${videoWidth - elementWidth - margin}:${videoHeight - elementHeight - margin}`,
    'center': `(${videoWidth} - ${elementWidth}) / 2:(${videoHeight} - ${elementHeight}) / 2`
  };

  if (positions[position]) {
    return positions[position];
  }

  // Custom X,Y position
  if (position.includes(',')) {
    const [x, y] = position.split(',');
    return `${x}:${y}`;
  }

  return positions['bottom-right']; // Default
}

async function addWatermark(inputVideo, outputVideo, options) {
  console.log(`🎬 Adding watermark...`);
  console.log(`   Video: ${path.basename(inputVideo)}`);

  if (options.text) {
    console.log(`   Text: "${options.text}"`);
    console.log(`   Font size: ${options.fontSize}px`);
  } else if (options.image) {
    console.log(`   Image: ${path.basename(options.image)}`);
  }

  if (options.timestamp) {
    console.log(`   Timestamp: Enabled`);
  }

  console.log(`   Position: ${options.position}`);
  console.log(`   Opacity: ${(options.opacity * 100).toFixed(0)}%`);
  console.log('');

  // Validate files
  MediaUtils.validateFile(inputVideo, SUPPORTED_VIDEO_FORMATS);

  if (options.image) {
    MediaUtils.validateFile(options.image, IMAGE_FORMATS);
  }

  // Get video info
  const videoInfo = MediaUtils.getVideoInfo(inputVideo);
  if (!videoInfo) {
    throw new Error('Failed to read video file. Make sure FFmpeg is installed.');
  }

  // Build watermark filter
  const filters = [];

  if (options.text) {
    const fontColor = colorToFFmpeg(options.fontColor);
    const textEscaped = options.text.replace(/'/g, "\\'");

    let textFilter = `drawtext=text='${textEscaped}':fontsize=${options.fontSize}:fontcolor=${fontColor}`;

    if (options.shadow) {
      textFilter += ':shadowx=2:shadowy=2:shadowcolor=0x000000';
    }

    const xy = getWatermarkPosition(options.position, videoInfo.width, videoInfo.height, 200, 50);
    textFilter += `:x=${xy.split(':')[0]}:y=${xy.split(':')[1]}`;

    textFilter += `:alpha=${options.opacity}`;

    filters.push(textFilter);
  }

  if (options.image) {
    const xy = getWatermarkPosition(options.position, videoInfo.width, videoInfo.height, 100, 100);
    const imageFilter = `movie='${options.image.replace(/\\/g, '\\\\')}',scale=${100}:${100}[img];[in][img]overlay=${xy}:alpha=${options.opacity}[out]`;
    filters.push(imageFilter);
  }

  if (options.timestamp) {
    const timeFilter = `drawtext=text='%{localtime\\:%Y-%m-%d %H\\:%M\\:%S}':fontsize=16:fontcolor=white:shadowx=2:shadowy=2:x=10:y=10:alpha=${options.opacity}`;
    filters.push(timeFilter);
  }

  // Build FFmpeg command
  const ffmpegArgs = ['-i', inputVideo];

  if (filters.length > 0) {
    ffmpegArgs.push('-vf', filters.join(','));
  }

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

        console.log('✅ Watermark added successfully!');
        console.log(`   Output: ${path.basename(outputVideo)}`);
        console.log(`   Size: ${MediaUtils.formatSize(stats.size)}`);
        console.log(`   Time: ${elapsed}s`);

        MediaUtils.sendNotification('Watermark Added', `Created ${path.basename(outputVideo)}`, 'success');
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

  if (!options.input) {
    console.error('❌ Error: Input video required');
    showHelp();
    process.exit(1);
  }

  if (!options.text && !options.image && !options.timestamp) {
    console.error('❌ Error: At least one watermark type required (--text, --image, or --timestamp)');
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
      const output = MediaUtils.getOutputPath(videoFile, '_watermarked');

      try {
        await addWatermark(videoFile, output, options);
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
    // Determine output path
    if (!options.output) {
      options.output = MediaUtils.getOutputPath(options.input, '_watermarked');
    }

    // Check if output already exists
    if (fs.existsSync(options.output) && !options.overwrite) {
      console.error(`❌ Error: Output file already exists: ${options.output}`);
      console.error('   Use --overwrite to replace');
      process.exit(1);
    }

    try {
      await addWatermark(options.input, options.output, options);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  }
}

main();
