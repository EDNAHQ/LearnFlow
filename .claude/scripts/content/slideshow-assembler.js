#!/usr/bin/env node
/**
 * Slideshow Assembler Script
 *
 * Assembles approved slides from a project folder into a final slideshow
 * Supports multiple output formats: MP4, animated GIF, WebP, and HTML
 *
 * Usage:
 *   node slideshow-assembler.js "/path/to/project" [options]
 *
 * Options:
 *   --format=mp4|gif|webp|html     Output format (default: mp4)
 *   --duration=3s|3000ms            Duration per slide (default: 3s)
 *   --transition=fade|slide|none    Transition type (default: fade)
 *   --fps=30                        Frame rate for video (default: 30)
 *   --quality=high|medium|low       Compression quality (default: high)
 *   --output=/custom/path           Custom output filename
 *   --with-music=/path/to/audio     Add audio track (MP4 only)
 *   --loop                          Loop infinitely (GIF/WebP)
 *   --include-rejected              Include rejected slides
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const { URL } = require('url');

// Import manifest manager
const ManifestManager = require('../utils/manifest-manager.js');

// Parse command-line arguments
function parseArgs(args) {
  const result = {
    projectPath: '',
    format: 'mp4',
    duration: '3s',
    transition: 'fade',
    fps: 30,
    quality: 'high',
    output: null,
    music: null,
    loop: false,
    includeRejected: false,
  };

  for (const arg of args) {
    if (arg.startsWith('--format=')) {
      result.format = arg.split('=')[1];
    } else if (arg.startsWith('--duration=')) {
      result.duration = arg.split('=')[1];
    } else if (arg.startsWith('--transition=')) {
      result.transition = arg.split('=')[1];
    } else if (arg.startsWith('--fps=')) {
      result.fps = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--quality=')) {
      result.quality = arg.split('=')[1];
    } else if (arg.startsWith('--output=')) {
      result.output = arg.split('=')[1];
    } else if (arg.startsWith('--with-music=')) {
      result.music = arg.split('=')[1];
    } else if (arg === '--loop') {
      result.loop = true;
    } else if (arg === '--include-rejected') {
      result.includeRejected = true;
    } else if (!arg.startsWith('--') && !result.projectPath) {
      result.projectPath = arg;
    }
  }

  return result;
}

// Convert duration string to milliseconds
function parseDuration(durationStr) {
  if (durationStr.endsWith('ms')) {
    return parseInt(durationStr, 10);
  } else if (durationStr.endsWith('s')) {
    return parseInt(durationStr, 10) * 1000;
  }
  return 3000; // default 3 seconds
}

// Get file size in MB
function getFileSizeMB(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return (stats.size / (1024 * 1024)).toFixed(2);
  } catch {
    return 'unknown';
  }
}

// Check if FFmpeg is installed
function checkFFmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore', windowsHide: true });
    return true;
  } catch (e) {
    return false;
  }
}

// Create MP4 video from images
async function createMP4(slidesDir, slides, options, outputPath) {
  console.log('🎬 Creating MP4 video...');

  if (!checkFFmpeg()) {
    throw new Error('FFmpeg is not installed. Install from: https://ffmpeg.org/download.html');
  }

  // Get duration in milliseconds
  const durationMs = parseDuration(options.duration);
  const durationSec = (durationMs / 1000).toFixed(2);

  // Create concat demuxer file
  const concatFile = path.join(path.dirname(outputPath), 'concat.txt');
  const concatContent = slides
    .map(slide => `file '${path.join(slidesDir, slide.filename)}'`)
    .join('\n');

  fs.writeFileSync(concatFile, concatContent);

  console.log(`   Duration per slide: ${durationSec}s`);
  console.log(`   Video codec: h264, Quality: ${options.quality}`);

  // FFmpeg quality settings
  const crf = options.quality === 'high' ? 18 : (options.quality === 'medium' ? 23 : 28);

  // Build FFmpeg command
  let cmd = `ffmpeg -f concat -safe 0 -i "${concatFile}" -c:v libx264 -crf ${crf} -preset fast -pix_fmt yuv420p`;

  // Add framerate and duration
  cmd += ` -r ${options.fps} -vf "pad=ceil(iw/2)*2:ceil(ih/2)*2"`;

  // Add audio if provided
  if (options.music && fs.existsSync(options.music)) {
    cmd += ` -i "${options.music}" -c:a aac -shortest`;
  }

  cmd += ` -y "${outputPath}"`;

  try {
    console.log('⏳ Encoding... (this may take a while)');
    execSync(cmd, { stdio: 'ignore', windowsHide: true });
    fs.unlinkSync(concatFile);
    console.log('✅ MP4 created successfully!');
  } catch (error) {
    fs.unlinkSync(concatFile);
    throw new Error(`FFmpeg encoding failed: ${error.message}`);
  }
}

// Create animated GIF
async function createGIF(slidesDir, slides, options, outputPath) {
  console.log('🎬 Creating animated GIF...');

  if (!checkFFmpeg()) {
    throw new Error('FFmpeg is not installed. Install from: https://ffmpeg.org/download.html');
  }

  const durationMs = parseDuration(options.duration);
  const durationSec = (durationMs / 1000).toFixed(2);

  // Palette generation command
  const paletteFile = path.join(path.dirname(outputPath), 'palette.png');

  // Create concat demuxer file
  const concatFile = path.join(path.dirname(outputPath), 'concat.txt');
  const concatContent = slides
    .map(slide => `file '${path.join(slidesDir, slide.filename)}'`)
    .join('\n');

  fs.writeFileSync(concatFile, concatContent);

  try {
    // Generate palette
    console.log('   Generating color palette...');
    const paletteCmd = `ffmpeg -f concat -safe 0 -i "${concatFile}" -vf "fps=10,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -y "${paletteFile}"`;
    execSync(paletteCmd, { stdio: 'ignore', windowsHide: true });

    // Create GIF
    console.log('⏳ Encoding GIF...');
    const gifCmd = `ffmpeg -f concat -safe 0 -i "${concatFile}" -i "${paletteFile}" -lavfi "fps=10,scale=640:-1:flags=lanczos[x];[x][1:v]paletteuse" -y "${outputPath}"`;
    execSync(gifCmd, { stdio: 'ignore', windowsHide: true });

    fs.unlinkSync(concatFile);
    fs.unlinkSync(paletteFile);
    console.log('✅ GIF created successfully!');
  } catch (error) {
    try {
      fs.unlinkSync(concatFile);
      if (fs.existsSync(paletteFile)) fs.unlinkSync(paletteFile);
    } catch (e) {}
    throw new Error(`GIF creation failed: ${error.message}`);
  }
}

// Create animated WebP
async function createWebP(slidesDir, slides, options, outputPath) {
  console.log('🎬 Creating animated WebP...');

  if (!checkFFmpeg()) {
    throw new Error('FFmpeg is not installed. Install from: https://ffmpeg.org/download.html');
  }

  const durationMs = parseDuration(options.duration);

  // Create concat demuxer file
  const concatFile = path.join(path.dirname(outputPath), 'concat.txt');
  const concatContent = slides
    .map(slide => `file '${path.join(slidesDir, slide.filename)}'`)
    .join('\n');

  fs.writeFileSync(concatFile, concatContent);

  try {
    console.log('⏳ Encoding WebP...');
    const cmd = `ffmpeg -f concat -safe 0 -i "${concatFile}" -vf "fps=10,scale=640:-1" -c:v libwebp -loop ${options.loop ? 0 : 1} -y "${outputPath}"`;
    execSync(cmd, { stdio: 'ignore', windowsHide: true });
    fs.unlinkSync(concatFile);
    console.log('✅ WebP created successfully!');
  } catch (error) {
    try {
      fs.unlinkSync(concatFile);
    } catch (e) {}
    throw new Error(`WebP creation failed: ${error.message}`);
  }
}

// Create HTML slideshow
async function createHTML(slidesDir, slides, options, outputPath) {
  console.log('🎬 Creating HTML slideshow...');

  const durationMs = parseDuration(options.duration);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Slideshow</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #1a1a1a;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .slideshow-container {
      max-width: 100%;
      width: 100%;
      position: relative;
      background: black;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .slide {
      display: none;
      width: 100%;
      height: auto;
    }
    .slide.active {
      display: block;
      animation: fadeIn 0.5s;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .slide img {
      width: 100%;
      height: auto;
      display: block;
    }
    .controls {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 10px;
      z-index: 10;
    }
    button {
      background: rgba(255,255,255,0.2);
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.3s;
    }
    button:hover {
      background: rgba(255,255,255,0.4);
    }
    .progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      background: rgba(255,255,255,0.5);
      z-index: 9;
    }
    .progress-bar {
      height: 100%;
      background: #4CAF50;
      width: 0%;
      transition: width linear;
    }
    .slide-counter {
      position: absolute;
      top: 20px;
      right: 20px;
      color: white;
      background: rgba(0,0,0,0.5);
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="slideshow-container">
    <div class="slides">
${slides.map(slide => `      <div class="slide"><img src="slides/${slide.filename}" alt="Slide"></div>`).join('\n')}
    </div>
    <div class="slide-counter"><span class="current">1</span>/<span class="total">${slides.length}</span></div>
    <div class="controls">
      <button onclick="previousSlide()">← Previous</button>
      <button onclick="togglePlayPause()" id="playBtn">Pause</button>
      <button onclick="nextSlide()">Next →</button>
    </div>
    <div class="progress">
      <div class="progress-bar" id="progressBar"></div>
    </div>
  </div>

  <script>
    let currentSlide = 0;
    let isPlaying = true;
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;
    const duration = ${durationMs};
    let progressInterval;

    function showSlide(n) {
      slides.forEach(slide => slide.classList.remove('active'));
      slides[n].classList.add('active');
      document.querySelector('.current').textContent = n + 1;
    }

    function nextSlide() {
      currentSlide = (currentSlide + 1) % totalSlides;
      showSlide(currentSlide);
      resetProgress();
    }

    function previousSlide() {
      currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
      showSlide(currentSlide);
      resetProgress();
    }

    function togglePlayPause() {
      isPlaying = !isPlaying;
      document.getElementById('playBtn').textContent = isPlaying ? 'Pause' : 'Play';
      if (isPlaying) startProgress();
      else clearInterval(progressInterval);
    }

    function resetProgress() {
      clearInterval(progressInterval);
      document.getElementById('progressBar').style.width = '0%';
      if (isPlaying) startProgress();
    }

    function startProgress() {
      let elapsed = 0;
      const step = 50; // update every 50ms
      progressInterval = setInterval(() => {
        elapsed += step;
        const percent = (elapsed / duration) * 100;
        document.getElementById('progressBar').style.width = percent + '%';

        if (elapsed >= duration) {
          nextSlide();
          elapsed = 0;
        }
      }, step);
    }

    // Initialize
    showSlide(0);
    startProgress();
  </script>
</body>
</html>`;

  fs.writeFileSync(outputPath, html);
  console.log('✅ HTML slideshow created successfully!');
}

// Main function
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
🎬 Slideshow Assembler

Assembles approved slides into final slideshows

Usage:
  node slideshow-assembler.js "/path/to/project" [options]

Options:
  --format=mp4|gif|webp|html     Output format (default: mp4)
  --duration=3s|3000ms           Seconds/ms per slide (default: 3s)
  --transition=fade|slide|none   Transition type (default: fade)
  --fps=30                       Video frame rate (default: 30)
  --quality=high|medium|low      Quality (default: high)
  --output=/custom/path          Custom output filename
  --with-music=/path/to/audio    Add audio track (MP4 only)
  --loop                         Loop infinitely (GIF/WebP)
  --include-rejected             Include rejected slides

Examples:
  node slideshow-assembler.js "C:\\Users\\GGPC\\Downloads\\slideshow-demo-2026-01-03"
  node slideshow-assembler.js "C:\\path\\to\\project" --format=gif --duration=2s
  node slideshow-assembler.js "C:\\path\\to\\project" --format=mp4 --with-music=audio.mp3
  node slideshow-assembler.js "C:\\path\\to\\project" --format=html --duration=4s

Output Formats:
  mp4    - H.264 video (best compatibility, requires FFmpeg)
  gif    - Animated GIF (requires FFmpeg)
  webp   - Animated WebP (requires FFmpeg, smaller files)
  html   - Interactive HTML slideshow (no dependencies)

Requirements:
  For MP4/GIF/WebP: FFmpeg (https://ffmpeg.org/download.html)
  For HTML: No requirements
`);
    return;
  }

  const options = parseArgs(args);

  if (!options.projectPath) {
    console.error('❌ Error: Project path is required');
    process.exit(1);
  }

  try {
    // Resolve project path
    const projectDir = path.resolve(options.projectPath);

    if (!fs.existsSync(projectDir)) {
      throw new Error(`Project directory not found: ${projectDir}`);
    }

    // Load manifest
    const manifestPath = path.join(projectDir, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
      throw new Error(`Manifest not found: ${manifestPath}`);
    }

    const manifest = ManifestManager.loadManifest(manifestPath);

    // Get slides
    let slides = options.includeRejected
      ? ManifestManager.getSlides(manifest, true)
      : ManifestManager.getApprovedSlides(manifest);

    if (slides.length === 0) {
      throw new Error('No approved slides found. Review your project and approve slides before assembling.');
    }

    console.log(`
🎬 Assembling Slideshow

Project: ${manifest.name}
Approved Slides: ${slides.length}
Format: ${options.format.toUpperCase()}
Duration: ${options.duration} per slide
`);

    // Determine slides directory and output path
    const slidesDir = path.join(projectDir, 'slides');
    if (!fs.existsSync(slidesDir)) {
      throw new Error(`Slides directory not found: ${slidesDir}`);
    }

    // Generate output filename if not specified
    let outputPath = options.output;
    if (!outputPath) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 10);
      const safeName = manifest.name.toLowerCase().replace(/\s+/g, '-');
      const ext = options.format === 'mp4' ? 'mp4' : options.format === 'gif' ? 'gif' : options.format === 'webp' ? 'webp' : 'html';
      outputPath = path.join(projectDir, `${safeName}-slideshow.${ext}`);
    }

    // Create slideshow based on format
    if (options.format === 'mp4') {
      await createMP4(slidesDir, slides, options, outputPath);
    } else if (options.format === 'gif') {
      await createGIF(slidesDir, slides, options, outputPath);
    } else if (options.format === 'webp') {
      await createWebP(slidesDir, slides, options, outputPath);
    } else if (options.format === 'html') {
      await createHTML(slidesDir, slides, options, outputPath);
    } else {
      throw new Error(`Unknown format: ${options.format}`);
    }

    // Print summary
    const fileSize = getFileSizeMB(outputPath);
    console.log(`
✅ Slideshow Created!

Output: ${outputPath}
Size: ${fileSize} MB
Slides: ${slides.length}
Format: ${options.format.toUpperCase()}

Ready to use! 🎉
`);

    // Update manifest status
    manifest.status = 'complete';
    ManifestManager.saveManifest(manifestPath, manifest);

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();
