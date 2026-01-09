#!/usr/bin/env node

/**
 * Video Downsizing Script
 *
 * Reduces video file size using ffmpeg with various compression options.
 * Useful for sharing, web uploads, or reducing storage.
 *
 * Usage:
 *   node downsize-video.js <input> [options]
 *
 * Options:
 *   --output, -o      Output file path (default: adds _downsized suffix)
 *   --resolution, -r  Target resolution: 2160p, 1080p, 720p, 480p, 360p (default: 720p)
 *   --quality, -q     CRF value 0-51, lower=better (default: 28)
 *   --preset, -p      Encoding preset: ultrafast, fast, medium, slow (default: medium)
 *   --codec, -c       Video codec: h264, h265, vp9, av1 (default: h264)
 *   --audio, -a       Audio bitrate in kbps (default: 128)
 *   --no-audio        Remove audio track
 *   --fps             Target frame rate (default: keep original)
 *   --start           Start time (e.g., 00:01:30 or 90)
 *   --duration        Duration (e.g., 00:05:00 or 300)
 *   --batch, -b       Process all videos in directory
 *   --recursive       Include subdirectories (with --batch)
 *   --overwrite       Overwrite output if exists
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const SUPPORTED_FORMATS = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v', '.mpeg', '.mpg'];

const RESOLUTIONS = {
    '2160p': { width: 3840, height: 2160 },
    '1440p': { width: 2560, height: 1440 },
    '1080p': { width: 1920, height: 1080 },
    '720p': { width: 1280, height: 720 },
    '480p': { width: 854, height: 480 },
    '360p': { width: 640, height: 360 },
    '240p': { width: 426, height: 240 },
};

const CODEC_OPTIONS = {
    h264: { encoder: 'libx264', ext: '.mp4' },
    h265: { encoder: 'libx265', ext: '.mp4' },
    vp9: { encoder: 'libvpx-vp9', ext: '.webm' },
    av1: { encoder: 'libaom-av1', ext: '.webm' },
};

function parseArgs(args) {
    const options = {
        input: null,
        output: null,
        resolution: '720p',
        quality: 28,
        preset: 'medium',
        codec: 'h264',
        audioBitrate: 128,
        noAudio: false,
        fps: null,
        start: null,
        duration: null,
        batch: false,
        recursive: false,
        overwrite: false,
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const next = args[i + 1];

        switch (arg) {
            case '--output':
            case '-o':
                options.output = next;
                i++;
                break;
            case '--resolution':
            case '-r':
                options.resolution = next.toLowerCase();
                i++;
                break;
            case '--quality':
            case '-q':
                options.quality = parseInt(next, 10);
                i++;
                break;
            case '--preset':
            case '-p':
                options.preset = next;
                i++;
                break;
            case '--codec':
            case '-c':
                options.codec = next.toLowerCase();
                i++;
                break;
            case '--audio':
            case '-a':
                options.audioBitrate = parseInt(next, 10);
                i++;
                break;
            case '--no-audio':
                options.noAudio = true;
                break;
            case '--fps':
                options.fps = parseInt(next, 10);
                i++;
                break;
            case '--start':
                options.start = next;
                i++;
                break;
            case '--duration':
                options.duration = next;
                i++;
                break;
            case '--batch':
            case '-b':
                options.batch = true;
                break;
            case '--recursive':
                options.recursive = true;
                break;
            case '--overwrite':
                options.overwrite = true;
                break;
            case '--help':
                printHelp();
                process.exit(0);
            default:
                if (!arg.startsWith('-') && !options.input) {
                    options.input = arg;
                }
        }
    }

    return options;
}

function printHelp() {
    console.log(`
Video Downsizing Script

Usage:
  node downsize-video.js <input> [options]

Options:
  --output, -o      Output file path (default: adds _downsized suffix)
  --resolution, -r  Target resolution: 2160p, 1080p, 720p, 480p, 360p (default: 720p)
  --quality, -q     CRF value 0-51, lower=better (default: 28)
  --preset, -p      Encoding preset: ultrafast, fast, medium, slow (default: medium)
  --codec, -c       Video codec: h264, h265, vp9, av1 (default: h264)
  --audio, -a       Audio bitrate in kbps (default: 128)
  --no-audio        Remove audio track
  --fps             Target frame rate (default: keep original)
  --start           Start time (e.g., 00:01:30 or 90)
  --duration        Duration (e.g., 00:05:00 or 300)
  --batch, -b       Process all videos in directory
  --recursive       Include subdirectories (with --batch)
  --overwrite       Overwrite output if exists

Quality Guide (CRF):
  18-20  High quality, larger file
  23-25  Good balance
  28-32  Smaller file, acceptable quality
  35+    Low quality, very small file

Examples:
  node downsize-video.js video.mp4
  node downsize-video.js video.mp4 -r 480p -q 30
  node downsize-video.js video.mp4 -c h265 -q 24 -o compressed.mp4
  node downsize-video.js video.mp4 --start 00:01:00 --duration 00:02:00
  node downsize-video.js ./videos -b -r 720p
`);
}

function checkFfmpeg() {
    try {
        execSync('ffmpeg -version', { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

function getVideoInfo(inputPath) {
    try {
        const result = execSync(
            `ffprobe -v quiet -print_format json -show_format -show_streams "${inputPath}"`,
            { encoding: 'utf-8' }
        );
        return JSON.parse(result);
    } catch {
        return null;
    }
}

function getOutputPath(inputPath, options) {
    if (options.output) {
        return options.output;
    }

    const dir = path.dirname(inputPath);
    const ext = path.extname(inputPath);
    const name = path.basename(inputPath, ext);
    const codecInfo = CODEC_OPTIONS[options.codec] || CODEC_OPTIONS.h264;

    return path.join(dir, `${name}_downsized${codecInfo.ext}`);
}

function getVideoFiles(dirPath, recursive) {
    const files = [];

    function scan(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory() && recursive) {
                scan(fullPath);
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (SUPPORTED_FORMATS.includes(ext)) {
                    files.push(fullPath);
                }
            }
        }
    }

    scan(dirPath);
    return files;
}

function formatSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unit = 0;
    while (size >= 1024 && unit < units.length - 1) {
        size /= 1024;
        unit++;
    }
    return `${size.toFixed(1)} ${units[unit]}`;
}

function formatDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

async function downsizeVideo(inputPath, options) {
    const outputPath = getOutputPath(inputPath, options);

    if (fs.existsSync(outputPath) && !options.overwrite) {
        console.log(`⏭️  Skipping (exists): ${outputPath}`);
        return { skipped: true };
    }

    const inputStats = fs.statSync(inputPath);
    const inputSize = inputStats.size;

    // Get video info
    const info = getVideoInfo(inputPath);
    const videoStream = info?.streams?.find(s => s.codec_type === 'video');
    const duration = parseFloat(info?.format?.duration || 0);

    console.log(`🎬 Processing: ${inputPath}`);
    if (videoStream) {
        console.log(`   Source: ${videoStream.width}x${videoStream.height}, ${formatDuration(duration)}`);
    }

    // Build ffmpeg command
    const codecInfo = CODEC_OPTIONS[options.codec] || CODEC_OPTIONS.h264;
    const res = RESOLUTIONS[options.resolution] || RESOLUTIONS['720p'];

    const ffmpegArgs = ['-i', inputPath];

    // Time options
    if (options.start) {
        ffmpegArgs.push('-ss', options.start);
    }
    if (options.duration) {
        ffmpegArgs.push('-t', options.duration);
    }

    // Video filter for scaling (maintain aspect ratio, don't upscale)
    const scaleFilter = `scale='min(${res.width},iw)':'min(${res.height},ih)':force_original_aspect_ratio=decrease`;
    let videoFilter = scaleFilter;

    // FPS filter
    if (options.fps) {
        videoFilter += `,fps=${options.fps}`;
    }

    ffmpegArgs.push('-vf', videoFilter);

    // Video codec options
    ffmpegArgs.push('-c:v', codecInfo.encoder);

    // CRF (quality)
    if (options.codec === 'vp9') {
        ffmpegArgs.push('-crf', options.quality.toString(), '-b:v', '0');
    } else if (options.codec === 'av1') {
        ffmpegArgs.push('-crf', options.quality.toString(), '-b:v', '0', '-cpu-used', '4');
    } else {
        ffmpegArgs.push('-crf', options.quality.toString());
    }

    // Preset
    if (['h264', 'h265'].includes(options.codec)) {
        ffmpegArgs.push('-preset', options.preset);
    }

    // Audio options
    if (options.noAudio) {
        ffmpegArgs.push('-an');
    } else {
        ffmpegArgs.push('-c:a', 'aac', '-b:a', `${options.audioBitrate}k`);
    }

    // Output options
    ffmpegArgs.push('-movflags', '+faststart'); // For web streaming
    ffmpegArgs.push('-y', outputPath);

    // Run ffmpeg
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', ffmpegArgs, { stdio: ['ignore', 'pipe', 'pipe'] });

        let lastProgress = '';

        ffmpeg.stderr.on('data', (data) => {
            const text = data.toString();
            const timeMatch = text.match(/time=(\d+:\d+:\d+\.\d+)/);
            if (timeMatch) {
                process.stdout.write(`\r   Encoding: ${timeMatch[1]}  `);
                lastProgress = timeMatch[1];
            }
        });

        ffmpeg.on('close', (code) => {
            process.stdout.write('\r' + ' '.repeat(40) + '\r');

            if (code !== 0) {
                console.log(`❌ Failed to process: ${inputPath}`);
                resolve({ error: `ffmpeg exited with code ${code}` });
                return;
            }

            const outputStats = fs.statSync(outputPath);
            const outputSize = outputStats.size;
            const reduction = ((1 - outputSize / inputSize) * 100).toFixed(1);
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

            console.log(`✅ Created: ${outputPath}`);
            console.log(`   Size: ${formatSize(inputSize)} → ${formatSize(outputSize)} (${reduction}% reduction)`);
            console.log(`   Time: ${elapsed}s`);

            resolve({
                input: inputPath,
                output: outputPath,
                inputSize,
                outputSize,
                reduction: parseFloat(reduction),
                elapsed: parseFloat(elapsed),
            });
        });

        ffmpeg.on('error', (err) => {
            console.log(`❌ Failed to start ffmpeg: ${err.message}`);
            resolve({ error: err.message });
        });
    });
}

async function main() {
    const args = process.argv.slice(2);
    const options = parseArgs(args);

    if (!options.input) {
        console.error('❌ No input file or directory specified');
        printHelp();
        process.exit(1);
    }

    if (!checkFfmpeg()) {
        console.error('❌ ffmpeg is not installed or not in PATH');
        console.error('   Install ffmpeg: https://ffmpeg.org/download.html');
        process.exit(1);
    }

    if (!fs.existsSync(options.input)) {
        console.error(`❌ Input not found: ${options.input}`);
        process.exit(1);
    }

    const stats = fs.statSync(options.input);

    if (stats.isDirectory() || options.batch) {
        const files = getVideoFiles(options.input, options.recursive);
        if (files.length === 0) {
            console.log('No video files found.');
            return;
        }

        console.log(`Found ${files.length} video(s) to process\n`);

        const results = [];
        for (const file of files) {
            const result = await downsizeVideo(file, { ...options, output: null });
            results.push(result);
            console.log('');
        }

        const processed = results.filter(r => !r.skipped && !r.error);
        const totalInputSize = processed.reduce((sum, r) => sum + r.inputSize, 0);
        const totalOutputSize = processed.reduce((sum, r) => sum + r.outputSize, 0);
        const totalTime = processed.reduce((sum, r) => sum + r.elapsed, 0);

        console.log('📊 Summary:');
        console.log(`   Processed: ${processed.length}/${files.length} files`);
        console.log(`   Total: ${formatSize(totalInputSize)} → ${formatSize(totalOutputSize)}`);
        console.log(`   Saved: ${formatSize(totalInputSize - totalOutputSize)}`);
        console.log(`   Time: ${totalTime.toFixed(1)}s`);
    } else {
        await downsizeVideo(options.input, options);
    }
}

main().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
