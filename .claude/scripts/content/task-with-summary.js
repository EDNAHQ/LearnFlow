#!/usr/bin/env node
/**
 * Task Wrapper with Audio Summary
 *
 * Wraps any command/task and automatically generates a voice summary when complete
 *
 * Usage:
 *   node task-with-summary.js "Summary text here"
 *   node task-with-summary.js --summary="Your summary" --voice-id=VOICE_ID
 *
 * This is meant to be called at the END of a task to provide voice feedback.
 *
 * Examples:
 *   node task-with-summary.js "Migration completed successfully"
 *   node task-with-summary.js "Found and fixed 5 type errors"
 *   node task-with-summary.js "Created new API endpoint with tests"
 */

const audioHelper = require('../utils/audio-summary-helper');

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
Task Summary Speaker

Usage:
  node task-with-summary.js "Your summary here"
  node task-with-summary.js --summary="Summary" --voice-id=VOICE_ID --silent

Options:
  --summary=text      Summary to speak (required)
  --voice-id=xxx      ElevenLabs voice ID (default: Rachel)
  --silent            Suppress status messages

Examples:
  node task-with-summary.js "Migration completed"
  node task-with-summary.js "Fixed 3 bugs in auth module"
  node task-with-summary.js "Created reusable Button component" --silent
`);
    process.exit(0);
  }

  let summary = '';
  let voiceId = '21m00Tcm4TlvDq8ikWAM';
  let verbose = true;

  for (const arg of args) {
    if (arg.startsWith('--summary=')) {
      summary = arg.split('=')[1];
    } else if (arg.startsWith('--voice-id=')) {
      voiceId = arg.split('=')[1];
    } else if (arg === '--silent') {
      verbose = false;
    } else if (!arg.startsWith('--')) {
      summary = arg;
    }
  }

  if (!summary) {
    if (verbose) {
      console.error('❌ Error: Summary text is required');
    }
    process.exit(1);
  }

  try {
    await audioHelper.speak(summary, voiceId, verbose);
  } catch (error) {
    if (verbose) {
      console.error(`❌ Error: ${error.message}`);
    }
    process.exit(1);
  }
}

main();
