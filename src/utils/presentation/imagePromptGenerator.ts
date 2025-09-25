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

  // Check for technical/architectural keywords
  const technicalKeywords = [
    'architecture', 'system', 'infrastructure', 'database', 'api',
    'server', 'cloud', 'network', 'workflow', 'pipeline', 'framework'
  ];
  const isTechnical = technicalKeywords.some(kw => contentLower.includes(kw));

  // Check for conceptual keywords
  const conceptualKeywords = [
    'concept', 'principle', 'theory', 'model', 'paradigm',
    'approach', 'methodology', 'strategy', 'pattern'
  ];
  const isConceptual = conceptualKeywords.some(kw => contentLower.includes(kw));

  // Hero slide - full background image
  if (isHeroSlide && topic) {
    return {
      prompt: `Abstract digital visualization representing "${topic}", modern tech aesthetic with flowing lines and nodes, gradient colors transitioning from deep purple to vibrant pink`,
      shouldGenerate: true,
      type: 'hero'
    };
  }

  // Technical/architectural content
  if (isTechnical) {
    const extract = slideContent.substring(0, 150);
    return {
      prompt: `Clean technical diagram illustrating ${extract}, minimalist vector style, purple and pink accent colors, white background, professional and modern`,
      shouldGenerate: true,
      type: 'technical'
    };
  }

  // Conceptual content
  if (isConceptual) {
    const extract = slideContent.substring(0, 150);
    return {
      prompt: `Abstract conceptual visualization of ${extract}, geometric shapes and flowing forms, gradient from purple to pink, modern and sophisticated`,
      shouldGenerate: true,
      type: 'concept'
    };
  }

  // Default: ambient background for visual interest (lower priority)
  return {
    prompt: `Subtle abstract background with gentle purple and pink gradient, minimal geometric patterns, soft and unobtrusive, modern tech aesthetic`,
    shouldGenerate: false, // Don't generate by default to save costs
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

  // Generate for slides with specific keywords
  const contentLower = slideContent.toLowerCase();
  const highValueKeywords = [
    'architecture', 'system design', 'workflow', 'process',
    'diagram', 'model', 'framework', 'infrastructure'
  ];

  if (highValueKeywords.some(kw => contentLower.includes(kw))) {
    return true;
  }

  // Generate for section headings (detected by markdown heading syntax)
  if (slideContent.match(/^#+\s/m)) {
    return true;
  }

  // Don't generate for code slides or very short text slides
  if (slideContent.length < 100 || slideContent.includes('```')) {
    return false;
  }

  return false;
};