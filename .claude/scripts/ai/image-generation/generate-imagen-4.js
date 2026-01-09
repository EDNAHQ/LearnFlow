#!/usr/bin/env node
/**
 * Google Imagen 4 Image Generation Script
 *
 * Generates high-quality images using Google's Imagen 4 model via Replicate API
 *
 * Usage:
 *   node generate-imagen-4.js "prompt" [options]
 *
 * Options:
 *   --aspect-ratio=1:1|4:3|16:9   Aspect ratio (default: 1:1)
 *   --output-format=png|jpg|webp  Output format (default: png)
 *   --safety-filter=LEVEL         Safety filter level (default: block_medium_and_above)
 *   --count=N                      Generate N images (default: 1)
 *   --output=filename.png          Output filename
 *
 * Environment Variables:
 *   REPLICATE_API_TOKEN           Required for Replicate API
 *
 * Examples:
 *   node generate-imagen-4.js "a serene landscape with mountains"
 *   node generate-imagen-4.js "professional product photography" --aspect-ratio=16:9
 *   node generate-imagen-4.js "cinematic hero shot" --count=3
 *   node generate-imagen-4.js "minimalist logo design" --aspect-ratio=1:1
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
    aspectRatio: '1:1',
    outputFormat: 'png',
    safetyFilter: 'block_medium_and_above',
    output: null,
    count: 1,
  };

  for (const arg of args) {
    if (arg.startsWith('--aspect-ratio=')) {
      result.aspectRatio = arg.split('=')[1];
    } else if (arg.startsWith('--output-format=')) {
      result.outputFormat = arg.split('=')[1];
    } else if (arg.startsWith('--safety-filter=')) {
      result.safetyFilter = arg.split('=')[1];
    } else if (arg.startsWith('--output=')) {
      result.output = arg.split('=')[1];
    } else if (arg.startsWith('--count=')) {
      result.count = parseInt(arg.split('=')[1], 10);
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
async function createPrediction(prompt, options, apiToken) {
  const input = {
    prompt: prompt,
    aspect_ratio: options.aspectRatio,
    output_format: options.outputFormat,
    safety_filter_level: options.safetyFilter,
  };

  const requestBody = JSON.stringify({
    version: 'google/imagen-4',
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
async function pollPrediction(pollUrl, apiToken, maxWaitSeconds = 600) {
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
    await new Promise(resolve => setTimeout(resolve, 1500));
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
        'User-Agent': 'imagen-4-generator/1.0',
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
🎨 Google Imagen 4 Image Generation

Usage:
  node generate-imagen-4.js "prompt" [options]

Options:
  --aspect-ratio=1:1|4:3|16:9   Aspect ratio (default: 1:1)
  --output-format=png|jpg|webp  Output format (default: png)
  --safety-filter=LEVEL         Safety filter (default: block_medium_and_above)
  --count=N                      Generate N images (default: 1)
  --output=filename              Output filename (for single image only)

Examples:
  node generate-imagen-4.js "a serene landscape with mountains"
  node generate-imagen-4.js "professional product photography" --aspect-ratio=16:9
  node generate-imagen-4.js "cinematic hero shot" --count=3
  node generate-imagen-4.js "minimalist logo design" --aspect-ratio=1:1
  node generate-imagen-4.js "abstract art" --output-format=webp --count=2

Environment:
  REPLICATE_API_TOKEN           Required

Safety Filter Levels:
  block_low_and_above           Strictest filtering
  block_medium_and_above        Medium filtering (recommended)
  block_only_high               Most permissive

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

  const count = Math.max(1, options.count);

  if (count > 1) {
    console.log(`🎨 Generating ${count} images with Imagen 4...`);
  } else {
    console.log('🎨 Generating image with Imagen 4...');
  }
  console.log(`   Prompt: "${options.prompt.substring(0, 60)}${options.prompt.length > 60 ? '...' : ''}"`);
  console.log(`   Aspect: ${options.aspectRatio}, Format: ${options.outputFormat}`);

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
      const prediction = await createPrediction(options.prompt, options, apiToken);
      const predictionId = prediction.id;
      const pollUrl = prediction.urls.get;

      console.log(`   Prediction ID: ${predictionId}`);

      // Poll for completion
      console.log('⏳ Processing (this may take 1-3 minutes)...');
      const result = await pollPrediction(pollUrl, apiToken);

      if (!result.output) {
        throw new Error('No image URL returned from API');
      }

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      let outputFilename;
      if (count === 1) {
        outputFilename = options.output || `imagen-4-${timestamp}.${ext}`;
      } else {
        // For batch, add index to filename
        const baseTimestamp = timestamp.split('T')[0] + '-' + timestamp.split('T')[1].split('-').slice(0, 2).join('-');
        outputFilename = options.output
          ? options.output.replace(`.${ext}`, `-${i}.${ext}`)
          : `imagen-4-${baseTimestamp}-${i}.${ext}`;
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
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Send completion notification
    if (count === 1) {
      const filename = savedFiles[0].filename;
      sendNotification('🎨 Imagen 4 Ready', `Image saved: ${filename}`);
    } else {
      sendNotification(`🎨 ${count} Images Ready`, `All images saved to Downloads`);
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
