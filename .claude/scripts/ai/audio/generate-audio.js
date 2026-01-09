#!/usr/bin/env node
/**
 * Audio/Speech Generation Script
 * 
 * Generates audio using OpenAI TTS or ElevenLabs
 * 
 * Usage:
 *   node generate-audio.js "text to speak" [options]
 * 
 * Options:
 *   --provider=openai|elevenlabs  Provider to use (default: openai)
 *   --voice=alloy|echo|...        Voice to use
 *   --output=filename.mp3         Output filename
 *   --speed=1.0                   Speed multiplier (OpenAI only, 0.25-4.0)
 *   --model=tts-1|tts-1-hd        OpenAI model (default: tts-1)
 * 
 * OpenAI Voices: alloy, echo, fable, onyx, nova, shimmer
 * ElevenLabs: Requires voice_id (use --voice-id=xxx)
 * 
 * Environment Variables:
 *   OPENAI_API_KEY              Required for OpenAI TTS
 *   ELEVENLABS_API_KEY          Required for ElevenLabs
 * 
 * Examples:
 *   node generate-audio.js "Welcome to our application"
 *   node generate-audio.js "Hello world" --voice=nova --output=greeting.mp3
 *   node generate-audio.js "Professional narration" --model=tts-1-hd
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '../../..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([^=]+?)\s*=\s*(.*)$/);
    if (match && !line.trim().startsWith('#')) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (key && !process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

// Parse arguments
function parseArgs(args) {
  const result = {
    text: '',
    provider: 'openai',
    voice: 'alloy',
    voiceId: null,
    output: null,
    speed: 1.0,
    model: 'tts-1',
  };

  for (const arg of args) {
    if (arg.startsWith('--provider=')) {
      result.provider = arg.split('=')[1];
    } else if (arg.startsWith('--voice=')) {
      result.voice = arg.split('=')[1];
    } else if (arg.startsWith('--voice-id=')) {
      result.voiceId = arg.split('=')[1];
    } else if (arg.startsWith('--output=')) {
      result.output = arg.split('=')[1];
    } else if (arg.startsWith('--speed=')) {
      result.speed = parseFloat(arg.split('=')[1]);
    } else if (arg.startsWith('--model=')) {
      result.model = arg.split('=')[1];
    } else if (!arg.startsWith('--')) {
      result.text = arg;
    }
  }

  return result;
}

// Generate with OpenAI TTS
async function generateWithOpenAI(text, options) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable not set');
  }

  const requestBody = JSON.stringify({
    model: options.model,
    input: text,
    voice: options.voice,
    speed: options.speed,
    response_format: 'mp3',
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/audio/speech',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    }, (res) => {
      if (res.statusCode !== 200) {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const error = JSON.parse(data);
            reject(new Error(error.error?.message || 'Request failed'));
          } catch {
            reject(new Error(`Request failed with status ${res.statusCode}`));
          }
        });
        return;
      }

      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });

    req.on('error', reject);
    req.write(requestBody);
    req.end();
  });
}

// Generate with ElevenLabs
async function generateWithElevenLabs(text, options) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY environment variable not set');
  }

  // Default voice ID (Rachel) if not specified
  const voiceId = options.voiceId || '21m00Tcm4TlvDq8ikWAM';

  const requestBody = JSON.stringify({
    text: text,
    model_id: 'eleven_monolingual_v1',
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
    },
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.elevenlabs.io',
      path: `/v1/text-to-speech/${voiceId}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
        'Accept': 'audio/mpeg',
      },
    }, (res) => {
      if (res.statusCode !== 200) {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const error = JSON.parse(data);
            reject(new Error(error.detail?.message || 'Request failed'));
          } catch {
            reject(new Error(`Request failed with status ${res.statusCode}`));
          }
        });
        return;
      }

      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });

    req.on('error', reject);
    req.write(requestBody);
    req.end();
  });
}

// Main
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    console.log(`
Audio/Speech Generation Script

Usage:
  node generate-audio.js "text to speak" [options]

Options:
  --provider=openai|elevenlabs  Provider (default: openai)
  --voice=alloy|echo|...        Voice name (default: alloy)
  --voice-id=xxx                ElevenLabs voice ID
  --output=filename.mp3         Output filename
  --speed=1.0                   Speed 0.25-4.0 (OpenAI only)
  --model=tts-1|tts-1-hd        Model (default: tts-1)

OpenAI Voices: alloy, echo, fable, onyx, nova, shimmer

Environment:
  OPENAI_API_KEY                For OpenAI TTS
  ELEVENLABS_API_KEY            For ElevenLabs
`);
    return;
  }

  const options = parseArgs(args);

  if (!options.text) {
    console.error('❌ Error: Text is required');
    process.exit(1);
  }

  console.log(`🔊 Generating audio with ${options.provider}...`);
  console.log(`   Text: "${options.text.substring(0, 50)}..."`);
  console.log(`   Voice: ${options.voice}`);

  try {
    let audioBuffer;
    if (options.provider === 'elevenlabs') {
      audioBuffer = await generateWithElevenLabs(options.text, options);
    } else {
      audioBuffer = await generateWithOpenAI(options.text, options);
    }

    // Create output directory
    const outputDir = path.join(process.cwd(), 'generated');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save audio
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const outputFilename = options.output || `audio-${timestamp}.mp3`;
    const outputPath = path.join(outputDir, outputFilename);

    fs.writeFileSync(outputPath, audioBuffer);

    console.log(`✅ Audio saved: ${outputPath}`);

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();

