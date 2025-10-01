import { callOpenAI } from "../utils/openai/index.ts";

export async function generateMentalModelPromptsForPath(
  topic: string,
  stepTitles: string[],
  pathSummary: string
): Promise<string[]> {
  const prompt = `
Create 4 distinct visual mental model prompts for an entire learning journey about "${topic}".

**Learning Path Overview:**
${pathSummary}

**All Steps in this Journey:**
${stepTitles.map((title, i) => `${i + 1}. ${title}`).join('\n')}

**Requirements for each prompt:**
1. Each prompt should represent a MAJOR THEME or KEY CONCEPT from the entire learning journey
2. Think holistically - these images will represent the WHOLE path, not individual steps
3. Make them highly visual and descriptive for AI image generation
4. Each should be different - cover 4 distinct overarching concepts
5. Keep prompts concise but descriptive (2-3 sentences max)
6. Include style guidance: "educational diagram style, clear visual metaphor, minimalist design, purple and pink gradient accents"

**Output format:**
Return ONLY a JSON array of 4 strings, nothing else. Example:
["prompt 1 here", "prompt 2 here", "prompt 3 here", "prompt 4 here"]

Generate the 4 prompts now:`;

  const systemMessage = `You are an expert at creating visual mental models for educational content. You understand how to translate abstract learning journeys into concrete visual metaphors that aid learning. You always return valid JSON arrays of exactly 4 prompts that capture the essence of an entire learning path.`;

  try {
    const data = await callOpenAI(prompt, systemMessage, undefined, 800);
    const response = data.choices[0].message.content.trim();

    // Parse the JSON array
    const prompts = JSON.parse(response);

    // Validate we got 4 prompts
    if (!Array.isArray(prompts) || prompts.length !== 4) {
      throw new Error('Expected exactly 4 prompts');
    }

    console.log('Generated 4 path-level mental model prompts:', prompts);
    return prompts;

  } catch (error) {
    console.error('Error generating mental model prompts:', error);

    // Fallback prompts based on the topic
    return [
      `Visual diagram showing the complete learning journey of ${topic}, educational style, minimalist design, purple and pink gradient accents`,
      `Metaphorical illustration representing the progression from beginner to advanced in ${topic}, clear visual metaphor, modern aesthetic`,
      `Conceptual diagram breaking down the key stages and milestones in mastering ${topic}, infographic style, clean composition`,
      `Abstract visualization showing how all concepts in ${topic} connect and build upon each other, geometric shapes, professional design`
    ];
  }
}
