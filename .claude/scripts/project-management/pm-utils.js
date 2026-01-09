#!/usr/bin/env node
/**
 * Project Management Utilities
 *
 * Shared helpers for the PM skill suite (/idea, /board, /tasks)
 *
 * Usage:
 *   node pm-utils.js parse <file>           # Parse items from file
 *   node pm-utils.js add <file> <json>      # Add item to file
 *   node pm-utils.js update <file> <id> <json>  # Update item
 *   node pm-utils.js render <file> [format] # Render as table/kanban
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// YAML Frontmatter Parsing
// ---------------------------------------------------------------------------

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };

  const yamlStr = match[1];
  const body = match[2];
  const meta = {};

  yamlStr.split('\n').forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      let value = line.slice(colonIdx + 1).trim();

      // Handle arrays like [tag1, tag2]
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(s => s.trim());
      }
      // Handle booleans
      else if (value === 'true') value = true;
      else if (value === 'false') value = false;

      meta[key] = value;
    }
  });

  return { meta, body };
}

function serializeFrontmatter(meta, body) {
  const lines = ['---'];
  for (const [key, value] of Object.entries(meta)) {
    if (Array.isArray(value)) {
      lines.push(`${key}: [${value.join(', ')}]`);
    } else {
      lines.push(`${key}: ${value}`);
    }
  }
  lines.push('---');
  lines.push(body);
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Item Parsing (from ideas.md / board.md format)
// ---------------------------------------------------------------------------

function parseItems(content) {
  const items = [];
  const lines = content.split('\n');
  let currentItem = null;
  let inUpdates = false;

  for (const line of lines) {
    // New item starts with ## and an ID like ## [1] Title or ## #1: Title
    const itemMatch = line.match(/^##\s+(?:\[(\d+)\]|#(\d+):?)\s+(.+)$/);
    if (itemMatch) {
      if (currentItem) items.push(currentItem);
      currentItem = {
        id: parseInt(itemMatch[1] || itemMatch[2]),
        title: itemMatch[3],
        status: 'backlog',
        priority: 'p2',
        tags: [],
        created: null,
        updated: null,
        description: '',
        updates: []
      };
      inUpdates = false;
      continue;
    }

    if (!currentItem) continue;

    // Parse metadata lines like **Status:** doing
    const metaMatch = line.match(/^\*\*(\w+):\*\*\s*(.+)$/);
    if (metaMatch) {
      const key = metaMatch[1].toLowerCase();
      const value = metaMatch[2].trim();
      if (key === 'status') currentItem.status = value;
      else if (key === 'priority') currentItem.priority = value;
      else if (key === 'tags') currentItem.tags = value.split(',').map(s => s.trim());
      else if (key === 'created') currentItem.created = value;
      else if (key === 'updated') currentItem.updated = value;
      else if (key === 'project') currentItem.project = value;
      continue;
    }

    // Updates section
    if (line.match(/^###\s+Updates/i)) {
      inUpdates = true;
      continue;
    }

    if (inUpdates && line.startsWith('- ')) {
      currentItem.updates.push(line.slice(2));
      continue;
    }

    // Description content
    if (!inUpdates && line.trim() && !line.startsWith('#')) {
      currentItem.description += line + '\n';
    }
  }

  if (currentItem) items.push(currentItem);
  return items;
}

function serializeItem(item) {
  const lines = [
    `## [${item.id}] ${item.title}`,
    `**Status:** ${item.status}`,
    `**Priority:** ${item.priority}`,
  ];

  if (item.tags && item.tags.length > 0) {
    lines.push(`**Tags:** ${item.tags.join(', ')}`);
  }
  if (item.project) {
    lines.push(`**Project:** ${item.project}`);
  }
  if (item.created) {
    lines.push(`**Created:** ${item.created}`);
  }
  if (item.updated) {
    lines.push(`**Updated:** ${item.updated}`);
  }

  lines.push('');

  if (item.description && item.description.trim()) {
    lines.push(item.description.trim());
    lines.push('');
  }

  if (item.updates && item.updates.length > 0) {
    lines.push('### Updates');
    item.updates.forEach(u => lines.push(`- ${u}`));
    lines.push('');
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// File Operations
// ---------------------------------------------------------------------------

function readPMFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return { header: '', items: [] };
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // Find where items start (first ## with ID)
  let headerEnd = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^##\s+(?:\[(\d+)\]|#(\d+):?)/)) {
      headerEnd = i;
      break;
    }
    headerEnd = i + 1;
  }

  const header = lines.slice(0, headerEnd).join('\n');
  const itemsContent = lines.slice(headerEnd).join('\n');
  const items = parseItems(itemsContent);

  return { header, items };
}

function writePMFile(filePath, header, items) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const content = header + '\n' + items.map(serializeItem).join('\n');
  fs.writeFileSync(filePath, content);
}

function getNextId(items) {
  if (items.length === 0) return 1;
  return Math.max(...items.map(i => i.id)) + 1;
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

function renderTable(items, columns = ['id', 'title', 'status', 'priority']) {
  if (items.length === 0) return 'No items found.';

  const headers = columns.map(c => c.toUpperCase());
  const rows = items.map(item =>
    columns.map(c => {
      if (c === 'id') return `#${item.id}`;
      if (c === 'tags') return (item.tags || []).join(', ');
      return item[c] || '';
    })
  );

  // Calculate column widths
  const widths = columns.map((c, i) =>
    Math.max(headers[i].length, ...rows.map(r => String(r[i]).length))
  );

  // Build table
  const sep = '+' + widths.map(w => '-'.repeat(w + 2)).join('+') + '+';
  const headerRow = '|' + headers.map((h, i) => ` ${h.padEnd(widths[i])} `).join('|') + '|';
  const dataRows = rows.map(r =>
    '|' + r.map((cell, i) => ` ${String(cell).padEnd(widths[i])} `).join('|') + '|'
  );

  return [sep, headerRow, sep, ...dataRows, sep].join('\n');
}

function renderKanban(items) {
  const columns = {
    backlog: items.filter(i => i.status === 'backlog'),
    doing: items.filter(i => i.status === 'doing'),
    blocked: items.filter(i => i.status === 'blocked'),
    done: items.filter(i => i.status === 'done')
  };

  const formatItem = (item) => {
    const priority = item.priority === 'p0' ? '!!!' :
                     item.priority === 'p1' ? '!!' :
                     item.priority === 'p2' ? '!' : '';
    return `  [${item.id}] ${priority}${item.title}`;
  };

  let output = '';
  for (const [status, statusItems] of Object.entries(columns)) {
    output += `\n## ${status.toUpperCase()} (${statusItems.length})\n`;
    if (statusItems.length === 0) {
      output += '  (empty)\n';
    } else {
      statusItems.forEach(item => {
        output += formatItem(item) + '\n';
      });
    }
  }

  return output.trim();
}

// ---------------------------------------------------------------------------
// CLI Interface
// ---------------------------------------------------------------------------

function main() {
  const [,, command, ...args] = process.argv;

  switch (command) {
    case 'parse': {
      const file = args[0];
      const { items } = readPMFile(file);
      console.log(JSON.stringify(items, null, 2));
      break;
    }

    case 'add': {
      const file = args[0];
      const itemData = JSON.parse(args[1]);
      const { header, items } = readPMFile(file);

      const newItem = {
        id: getNextId(items),
        title: itemData.title,
        status: itemData.status || 'backlog',
        priority: itemData.priority || 'p2',
        tags: itemData.tags || [],
        project: itemData.project || null,
        created: getToday(),
        updated: getToday(),
        description: itemData.description || '',
        updates: [`${getToday()}: Created`]
      };

      items.push(newItem);
      writePMFile(file, header, items);
      console.log(JSON.stringify(newItem));
      break;
    }

    case 'update': {
      const file = args[0];
      const id = parseInt(args[1]);
      const updates = JSON.parse(args[2]);
      const { header, items } = readPMFile(file);

      const item = items.find(i => i.id === id);
      if (!item) {
        console.error(`Item #${id} not found`);
        process.exit(1);
      }

      // Apply updates
      Object.assign(item, updates);
      item.updated = getToday();

      // Add update log entry if status changed
      if (updates.status) {
        item.updates = item.updates || [];
        item.updates.unshift(`${getToday()}: Status → ${updates.status}`);
      }

      writePMFile(file, header, items);
      console.log(JSON.stringify(item));
      break;
    }

    case 'render': {
      const file = args[0];
      const format = args[1] || 'kanban';
      const { items } = readPMFile(file);

      if (format === 'table') {
        console.log(renderTable(items));
      } else {
        console.log(renderKanban(items));
      }
      break;
    }

    case 'find': {
      const file = args[0];
      const id = parseInt(args[1]);
      const { items } = readPMFile(file);
      const item = items.find(i => i.id === id);
      if (item) {
        console.log(JSON.stringify(item, null, 2));
      } else {
        console.error(`Item #${id} not found`);
        process.exit(1);
      }
      break;
    }

    default:
      console.log(`
PM Utils - Project Management Helpers

Usage:
  node pm-utils.js parse <file>              Parse items from file
  node pm-utils.js add <file> <json>         Add item to file
  node pm-utils.js update <file> <id> <json> Update item by ID
  node pm-utils.js render <file> [format]    Render (kanban|table)
  node pm-utils.js find <file> <id>          Find item by ID
      `);
  }
}

main();
