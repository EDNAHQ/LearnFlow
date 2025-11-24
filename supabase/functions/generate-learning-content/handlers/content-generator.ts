
import { callOpenAI, checkExistingContent, saveContentToSupabase, getStepContext, cleanMetaCommentary } from "../utils/openai/index.ts";
import { getUserProfile, getContentPreferences, buildPersonalizationContext, getWordCountTarget } from "../utils/personalization.ts";

export async function generateStepContent(
  stepId: string, 
  topic: string, 
  title: string, 
  stepNumber: number | undefined, 
  totalSteps: number | undefined,
  supabaseUrl: string,
  supabaseServiceKey: string,
  corsHeaders: Record<string, string>,
  userId?: string,
  pathId?: string,
  regenerate?: boolean,
  stylePreferences?: { content_style?: string; content_length?: string }
) {
  if (!stepId || !topic || !title) {
    return new Response(
      JSON.stringify({ error: 'Missing required parameters' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log(`Received content generation request for: ${title} (ID: ${stepId})${regenerate ? ' (regenerating)' : ''}`);

  // Check if content already exists (skip if regenerating)
  try {
    if (!regenerate) {
      const existingContent = await checkExistingContent(stepId, supabaseUrl, supabaseServiceKey);

      if (existingContent) {
        console.log(`Content already exists for step ${stepId} (${title}), returning existing content`);
        return new Response(
          JSON.stringify({ content: existingContent }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log(`Generating content for step: ${title}`);

    // Get step context including description and previous step
    const stepContext = await getStepContext(stepId, supabaseUrl, supabaseServiceKey);
    const description = stepContext.description;
    const previousStepTitle = stepContext.previousStepTitle;

    // Fetch user profile and preferences if available
    // If stylePreferences are provided, merge them with existing preferences
    let userProfile = null;
    let preferences = null;
    if (userId && pathId) {
      try {
        userProfile = await getUserProfile(userId, supabaseUrl, supabaseServiceKey);
        const basePreferences = await getContentPreferences(pathId, supabaseUrl, supabaseServiceKey);
        // Merge style preferences if provided (for regeneration)
        preferences = stylePreferences ? { ...basePreferences, ...stylePreferences } : basePreferences;
      } catch (error) {
        console.log('Error fetching personalization data, using defaults:', error);
        // If we have stylePreferences but no base preferences, use stylePreferences
        if (stylePreferences) {
          preferences = stylePreferences;
        }
      }
    } else if (stylePreferences) {
      // Use stylePreferences even without userId/pathId
      preferences = stylePreferences;
    }

    // Use provided stepNumber or default to 1
    const currentStepNumber = stepNumber ?? 1;
    const totalStepsCount = totalSteps ?? 10;
    
    // Get word count target based on preferences
    const wordCount = getWordCountTarget(preferences);

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

    // Build personalization context
    const personalizationContext = buildPersonalizationContext(userProfile, preferences);
    
    // Simplified system message - just establish the role
    const systemMessage = `You are an expert teacher with deep knowledge of ${topic}. You explain concepts clearly, use engaging examples, and make learning enjoyable. Write naturally and conversationally, as if teaching a curious student one-on-one.

NEVER include word counts, meta-commentary, or any notes about the content itself. Output ONLY pure educational content.`;

    // Simplified prompt - just the essentials
    const prompt = `Teach me about "${title}".

${description ? `Context: ${description}` : ''}
${previousStepTitle ? `Note: We just covered "${previousStepTitle}" - build on that naturally.` : ''}
${stepNumber && totalSteps ? `This is step ${stepNumber} of ${totalSteps}.` : ''}

Write ${wordCount.min}-${wordCount.max} words of engaging, clear content. Use examples, analogies, and real-world connections. Make it interesting to read.

CRITICAL: Do NOT include word counts, word count notes, or any meta-commentary. Write ONLY the educational content itself.

${personalizationContext ? `\n${personalizationContext}` : ''}

Start writing the content now:`;

    // Increased token limit to ensure complete responses for 600-700 words
    const data = await callOpenAI(prompt, systemMessage, undefined, 2000);
    
    let generatedContent = data.choices[0].message.content;
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

    // Save generated content to the database (cleaning happens in saveContentToSupabase)
    await saveContentToSupabase(stepId, generatedContent, supabaseUrl, supabaseServiceKey);
    
    // Return cleaned content for immediate use
    const cleanedContent = cleanMetaCommentary(generatedContent);

    console.log(`Successfully saved content for step ${stepId}`);

    return new Response(
      JSON.stringify({ content: cleanedContent }),
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
