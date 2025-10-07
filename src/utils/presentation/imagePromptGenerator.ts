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

  // Extract key concepts from the content for more relevant prompts
  const extractKeyPhrase = (content: string, maxLength: number = 100): string => {
    // Remove markdown formatting
    const cleaned = content
      .replace(/^#+\s/gm, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`/g, '')
      .trim();

    // Get first sentence or first N characters
    const firstSentence = cleaned.match(/^[^.!?]+/)?.[0] || cleaned;
    return firstSentence.substring(0, maxLength);
  };

  // Check if this is a title/hero slide (first slide or contains headings)
  const isHeroSlide = slideIndex === 0 || contentLower.match(/^#+\s/m);

  // Enhanced keyword detection
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

  // Hero slide - full background image with brand colors
  if (isHeroSlide && topic) {
    return {
      prompt: `Futuristic abstract digital art for "${topic}", flowing data streams and interconnected nodes, dominant purple (#6654f5) transitioning to pink (#ca5a8b) with gold (#f2b347) accents, dark background with glowing elements, cinematic lighting, ultra modern tech aesthetic, 4k quality`,
      shouldGenerate: true,
      type: 'hero'
    };
  }

  // Process/workflow visualization
  if (isProcess) {
    const keyPhrase = extractKeyPhrase(slideContent);
    return {
      prompt: `Clean infographic showing ${keyPhrase}, step-by-step flow diagram with connected nodes, purple (#6654f5) to pink (#ca5a8b) gradient arrows, white background, minimalist flat design, professional business presentation style`,
      shouldGenerate: true,
      type: 'concept'
    };
  }

  // Technical/architectural content
  if (isTechnical) {
    const keyPhrase = extractKeyPhrase(slideContent);
    return {
      prompt: `Technical architecture diagram for ${keyPhrase}, isometric 3D style, clean lines and shapes, purple (#6654f5) and pink (#ca5a8b) accent colors on white background, professional tech documentation style, modern and minimalist`,
      shouldGenerate: true,
      type: 'technical'
    };
  }

  // Conceptual/educational content
  if (isConceptual) {
    const keyPhrase = extractKeyPhrase(slideContent);
    return {
      prompt: `Abstract conceptual illustration of ${keyPhrase}, flowing organic shapes with geometric elements, vibrant gradient from purple (#6654f5) through pink (#ca5a8b) to gold (#f2b347), modern educational infographic style, clean and sophisticated`,
      shouldGenerate: true,
      type: 'concept'
    };
  }

  // Check for data/analytics content
  if (contentLower.includes('data') || contentLower.includes('analytics') || contentLower.includes('metrics')) {
    const keyPhrase = extractKeyPhrase(slideContent);
    return {
      prompt: `Data visualization dashboard concept for ${keyPhrase}, modern charts and graphs, purple (#6654f5) to pink (#ca5a8b) gradient data points, dark mode interface, glowing neon accents, futuristic analytics aesthetic`,
      shouldGenerate: true,
      type: 'technical'
    };
  }

  // Section headers or important slides
  if (slideContent.match(/^#+\s/m) || slideContent.length < 200) {
    const keyPhrase = extractKeyPhrase(slideContent);
    return {
      prompt: `Minimalist abstract art representing ${keyPhrase}, soft gradient from purple (#6654f5) to pink (#ca5a8b), subtle geometric patterns, professional presentation background, elegant and modern`,
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