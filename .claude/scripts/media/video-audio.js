#!/usr/bin/env node

/**
 * Video Audio Processing Script
 *
 * Replace, mix, extract, or normalize audio tracks in videos.
 * Useful for adding voiceovers, background music, or fixing audio issues.
 *
 * Usage:
 *   node video-audio.js video.mp4 --replace=audio.mp3 [options]
 *   node video-audio.js video.mp4 --music=background.mp3 --music-volume=0.3 [options]
 *   node video-audio.js video.mp4 --extract [options]
 *   node video-audio.js video.mp4 --normalize [options]
 *
 * Options:
 *   --replace=audio.mp3         Replace video audio with new audio file
 *   --music=background.mp3      Mix in background music
 *   --music-volume=0.3          Background music volume (0-1, default: 0.3)
 *   --voice-volume=1.0          Original audio volume (0-1, default: 1.0)
 *   --extract                   Extract audio to separate file
 *   --remove                    Remove audio track
 *   --normalize                 Normalize audio levels
 *   --fade-in=2s                Fade in duration (e.g., 2s, 2000ms)
 *   --fade-out=3s               Fade out duration
 *   --audio-codec=aac|mp3       Output audio format (default: aac)
 *   --audio-bitrate=192         Audio bitrate in kbps (default: 128)
 *   --output, -o                Output file path
 *   --batch, -b                 Process directory
 *   --recursive                 Include subdirectories
 *   --overwrite                 Overwrite output if exists
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const MediaUtils = require('../utils/media-utils.js');
const FFmpegBuilder = require('../utils/ffmpeg-builder.js');

const SUPPORTED_VIDEO_FORMATS = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v', '.mpeg', '.mpg'];
const AUDIO_FORMATS = ['.mp3', '.aac', '.wav', '.m4a', '.flac', '.ogg', '.opus'];

function parseArgs(args) {
  const options = {
    input: null,
    replace: null,
    music: null,
    musicVolume: 0.3,
    voiceVolume: 1.0,
    extract: false,
    remove: false,
    normalize: false,
    fadeIn: null,
    fadeOut: null,
    audioCodec: 'aac',
    audioBitrate: 128,
    output: null,
    batch: false,
    recursive: false,
    overwrite: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--replace=')) {
      options.replace = arg.split('=')[1];
    } else if (arg.startsWith('--music=')) {
      options.music = arg.split('=')[1];
    } else if (arg.startsWith('--music-volume=')) {
      options.musicVolume = parseFloat(arg.split('=')[1]);
    } else if (arg.startsWith('--voice-volume=')) {
      options.voiceVolume = parseFloat(arg.split('=')[1]);
    } else if (arg === '--extract') {
      options.extract = true;
    } else if (arg === '--remove') {
      options.remove = true;
    } else if (arg === '--normalize') {
      options.normalize = true;
    } else if (arg.startsWith('--fade-in=')) {
      options.fadeIn = MediaUtils.parseDuration(arg.split('=')[1]);
    } else if (arg.startsWith('--fade-out=')) {
      options.fadeOut = MediaUtils.parseDuration(arg.split('=')[1]);
    } else if (arg.startsWith('--audio-codec=')) {
      options.audioCodec = arg.split('=')[1];
    } else if (arg.startsWith('--audio-bitrate=')) {
      options.audioBitrate = parseInt(arg.split('=')[1], 10);
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
🎬 Video Audio Processing Script

Replace, mix, extract, or normalize audio in videos.

Usage:
  node video-audio.js video.mp4 --replace=audio.mp3
  node video-audio.js video.mp4 --music=bg.mp3 --music-volume=0.3
  node video-audio.js video.mp4 --extract
  node video-audio.js ./videos --batch --normalize

Audio Operations:
  --replace=file.mp3           Replace video audio completely
  --music=file.mp3             Mix in background music (keeps original)
  --extract                    Save audio to separate file
  --remove                     Remove audio track
  --normalize                  Equalize volume levels

Options:
  --music-volume=0.3           Background music level (0-1, default: 0.3)
  --voice-volume=1.0           Original audio level (0-1)
  --fade-in=2s                 Fade in duration
  --fade-out=3s                Fade out duration
  --audio-codec=aac|mp3        Output codec (default: aac)
  --audio-bitrate=192          Bitrate in kbps (default: 128)
  --output, -o                 Output file path
  --batch, -b                  Process directory
  --overwrite                  Overwrite output if exists

Examples:
  node video-audio.js video.mp4 --replace=voiceover.mp3 -o output.mp4
  node video-audio.js video.mp4 --music=background.mp3 --music-volume=0.5 -o output.mp4
  node video-audio.js video.mp4 --extract -o audio.mp3
  node video-audio.js video.mp4 --normalize --fade-out=3s

`);
}

async function processAudio(inputVideo, outputPath, options) {
  console.log(`🎬 Processing audio...`);
  console.log(`   Video: ${path.basename(inputVideo)}`);

  if (options.extract) {
    console.log(`   Operation: Extract audio`);
  } else if (options.remove) {
    console.log(`   Operation: Remove audio`);
  } else if (options.replace) {
    console.log(`   Operation: Replace audio`);
    console.log(`   Audio: ${path.basename(options.replace)}`);
  } else if (options.music) {
    console.log(`   Operation: Mix with background music`);
    console.log(`   Music: ${path.basename(options.music)}`);
    console.log(`   Music volume: ${(options.musicVolume * 100).toFixed(0)}%`);
  } else if (options.normalize) {
    console.log(`   Operation: Normalize audio levels`);
  }

  console.log('');

  // Validate input
  MediaUtils.validateFile(inputVideo, SUPPORTED_VIDEO_FORMATS);

  if (options.replace) {
    MediaUtils.validateFile(options.replace, AUDIO_FORMATS);
  }
  if (options.music) {
    MediaUtils.validateFile(options.music, AUDIO_FORMATS);
  }

  // Get video info
  const videoInfo = MediaUtils.getVideoInfo(inputVideo);
  if (!videoInfo) {
    throw new Error('Failed to read video file. Make sure FFmpeg is installed.');
  }

  const ffmpegArgs = [];

  // Extract operation
  if (options.extract) {
    ffmpegArgs.push('-i', inputVideo);
    ffmpegArgs.push('-vn'); // No video
    ffmpegArgs.push('-acodec', options.audioCodec === 'mp3' ? 'libmp3lame' : 'aac');
    ffmpegArgs.push('-b:a', `${options.audioBitrate}k`);

    if (options.overwrite) {
      ffmpegArgs.push('-y');
    } else {
      ffmpegArgs.push('-n');
    }

    ffmpegArgs.push(outputPath);
  }
  // Remove audio operation
  else if (options.remove) {
    ffmpegArgs.push('-i', inputVideo);
    ffmpegArgs.push('-c:v', 'copy');
    ffmpegArgs.push('-an'); // No audio

    if (options.overwrite) {
      ffmpegArgs.push('-y');
    } else {
      ffmpegArgs.push('-n');
    }

    ffmpegArgs.push(outputPath);
  }
  // Replace audio operation
  else if (options.replace) {
    ffmpegArgs.push('-i', inputVideo);
    ffmpegArgs.push('-i', options.replace);
    ffmpegArgs.push('-c:v', 'copy');
    ffmpegArgs.push('-map', '0:v:0');
    ffmpegArgs.push('-map', '1:a:0');
    ffmpegArgs.push('-shortest');

    if (options.overwrite) {
      ffmpegArgs.push('-y');
    } else {
      ffmpegArgs.push('-n');
    }

    ffmpegArgs.push(outputPath);
  }
  // Mix with background music
  else if (options.music) {
    ffmpegArgs.push('-i', inputVideo);
    ffmpegArgs.push('-i', options.music);

    // Build audio filter for mixing
    const voiceFilter = `[0:a]volume=${options.voiceVolume}[voice]`;
    const musicFilter = `[1:a]volume=${options.musicVolume}[music]`;
    const mixFilter = `[voice][music]amix=inputs=2:duration=first[aout]`;

    const complexFilter = `${voiceFilter};${musicFilter};${mixFilter}`;

    ffmpegArgs.push('-filter_complex', complexFilter);
    ffmpegArgs.push('-map', '0:v:0');
    ffmpegArgs.push('-map', '[aout]');
    ffmpegArgs.push('-c:v', 'copy');
    ffmpegArgs.push('-c:a', options.audioCodec === 'mp3' ? 'libmp3lame' : 'aac');
    ffmpegArgs.push('-b:a', `${options.audioBitrate}k`);

    if (options.overwrite) {
      ffmpegArgs.push('-y');
    } else {
      ffmpegArgs.push('-n');
    }

    ffmpegArgs.push(outputPath);
  }
  // Normalize or standard encode
  else {
    ffmpegArgs.push('-i', inputVideo);
    ffmpegArgs.push('-c:v', 'copy');

    // Audio processing
    let audioFilter = '';

    if (options.normalize) {
      audioFilter = 'loudnorm=I=-16:TP=-1.5:LRA=11';
    }

    if (options.fadeIn || options.fadeOut) {
      const fadeFilters = [];

      if (options.fadeIn) {
        fadeFilters.push(`afade=t=in:st=0:d=${options.fadeIn}`);
      }

      if (options.fadeOut) {
        fadeFilters.push(`afade=t=out:st=${videoInfo.duration - options.fadeOut}:d=${options.fadeOut}`);
      }

      audioFilter = audioFilter
        ? `${audioFilter},${fadeFilters.join(',')}`
        : fadeFilters.join(',');
    }

    if (audioFilter) {
      ffmpegArgs.push('-af', audioFilter);
    }

    ffmpegArgs.push('-c:a', options.audioCodec === 'mp3' ? 'libmp3lame' : 'aac');
    ffmpegArgs.push('-b:a', `${options.audioBitrate}k`);

    if (options.overwrite) {
      ffmpegArgs.push('-y');
    } else {
      ffmpegArgs.push('-n');
    }

    ffmpegArgs.push(outputPath);
  }

  console.log('⏳ Processing...');
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
        process.stdout.write(`\r   Progress: ${timeMatch[1]}  `);
      }
    });

    ffmpeg.on('close', (code) => {
      process.stdout.write('\r' + ' '.repeat(40) + '\r');

      if (code === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

        if (options.extract) {
          const stats = fs.statSync(outputPath);
          console.log('✅ Audio extracted successfully!');
          console.log(`   Output: ${path.basename(outputPath)}`);
          console.log(`   Size: ${MediaUtils.formatSize(stats.size)}`);
        } else {
          const stats = fs.statSync(outputPath);
          console.log('✅ Audio processed successfully!');
          console.log(`   Output: ${path.basename(outputPath)}`);
          console.log(`   Size: ${MediaUtils.formatSize(stats.size)}`);
        }

        console.log(`   Time: ${elapsed}s`);

        MediaUtils.sendNotification('Audio Processed', `Created ${path.basename(outputPath)}`, 'success');
        resolve(outputPath);
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
      let suffix = '_audio';
      let ext = path.extname(videoFile);

      if (options.extract) {
        ext = options.audioCodec === 'mp3' ? '.mp3' : '.m4a';
        suffix = '_audio';
      }

      const output = MediaUtils.getOutputPath(videoFile, suffix, ext);

      try {
        await processAudio(videoFile, output, options);
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
      if (options.extract) {
        const ext = options.audioCodec === 'mp3' ? '.mp3' : '.m4a';
        options.output = MediaUtils.getOutputPath(options.input, '_audio', ext);
      } else {
        options.output = MediaUtils.getOutputPath(options.input, '_audio');
      }
    }

    // Check if output already exists
    if (fs.existsSync(options.output) && !options.overwrite) {
      console.error(`❌ Error: Output file already exists: ${options.output}`);
      console.error('   Use --overwrite to replace');
      process.exit(1);
    }

    try {
      await processAudio(options.input, options.output, options);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  }
}

main();
