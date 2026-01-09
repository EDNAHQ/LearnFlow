#!/usr/bin/env node
/**
 * Audio Summary Skill
 *
 * Generates an audio summary of what was just accomplished.
 * Can use provided text or extract from conversation history.
 *
 * Usage:
 *   - As a skill: /audio-summary
 *   - With custom text: /audio-summary "Your summary text"
 *   - With voice: /audio-summary "Summary" --voice-id=VOICE_ID
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { spawn } = require('child_process');

// Load environment variables
function loadEnv() {
  const possiblePaths = [
    path.join(__dirname, '../../..', '.env.local'),
    path.join(process.cwd(), '.env.local'),
    path.join(process.env.CLAUDE_PROJECT_DIR || '', '.env.local')
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
        return envPath; // Successfully loaded
      } catch (e) {
        // Continue to next path
      }
    }
  }
  return null;
}

// Parse command line arguments
function parseArgs(args) {
  const result = {
    text: '',
    voiceId: '21m00Tcm4TlvDq8ikWAM', // Default: Rachel
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--voice-id=')) {
      result.voiceId = arg.split('=')[1];
    } else if (arg.startsWith('--voice=')) {
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
    throw new Error(
      'ELEVENLABS_API_KEY not found. Please ensure it is set in your .env.local file.'
    );
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
    const req = https.request(
      {
        hostname: 'api.elevenlabs.io',
        path: `/v1/text-to-speech/${voiceId}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
          Accept: 'audio/mpeg',
        },
      },
      (res) => {
        if (res.statusCode !== 200) {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              const error = JSON.parse(data);
              reject(
                new Error(
                  error.detail?.message ||
                    `API error: ${res.statusCode}`
                )
              );
            } catch {
              reject(new Error(`API request failed with status ${res.statusCode}`));
            }
          });
          return;
        }

        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          resolve(Buffer.concat(chunks));
        });
      }
    );

    req.on('error', reject);
    req.write(requestBody);
    req.end();
  });
}

// Play audio file
async function playAudio(audioBuffer) {
  const tempDir = path.join(__dirname, '../../data/temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  const tempFile = path.join(tempDir, 'audio-summary.mp3');
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
        detached: true,
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
      // Linux: use paplay
      const player = spawn('paplay', [tempFile], {
        stdio: 'ignore',
        detached: true,
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

// Main execution
async function main() {
  const args = process.argv.slice(2);

  // Load environment variables
  const envPath = loadEnv();
  if (!envPath) {
    console.error('❌ Error: Could not find .env.local file');
    process.exit(1);
  }

  // Parse arguments
  const options = parseArgs(args);

  if (!options.text) {
    // No text provided - show help
    console.log(`
🎤 Audio Summary Skill

Generate a spoken summary of what was accomplished.

Usage:
  /audio-summary "Your summary text here"
  /audio-summary "Summary" --voice-id=VOICE_ID

Examples:
  /audio-summary "We fixed the bug and added tests"
  /audio-summary "Implemented dark mode feature" --voice-id=TxGEqnHWrfWFTfGW9XjX

Available voices:
  21m00Tcm4TlvDq8ikWAM  Rachel (default)
  TxGEqnHWrfWFTfGW9XjX  Aria
  EXAVITQu4vr4xnSDxMaL  Bella
  9BWtsMINqrJLrRacOk9x  Arnold
  iP3nJ0z0nHCmSC0cTHvh  Sam
    `);
    process.exit(0);
  }

  try {
    console.log('🎤 Generating audio summary...');
    const audioBuffer = await generateAudio(options.text, options.voiceId);

    console.log('🔊 Playing audio...');
    await playAudio(audioBuffer);

    console.log('✅ Audio summary complete');
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run
main();
