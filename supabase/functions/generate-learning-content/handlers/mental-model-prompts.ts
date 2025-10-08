import { callOpenAI } from "../utils/openai/index.ts";

export async function generateMentalModelPromptsForPath(
  topic: string,
  stepTitles: string[],
  pathSummary: string
): Promise<string[]> {
  const prompt = `
Create 8 distinct INFORMATIVE mental model image prompts for a learning journey about "${topic}".

**Learning Path Overview:**
${pathSummary}

**All Steps in this Journey:**
${stepTitles.map((title, i) => `${i + 1}. ${title}`).join('\n')}

**CRITICAL REQUIREMENTS - These images MUST be educational and informative:**
1. Each prompt MUST include specific TEXT LABELS, KEY TERMS, and CONCEPT NAMES that will appear in the image
2. The images must TEACH something - they should include definitions, examples, or explanations visible as text
3. Specify what text should appear in the image (e.g., "with labels showing 'Step 1: Foundation', 'Step 2: Practice', etc.")
4. Include specific concepts, terminology, or frameworks from the topic that should be labeled
5. Make them diagram-heavy with annotations, arrows showing relationships, and clear text overlays
6. Each of the 8 prompts should cover a different major aspect/view of the learning path
7. ALWAYS specify: "Include clear text labels and annotations explaining each component"
8. Vary the visualization types: flowcharts, concept maps, timelines, comparison diagrams, hierarchies, process flows, mind maps, frameworks

**Good Examples:**
- "Educational infographic showing the 4 stages of ${topic} with large text labels: '1. Foundation: Understanding basics', '2. Application: Practical use', '3. Mastery: Advanced techniques', '4. Teaching: Explaining to others'. Modern design with purple/pink accents, arrows showing progression."
- "Diagram illustrating key terminology in ${topic} with text boxes defining: [list 3-4 key terms from the step titles]. Clean layout, concept map style, labeled connections."

**Bad Examples (DON'T do this):**
- "Abstract visualization of ${topic}" (too vague, no text)
- "Metaphorical illustration" (not informative enough)
- "Visual journey" (doesn't specify what text/labels to include)

**Output format:**
Return ONLY a JSON array of 8 strings, nothing else. Example:
["prompt 1 here", "prompt 2 here", ..., "prompt 8 here"]

Generate the 8 INFORMATIVE, TEXT-RICH prompts now:`;

  const systemMessage = `You are an expert at creating EDUCATIONAL visual diagrams for learning content. Your mental models are INFORMATIVE - they include specific text labels, key terms, definitions, and annotations that help learners understand concepts. You NEVER create vague abstract art. You create clear, labeled diagrams that teach. You always return valid JSON arrays of exactly 8 prompts with varied visualization styles.`;

  try {
    const data = await callOpenAI(prompt, systemMessage, undefined, 1200);
    const response = data.choices[0].message.content.trim();

    // Parse the JSON array
    const prompts = JSON.parse(response);

    // Validate we got 8 prompts
    if (!Array.isArray(prompts) || prompts.length !== 8) {
      throw new Error('Expected exactly 8 prompts');
    }

    console.log('Generated 8 path-level mental model prompts:', prompts);
    return prompts;

  } catch (error) {
    console.error('Error generating mental model prompts:', error);

    // Fallback prompts based on the topic - INFORMATIVE versions with 8 prompts
    const firstThreeSteps = stepTitles.slice(0, 3).map((title, i) => `${i + 1}. ${title}`).join(', ');
    const midSteps = stepTitles.slice(3, 6).map((title, i) => `${i + 4}. ${title}`).join(', ');

    return [
      `Educational flowchart showing the learning progression for ${topic} with text labels for each stage: ${firstThreeSteps}. Include arrows showing the flow and key concepts labeled at each step. Clean infographic style with purple and pink accents.`,
      `Concept map diagram for ${topic} with the main topic in the center and branches showing: ${stepTitles.slice(0, 4).join(', ')}. Each branch labeled with text explaining the concept. Modern educational design with clear typography.`,
      `Side-by-side comparison diagram showing 'Before Learning ${topic}' vs 'After Learning ${topic}' with bullet points of key skills gained: ${stepTitles.slice(0, 3).join(', ')}. Include text labels and annotations. Professional infographic style.`,
      `Timeline visualization of mastering ${topic} with 4 milestones clearly labeled with text: Beginner (${stepTitles[0] || 'foundations'}), Intermediate (${stepTitles[Math.floor(stepTitles.length/3)] || 'practice'}), Advanced (${stepTitles[Math.floor(stepTitles.length*2/3)] || 'mastery'}), Expert (${stepTitles[stepTitles.length-1] || 'application'}). Include descriptive text at each milestone. Modern design with gradient accents.`,
      `Hierarchical pyramid diagram for ${topic} showing skill levels from bottom to top with text labels: Foundation level (${stepTitles[0] || 'basics'}), Intermediate level (${stepTitles[Math.floor(stepTitles.length/2)] || 'practice'}), Advanced level (${stepTitles[stepTitles.length-1] || 'mastery'}). Include key concepts at each level with annotations.`,
      `Process flow diagram illustrating the ${topic} learning workflow with numbered steps and text descriptions: ${midSteps}. Include decision points, feedback loops, and clear labels. Technical diagram style with modern aesthetics.`,
      `Mind map visualization of ${topic} with central topic and 6-8 branches representing: ${stepTitles.slice(0, 6).join(', ')}. Each branch includes sub-topics and key terms as text labels. Organic layout with color-coded sections.`,
      `Framework diagram showing the ${topic} methodology with clearly labeled components and their relationships. Include text boxes explaining: ${stepTitles.slice(0, 4).join(', ')}. Professional business diagram style with icons and annotations.`
    ];
  }
}
