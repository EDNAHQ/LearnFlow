#!/usr/bin/env node

/**
 * Image Downsizing Script
 *
 * Reduces image file size and dimensions using sharp (Node.js) or ImageMagick/ffmpeg as fallback.
 * Useful for preparing images for web, sharing, or reducing storage.
 *
 * Usage:
 *   node downsize-image.js <input> [options]
 *
 * Options:
 *   --output, -o     Output file path (default: adds _downsized suffix)
 *   --width, -w      Max width in pixels (default: 1920)
 *   --height, -h     Max height in pixels (default: 1080)
 *   --quality, -q    Quality 1-100 (default: 80)
 *   --format, -f     Output format: jpg, png, webp, avif (default: same as input)
 *   --overwrite      Overwrite output if exists
 *   --batch, -b      Process all images in directory
 *   --recursive, -r  Include subdirectories (with --batch)
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.bmp', '.tiff', '.tif'];

function parseArgs(args) {
    const options = {
        input: null,
        output: null,
        width: 1920,
        height: 1080,
        quality: 80,
        format: null,
        overwrite: false,
        batch: false,
        recursive: false,
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
            case '--width':
            case '-w':
                options.width = parseInt(next, 10);
                i++;
                break;
            case '--height':
            case '-h':
                options.height = parseInt(next, 10);
                i++;
                break;
            case '--quality':
            case '-q':
                options.quality = parseInt(next, 10);
                i++;
                break;
            case '--format':
            case '-f':
                options.format = next.toLowerCase().replace('.', '');
                i++;
                break;
            case '--overwrite':
                options.overwrite = true;
                break;
            case '--batch':
            case '-b':
                options.batch = true;
                break;
            case '--recursive':
            case '-r':
                options.recursive = true;
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
Image Downsizing Script

Usage:
  node downsize-image.js <input> [options]

Options:
  --output, -o     Output file path (default: adds _downsized suffix)
  --width, -w      Max width in pixels (default: 1920)
  --height, -h     Max height in pixels (default: 1080)
  --quality, -q    Quality 1-100 (default: 80)
  --format, -f     Output format: jpg, png, webp, avif (default: same as input)
  --overwrite      Overwrite output if exists
  --batch, -b      Process all images in directory
  --recursive, -r  Include subdirectories (with --batch)

Examples:
  node downsize-image.js photo.jpg
  node downsize-image.js photo.png -w 800 -h 600 -q 90
  node downsize-image.js photo.jpg -f webp -o optimized.webp
  node downsize-image.js ./images -b -w 1280 -q 75
`);
}

function getOutputPath(inputPath, options) {
    if (options.output) {
        return options.output;
    }

    const dir = path.dirname(inputPath);
    const ext = path.extname(inputPath);
    const name = path.basename(inputPath, ext);
    const newExt = options.format ? `.${options.format}` : ext;

    return path.join(dir, `${name}_downsized${newExt}`);
}

function getImageFiles(dirPath, recursive) {
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

function checkTool(command) {
    try {
        execSync(`${command} --version`, { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

async function downsizeWithSharp(inputPath, outputPath, options) {
    let sharp;
    try {
        sharp = require('sharp');
    } catch {
        return false;
    }

    const image = sharp(inputPath);
    const metadata = await image.metadata();

    // Resize maintaining aspect ratio
    image.resize(options.width, options.height, {
        fit: 'inside',
        withoutEnlargement: true,
    });

    // Set format and quality
    const format = options.format || metadata.format;
    switch (format) {
        case 'jpg':
        case 'jpeg':
            image.jpeg({ quality: options.quality });
            break;
        case 'png':
            image.png({ quality: options.quality });
            break;
        case 'webp':
            image.webp({ quality: options.quality });
            break;
        case 'avif':
            image.avif({ quality: options.quality });
            break;
    }

    await image.toFile(outputPath);
    return true;
}

function downsizeWithMagick(inputPath, outputPath, options) {
    const magickCmd = checkTool('magick') ? 'magick' : 'convert';
    if (!checkTool(magickCmd)) {
        return false;
    }

    const args = [
        inputPath,
        '-resize', `${options.width}x${options.height}>`,
        '-quality', options.quality.toString(),
        outputPath,
    ];

    execSync(`${magickCmd} ${args.map(a => `"${a}"`).join(' ')}`, { stdio: 'inherit' });
    return true;
}

function downsizeWithFfmpeg(inputPath, outputPath, options) {
    if (!checkTool('ffmpeg')) {
        return false;
    }

    const args = [
        '-i', inputPath,
        '-vf', `scale='min(${options.width},iw)':'min(${options.height},ih)':force_original_aspect_ratio=decrease`,
        '-q:v', Math.round((100 - options.quality) / 3.2 + 1).toString(), // Convert quality to ffmpeg scale
        '-y',
        outputPath,
    ];

    execSync(`ffmpeg ${args.map(a => `"${a}"`).join(' ')}`, { stdio: 'pipe' });
    return true;
}

async function downsizeImage(inputPath, options) {
    const outputPath = getOutputPath(inputPath, options);

    if (fs.existsSync(outputPath) && !options.overwrite) {
        console.log(`⏭️  Skipping (exists): ${outputPath}`);
        return { skipped: true };
    }

    const inputStats = fs.statSync(inputPath);
    const inputSize = inputStats.size;

    console.log(`📸 Processing: ${inputPath}`);

    // Try different tools in order of preference
    let success = await downsizeWithSharp(inputPath, outputPath, options);

    if (!success) {
        success = downsizeWithMagick(inputPath, outputPath, options);
    }

    if (!success) {
        success = downsizeWithFfmpeg(inputPath, outputPath, options);
    }

    if (!success) {
        console.error('❌ No image processing tool available.');
        console.error('   Install one of: sharp (npm), ImageMagick, or ffmpeg');
        return { error: 'No tool available' };
    }

    const outputStats = fs.statSync(outputPath);
    const outputSize = outputStats.size;
    const reduction = ((1 - outputSize / inputSize) * 100).toFixed(1);

    console.log(`✅ Created: ${outputPath}`);
    console.log(`   Size: ${formatSize(inputSize)} → ${formatSize(outputSize)} (${reduction}% reduction)`);

    return {
        input: inputPath,
        output: outputPath,
        inputSize,
        outputSize,
        reduction: parseFloat(reduction),
    };
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

async function main() {
    const args = process.argv.slice(2);
    const options = parseArgs(args);

    if (!options.input) {
        console.error('❌ No input file or directory specified');
        printHelp();
        process.exit(1);
    }

    if (!fs.existsSync(options.input)) {
        console.error(`❌ Input not found: ${options.input}`);
        process.exit(1);
    }

    const stats = fs.statSync(options.input);

    if (stats.isDirectory() || options.batch) {
        const files = getImageFiles(options.input, options.recursive);
        if (files.length === 0) {
            console.log('No image files found.');
            return;
        }

        console.log(`Found ${files.length} image(s) to process\n`);

        const results = [];
        for (const file of files) {
            const result = await downsizeImage(file, { ...options, output: null });
            results.push(result);
            console.log('');
        }

        const processed = results.filter(r => !r.skipped && !r.error);
        const totalInputSize = processed.reduce((sum, r) => sum + r.inputSize, 0);
        const totalOutputSize = processed.reduce((sum, r) => sum + r.outputSize, 0);

        console.log('📊 Summary:');
        console.log(`   Processed: ${processed.length}/${files.length} files`);
        console.log(`   Total: ${formatSize(totalInputSize)} → ${formatSize(totalOutputSize)}`);
        console.log(`   Saved: ${formatSize(totalInputSize - totalOutputSize)}`);
    } else {
        await downsizeImage(options.input, options);
    }
}

main().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
