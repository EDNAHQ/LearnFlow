#!/usr/bin/env node
/**
 * Nano Banana Pro Image Generation Script
 *
 * Generates images using Google's Nano Banana Pro model via Replicate API
 *
 * Usage:
 *   node generate-nano-banana.js "prompt" [options]
 *
 * Options:
 *   --aspect-ratio=1:1|4:3|16:9|etc  Aspect ratio (default: 4:3)
 *   --resolution=1K|2K|4K            Resolution (default: 2K)
 *   --output-format=png|jpg|webp     Output format (default: png)
 *   --safety-filter=level             Safety filter level (default: block_only_high)
 *   --output=filename.png             Output filename
 *
 * Environment Variables:
 *   REPLICATE_API_TOKEN              Required for Replicate API
 *
 * Examples:
 *   node generate-nano-banana.js "modern dashboard interface"
 *   node generate-nano-banana.js "app icon" --aspect-ratio=1:1 --resolution=2K
 *   node generate-nano-banana.js "hero banner" --output-format=webp --output=banner.webp
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const { execSync } = require('child_process');

// Parse command-line arguments
function parseArgs(args) {
  const result = {
    prompt: '',
    aspectRatio: '4:3',
    resolution: '2K',
    outputFormat: 'png',
    safetyFilter: 'block_only_high',
    output: null,
    count: 1,
    image: null,
    images: [],
    imageUrl: null,
  };

  for (const arg of args) {
    if (arg.startsWith('--aspect-ratio=')) {
      result.aspectRatio = arg.split('=')[1];
    } else if (arg.startsWith('--resolution=')) {
      result.resolution = arg.split('=')[1];
    } else if (arg.startsWith('--output-format=')) {
      result.outputFormat = arg.split('=')[1];
    } else if (arg.startsWith('--safety-filter=')) {
      result.safetyFilter = arg.split('=')[1];
    } else if (arg.startsWith('--output=')) {
      result.output = arg.split('=')[1];
    } else if (arg.startsWith('--count=')) {
      result.count = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--image=')) {
      result.image = arg.split('=')[1];
    } else if (arg.startsWith('--images=')) {
      result.images = arg.split('=')[1].split(',').map(img => img.trim());
    } else if (arg.startsWith('--image-url=')) {
      result.imageUrl = arg.split('=')[1];
    } else if (!arg.startsWith('--')) {
      result.prompt = arg;
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
async function createPrediction(prompt, options, apiToken, imageUrls = []) {
  const input = {
    prompt: prompt,
    aspect_ratio: options.aspectRatio,
    resolution: options.resolution,
    output_format: options.outputFormat,
    safety_filter_level: options.safetyFilter,
  };

  // Add images if provided
  if (imageUrls.length === 1) {
    input.image = imageUrls[0];
  } else if (imageUrls.length > 1) {
    input.images = imageUrls;
  }

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
    // Check timeout
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

    // Wait before polling again
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Convert local image file to base64 data URL
function imageToBase64Url(imagePath) {
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Image file not found: ${imagePath}`);
  }

  const imageData = fs.readFileSync(imagePath);
  const base64 = imageData.toString('base64');
  const ext = path.extname(imagePath).toLowerCase().slice(1);
  const mimeType = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'webp': 'image/webp',
    'gif': 'image/gif',
  }[ext] || 'image/png';

  return `data:${mimeType};base64,${base64}`;
}

// Validate and process image inputs
function processImageInputs(options) {
  const imageUrls = [];

  // Handle single local image
  if (options.image) {
    const resolvedPath = path.resolve(options.image);
    imageUrls.push(imageToBase64Url(resolvedPath));
  }

  // Handle multiple local images
  if (options.images.length > 0) {
    if (options.images.length > 14) {
      throw new Error('Maximum 14 images supported by Nano Banana Pro');
    }
    for (const imagePath of options.images) {
      const resolvedPath = path.resolve(imagePath);
      imageUrls.push(imageToBase64Url(resolvedPath));
    }
  }

  // Handle direct URL
  if (options.imageUrl) {
    imageUrls.push(options.imageUrl);
  }

  return imageUrls;
}

// Download image from URL to file
async function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);

    https.get({
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: {
        'User-Agent': 'nano-banana-generator/1.0',
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

// Main function
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
🍌 Nano Banana Pro Image Generation

Usage:
  node generate-nano-banana.js "prompt" [options]

Options:
  --aspect-ratio=1:1|4:3|16:9   Aspect ratio (default: 4:3)
  --resolution=1K|2K|4K         Resolution (default: 2K)
  --output-format=png|jpg|webp  Output format (default: png)
  --safety-filter=LEVEL         Safety filter (default: block_only_high)
  --count=N                      Generate N images (default: 1)
  --output=filename             Output filename (for single image only)
  --image=/path/to/file.png     Use local image for blending/reference
  --images=/path1,/path2,...    Multiple images (up to 14)
  --image-url=https://...       Use public URL for image

Examples:
  node generate-nano-banana.js "modern dashboard interface"
  node generate-nano-banana.js "app icon" --aspect-ratio=1:1
  node generate-nano-banana.js "hero banner" --resolution=4K --output=banner.png
  node generate-nano-banana.js "logo design" --count=3 --aspect-ratio=1:1
  node generate-nano-banana.js "blend images" --image=/path/to/photo.png
  node generate-nano-banana.js "style transfer" --images=/path1.png,/path2.png
  node generate-nano-banana.js "enhance photo" --image-url=https://example.com/img.png

Environment:
  REPLICATE_API_TOKEN           Required

Safety Filter Levels:
  block_low_and_above           Strictest filtering
  block_medium_and_above        Medium filtering
  block_only_high               Most permissive (recommended)

Output Location:
  All images saved to: C:\\Users\\GGPC\\Downloads\\
`);
    return;
  }

  const options = parseArgs(args);

  if (!options.prompt) {
    console.error('❌ Error: Prompt is required');
    process.exit(1);
  }

  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken) {
    console.error('❌ Error: REPLICATE_API_TOKEN environment variable not set');
    console.error('   Get your token from: https://replicate.com/account/api-tokens');
    process.exit(1);
  }

  let imageUrls = [];
  try {
    imageUrls = processImageInputs(options);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }

  const count = Math.max(1, options.count);

  if (count > 1) {
    console.log(`🍌 Generating ${count} images with Nano Banana Pro...`);
  } else {
    console.log('🍌 Generating image with Nano Banana Pro...');
  }
  console.log(`   Prompt: "${options.prompt.substring(0, 60)}${options.prompt.length > 60 ? '...' : ''}"`);
  console.log(`   Resolution: ${options.resolution}, Aspect: ${options.aspectRatio}`);
  if (imageUrls.length > 0) {
    console.log(`   Input images: ${imageUrls.length}`);
  }

  try {
    // Get Downloads folder
    const downloadsDir = path.join(process.env.USERPROFILE, 'Downloads');
    if (!fs.existsSync(downloadsDir)) {
      throw new Error(`Downloads folder not found: ${downloadsDir}`);
    }

    const ext = options.outputFormat === 'jpg' ? 'jpg' : options.outputFormat;
    const savedFiles = [];

    // Generate images in batch
    for (let i = 1; i <= count; i++) {
      console.log(`\n[${i}/${count}] Creating prediction...`);
      const prediction = await createPrediction(options.prompt, options, apiToken, imageUrls);
      const predictionId = prediction.id;
      const pollUrl = prediction.urls.get;

      console.log(`   Prediction ID: ${predictionId}`);

      // Poll for completion
      console.log('⏳ Processing (this may take 30-60 seconds)...');
      const result = await pollPrediction(pollUrl, apiToken);

      if (!result.output) {
        throw new Error('No image URL returned from API');
      }

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      let outputFilename;
      if (count === 1) {
        outputFilename = options.output || `nano-banana-${timestamp}.${ext}`;
      } else {
        // For batch, add index to filename
        const baseTimestamp = timestamp.split('T')[0] + '-' + timestamp.split('T')[1].split('-').slice(0, 2).join('-');
        outputFilename = options.output
          ? options.output.replace(`.${ext}`, `-${i}.${ext}`)
          : `nano-banana-${baseTimestamp}-${i}.${ext}`;
      }
      const outputPath = path.join(downloadsDir, outputFilename);

      // Download image
      console.log('⬇️  Downloading image...');
      await downloadImage(result.output, outputPath);

      console.log(`✅ Image ${i} saved successfully!`);
      console.log(`   Saved to: ${outputPath}`);
      console.log(`   Size: ${getFileSizeKB(outputPath)} KB`);

      savedFiles.push({
        filename: path.basename(outputPath),
        path: outputPath,
      });

      // Small delay between requests to avoid rate limiting
      if (i < count) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Send completion notification
    if (count === 1) {
      const filename = savedFiles[0].filename;
      sendNotification('🍌 Nano Banana Ready', `Image saved: ${filename}`);
    } else {
      sendNotification(`🍌 ${count} Images Ready`, `All images saved to Downloads`);
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Helper function to get file size in KB
function getFileSizeKB(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return (stats.size / 1024).toFixed(2);
  } catch {
    return 'unknown';
  }
}

// Send Windows notification using simple msgbox
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
