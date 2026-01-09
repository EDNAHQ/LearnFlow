#!/usr/bin/env node
/**
 * Web Search Script
 * 
 * Searches the web using Tavily or Perplexity for real-time information
 * 
 * Usage:
 *   node search-web.js "search query" [options]
 * 
 * Options:
 *   --provider=tavily|perplexity  Provider to use (default: tavily)
 *   --depth=basic|advanced        Search depth (default: basic)
 *   --max-results=5               Max results (default: 5)
 *   --include-answer              Include AI-generated answer
 *   --output=filename.json        Save results to file
 * 
 * Environment Variables:
 *   TAVILY_API_KEY               Required for Tavily
 *   PERPLEXITY_API_KEY           Required for Perplexity
 * 
 * Examples:
 *   node search-web.js "latest React 19 features"
 *   node search-web.js "Node.js best practices 2024" --include-answer
 *   node search-web.js "TypeScript 5.3 changes" --depth=advanced
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Parse arguments
function parseArgs(args) {
  const result = {
    query: '',
    provider: 'tavily',
    depth: 'basic',
    maxResults: 5,
    includeAnswer: false,
    output: null,
  };

  for (const arg of args) {
    if (arg.startsWith('--provider=')) {
      result.provider = arg.split('=')[1];
    } else if (arg.startsWith('--depth=')) {
      result.depth = arg.split('=')[1];
    } else if (arg.startsWith('--max-results=')) {
      result.maxResults = parseInt(arg.split('=')[1]);
    } else if (arg === '--include-answer') {
      result.includeAnswer = true;
    } else if (arg.startsWith('--output=')) {
      result.output = arg.split('=')[1];
    } else if (!arg.startsWith('--')) {
      result.query = arg;
    }
  }

  return result;
}

// Search with Tavily
async function searchWithTavily(query, options) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error('TAVILY_API_KEY environment variable not set');
  }

  const requestBody = JSON.stringify({
    api_key: apiKey,
    query: query,
    search_depth: options.depth,
    max_results: options.maxResults,
    include_answer: options.includeAnswer,
    include_raw_content: false,
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.tavily.com',
      path: '/search',
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
          if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve(response);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(requestBody);
    req.end();
  });
}

// Search with Perplexity
async function searchWithPerplexity(query, options) {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error('PERPLEXITY_API_KEY environment variable not set');
  }

  const requestBody = JSON.stringify({
    model: 'llama-3.1-sonar-small-128k-online',
    messages: [
      {
        role: 'system',
        content: 'Be precise and concise. Cite sources when possible.',
      },
      {
        role: 'user',
        content: query,
      },
    ],
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.perplexity.ai',
      path: '/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.error) {
            reject(new Error(response.error.message));
          } else {
            // Format Perplexity response to match Tavily structure
            resolve({
              answer: response.choices[0].message.content,
              results: response.citations?.map(c => ({
                title: c.title || 'Source',
                url: c.url,
                content: c.snippet || '',
              })) || [],
            });
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(requestBody);
    req.end();
  });
}

// Format results for display
function formatResults(results, includeAnswer) {
  let output = '';

  if (includeAnswer && results.answer) {
    output += '## Answer\n\n';
    output += results.answer + '\n\n';
    output += '---\n\n';
  }

  output += '## Sources\n\n';
  
  if (results.results && results.results.length > 0) {
    results.results.forEach((result, i) => {
      output += `### ${i + 1}. ${result.title}\n`;
      output += `**URL:** ${result.url}\n\n`;
      if (result.content) {
        output += `${result.content.substring(0, 300)}...\n\n`;
      }
    });
  } else {
    output += 'No results found.\n';
  }

  return output;
}

// Main
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    console.log(`
Web Search Script

Usage:
  node search-web.js "search query" [options]

Options:
  --provider=tavily|perplexity  Provider (default: tavily)
  --depth=basic|advanced        Search depth (default: basic)
  --max-results=5               Max results (default: 5)
  --include-answer              Include AI answer
  --output=filename.json        Save to file

Environment:
  TAVILY_API_KEY                For Tavily
  PERPLEXITY_API_KEY            For Perplexity
`);
    return;
  }

  const options = parseArgs(args);

  if (!options.query) {
    console.error('❌ Error: Search query is required');
    process.exit(1);
  }

  console.log(`🔍 Searching with ${options.provider}...`);
  console.log(`   Query: "${options.query}"`);

  try {
    let results;
    if (options.provider === 'perplexity') {
      results = await searchWithPerplexity(options.query, options);
    } else {
      results = await searchWithTavily(options.query, options);
    }

    // Display results
    const formatted = formatResults(results, options.includeAnswer);
    console.log('\n' + formatted);

    // Save to file if requested
    if (options.output) {
      const outputDir = path.join(process.cwd(), 'generated');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const outputPath = path.join(outputDir, options.output);
      fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
      console.log(`✅ Results saved: ${outputPath}`);
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();

