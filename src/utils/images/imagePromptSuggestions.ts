/**
 * Smart Image Prompt Suggestions System
 * Provides contextual, pre-defined prompt templates based on content analysis
 */

export interface PromptSuggestion {
  id: string;
  label: string;
  description: string;
  promptTemplate: string;
  category: 'architecture' | 'concept' | 'process' | 'data' | 'comparison' | 'timeline' | 'hierarchy' | 'relationship';
  keywords: string[];
}

export interface ContentAnalysis {
  detectedCategories: string[];
  suggestedPrompts: PromptSuggestion[];
  contextKeywords: string[];
}

// Pre-defined prompt templates for common learning concepts
const PROMPT_TEMPLATES: PromptSuggestion[] = [
  // Architecture & Systems
  {
    id: 'system-architecture',
    label: 'System Architecture',
    description: 'Visual representation of system components and connections',
    promptTemplate: 'Clean architectural diagram showing {topic} system components, isometric 3D view with interconnected modules, purple and pink gradient accents, white background, technical documentation style',
    category: 'architecture',
    keywords: ['system', 'architecture', 'components', 'modules', 'infrastructure', 'backend', 'frontend', 'api', 'database']
  },
  {
    id: 'layered-architecture',
    label: 'Layered Stack',
    description: 'Hierarchical layers building on each other',
    promptTemplate: 'Layered pyramid diagram for {topic}, foundational base layers building up to advanced concepts at the peak, purple to pink gradient, clean educational style, clear visual hierarchy',
    category: 'architecture',
    keywords: ['layers', 'stack', 'foundation', 'hierarchy', 'levels', 'tiers'],
  },

  // Processes & Workflows
  {
    id: 'process-flow',
    label: 'Process Flow',
    description: 'Step-by-step workflow visualization',
    promptTemplate: 'Process flow diagram for {topic}, connected nodes showing sequential steps, directional arrows, purple to pink gradient flow, clean minimalist design, business presentation style',
    category: 'process',
    keywords: ['process', 'workflow', 'steps', 'procedure', 'flow', 'sequence', 'pipeline'],
  },
  {
    id: 'circular-process',
    label: 'Cycle Diagram',
    description: 'Continuous or iterative process',
    promptTemplate: 'Circular cycle diagram for {topic}, interconnected phases in a continuous loop, gradient from purple through pink to gold, modern infographic style',
    category: 'process',
    keywords: ['cycle', 'iteration', 'continuous', 'loop', 'phases', 'circular']
  },

  // Conceptual & Abstract
  {
    id: 'mind-map',
    label: 'Mind Map',
    description: 'Central concept with branching ideas',
    promptTemplate: 'Mind map visualization of {topic}, central node with organic branching connections, colorful gradient nodes from purple to pink, educational poster style',
    category: 'concept',
    keywords: ['concept', 'ideas', 'brainstorm', 'connections', 'relationships', 'map']
  },
  {
    id: 'network-graph',
    label: 'Network Connections',
    description: 'Interconnected nodes and relationships',
    promptTemplate: 'Network graph showing {topic} relationships, glowing nodes with connecting lines, purple and pink neon effects on dark background, data visualization style',
    category: 'relationship',
    keywords: ['network', 'connections', 'relationships', 'graph', 'nodes', 'links']
  },

  // Data & Analytics
  {
    id: 'dashboard-metrics',
    label: 'Dashboard View',
    description: 'Data visualization and metrics',
    promptTemplate: 'Modern analytics dashboard for {topic}, charts and KPI cards, dark theme with purple and pink accent colors, clean data visualization design',
    category: 'data',
    keywords: ['data', 'analytics', 'metrics', 'dashboard', 'charts', 'visualization', 'statistics']
  },
  {
    id: 'comparison-chart',
    label: 'Comparison Matrix',
    description: 'Side-by-side feature or option comparison',
    promptTemplate: 'Comparison matrix for {topic} options, clean table layout with checkmarks and features, purple headers with pink accents, professional presentation style',
    category: 'comparison',
    keywords: ['comparison', 'versus', 'options', 'features', 'matrix', 'table', 'differences']
  },

  // Timeline & Progress
  {
    id: 'timeline-roadmap',
    label: 'Timeline Roadmap',
    description: 'Chronological progression or roadmap',
    promptTemplate: 'Timeline roadmap for {topic}, horizontal progression with milestone markers, gradient from purple (past) through pink (present) to gold (future), clean infographic style',
    category: 'timeline',
    keywords: ['timeline', 'roadmap', 'progression', 'history', 'future', 'milestones', 'phases']
  },
  {
    id: 'journey-path',
    label: 'Learning Journey',
    description: 'Visual path from beginner to expert',
    promptTemplate: 'Learning journey path for {topic}, winding road with checkpoints and achievements, landscape view with purple to pink sky gradient, motivational educational style',
    category: 'timeline',
    keywords: ['journey', 'path', 'learning', 'progress', 'stages', 'beginner', 'expert']
  },

  // Hierarchical Structures
  {
    id: 'tree-hierarchy',
    label: 'Tree Structure',
    description: 'Hierarchical organization or taxonomy',
    promptTemplate: 'Tree hierarchy diagram for {topic}, branching structure showing parent-child relationships, purple trunk with pink and gold leaves, clean organizational chart style',
    category: 'hierarchy',
    keywords: ['hierarchy', 'tree', 'organization', 'structure', 'taxonomy', 'categories', 'parent', 'child']
  },
  {
    id: 'venn-diagram',
    label: 'Venn Diagram',
    description: 'Overlapping concepts or relationships',
    promptTemplate: 'Venn diagram showing {topic} relationships, overlapping circles with shared areas, purple and pink transparent circles with gold intersections, educational infographic style',
    category: 'relationship',
    keywords: ['venn', 'overlap', 'intersection', 'shared', 'common', 'relationships']
  }
];

/**
 * Analyze content and suggest relevant image prompts
 */
export function analyzeContentForPrompts(
  content: string,
  topic: string,
  stepTitle?: string
): ContentAnalysis {
  const contentLower = content.toLowerCase();
  const titleLower = (stepTitle || '').toLowerCase();
  const combinedText = `${contentLower} ${titleLower}`;

  // Extract keywords from content
  const contextKeywords: string[] = [];
  const detectedCategories = new Set<string>();
  const suggestedPrompts: PromptSuggestion[] = [];

  // Score each template based on keyword matches
  const templateScores = PROMPT_TEMPLATES.map(template => {
    let score = 0;
    let matchedKeywords: string[] = [];

    template.keywords.forEach(keyword => {
      if (combinedText.includes(keyword)) {
        score += keyword.length > 6 ? 2 : 1; // Longer keywords get higher score
        matchedKeywords.push(keyword);
        contextKeywords.push(keyword);
        detectedCategories.add(template.category);
      }
    });

    // Bonus points for title matches
    if (titleLower && template.keywords.some(kw => titleLower.includes(kw))) {
      score += 3;
    }

    return { template, score, matchedKeywords };
  });

  // Sort by score and get top suggestions
  const topSuggestions = templateScores
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(item => ({
      ...item.template,
      promptTemplate: item.template.promptTemplate.replace('{topic}', topic)
    }));

  // If no matches, provide generic suggestions based on content length and type
  if (topSuggestions.length === 0) {
    // Short content - likely a title or key concept
    if (content.length < 200) {
      suggestedPrompts.push(
        {
          ...PROMPT_TEMPLATES.find(t => t.id === 'mind-map')!,
          promptTemplate: PROMPT_TEMPLATES.find(t => t.id === 'mind-map')!.promptTemplate.replace('{topic}', topic)
        },
        {
          ...PROMPT_TEMPLATES.find(t => t.id === 'system-architecture')!,
          promptTemplate: PROMPT_TEMPLATES.find(t => t.id === 'system-architecture')!.promptTemplate.replace('{topic}', topic)
        }
      );
    } else {
      // Longer content - suggest process or conceptual diagrams
      suggestedPrompts.push(
        {
          ...PROMPT_TEMPLATES.find(t => t.id === 'process-flow')!,
          promptTemplate: PROMPT_TEMPLATES.find(t => t.id === 'process-flow')!.promptTemplate.replace('{topic}', topic)
        },
        {
          ...PROMPT_TEMPLATES.find(t => t.id === 'layered-architecture')!,
          promptTemplate: PROMPT_TEMPLATES.find(t => t.id === 'layered-architecture')!.promptTemplate.replace('{topic}', topic)
        }
      );
    }
  } else {
    suggestedPrompts.push(...topSuggestions);
  }

  // Add a custom option at the end
  suggestedPrompts.push({
    id: 'custom',
    label: 'Custom Visualization',
    description: 'Describe your own mental model',
    promptTemplate: '',
    category: 'concept',
    keywords: []
  });

  return {
    detectedCategories: Array.from(detectedCategories),
    suggestedPrompts,
    contextKeywords: [...new Set(contextKeywords)].slice(0, 10)
  };
}

/**
 * Generate variations of a base prompt
 */
export function generatePromptVariations(basePrompt: string, topic: string): string[] {
  const variations = [
    basePrompt,
    `${basePrompt}, highly detailed, 4k quality`,
    `${basePrompt}, simple and clean, minimalist style`,
    `${basePrompt}, vibrant colors, modern design`,
    `Abstract representation of ${topic}, ${basePrompt.toLowerCase()}`,
  ];

  return variations.slice(0, 3);
}

/**
 * Get quick prompt suggestions without full analysis
 */
export function getQuickSuggestions(category?: string): PromptSuggestion[] {
  if (category) {
    return PROMPT_TEMPLATES
      .filter(t => t.category === category)
      .slice(0, 4);
  }

  // Return a diverse set of quick options
  const categories = ['architecture', 'process', 'concept', 'data'];
  return categories
    .map(cat => PROMPT_TEMPLATES.find(t => t.category === cat))
    .filter(Boolean) as PromptSuggestion[];
}