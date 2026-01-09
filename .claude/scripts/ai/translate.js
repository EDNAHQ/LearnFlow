#!/usr/bin/env node
/**
 * Translation Script
 * 
 * Translates text using DeepL or Google Cloud Translation
 * 
 * Usage:
 *   node translate.js "text to translate" --target=es [options]
 * 
 * Options:
 *   --provider=deepl|google      Provider to use (default: deepl)
 *   --target=es                  Target language code (required)
 *   --source=en                  Source language (auto-detect if omitted)
 *   --formality=default|more|less  Formality (DeepL only)
 *   --output=filename.txt        Save to file
 * 
 * Language Codes:
 *   en (English), es (Spanish), fr (French), de (German),
 *   it (Italian), pt (Portuguese), nl (Dutch), pl (Polish),
 *   ru (Russian), ja (Japanese), zh (Chinese), ko (Korean)
 * 
 * Environment Variables:
 *   DEEPL_API_KEY               Required for DeepL
 *   GOOGLE_TRANSLATE_API_KEY    Required for Google
 * 
 * Examples:
 *   node translate.js "Hello, how are you?" --target=es
 *   node translate.js "Bonjour" --target=en --source=fr
 *   node translate.js "Professional greeting" --target=de --formality=more
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Parse arguments
function parseArgs(args) {
  const result = {
    text: '',
    provider: 'deepl',
    target: null,
    source: null,
    formality: 'default',
    output: null,
  };

  for (const arg of args) {
    if (arg.startsWith('--provider=')) {
      result.provider = arg.split('=')[1];
    } else if (arg.startsWith('--target=')) {
      result.target = arg.split('=')[1].toUpperCase();
    } else if (arg.startsWith('--source=')) {
      result.source = arg.split('=')[1].toUpperCase();
    } else if (arg.startsWith('--formality=')) {
      result.formality = arg.split('=')[1];
    } else if (arg.startsWith('--output=')) {
      result.output = arg.split('=')[1];
    } else if (!arg.startsWith('--')) {
      result.text = arg;
    }
  }

  return result;
}

// Translate with DeepL
async function translateWithDeepL(text, options) {
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPL_API_KEY environment variable not set');
  }

  // Determine if free or pro API
  const hostname = apiKey.endsWith(':fx') 
    ? 'api-free.deepl.com' 
    : 'api.deepl.com';

  const params = new URLSearchParams({
    text: text,
    target_lang: options.target,
  });

  if (options.source) {
    params.append('source_lang', options.source);
  }

  if (options.formality !== 'default') {
    params.append('formality', options.formality);
  }

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: hostname,
      path: '/v2/translate',
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.translations && response.translations.length > 0) {
            resolve({
              translatedText: response.translations[0].text,
              detectedSourceLanguage: response.translations[0].detected_source_language,
            });
          } else if (response.message) {
            reject(new Error(response.message));
          } else {
            reject(new Error('No translation returned'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(params.toString());
    req.end();
  });
}

// Translate with Google Cloud Translation
async function translateWithGoogle(text, options) {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_TRANSLATE_API_KEY environment variable not set');
  }

  const params = new URLSearchParams({
    key: apiKey,
    q: text,
    target: options.target.toLowerCase(),
  });

  if (options.source) {
    params.append('source', options.source.toLowerCase());
  }

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'translation.googleapis.com',
      path: `/language/translate/v2?${params.toString()}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.data && response.data.translations) {
            const translation = response.data.translations[0];
            resolve({
              translatedText: translation.translatedText,
              detectedSourceLanguage: translation.detectedSourceLanguage,
            });
          } else if (response.error) {
            reject(new Error(response.error.message));
          } else {
            reject(new Error('No translation returned'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Main
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    console.log(`
Translation Script

Usage:
  node translate.js "text" --target=es [options]

Options:
  --provider=deepl|google       Provider (default: deepl)
  --target=es                   Target language (required)
  --source=en                   Source language (auto-detect)
  --formality=default|more|less Formality (DeepL only)
  --output=filename.txt         Save to file

Languages: en, es, fr, de, it, pt, nl, pl, ru, ja, zh, ko

Environment:
  DEEPL_API_KEY                 For DeepL
  GOOGLE_TRANSLATE_API_KEY      For Google
`);
    return;
  }

  const options = parseArgs(args);

  if (!options.text) {
    console.error('❌ Error: Text is required');
    process.exit(1);
  }

  if (!options.target) {
    console.error('❌ Error: Target language is required (--target=xx)');
    process.exit(1);
  }

  console.log(`🌐 Translating with ${options.provider}...`);
  console.log(`   Text: "${options.text.substring(0, 50)}${options.text.length > 50 ? '...' : ''}"`);
  console.log(`   Target: ${options.target}`);

  try {
    let result;
    if (options.provider === 'google') {
      result = await translateWithGoogle(options.text, options);
    } else {
      result = await translateWithDeepL(options.text, options);
    }

    console.log(`\n✅ Translation (${result.detectedSourceLanguage || options.source || 'auto'} → ${options.target}):`);
    console.log(`\n"${result.translatedText}"\n`);

    // Save to file if requested
    if (options.output) {
      const outputDir = path.join(process.cwd(), 'generated');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const outputPath = path.join(outputDir, options.output);
      fs.writeFileSync(outputPath, result.translatedText);
      console.log(`✅ Saved: ${outputPath}`);
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();

