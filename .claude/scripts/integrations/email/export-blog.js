#!/usr/bin/env node

/**
 * Export Blog Post to Downloads Folder
 * Saves formatted blog content as a text file for easy copying
 *
 * Usage:
 *   node export-blog.js "Your Blog Title" "Your blog content here..." [--format=markdown|text]
 *
 * Or pipe content:
 *   echo "Blog content" | node export-blog.js "My Blog Title"
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  format: 'markdown'
};

let title = '';
let content = '';
let usingStdin = false;

// Parse arguments
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    const [key, value] = args[i].substring(2).split('=');
    options[key] = value || true;
  } else if (!title) {
    title = args[i];
  } else if (!content) {
    content = args[i];
  }
}

// If no content provided, read from stdin
if (!content) {
  usingStdin = true;
  let stdinData = '';

  process.stdin.setEncoding('utf8');
  process.stdin.on('readable', () => {
    let chunk;
    while ((chunk = process.stdin.read()) !== null) {
      stdinData += chunk;
    }
  });

  process.stdin.on('end', () => {
    if (stdinData.trim()) {
      exportBlog(title, stdinData.trim());
    } else {
      console.error('❌ Error: Must provide blog title and content');
      console.error('   Usage: node export-blog.js "Title" "Content"');
      console.error('   Or: cat blog.txt | node export-blog.js "Title"');
      process.exit(1);
    }
  });
} else {
  exportBlog(title, content);
}

function exportBlog(title, content) {
  if (!title) {
    console.error('❌ Error: Blog title is required');
    process.exit(1);
  }

  // Ensure Downloads folder exists
  const downloadPath = path.join(os.homedir(), 'Downloads');
  if (!fs.existsSync(downloadPath)) {
    console.error('❌ Error: Downloads folder not found');
    process.exit(1);
  }

  // Create filename from title
  const filename = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);

  const extension = options.format === 'text' ? 'txt' : 'md';
  const filepath = path.join(downloadPath, `${filename}.${extension}`);

  // Format content based on option
  let formattedContent = content;

  if (options.format === 'text') {
    // Plain text - just clean up line breaks
    formattedContent = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n\n');
  } else {
    // Markdown format - keep as is, but remove duplicate title if it exists
    formattedContent = content;
    // Remove leading title if content already starts with one
    if (formattedContent.startsWith('# ' + title)) {
      formattedContent = formattedContent.substring(('# ' + title).length).trim();
    }
  }

  // Add title at the top
  const output = `# ${title}\n\n${formattedContent}`;

  // Write file
  try {
    fs.writeFileSync(filepath, output, 'utf8');
    console.log(`✅ Blog exported successfully`);
    console.log(`📄 File: ${filepath}`);
    console.log(`📊 Size: ${(output.length / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.error('❌ Error writing file:', error.message);
    process.exit(1);
  }
}
