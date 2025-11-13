/**
 * IMAGE PROMPT GENERATION - TEXT-FREE ABSTRACT IMAGERY STRATEGY
 * ================================================================
 * 
 * CORE PHILOSOPHY:
 * All generated presentation images MUST be:
 * - 100% TEXT-FREE (no letters, words, typography, labels, symbols)
 * - PURELY ABSTRACT (geometric shapes, colors, flows, patterns)
 * - VISUALLY CONSISTENT (use brand colors across all images)
 * - CONTENT-AGNOSTIC (imagery doesn't directly illustrate slide content)
 * 
 * WHY THIS APPROACH:
 * 1. Images serve as VISUAL FRAMING around text content
 * 2. Abstract imagery prevents cognitive overload
 * 3. Consistent visual language reinforces brand
 * 4. Audience focuses on slide text, not decoding image content
 * 
 * BRAND COLOR CONSISTENCY:
 * Every image uses these colors for visual unity:
 * - Primary: Purple (#6654f5)
 * - Secondary: Pink (#ca5a8b)  
 * - Accent: Gold (#f2b347)
 * 
 * PROMPT STRATEGY:
 * Keywords from slide content determine VISUAL STYLE only:
 * - Technical keywords → geometric, structured, layered aesthetic
 * - Conceptual keywords → organic, flowing, interconnected forms
 * - Process keywords → directional flow, movement, progression
 * - General slides → minimalist, elegant, sophisticated
 * 
 * CRITICAL IN EVERY PROMPT:
 * "No text, letters, words, typography, labels, or any written characters"
 * This explicit instruction must appear multiple times to prevent
 * AI models from including text in the generated images.
 */

export interface ImagePromptResult {
  prompt: string;
  shouldGenerate: boolean;
  type: 'hero' | 'concept' | 'technical' | 'ambient';
}

export const generateImagePrompt = (
  slideContent: string,
  topic?: string,
  slideIndex?: number,
  totalSlides?: number
): ImagePromptResult => {
  const contentLower = slideContent.toLowerCase();

  // Check if this is a title/hero slide (first slide or contains headings)
  const isHeroSlide = slideIndex === 0 || contentLower.match(/^#+\s/m);

  // Enhanced keyword detection - PURELY for determining visual style, NOT for inclusion in prompt
  const technicalKeywords = [
    'architecture', 'system', 'infrastructure', 'database', 'api',
    'server', 'cloud', 'network', 'workflow', 'pipeline', 'framework',
    'backend', 'frontend', 'deployment', 'integration', 'microservice',
    'docker', 'kubernetes', 'aws', 'cache', 'queue', 'stream'
  ];
  const isTechnical = technicalKeywords.some(kw => contentLower.includes(kw));

  const conceptualKeywords = [
    'concept', 'principle', 'theory', 'model', 'paradigm',
    'approach', 'methodology', 'strategy', 'pattern', 'design',
    'analytics', 'insights', 'metrics', 'data', 'visualization',
    'learning', 'knowledge', 'understanding', 'foundation'
  ];
  const isConceptual = conceptualKeywords.some(kw => contentLower.includes(kw));

  const processKeywords = [
    'step', 'process', 'phase', 'stage', 'cycle', 'flow',
    'sequence', 'procedure', 'method', 'journey', 'path'
  ];
  const isProcess = processKeywords.some(kw => contentLower.includes(kw));

  // ==========================================
  // BRAND COLOR PALETTE - CONSISTENT ACROSS ALL IMAGES
  // ==========================================
  // Primary: Purple (#6654f5)
  // Secondary: Pink (#ca5a8b)
  // Accent: Gold (#f2b347)
  // These colors should appear in EVERY generated image for visual consistency

  // Hero slide - dramatic, energetic abstract composition
  if (isHeroSlide && topic) {
    return {
      prompt: `Abstract digital art with flowing geometric shapes and organic curves. Dominant color palette: deep purple transitioning to vibrant pink with gold accents. Layered transparent shapes creating depth. Flowing light trails and soft glowing particles. Modern tech aesthetic with cinematic lighting. 4K quality. CRITICAL: Absolutely no text, no letters, no words, no typography, no labels, no symbols, no written characters whatsoever. Pure visual imagery only.`,
      shouldGenerate: true,
      type: 'hero'
    };
  }

  // Process/workflow - flowing, connected, directional energy
  if (isProcess) {
    return {
      prompt: `Abstract visualization of flow and connection using geometric shapes. Color palette: purple to pink gradient with gold highlights. Flowing lines and nodes creating a sense of movement and progression. Minimalist design with layered depth. Soft lighting and subtle shadows. Modern minimalist aesthetic. CRITICAL: No text, letters, words, typography, labels, or any written characters. Pure abstract imagery only.`,
      shouldGenerate: true,
      type: 'concept'
    };
  }

  // Technical/architectural - structural, ordered, layered
  if (isTechnical) {
    return {
      prompt: `Abstract technical aesthetic using clean geometric structures and layered architectural forms. Color palette: purple, pink, and gold accents. Isometric or angular perspective suggesting 3D depth. Crisp lines, hexagons, grids, and connected nodes. Professional but artistic feel. Dark or white background with glowing elements. CRITICAL: Absolutely no text, no letters, no words, no typography, no labels. Pure visual structure and form only.`,
      shouldGenerate: true,
      type: 'technical'
    };
  }

  // Conceptual/educational - organic, flowing, interconnected
  if (isConceptual) {
    return {
      prompt: `Abstract conceptual illustration with flowing organic shapes blending into geometric patterns. Color palette: vibrant purple to pink gradient with gold accents. Soft, dreamy atmosphere with layered transparency. Connected circles, spirals, and wave-like forms suggesting growth and interconnection. Modern abstract art style. CRITICAL: No text, no letters, no words, no typography, no labels, no symbols. Pure imagery and composition only.`,
      shouldGenerate: true,
      type: 'concept'
    };
  }

  // Data/analytics - structured, points, patterns, glowing
  if (contentLower.includes('data') || contentLower.includes('analytics') || contentLower.includes('metrics')) {
    return {
      prompt: `Abstract data visualization with scattered points and connections creating patterns. Color palette: purple, pink, and gold glowing elements. Glowing particles, nodes, and connecting lines. Dark atmospheric background with luminescent accents. Futuristic, analytical aesthetic. Suggest complexity and information flow through purely visual means. CRITICAL: No text, letters, words, typography, labels, or any written information. Pure abstract pattern and visualization only.`,
      shouldGenerate: true,
      type: 'technical'
    };
  }

  // Section headers or important slides - minimalist, impactful, gradient-focused
  if (slideContent.match(/^#+\s/m) || slideContent.length < 200) {
    return {
      prompt: `Minimalist abstract composition with soft gradient transitions. Color palette: purple fading to pink with subtle gold accents. Geometric shapes, curves, and flowing forms creating elegant negative space. Professional presentation aesthetic with sophisticated simplicity. Light or neutral background with subtle depth. CRITICAL: No text, no letters, no words, no typography, no labels, no characters of any kind. Pure visual elegance only.`,
      shouldGenerate: true,
      type: 'ambient'
    };
  }

  // Default: Don't generate for regular text-heavy slides
  return {
    prompt: '',
    shouldGenerate: false,
    type: 'ambient'
  };
};

// Determine if a slide should have an image based on various factors
export const shouldGenerateImage = (
  slideIndex: number,
  totalSlides: number,
  slideContent: string
): boolean => {
  // Always generate for first slide (hero)
  if (slideIndex === 0) return true;

  // Don't generate for code slides
  if (slideContent.includes('```')) {
    return false;
  }

  // Generate for slides with specific high-value keywords
  const contentLower = slideContent.toLowerCase();
  const highValueKeywords = [
    'architecture', 'system design', 'workflow', 'process',
    'diagram', 'model', 'framework', 'infrastructure',
    'data', 'analytics', 'metrics', 'visualization',
    'journey', 'roadmap', 'timeline', 'phase',
    'concept', 'principle', 'foundation', 'overview'
  ];

  if (highValueKeywords.some(kw => contentLower.includes(kw))) {
    return true;
  }

  // Generate for section headings (detected by markdown heading syntax)
  if (slideContent.match(/^#+\s/m)) {
    return true;
  }

  // Generate for shorter, impactful slides (likely to be key points)
  if (slideContent.length < 300 && slideContent.length > 50) {
    return true;
  }

  // Generate for slides at key positions (every 3-4 slides for visual variety)
  if (slideIndex % 4 === 0 && totalSlides > 5) {
    return true;
  }

  // Don't generate for very long text-heavy slides
  if (slideContent.length > 800) {
    return false;
  }

  // For medium-length slides, generate if it's been a while since last image
  if (slideContent.length < 500) {
    return true;
  }

  return false;
};