#!/usr/bin/env node
/**
 * Audio Transcription Script
 * 
 * Transcribes audio files using OpenAI Whisper or AssemblyAI
 * 
 * Usage:
 *   node transcribe.js <audio-file> [options]
 * 
 * Options:
 *   --provider=openai|assemblyai  Provider to use (default: openai)
 *   --language=en                 Language code (optional, auto-detect)
 *   --output=filename.txt         Output filename
 *   --format=text|srt|vtt         Output format (default: text)
 *   --timestamps                  Include timestamps (OpenAI verbose mode)
 * 
 * Supported formats: mp3, mp4, mpeg, mpga, m4a, wav, webm
 * 
 * Environment Variables:
 *   OPENAI_API_KEY              Required for OpenAI Whisper
 *   ASSEMBLYAI_API_KEY          Required for AssemblyAI
 * 
 * Examples:
 *   node transcribe.js meeting.mp3
 *   node transcribe.js podcast.mp3 --format=srt --output=subtitles.srt
 *   node transcribe.js interview.wav --timestamps
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Parse arguments
function parseArgs(args) {
  const result = {
    inputFile: null,
    provider: 'openai',
    language: null,
    output: null,
    format: 'text',
    timestamps: false,
  };

  for (const arg of args) {
    if (arg.startsWith('--provider=')) {
      result.provider = arg.split('=')[1];
    } else if (arg.startsWith('--language=')) {
      result.language = arg.split('=')[1];
    } else if (arg.startsWith('--output=')) {
      result.output = arg.split('=')[1];
    } else if (arg.startsWith('--format=')) {
      result.format = arg.split('=')[1];
    } else if (arg === '--timestamps') {
      result.timestamps = true;
    } else if (!arg.startsWith('--')) {
      result.inputFile = arg;
    }
  }

  return result;
}

// Transcribe with OpenAI Whisper
async function transcribeWithOpenAI(filePath, options) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable not set');
  }

  const FormData = require('form-data');
  const form = new FormData();
  
  form.append('file', fs.createReadStream(filePath));
  form.append('model', 'whisper-1');
  
  if (options.language) {
    form.append('language', options.language);
  }
  
  if (options.format === 'srt') {
    form.append('response_format', 'srt');
  } else if (options.format === 'vtt') {
    form.append('response_format', 'vtt');
  } else if (options.timestamps) {
    form.append('response_format', 'verbose_json');
  } else {
    form.append('response_format', 'text');
  }

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/audio/transcriptions',
      method: 'POST',
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${apiKey}`,
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          try {
            const error = JSON.parse(data);
            reject(new Error(error.error?.message || 'Request failed'));
          } catch {
            reject(new Error(`Request failed with status ${res.statusCode}`));
          }
          return;
        }
        
        if (options.timestamps && options.format === 'text') {
          try {
            const json = JSON.parse(data);
            resolve(formatTimestampedText(json));
          } catch {
            resolve(data);
          }
        } else {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    form.pipe(req);
  });
}

// Format timestamped output
function formatTimestampedText(json) {
  if (!json.segments) {
    return json.text || JSON.stringify(json);
  }

  return json.segments.map(seg => {
    const start = formatTime(seg.start);
    const end = formatTime(seg.end);
    return `[${start} --> ${end}] ${seg.text.trim()}`;
  }).join('\n');
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

// Transcribe with AssemblyAI
async function transcribeWithAssemblyAI(filePath, options) {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) {
    throw new Error('ASSEMBLYAI_API_KEY environment variable not set');
  }

  // First, upload the file
  console.log('   Uploading file...');
  const uploadUrl = await uploadToAssemblyAI(filePath, apiKey);

  // Then, request transcription
  console.log('   Starting transcription...');
  const transcriptId = await requestAssemblyAITranscription(uploadUrl, apiKey, options);

  // Poll for completion
  console.log('   Processing...');
  const result = await pollAssemblyAI(transcriptId, apiKey);

  return result.text;
}

async function uploadToAssemblyAI(filePath, apiKey) {
  const fileData = fs.readFileSync(filePath);

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.assemblyai.com',
      path: '/v2/upload',
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/octet-stream',
        'Content-Length': fileData.length,
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const response = JSON.parse(data);
        resolve(response.upload_url);
      });
    });

    req.on('error', reject);
    req.write(fileData);
    req.end();
  });
}

async function requestAssemblyAITranscription(audioUrl, apiKey, options) {
  const requestBody = JSON.stringify({
    audio_url: audioUrl,
    language_code: options.language || 'en',
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.assemblyai.com',
      path: '/v2/transcript',
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const response = JSON.parse(data);
        resolve(response.id);
      });
    });

    req.on('error', reject);
    req.write(requestBody);
    req.end();
  });
}

async function pollAssemblyAI(transcriptId, apiKey) {
  return new Promise((resolve, reject) => {
    const poll = () => {
      const req = https.request({
        hostname: 'api.assemblyai.com',
        path: `/v2/transcript/${transcriptId}`,
        method: 'GET',
        headers: {
          'Authorization': apiKey,
        },
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const response = JSON.parse(data);
          if (response.status === 'completed') {
            resolve(response);
          } else if (response.status === 'error') {
            reject(new Error(response.error || 'Transcription failed'));
          } else {
            setTimeout(poll, 3000);
          }
        });
      });
      req.on('error', reject);
      req.end();
    };
    poll();
  });
}

// Main
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    console.log(`
Audio Transcription Script

Usage:
  node transcribe.js <audio-file> [options]

Options:
  --provider=openai|assemblyai  Provider (default: openai)
  --language=en                 Language code (auto-detect if omitted)
  --output=filename.txt         Output filename
  --format=text|srt|vtt         Output format (default: text)
  --timestamps                  Include timestamps

Supported: mp3, mp4, mpeg, mpga, m4a, wav, webm

Environment:
  OPENAI_API_KEY                For OpenAI Whisper
  ASSEMBLYAI_API_KEY            For AssemblyAI
`);
    return;
  }

  const options = parseArgs(args);

  if (!options.inputFile) {
    console.error('❌ Error: Input file is required');
    process.exit(1);
  }

  if (!fs.existsSync(options.inputFile)) {
    console.error(`❌ Error: File not found: ${options.inputFile}`);
    process.exit(1);
  }

  console.log(`📝 Transcribing with ${options.provider}...`);
  console.log(`   File: ${options.inputFile}`);

  try {
    let transcript;
    if (options.provider === 'assemblyai') {
      transcript = await transcribeWithAssemblyAI(options.inputFile, options);
    } else {
      transcript = await transcribeWithOpenAI(options.inputFile, options);
    }

    // Create output directory
    const outputDir = path.join(process.cwd(), 'generated');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save transcript
    const inputBasename = path.basename(options.inputFile, path.extname(options.inputFile));
    const ext = options.format === 'srt' ? 'srt' : options.format === 'vtt' ? 'vtt' : 'txt';
    const outputFilename = options.output || `${inputBasename}-transcript.${ext}`;
    const outputPath = path.join(outputDir, outputFilename);

    fs.writeFileSync(outputPath, transcript);

    console.log(`✅ Transcript saved: ${outputPath}`);
    console.log(`\n--- Preview ---`);
    console.log(transcript.substring(0, 500) + (transcript.length > 500 ? '...' : ''));

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();

