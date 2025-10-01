
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

    const learningJourneyContext = currentStepNumber === 1 ? 'just started' :
                                   currentStepNumber < 5 ? 'covered the basics' :
                                   'built strong foundations';

    const depthGuidance = phase === 'foundational' ? 'Keep it simple and clear' :
                         phase === 'intermediate' ? 'Add nuance and complexity' :
                         'Go deep with advanced insights';

    const contentFocus = phase === 'foundational' ? 'Basic definitions and clear examples' :
                        phase === 'intermediate' ? 'How this builds on earlier concepts' :
                        'Advanced patterns and production considerations';

    const exampleGuidance = phase === 'foundational' ? '1 very simple, relatable example' :
                           phase === 'intermediate' ? '1-2 practical examples showing progression' :
                           'Real-world scenarios and best practices';

    const forwardConnection = currentStepNumber < totalStepsCount ?
                             'Why this step matters for what comes next' :
                             'How to apply everything learned';

    // Build the improved prompt with contextual information
    const prompt = `
Create educational content for Step ${currentStepNumber} of ${totalStepsCount} in a learning path about "${topic}".

**This Step's Focus:** "${title}"
**Step Description:** "${description}"
**Learning Phase:** ${phase.toUpperCase()} (Step ${currentStepNumber}/${totalStepsCount})
${previousStepTitle ? `**Previous Step:** "${previousStepTitle}" (avoid repeating this content)` : ''}

**Context for This Phase:**
${progressContext[phase]}

**Content Requirements:**
Write 400-500 words that:
1. **Builds on the learning journey** - Reference that learners have ${learningJourneyContext}
2. **Addresses THIS step's unique focus** - Make sure the content is specifically about "${title}", not just general "${topic}" information
3. **Provides step-appropriate depth** - ${depthGuidance}
4. **Connects forward** - ${forwardConnection}

**Include:**
- ${contentFocus}
- ${exampleGuidance}
- ${forwardConnection}

**Style:**
- SHORT PARAGRAPHS (2-3 sentences maximum)
- Clear, engaging educational tone
- NO meta-references like "In this section" or "Part ${currentStepNumber}"
- Start directly with substantive content
- Avoid repeating phrases from earlier steps
- Frequent paragraph breaks for readability

Keep the content concise but complete, making every word count.
`;

    const systemMessage = `You are an expert educational content writer who creates progressive learning experiences. You understand how to build knowledge step-by-step, with each piece of content building naturally on what came before. Your writing features short paragraphs, practical examples, and readable formatting. You avoid filler words, redundancy, and overly complex terminology. You always complete your thoughts fully without getting cut off.`;
    
    // Increased token limit to ensure complete responses
    const data = await callOpenAI(prompt, systemMessage, undefined, 1500);
    
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
