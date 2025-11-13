
import { callOpenAI, checkExistingContent, saveContentToSupabase, getStepContext } from "../utils/openai/index.ts";

export async function generateStepContent(
  stepId: string, 
  topic: string, 
  title: string, 
  stepNumber: number | undefined, 
  totalSteps: number | undefined,
  supabaseUrl: string,
  supabaseServiceKey: string,
  corsHeaders: Record<string, string>
) {
  if (!stepId || !topic || !title) {
    return new Response(
      JSON.stringify({ error: 'Missing required parameters' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log(`Received content generation request for: ${title} (ID: ${stepId})`);

  // Check if content already exists
  try {
    const existingContent = await checkExistingContent(stepId, supabaseUrl, supabaseServiceKey);

    if (existingContent) {
      console.log(`Content already exists for step ${stepId} (${title}), returning existing content`);
      return new Response(
        JSON.stringify({ content: existingContent }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating content for step: ${title}`);

    // Get step context including description and previous step
    const stepContext = await getStepContext(stepId, supabaseUrl, supabaseServiceKey);
    const description = stepContext.description;
    const previousStepTitle = stepContext.previousStepTitle;

    // Use provided stepNumber or default to 1
    const currentStepNumber = stepNumber ?? 1;
    const totalStepsCount = totalSteps ?? 10;

    // Determine learning phase based on step number
    const phase = currentStepNumber <= 3 ? "foundational" :
                  currentStepNumber <= 7 ? "intermediate" :
                  "advanced";

    const progressContext = {
      foundational: "This is an introductory step. Assume the learner is encountering these concepts for the first time. Focus on clear definitions, simple examples, and building confidence.",
      intermediate: "The learner now has foundational knowledge. Build on what they've learned, introduce more complexity, and show how concepts connect.",
      advanced: "The learner has strong fundamentals. Focus on sophisticated applications, edge cases, best practices, and real-world scenarios."
    };

    const depthGuidance = phase === 'foundational' ? 'Keep it simple and clear' :
                         phase === 'intermediate' ? 'Add nuance and complexity' :
                         'Go deep with advanced insights';

    const contentFocus = phase === 'foundational' ? 'Basic definitions and clear examples' :
                        phase === 'intermediate' ? 'Core concepts with practical applications' :
                        'Advanced patterns and production considerations';

    const exampleGuidance = phase === 'foundational' ? '1 very simple, relatable example' :
                           phase === 'intermediate' ? '1-2 practical examples showing real-world application' :
                           'Real-world scenarios and best practices';

    // Build the improved prompt with contextual information
    const prompt = `
Create comprehensive educational content about "${title}" as part of a learning path on "${topic}".

**Primary Focus:** "${title}"
**Context:** "${description}"
**Learning Level:** ${phase.toUpperCase()}
${previousStepTitle ? `**Note:** The previous chapter covered "${previousStepTitle}" - avoid repeating that material.` : ''}

**Your Task:**
Write 600-700 words of deep, focused educational content that thoroughly explores "${title}".

**Phase-Appropriate Approach:**
${progressContext[phase]}

**Content Quality Standards:**
1. **Laser-Focused** - Every paragraph should directly relate to "${title}", not just general information about "${topic}"
2. **Comprehensive Coverage** - Dig deep into this specific subtopic. Cover the most important aspects thoroughly
3. **Concrete Examples** - ${exampleGuidance}
4. **Clarity and Depth** - ${depthGuidance}, but always prioritize understanding over brevity
5. **Substantive Value** - Make every sentence count. No filler, no fluff

**What to Include:**
- ${contentFocus}
- Practical, relatable examples that illuminate the concepts
- Clear explanations that build genuine understanding
- The "why" behind concepts, not just the "what"

**Writing Style:**
- SHORT PARAGRAPHS (2-3 sentences maximum) for readability
- Clear, engaging, conversational educational tone
- NO meta-references like "In this section," "This chapter," or "Part ${currentStepNumber}"
- Start immediately with substantive content
- Use frequent paragraph breaks to maintain engagement
- Write as if explaining to someone genuinely curious about this specific topic

**Quality Over Everything:**
Focus entirely on making this the best possible explanation of "${title}". Don't worry about connecting to other steps - just make THIS content exceptional.
`;

    const systemMessage = `You are a master educator and expert content writer. You create deep, focused educational content that thoroughly explores specific topics. Your writing is clear, engaging, and substantive - you explain complex ideas in accessible ways while maintaining rigor. You use short paragraphs, concrete examples, and careful explanations. You avoid filler words, redundancy, and vague generalizations. You always complete your thoughts fully and deliver complete, polished content.`;

    // Increased token limit to ensure complete responses for 600-700 words
    const data = await callOpenAI(prompt, systemMessage, undefined, 2000);
    
    const generatedContent = data.choices[0].message.content;
    const contentLength = generatedContent.length;
    console.log(`Content successfully generated (${contentLength} characters)`);
    
    // Additional validation to ensure content is complete
    if (contentLength < 200) {
      console.error("Generated content is suspiciously short:", generatedContent);
      throw new Error("Generated content is too short and may be incomplete");
    }
    
    // Check for truncation patterns
    if (generatedContent.endsWith("...") || 
        generatedContent.endsWith("…") ||
        generatedContent.endsWith("to be continued")) {
      console.error("Content appears truncated:", generatedContent.slice(-50));
      throw new Error("Generated content appears to be truncated");
    }

    // Save generated content to the database and rely on realtime to update clients
    await saveContentToSupabase(stepId, generatedContent, supabaseUrl, supabaseServiceKey);

    console.log(`Successfully saved content for step ${stepId}`);

    return new Response(
      JSON.stringify({ content: generatedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in content generation:', error);
    const message = error && (error as any).message ? (error as any).message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: `Content generation failed: ${message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
