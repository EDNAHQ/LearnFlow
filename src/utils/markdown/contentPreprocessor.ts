/**
 * Preprocesses content to detect and format code snippets
 * Converts plain text code examples into proper markdown code blocks
 */

// Common code patterns to detect
const CODE_PATTERNS = [
  // SQL patterns - more flexible matching
  {
    pattern: /(?:^|\n|\.\s+)(CREATE\s+(?:SCHEMA|TABLE|VIEW|INDEX|DATABASE)\s+[^;.]+;)/gim,
    language: 'sql',
    minLength: 15,
    contextBefore: 2
  },
  {
    pattern: /(?:^|\n|\.\s+)(ALTER\s+TABLE\s+[^;.]+;)/gim,
    language: 'sql',
    minLength: 12,
    contextBefore: 2
  },
  {
    pattern: /(?:^|\n|\.\s+)(DROP\s+(?:TABLE|SCHEMA|VIEW|INDEX)\s+[^;.]+(?:CASCADE)?;)/gim,
    language: 'sql',
    minLength: 12,
    contextBefore: 2
  },
  {
    pattern: /(?:^|\n|\.\s+)(SELECT\s+[^;.]+FROM\s+[^;.]+(?:WHERE|GROUP\s+BY|ORDER\s+BY|HAVING|LIMIT)?[^;.]*;)/gim,
    language: 'sql',
    minLength: 15,
    contextBefore: 2
  },
  {
    pattern: /(?:^|\n|\.\s+)(INSERT\s+INTO\s+[^;.]+(?:VALUES|SELECT)[^;.]+;)/gim,
    language: 'sql',
    minLength: 15,
    contextBefore: 2
  },
  {
    pattern: /(?:^|\n|\.\s+)(UPDATE\s+[^;.]+SET\s+[^;.]+(?:WHERE)?[^;.]*;)/gim,
    language: 'sql',
    minLength: 15,
    contextBefore: 2
  },
  {
    pattern: /(?:^|\n|\.\s+)(DELETE\s+FROM\s+[^;.]+(?:WHERE)?[^;.]*;)/gim,
    language: 'sql',
    minLength: 12,
    contextBefore: 2
  },
  // Multi-line SQL blocks (e.g., CREATE TABLE with columns)
  {
    pattern: /(?:^|\n|\.\s+)(CREATE\s+TABLE\s+[^;]+\([^)]+\)[^;]*;)/gims,
    language: 'sql',
    minLength: 30,
    contextBefore: 2
  },
  // JavaScript/TypeScript patterns
  {
    pattern: /(?:^|\n|\.\s+)((?:const|let|var|function|class|export|import)\s+[^\n]+(?:\n[^\n]+){0,15})/gm,
    language: 'javascript',
    minLength: 10,
    maxLines: 20
  },
  // Python patterns
  {
    pattern: /(?:^|\n|\.\s+)((?:def|class|import|from|if|for|while|try|with)\s+[^\n]+(?:\n[^\n]+){0,15})/gm,
    language: 'python',
    minLength: 10,
    maxLines: 20
  },
  // Code examples in quotes or parentheses
  {
    pattern: /(?:\(|"|'|`)(CREATE\s+(?:SCHEMA|TABLE|VIEW)\s+[^;)]+;)(?:\)|"|'|`)/gim,
    language: 'sql',
    minLength: 15
  },
  {
    pattern: /(?:\(|"|'|`)(ALTER\s+TABLE\s+[^;)]+;)(?:\)|"|'|`)/gim,
    language: 'sql',
    minLength: 12
  },
  {
    pattern: /(?:\(|"|'|`)(DROP\s+(?:TABLE|SCHEMA)\s+[^;)]+;)(?:\)|"|'|`)/gim,
    language: 'sql',
    minLength: 12
  }
];

/**
 * Detects code patterns in text and converts them to markdown code blocks
 */
export function preprocessContentForCodeBlocks(content: string): string {
  if (!content || typeof content !== 'string') {
    return content;
  }

  let processed = content;
  const processedRanges: Array<{ start: number; end: number }> = [];

  // Process each code pattern
  for (const codePattern of CODE_PATTERNS) {
    const matches = Array.from(processed.matchAll(codePattern.pattern));
    
    // Process matches in reverse order to maintain indices
    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i];
      if (!match || match.index === undefined) continue;

      const codeText = match[1] || match[0];
      let startIndex = match.index;
      let endIndex = startIndex + match[0].length;

      // Adjust for context before if specified
      if (codePattern.contextBefore) {
        const beforeText = processed.substring(Math.max(0, startIndex - codePattern.contextBefore), startIndex);
        // If there's a period or newline before, include it
        if (beforeText.match(/[.\n]$/)) {
          startIndex = Math.max(0, startIndex - codePattern.contextBefore);
        }
      }

      // Skip if already processed or too short
      if (codeText.length < codePattern.minLength) continue;

      // Check if this range overlaps with already processed ranges
      const overlaps = processedRanges.some(
        range => (startIndex >= range.start && startIndex < range.end) ||
                 (endIndex > range.start && endIndex <= range.end) ||
                 (startIndex < range.start && endIndex > range.end)
      );

      if (overlaps) continue;

      // Check max lines if specified
      if (codePattern.maxLines) {
        const lines = codeText.split('\n').length;
        if (lines > codePattern.maxLines) continue;
      }

      // Clean up the code text
      let cleanCode = codeText.trim();
      
      // Remove leading/trailing quotes, parentheses, backticks if present
      cleanCode = cleanCode.replace(/^[(`"'`]/, '').replace(/[)`"'`]$/, '');
      cleanCode = cleanCode.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '');
      
      // Skip if it's already in a code block
      if (cleanCode.includes('```')) continue;

      // Check if it's already formatted as markdown code block
      const beforeMatch = processed.substring(Math.max(0, startIndex - 10), startIndex);
      const afterMatch = processed.substring(endIndex, Math.min(processed.length, endIndex + 10));
      
      if (beforeMatch.includes('```') || afterMatch.includes('```')) {
        continue;
      }

      // Ensure we have proper spacing before and after
      const beforeChar = startIndex > 0 ? processed[startIndex - 1] : '';
      const afterChar = endIndex < processed.length ? processed[endIndex] : '';
      
      let prefix = '';
      let suffix = '';
      
      if (beforeChar && beforeChar !== '\n' && beforeChar !== ' ') {
        prefix = ' ';
      }
      if (afterChar && afterChar !== '\n' && afterChar !== ' ') {
        suffix = ' ';
      }

      // Format as markdown code block
      const codeBlock = `${prefix}\n\n\`\`\`${codePattern.language}\n${cleanCode}\n\`\`\`\n\n${suffix}`;
      
      // Replace the match
      processed = processed.substring(0, startIndex) + codeBlock + processed.substring(endIndex);
      
      // Track processed range
      processedRanges.push({
        start: startIndex,
        end: startIndex + codeBlock.length
      });
    }
  }

  // Clean up multiple consecutive newlines (max 2)
  processed = processed.replace(/\n{4,}/g, '\n\n\n');

  return processed;
}

/**
 * Enhances markdown formatting with better structure
 */
export function enhanceMarkdownFormatting(content: string): string {
  if (!content || typeof content !== 'string') {
    return content;
  }

  let enhanced = content;

  // Add spacing around headings if missing
  enhanced = enhanced.replace(/([^\n])\n(#{1,4}\s+)/g, '$1\n\n$2');
  enhanced = enhanced.replace(/(#{1,4}\s+[^\n]+)\n([^\n#])/g, '$1\n\n$2');

  // Ensure code blocks have spacing
  enhanced = enhanced.replace(/([^\n])\n(```)/g, '$1\n\n$2');
  enhanced = enhanced.replace(/(```[^\n]*\n[^`]*```)\n([^\n])/g, '$1\n\n$2');

  // Add spacing around lists (but not consecutive list items)
  enhanced = enhanced.replace(/([^\n])\n([*\-+]|\d+\.)\s/g, '$1\n\n$2 ');
  
  // Add spacing after lists
  enhanced = enhanced.replace(/([*\-+]|\d+\.)\s[^\n]+\n([^\n*\-+\d])/g, (match, listMarker, after) => {
    // Check if next line is not a list item
    if (!after.match(/^[*\-+\d]/)) {
      return match.replace(/\n([^\n*\-+\d])/, '\n\n$1');
    }
    return match;
  });

  // Break up very long paragraphs (more than 3 sentences without line breaks)
  enhanced = enhanced.replace(/([.!?]\s+)([A-Z][^.!?]{100,}[.!?]\s+[A-Z][^.!?]{100,}[.!?]\s+[A-Z][^.!?]{100,})/g, '$1\n\n$2');

  // Clean up excessive blank lines (max 2 consecutive)
  enhanced = enhanced.replace(/\n{4,}/g, '\n\n\n');

  return enhanced;
}

/**
 * Preprocesses custom markdown blocks (:::block-type)
 * Converts them to HTML divs with data attributes for react-markdown to handle
 */
export function preprocessCustomBlocks(content: string): string {
  if (!content || typeof content !== 'string') {
    return content;
  }

  let processed = content;
  
  // Match custom blocks: :::block-type\ncontent\n:::
  // Handle multiline blocks - match from start of line to end of line
  const blockPattern = /^:::(key-idea|checkpoint|deep-dive|summary)\n([\s\S]*?)\n:::$/gm;
  
  processed = processed.replace(blockPattern, (match, blockType, blockContent) => {
    // Trim content but preserve internal formatting
    const trimmedContent = blockContent.trim();
    // Wrap in HTML div with data attribute
    return `\n<div data-custom-block="${blockType}">${trimmedContent}</div>\n`;
  });

  return processed;
}

/**
 * Main preprocessing function
 */
export function preprocessContent(content: string): string {
  if (!content || typeof content !== 'string') {
    return content;
  }

  // First, preprocess custom blocks (before code block detection to avoid conflicts)
  let processed = preprocessCustomBlocks(content);
  
  // Then detect and format code blocks
  processed = preprocessContentForCodeBlocks(processed);
  
  // Finally enhance markdown formatting
  processed = enhanceMarkdownFormatting(processed);

  return processed;
}

