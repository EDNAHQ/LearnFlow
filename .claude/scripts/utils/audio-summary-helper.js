#!/usr/bin/env node
/**
 * Audio Summary Helper
 *
 * Internal utility for generating and playing audio summaries
 * Used by other scripts to provide voice feedback
 *
 * Usage (from other Node scripts):
 *   const audioHelper = require('./audio-summary-helper');
 *   await audioHelper.speak("Your summary text");
 *
 * Or from command line:
 *   node audio-summary-helper.js "Your summary text"
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Load environment variables from .env.local
function loadEnv() {
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
}

loadEnv();

// Generate audio with ElevenLabs
async function generateAudio(text, voiceId = '21m00Tcm4TlvDq8ikWAM') {
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
      // Windows: use VBScript to play audio via Windows API
      const vbsFile = path.join(process.cwd(), '.play-audio.vbs');
      const vbsScript = `Set objPlayer = CreateObject("WMPlayer.OCX")
objPlayer.URL = "${tempFile}"
objPlayer.controls.play()
WScript.Sleep(5000)
objPlayer.close()`;

      fs.writeFileSync(vbsFile, vbsScript);

      const player = spawn('cscript.exe', [vbsFile], {
        stdio: 'ignore',
        detached: true
      });

      player.on('close', () => {
        // Clean up files
        setTimeout(() => {
          try {
            fs.unlinkSync(tempFile);
            fs.unlinkSync(vbsFile);
          } catch (e) {
            // Ignore cleanup errors
          }
        }, 100);
        resolve();
      });

      player.on('error', () => {
        // Silently continue - audio was generated, just can't play it
        try {
          fs.unlinkSync(tempFile);
          fs.unlinkSync(vbsFile);
        } catch (e) {
          // Ignore
        }
        resolve();
      });

      player.unref();
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

// Main function: generate and speak
async function speak(text, voiceId = '21m00Tcm4TlvDq8ikWAM', verbose = true) {
  try {
    if (verbose) {
      process.stdout.write('🎤 ');
    }
    const audioBuffer = await generateAudio(text, voiceId);
    if (verbose) {
      process.stdout.write('🔊 ');
    }
    await playAudio(audioBuffer);
    if (verbose) {
      process.stdout.write('✅\n');
    }
  } catch (error) {
    if (verbose) {
      console.error(`❌ Error: ${error.message}`);
    }
    throw error;
  }
}

// Export for use in other scripts
module.exports = {
  speak,
  generateAudio,
  playAudio,
};

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
Audio Summary Helper

Usage:
  node audio-summary-helper.js "Your summary text"
  node audio-summary-helper.js --text="Summary text" --voice-id=VOICE_ID

Options:
  --voice-id=xxx   ElevenLabs voice ID (default: Rachel)
  --silent         No status messages, just play audio

Examples:
  node audio-summary-helper.js "Task completed"
  node audio-summary-helper.js "Found 3 bugs" --silent
`);
    process.exit(0);
  }

  let text = '';
  let voiceId = '21m00Tcm4TlvDq8ikWAM';
  let verbose = true;

  for (const arg of args) {
    if (arg.startsWith('--text=')) {
      text = arg.split('=')[1];
    } else if (arg.startsWith('--voice-id=')) {
      voiceId = arg.split('=')[1];
    } else if (arg === '--silent') {
      verbose = false;
    } else if (!arg.startsWith('--')) {
      text = arg;
    }
  }

  if (!text) {
    console.error('❌ Error: Text is required');
    process.exit(1);
  }

  speak(text, voiceId, verbose).catch(() => process.exit(1));
}
