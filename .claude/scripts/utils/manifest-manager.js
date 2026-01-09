#!/usr/bin/env node
/**
 * Manifest Manager Utility
 *
 * Handles creation, reading, and updating of slideshow manifest files
 * Provides a clean interface for manifest operations
 */

const fs = require('fs');
const path = require('path');

class ManifestManager {
  /**
   * Create a new manifest for a slideshow project
   */
  static createManifest(projectDir, name, options = {}) {
    const manifest = {
      version: '1.0',
      name: name || path.basename(projectDir),
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      status: 'curating', // curating | assembling | complete
      settings: {
        aspectRatio: options.aspectRatio || '16:9',
        resolution: options.resolution || '2K',
        outputFormat: options.outputFormat || 'png',
        safetyFilter: options.safetyFilter || 'block_only_high',
      },
      slides: [],
      metadata: options.metadata || {},
    };

    return manifest;
  }

  /**
   * Load manifest from file
   */
  static loadManifest(manifestPath) {
    if (!fs.existsSync(manifestPath)) {
      throw new Error(`Manifest not found: ${manifestPath}`);
    }

    try {
      const content = fs.readFileSync(manifestPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to parse manifest: ${error.message}`);
    }
  }

  /**
   * Save manifest to file
   */
  static saveManifest(manifestPath, manifest) {
    const dir = path.dirname(manifestPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    manifest.updated = new Date().toISOString();
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  }

  /**
   * Add a slide to the manifest
   */
  static addSlide(manifest, slideData) {
    const slideIndex = manifest.slides.length + 1;
    const slide = {
      index: slideIndex,
      filename: slideData.filename,
      prompt: slideData.prompt,
      generatedAt: new Date().toISOString(),
      approved: slideData.approved !== false,
      notes: slideData.notes || '',
      metadata: slideData.metadata || {},
    };

    manifest.slides.push(slide);
    return slide;
  }

  /**
   * Update slide status
   */
  static updateSlide(manifest, slideIndex, updates) {
    const slide = manifest.slides.find(s => s.index === slideIndex);
    if (!slide) {
      throw new Error(`Slide ${slideIndex} not found`);
    }

    Object.assign(slide, updates);
    return slide;
  }

  /**
   * Get approved slides only
   */
  static getApprovedSlides(manifest) {
    return manifest.slides.filter(s => s.approved).sort((a, b) => a.index - b.index);
  }

  /**
   * Get all slides in order
   */
  static getSlides(manifest, includePending = false) {
    let slides = manifest.slides.sort((a, b) => a.index - b.index);
    if (!includePending) {
      slides = slides.filter(s => s.approved);
    }
    return slides;
  }

  /**
   * Reject a slide (mark as not approved)
   */
  static rejectSlide(manifest, slideIndex, reason = '') {
    const slide = this.updateSlide(manifest, slideIndex, {
      approved: false,
      rejectionReason: reason,
      rejectedAt: new Date().toISOString(),
    });
    return slide;
  }

  /**
   * Approve a slide
   */
  static approveSlide(manifest, slideIndex) {
    const slide = this.updateSlide(manifest, slideIndex, {
      approved: true,
      rejectionReason: undefined,
      rejectedAt: undefined,
    });
    return slide;
  }

  /**
   * Get manifest summary
   */
  static getSummary(manifest) {
    const approved = manifest.slides.filter(s => s.approved).length;
    const pending = manifest.slides.filter(s => !s.approved).length;
    const total = manifest.slides.length;

    return {
      name: manifest.name,
      status: manifest.status,
      total: total,
      approved: approved,
      pending: pending,
      created: manifest.created,
      updated: manifest.updated,
      slides: manifest.slides.map(s => ({
        index: s.index,
        filename: s.filename,
        approved: s.approved,
        prompt: s.prompt.substring(0, 50) + (s.prompt.length > 50 ? '...' : ''),
      })),
    };
  }

  /**
   * Validate manifest structure
   */
  static validate(manifest) {
    const errors = [];

    if (!manifest.version) errors.push('Missing version');
    if (!manifest.name) errors.push('Missing name');
    if (!Array.isArray(manifest.slides)) errors.push('Slides must be an array');
    if (!manifest.settings) errors.push('Missing settings');

    manifest.slides.forEach((slide, idx) => {
      if (!slide.filename) errors.push(`Slide ${idx + 1}: missing filename`);
      if (!slide.prompt) errors.push(`Slide ${idx + 1}: missing prompt`);
      if (typeof slide.approved !== 'boolean') errors.push(`Slide ${idx + 1}: approved must be boolean`);
    });

    return {
      valid: errors.length === 0,
      errors: errors,
    };
  }
}

module.exports = ManifestManager;
