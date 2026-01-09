#!/usr/bin/env node

/**
 * Audio Queue System
 * Manages async audio generation with rate limiting and retry logic
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const AUDIO_DIR = path.join(DATA_DIR, 'audio-summaries');
const QUEUE_FILE = path.join(DATA_DIR, 'audio-queue.json');
const ENV_FILE = path.join(__dirname, '..', '..', '..', '.env.local');
const CONFIG_FILE = path.join(__dirname, '..', '..', 'config', 'audio-summary-config.json');

class AudioQueue {
  constructor(options = {}) {
    this.ensureDirs();
    this.config = this.loadConfig();
    this.queue = this.loadQueue();
    this.apiKey = this.loadApiKey();
    this.voiceId = options.voiceId || this.config.voiceId || 'TxGEqnHWrfWFTfGW9XjX'; // default voice
    this.rateLimitDelay = options.rateLimitDelay || this.config.rateLimitDelay || 1000; // 1 second between requests
    this.maxRetries = options.maxRetries || this.config.maxRetries || 3;
    this.isProcessing = false;
  }

  /**
   * Ensure directories exist
   */
  ensureDirs() {
    [DATA_DIR, AUDIO_DIR].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Load configuration
   */
  loadConfig() {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      }
    } catch (error) {
      console.warn('Warning: Could not load config:', error.message);
    }

    return {
      voiceId: 'TxGEqnHWrfWFTfGW9XjX',
      rateLimitDelay: 1000,
      maxRetries: 3
    };
  }

  /**
   * Load API key from environment
   */
  loadApiKey() {
    // Try .env.local first
    if (fs.existsSync(ENV_FILE)) {
      try {
        const content = fs.readFileSync(ENV_FILE, 'utf-8');
        const match = content.match(/ELEVENLABS_API_KEY\s*=\s*(.+)/);
        if (match) {
          return match[1].trim().replace(/['"]/g, '');
        }
      } catch (error) {
        console.warn('Warning: Could not read .env.local');
      }
    }

    // Try process.env
    return process.env.ELEVENLABS_API_KEY || '';
  }

  /**
   * Load queue from disk
   */
  loadQueue() {
    if (!fs.existsSync(QUEUE_FILE)) {
      return { items: [], processing: false, lastProcessed: 0 };
    }

    try {
      return JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf-8'));
    } catch (error) {
      return { items: [], processing: false, lastProcessed: 0 };
    }
  }

  /**
   * Save queue to disk
   */
  saveQueue() {
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(this.queue, null, 2));
  }

  /**
   * Queue a summary for audio generation
   * @returns {string} Queue item ID
   */
  async queueSummary(data) {
    const queueId = `audio-${data.sessionId}-${Date.now()}`;

    const item = {
      id: queueId,
      sessionId: data.sessionId,
      tabLabel: data.tabLabel,
      text: data.text,
      messageIndex: data.messageIndex,
      status: 'pending',
      createdAt: Date.now(),
      attempts: 0
    };

    this.queue.items.push(item);
    this.saveQueue();

    // Start processing if not already running
    if (!this.isProcessing) {
      setImmediate(() => this.processQueue());
    }

    return queueId;
  }

  /**
   * Process the audio queue
   */
  async processQueue() {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    const startTime = Date.now();

    try {
      while (this.queue.items.length > 0) {
        const item = this.queue.items[0];

        if (item.status === 'pending' || (item.status === 'failed' && item.attempts < this.maxRetries)) {
          const success = await this.processItem(item);

          if (success) {
            this.queue.items.shift();
            this.queue.lastProcessed = Date.now();
            this.saveQueue();
          } else {
            // Move to end of queue for retry
            item.attempts++;
            if (item.attempts >= this.maxRetries) {
              item.status = 'failed';
              console.error(`[AudioQueue] Max retries exceeded for ${item.id}`);
            } else {
              item.status = 'pending';
            }
            this.queue.items.shift();
            this.queue.items.push(item);
            this.saveQueue();
            break; // Wait before retrying
          }

          // Rate limiting
          await this.sleep(this.rateLimitDelay);
        }
      }
    } catch (error) {
      console.error('[AudioQueue] Queue processing error:', error.message);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single queue item
   */
  async processItem(item) {
    try {
      if (!this.apiKey) {
        console.warn('[AudioQueue] No API key configured, skipping audio generation');
        return true; // Don't retry without API key
      }

      const audioPath = this.getAudioPath(item);
      const dir = path.dirname(audioPath);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Generate audio
      const success = await this.generateAudio(item.text, audioPath);

      if (success) {
        item.status = 'completed';
        item.audioPath = audioPath;
        item.completedAt = Date.now();
        console.log(`[AudioQueue] Generated audio: ${item.tabLabel}`);
        return true;
      } else {
        item.status = 'failed';
        return false;
      }
    } catch (error) {
      console.error(`[AudioQueue] Error processing item ${item.id}:`, error.message);
      item.status = 'failed';
      return false;
    }
  }

  /**
   * Generate audio using ElevenLabs API
   */
  async generateAudio(text, outputPath) {
    return new Promise((resolve) => {
      try {
        const url = `https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`;
        const postData = JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        });

        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'xi-api-key': this.apiKey
          },
          timeout: 30000
        };

        const request = https.request(url, options, (response) => {
          let data = Buffer.alloc(0);

          response.on('data', (chunk) => {
            data = Buffer.concat([data, chunk]);
          });

          response.on('end', () => {
            if (response.statusCode === 200) {
              try {
                fs.writeFileSync(outputPath, data);
                resolve(true);
              } catch (error) {
                console.error('[AudioQueue] Error writing audio file:', error.message);
                resolve(false);
              }
            } else {
              console.error(`[AudioQueue] API error: ${response.statusCode}`);
              resolve(false);
            }
          });
        });

        request.on('error', (error) => {
          console.error('[AudioQueue] Request error:', error.message);
          resolve(false);
        });

        request.on('timeout', () => {
          request.destroy();
          resolve(false);
        });

        request.write(postData);
        request.end();
      } catch (error) {
        console.error('[AudioQueue] Error generating audio:', error.message);
        resolve(false);
      }
    });
  }

  /**
   * Get audio file path for a queue item
   */
  getAudioPath(item) {
    const sessionDir = path.join(AUDIO_DIR, item.sessionId);
    const timestamp = new Date(item.createdAt).toISOString().replace(/[:.]/g, '-');
    const filename = `${String(item.messageIndex).padStart(5, '0')}-${timestamp}.mp3`;
    return path.join(sessionDir, filename);
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      queued: this.queue.items.filter(i => i.status === 'pending').length,
      processing: this.isProcessing,
      completed: this.queue.items.filter(i => i.status === 'completed').length,
      failed: this.queue.items.filter(i => i.status === 'failed').length,
      lastProcessed: this.queue.lastProcessed,
      hasApiKey: !!this.apiKey
    };
  }

  /**
   * Get completed audio files for a session
   */
  getSessionAudios(sessionId) {
    const sessionDir = path.join(AUDIO_DIR, sessionId);

    if (!fs.existsSync(sessionDir)) {
      return [];
    }

    try {
      const files = fs.readdirSync(sessionDir).filter(f => f.endsWith('.mp3'));
      return files.sort().map(f => ({
        filename: f,
        path: path.join(sessionDir, f),
        size: fs.statSync(path.join(sessionDir, f)).size
      }));
    } catch (error) {
      return [];
    }
  }

  /**
   * Sleep helper
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI Interface
if (require.main === module) {
  const command = process.argv[2];
  const queue = new AudioQueue();

  switch (command) {
    case 'queue':
      const data = JSON.parse(process.argv[3]);
      queue.queueSummary(data).then(id => {
        console.log(JSON.stringify({ success: true, queueId: id }));
      }).catch(error => {
        console.error(JSON.stringify({ success: false, error: error.message }));
        process.exit(1);
      });
      break;

    case 'process':
      queue.processQueue().then(() => {
        console.log(JSON.stringify({ success: true }));
        process.exit(0);
      }).catch(error => {
        console.error(JSON.stringify({ success: false, error: error.message }));
        process.exit(1);
      });
      break;

    case 'status':
      console.log(JSON.stringify(queue.getStatus(), null, 2));
      break;

    case 'audios':
      const sessionId = process.argv[3];
      const audios = queue.getSessionAudios(sessionId);
      console.log(JSON.stringify(audios, null, 2));
      break;

    default:
      console.error('Unknown command:', command);
      console.error('Usage: node audio-queue.js [queue|process|status|audios]');
      process.exit(1);
  }
}

module.exports = AudioQueue;
