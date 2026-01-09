#!/usr/bin/env node
/**
 * Slideshow Builder Script
 *
 * Generates images for a slideshow project with proper organization and curation workflow
 * Extends Nano Banana Pro with folder structure, manifest tracking, and batch generation
 *
 * Usage:
 *   node slideshow-builder.js "project name" --slides="slide1,slide2,slide3" [options]
 *   node slideshow-builder.js "project name" --slide-file=slides.txt [options]
 *
 * Options:
 *   --slides="prompt1,prompt2,..."  Comma-separated slide prompts
 *   --slide-file=/path/to/file      Text file with one prompt per line
 *   --aspect-ratio=16:9              Aspect ratio (default: 16:9)
 *   --resolution=2K                  Resolution (default: 2K)
 *   --output-format=png              Output format (default: png)
 *   --safety-filter=level            Safety filter level (default: block_only_high)
 *   --project-dir=/path              Save to custom directory (default: Downloads)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const { execSync } = require('child_process');

// Import manifest manager
const ManifestManager = require('../utils/manifest-manager.js');

// Parse command-line arguments
function parseArgs(args) {
  const result = {
    projectName: '',
    slides: [],
    slideFile: null,
    aspectRatio: '16:9',
    resolution: '2K',
    outputFormat: 'png',
    safetyFilter: 'block_only_high',
    projectDir: null,
  };

  for (const arg of args) {
    if (arg.startsWith('--slides=')) {
      const slidesStr = arg.split('=')[1];
      result.slides = slidesStr.split(',').map(s => s.trim()).filter(s => s);
    } else if (arg.startsWith('--slide-file=')) {
      result.slideFile = arg.split('=')[1];
    } else if (arg.startsWith('--aspect-ratio=')) {
      result.aspectRatio = arg.split('=')[1];
    } else if (arg.startsWith('--resolution=')) {
      result.resolution = arg.split('=')[1];
    } else if (arg.startsWith('--output-format=')) {
      result.outputFormat = arg.split('=')[1];
    } else if (arg.startsWith('--safety-filter=')) {
      result.safetyFilter = arg.split('=')[1];
    } else if (arg.startsWith('--project-dir=')) {
      result.projectDir = arg.split('=')[1];
    } else if (!arg.startsWith('--') && !result.projectName) {
      result.projectName = arg;
    }
  }

  return result;
}

// Make HTTPS request
function makeRequest(hostname, path, method, headers, body) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname,
      path,
      method,
      headers,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

// Create prediction on Replicate
async function createPrediction(prompt, options, apiToken) {
  const input = {
    prompt: prompt,
    aspect_ratio: options.aspectRatio,
    resolution: options.resolution,
    output_format: options.outputFormat,
    safety_filter_level: options.safetyFilter,
  };

  const requestBody = JSON.stringify({
    version: 'google/nano-banana-pro',
    input: input,
  });

  const response = await makeRequest(
    'api.replicate.com',
    '/v1/predictions',
    'POST',
    {
      'Content-Type': 'application/json',
      'Authorization': `Token ${apiToken}`,
    },
    requestBody
  );

  if (response.status !== 201) {
    const error = response.data.detail || response.data.error || 'Unknown error';
    throw new Error(`Replicate API error: ${error}`);
  }

  return response.data;
}

// Poll prediction status
async function pollPrediction(pollUrl, apiToken, maxWaitSeconds = 300) {
  const startTime = Date.now();
  const maxWaitMs = maxWaitSeconds * 1000;

  const parsedUrl = new URL(pollUrl);

  while (true) {
    if (Date.now() - startTime > maxWaitMs) {
      throw new Error(`Generation timed out after ${maxWaitSeconds} seconds`);
    }

    const response = await makeRequest(
      parsedUrl.hostname,
      parsedUrl.pathname + parsedUrl.search,
      'GET',
      {
        'Authorization': `Token ${apiToken}`,
      }
    );

    const data = response.data;

    if (data.status === 'succeeded') {
      return data;
    } else if (data.status === 'failed') {
      const error = data.error || 'Unknown error';
      throw new Error(`Generation failed: ${error}`);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Download image from URL to file
async function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);

    https.get({
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: {
        'User-Agent': 'slideshow-builder/1.0',
      },
    }, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: HTTP ${response.statusCode}`));
        return;
      }

      const file = fs.createWriteStream(outputPath);
      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve(outputPath);
      });

      file.on('error', (err) => {
        fs.unlink(outputPath, () => {});
        reject(err);
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });
  });
}

// Load slides from file
function loadSlidesFromFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Slide file not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const slides = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));

  if (slides.length === 0) {
    throw new Error('No valid slides found in file');
  }

  return slides;
}

// Get file size in KB
function getFileSizeKB(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return (stats.size / 1024).toFixed(2);
  } catch {
    return 'unknown';
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
🎬 Slideshow Builder

Generates organized slide collections for curation and assembly

Usage:
  node slideshow-builder.js "project name" --slides="slide1,slide2,slide3" [options]
  node slideshow-builder.js "project name" --slide-file=slides.txt [options]

Options:
  --slides="prompt1,prompt2,..."    Comma-separated slide prompts
  --slide-file=/path/to/file        Text file with one prompt per line
  --aspect-ratio=16:9|4:3|1:1       Aspect ratio (default: 16:9)
  --resolution=1K|2K|4K             Resolution (default: 2K)
  --output-format=png|jpg|webp      Output format (default: png)
  --safety-filter=LEVEL             Safety filter level (default: block_only_high)
  --project-dir=/path               Custom project directory

Examples:
  node slideshow-builder.js "Product Demo" --slides="dashboard,features,pricing,demo"
  node slideshow-builder.js "Tutorial" --slide-file=slides.txt --aspect-ratio=16:9
  node slideshow-builder.js "Gallery" --slides="landscape,portrait,abstract" --resolution=4K

Folder Structure:
  Downloads/slideshow-projectname-DATE/
  ├── manifest.json        (project metadata and slide tracking)
  ├── slide-001.png        (approved slide)
  ├── slide-002.png
  └── rejected/            (folder for rejected slides)

Environment:
  REPLICATE_API_TOKEN     Required
`);
    return;
  }

  const options = parseArgs(args);

  if (!options.projectName) {
    console.error('❌ Error: Project name is required');
    process.exit(1);
  }

  // Load slides
  let slides = options.slides;
  if (options.slideFile) {
    try {
      slides = loadSlidesFromFile(options.slideFile);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  }

  if (slides.length === 0) {
    console.error('❌ Error: No slides provided. Use --slides or --slide-file');
    process.exit(1);
  }

  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken) {
    console.error('❌ Error: REPLICATE_API_TOKEN environment variable not set');
    console.error('   Get your token from: https://replicate.com/account/api-tokens');
    process.exit(1);
  }

  try {
    // Create project directory
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 10);
    const safeName = options.projectName.toLowerCase().replace(/\s+/g, '-');
    const projectDirName = `slideshow-${safeName}-${timestamp}`;

    const downloadsDir = options.projectDir || path.join(process.env.USERPROFILE, 'Downloads');
    const projectDir = path.join(downloadsDir, projectDirName);
    const slidesDir = path.join(projectDir, 'slides');
    const rejectedDir = path.join(projectDir, 'rejected');
    const manifestPath = path.join(projectDir, 'manifest.json');

    // Create directories
    fs.mkdirSync(slidesDir, { recursive: true });
    fs.mkdirSync(rejectedDir, { recursive: true });

    // Create manifest
    let manifest = ManifestManager.createManifest(projectDir, options.projectName, {
      aspectRatio: options.aspectRatio,
      resolution: options.resolution,
      outputFormat: options.outputFormat,
      safetyFilter: options.safetyFilter,
    });

    console.log(`
🎬 Slideshow Builder - ${options.projectName}

Project Directory: ${projectDir}
Slides to Generate: ${slides.length}
Settings: ${options.aspectRatio} @ ${options.resolution}
`);

    const ext = options.outputFormat === 'jpg' ? 'jpg' : options.outputFormat;
    const savedSlides = [];

    // Generate slides
    for (let i = 0; i < slides.length; i++) {
      const prompt = slides[i];
      const slideNum = i + 1;

      console.log(`[${slideNum}/${slides.length}] Creating prediction...`);
      console.log(`   Prompt: "${prompt.substring(0, 60)}${prompt.length > 60 ? '...' : ''}"`);

      const prediction = await createPrediction(prompt, options, apiToken);
      const predictionId = prediction.id;
      const pollUrl = prediction.urls.get;

      console.log(`   Prediction ID: ${predictionId}`);
      console.log('⏳ Processing...');

      const result = await pollPrediction(pollUrl, apiToken);

      if (!result.output) {
        throw new Error('No image URL returned from API');
      }

      // Generate filename with proper padding
      const paddedNum = String(slideNum).padStart(3, '0');
      const outputFilename = `slide-${paddedNum}.${ext}`;
      const outputPath = path.join(slidesDir, outputFilename);

      // Download image
      console.log('⬇️  Downloading image...');
      await downloadImage(result.output, outputPath);

      // Add to manifest
      ManifestManager.addSlide(manifest, {
        filename: outputFilename,
        prompt: prompt,
        approved: true,
      });

      console.log(`✅ Slide ${slideNum} saved successfully!`);
      console.log(`   File: ${outputFilename} (${getFileSizeKB(outputPath)} KB)`);

      savedSlides.push({
        index: slideNum,
        filename: outputFilename,
        path: outputPath,
      });

      // Delay between requests
      if (i < slides.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Save manifest
    ManifestManager.saveManifest(manifestPath, manifest);

    // Summary
    const summary = ManifestManager.getSummary(manifest);
    console.log(`
✅ Project Complete!

Project: ${summary.name}
Total Slides: ${summary.total}
Location: ${projectDir}

Next Steps:
1. Review each slide in the project folder
2. Delete or regenerate any slides you don't like
3. Update manifest.json if needed (mark slides as approved/rejected)
4. Run: node slideshow-assembler.js "${projectDir}" --format=mp4

Manifest saved to: ${manifestPath}
`);

    sendNotification(`🎬 ${options.projectName}`, `${slides.length} slides generated and ready for review`);

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Send Windows notification
function sendNotification(title, message) {
  try {
    const escapedMessage = message.replace(/'/g, "''");
    const escapedTitle = title.replace(/'/g, "''");

    execSync(`powershell -Command "[System.Windows.Forms.MessageBox]::Show('${escapedMessage}', '${escapedTitle}', 0, 64)" -NoProfile`, {
      stdio: 'ignore',
      windowsHide: true
    });
  } catch (e) {
    // Silently fail if notification doesn't work
  }
}

main();
