
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
    
    // Build the improved prompt with contextual information
    const prompt = `
Create comprehensive educational content about "${title}" as part of a learning path on "${topic}".

**Primary Focus:** "${title}"
**Context:** "${description}"
**Learning Level:** ${phase.toUpperCase()}
${previousStepTitle ? `**Note:** The previous chapter covered "${previousStepTitle}" - avoid repeating that material.` : ''}
${personalizationContext}

**Your Task:**
Write ${wordCount.min}-${wordCount.max} words of deep, focused educational content that thoroughly explores "${title}".

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
${preferences?.content_style === 'conversational' ? '- Use a friendly, conversational tone as if talking directly to the learner\n- Address them as "you" and make it personal' : preferences?.content_style === 'formal' ? '- Use a formal, academic writing style\n- Maintain professional tone throughout' : preferences?.content_style === 'technical' ? '- Focus on technical precision and terminology\n- Use precise technical language' : preferences?.content_style === 'storytelling' ? '- Use storytelling and narrative techniques\n- Create engaging narratives to explain concepts' : preferences?.content_style === 'practical' ? '- Emphasize practical, actionable advice\n- Focus on real-world application' : '- Clear, engaging, conversational educational tone'}
- NO meta-references like "In this section," "This chapter," or "Part ${currentStepNumber}"
- Start immediately with substantive content
- Use frequent paragraph breaks to maintain engagement
${userProfile ? `- Write as if explaining to ${userProfile.role || 'someone'} who is ${userProfile.experience_level || 'beginner'} level and wants to learn about this topic` : '- Write as if explaining to someone genuinely curious about this specific topic'}
${userProfile?.goals_short_term ? `- Keep in mind their goal: "${userProfile.goals_short_term}" - make content relevant to achieving this` : ''}

**Quality Over Everything:**
Focus entirely on making this the best possible explanation of "${title}". Don't worry about connecting to other steps - just make THIS content exceptional.

**CRITICAL OUTPUT REQUIREMENTS:**
- Output ONLY the educational content itself - no meta-commentary, no word counts, no notes about the content
- Do NOT include phrases like "Word Count:", "This content is...", "In summary...", or any self-referential notes
- Do NOT add headers like "### Word Count: 682" or similar metadata
- Start immediately with the actual educational content
- End with the last paragraph of content - no closing statements or meta-notes
- The output should be pure educational content that can be displayed directly to learners
`;

    const systemMessage = `You are a master educator and expert content writer. You create deep, focused educational content that thoroughly explores specific topics. Your writing is clear, engaging, and substantive - you explain complex ideas in accessible ways while maintaining rigor. You use short paragraphs, concrete examples, and careful explanations. You avoid filler words, redundancy, and vague generalizations. You always complete your thoughts fully and deliver complete, polished content.

CRITICAL: Output ONLY the educational content. Never include meta-commentary, word counts, notes about the content, or any self-referential statements. The content you generate will be displayed directly to learners - it must be pure educational material with no metadata or commentary about the content itself.
${userProfile ? `You personalize your content to match the learner's background (${userProfile.role || 'general learner'}), experience level (${userProfile.experience_level || 'beginner'}), and goals. Make it feel like you're writing specifically for them.` : ''}
${preferences ? `You adapt your writing style, length, and complexity based on the learner's preferences.` : ''}`;

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
