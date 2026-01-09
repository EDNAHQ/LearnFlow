#!/usr/bin/env node

/**
 * Incremental Summarizer
 * Creates digestible, audio-friendly summaries from conversation transcripts
 * Only processes new messages since last summary
 */

const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '..', '..', 'config', 'audio-summary-config.json');

class IncrementalSummarizer {
  constructor(options = {}) {
    this.config = this.loadConfig();
    this.summaryLength = options.summaryLength || this.config.summaryLength || 'medium';
    this.minThreshold = options.minThreshold || 2; // Minimum new messages to trigger summary
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
      summaryLength: 'medium',
      excludeToolOutput: true,
      maxSummaryLength: 500
    };
  }

  /**
   * Parse JSONL transcript file
   * @param {string} transcriptPath - Path to transcript file
   * @param {number} fromIndex - Start from this line index (0-based)
   * @returns {Array} Array of transcript entries
   */
  parseTranscript(transcriptPath, fromIndex = 0) {
    try {
      if (!fs.existsSync(transcriptPath)) {
        return [];
      }

      const content = fs.readFileSync(transcriptPath, 'utf-8');
      const lines = content.trim().split('\n').filter(line => line.length > 0);

      const entries = [];
      for (let i = Math.max(0, fromIndex); i < lines.length; i++) {
        try {
          const entry = JSON.parse(lines[i]);
          entry._index = i;
          entries.push(entry);
        } catch (e) {
          // Skip malformed lines
          continue;
        }
      }

      return entries;
    } catch (error) {
      console.error('Error parsing transcript:', error.message);
      return [];
    }
  }

  /**
   * Extract meaningful messages (filter out tool outputs, etc.)
   */
  extractMeaningfulMessages(entries) {
    return entries.filter(entry => {
      // Include user messages
      if (entry.type === 'user') {
        return true;
      }

      // Include assistant messages that aren't pure tool output
      if (entry.type === 'assistant') {
        const content = entry.content || '';
        // Skip if it's just tool invocation output
        if (content.includes('<function_calls>') && content.length < 200) {
          return false;
        }
        return true;
      }

      return false;
    });
  }

  /**
   * Generate a summary from new messages
   * @param {string} transcriptPath - Path to transcript
   * @param {number} fromIndex - Start from this index
   * @param {string} tabLabel - Label for this tab
   * @returns {Object} Summary object with text and metadata
   */
  generateSummary(transcriptPath, fromIndex = 0, tabLabel = 'Unknown') {
    const entries = this.parseTranscript(transcriptPath, fromIndex);

    if (entries.length < this.minThreshold) {
      return null;
    }

    const meaningfulMessages = this.extractMeaningfulMessages(entries);

    if (meaningfulMessages.length === 0) {
      return null;
    }

    const summary = this.buildSummaryText(meaningfulMessages, tabLabel);

    if (!summary) {
      return null;
    }

    return {
      text: summary,
      messageCount: meaningfulMessages.length,
      startIndex: entries[0]._index,
      endIndex: entries[entries.length - 1]._index,
      timestamp: Date.now()
    };
  }

  /**
   * Build concise summary text suitable for audio
   */
  buildSummaryText(messages, tabLabel) {
    if (messages.length === 0) {
      return null;
    }

    const parts = [];

    // Add tab context
    parts.push(`In ${tabLabel}:`);

    // Extract user requests
    const userMessages = messages.filter(m => m.type === 'user');
    if (userMessages.length > 0) {
      const lastUserMessage = userMessages[userMessages.length - 1];
      const preview = this.truncate(lastUserMessage.content, 100);
      parts.push(`User asked: ${preview}`);
    }

    // Extract assistant response summary
    const assistantMessages = messages.filter(m => m.type === 'assistant');
    if (assistantMessages.length > 0) {
      const lastAssistantMessage = assistantMessages[assistantMessages.length - 1];
      const content = lastAssistantMessage.content || '';

      // Try to extract meaningful summary
      const summary = this.extractSummaryFromContent(content);
      if (summary) {
        parts.push(`Claude: ${summary}`);
      }
    }

    const text = parts.join(' ');
    return text.length > 0 ? this.truncate(text, this.config.maxSummaryLength || 500) : null;
  }

  /**
   * Extract meaningful summary from assistant response
   */
  extractSummaryFromContent(content) {
    // Remove function calls and tool outputs
    let text = content;

    // Remove code blocks
    text = text.replace(/```[\s\S]*?```/g, '[code block]');

    // Remove function call syntax
    text = text.replace(/<function_calls>[\s\S]*?<\/antml:function_calls>/g, '[executing task]');

    // Remove HTML tags
    text = text.replace(/<[^>]+>/g, '');

    // Get first meaningful sentence or paragraph
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);

    if (sentences.length === 0) {
      return null;
    }

    // Return first sentence, up to 150 chars
    return this.truncate(sentences[0], 150);
  }

  /**
   * Truncate text to length, respecting word boundaries
   */
  truncate(text, maxLength) {
    if (text.length <= maxLength) {
      return text;
    }

    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > maxLength * 0.7) {
      return truncated.substring(0, lastSpace) + '...';
    }

    return truncated + '...';
  }

  /**
   * Get summary for display (for debugging)
   */
  getSummaryReport(transcriptPath, fromIndex = 0) {
    const entries = this.parseTranscript(transcriptPath, fromIndex);
    const meaningful = this.extractMeaningfulMessages(entries);

    return {
      totalEntries: entries.length,
      meaningfulMessages: meaningful.length,
      userMessages: meaningful.filter(m => m.type === 'user').length,
      assistantMessages: meaningful.filter(m => m.type === 'assistant').length,
      fromIndex,
      toIndex: entries.length > 0 ? entries[entries.length - 1]._index : 0
    };
  }
}

// CLI Interface
if (require.main === module) {
  const command = process.argv[2];
  const summarizer = new IncrementalSummarizer();

  switch (command) {
    case 'generate':
      const transcriptPath = process.argv[3];
      const fromIndex = parseInt(process.argv[4]) || 0;
      const tabLabel = process.argv[5] || 'Unknown';

      const summary = summarizer.generateSummary(transcriptPath, fromIndex, tabLabel);
      console.log(JSON.stringify(summary, null, 2));
      break;

    case 'report':
      const reportPath = process.argv[3];
      const reportFromIndex = parseInt(process.argv[4]) || 0;

      const report = summarizer.getSummaryReport(reportPath, reportFromIndex);
      console.log(JSON.stringify(report, null, 2));
      break;

    default:
      console.error('Unknown command:', command);
      console.error('Usage: node incremental-summarizer.js [generate|report] <transcript-path> [from-index] [tab-label]');
      process.exit(1);
  }
}

module.exports = IncrementalSummarizer;
