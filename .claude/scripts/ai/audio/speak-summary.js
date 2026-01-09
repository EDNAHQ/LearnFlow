#!/usr/bin/env node
/**
 * Audio Summary Speaker
 *
 * Generates audio using ElevenLabs and plays it directly in the terminal
 *
 * Usage:
 *   node speak-summary.js "Your summary text here"
 *   node speak-summary.js --text="Summary text" --voice-id=VOICE_ID
 *
 * Environment Variables:
 *   ELEVENLABS_API_KEY      Required for ElevenLabs TTS
 *
 * Examples:
 *   node speak-summary.js "Task completed successfully"
 *   node speak-summary.js "I've analyzed 5 files and found 3 issues"
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Load environment variables from .env.local
function loadEnv() {
  // Try multiple possible paths to find .env.local
  const possiblePaths = [
    path.join(__dirname, '../../..', '.env.local'),           // From .claude/scripts/ai/audio
    path.join(__dirname, '../../../..', '.env.local'),        // If running from deeper path
    path.join(process.cwd(), '.env.local'),                   // From current working directory
    path.join(process.env.CLAUDE_PROJECT_DIR || '', '.env.local') // From project env var
  ].filter(Boolean);

  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      try {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
          if (!line.trim().startsWith('#') && line.includes('=')) {
            const [key, ...rest] = line.split('=');
            const trimmedKey = key.trim();
            const value = rest.join('=').trim();
            if (trimmedKey && !process.env[trimmedKey]) {
              process.env[trimmedKey] = value;
            }
          }
        });
        return; // Successfully loaded
      } catch (e) {
        // Continue to next path
      }
    }
  }
}

// Parse arguments
function parseArgs(args) {
  const result = {
    text: '',
    voiceId: '21m00Tcm4TlvDq8ikWAM', // Default: Rachel voice
  };

  for (const arg of args) {
    if (arg.startsWith('--text=')) {
      result.text = arg.split('=')[1];
    } else if (arg.startsWith('--voice-id=')) {
      result.voiceId = arg.split('=')[1];
    } else if (!arg.startsWith('--')) {
      result.text = arg;
    }
  }

  return result;
}

// Generate audio with ElevenLabs
async function generateAudio(text, voiceId) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY environment variable not set');
  }

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

// Play audio file based on platform
async function playAudio(audioBuffer) {
  const tempDir = path.join(__dirname, '../../data/temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  const tempFile = path.join(tempDir, 'audio-temp.mp3');
  fs.writeFileSync(tempFile, audioBuffer);

  return new Promise((resolve) => {
    const platform = process.platform;

    if (platform === 'win32') {
      // Windows: use ffplay for simple, reliable audio playback
      const player = spawn('ffplay', ['-nodisp', '-autoexit', tempFile], {
        stdio: 'pipe',
      });

      player.on('close', () => {
        setTimeout(() => {
          try {
            fs.unlinkSync(tempFile);
          } catch (e) {
            // Ignore cleanup errors
          }
        }, 100);
        resolve();
      });

      player.on('error', () => {
        try {
          fs.unlinkSync(tempFile);
        } catch (e) {
          // Ignore
        }
        resolve();
      });
    } else if (platform === 'darwin') {
      // macOS: use afplay
      const player = spawn('afplay', [tempFile], {
        stdio: 'ignore',
        detached: true
      });

      player.on('close', () => {
        setTimeout(() => {
          try {
            fs.unlinkSync(tempFile);
          } catch (e) {
            // Ignore
          }
        }, 100);
        resolve();
      });

      player.on('error', () => {
        try {
          fs.unlinkSync(tempFile);
        } catch (e) {
          // Ignore
        }
        resolve();
      });

      player.unref();
    } else {
      // Linux: try paplay
      const player = spawn('paplay', [tempFile], {
        stdio: 'ignore',
        detached: true
      });

      player.on('close', () => {
        setTimeout(() => {
          try {
            fs.unlinkSync(tempFile);
          } catch (e) {
            // Ignore
          }
        }, 100);
        resolve();
      });

      player.on('error', () => {
        try {
          fs.unlinkSync(tempFile);
        } catch (e) {
          // Ignore
        }
        resolve();
      });

      player.unref();
    }
  });
}

// Main
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
Audio Summary Speaker

Usage:
  node speak-summary.js "Your summary text"
  node speak-summary.js --text="Summary text" --voice-id=VOICE_ID

Options:
  --voice-id=xxx   ElevenLabs voice ID (default: Rachel)

Environment:
  ELEVENLABS_API_KEY   Your ElevenLabs API key

Examples:
  node speak-summary.js "Task completed successfully"
  node speak-summary.js "I found 3 bugs in the code"
`);
    return;
  }

  const options = parseArgs(args);

  if (!options.text) {
    console.error('❌ Error: Text is required');
    process.exit(1);
  }

  try {
    console.log('🎤 Generating audio...');
    const audioBuffer = await generateAudio(options.text, options.voiceId);

    console.log('🔊 Playing audio...');
    await playAudio(audioBuffer);

    console.log('✅ Done');
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

loadEnv();
main();
