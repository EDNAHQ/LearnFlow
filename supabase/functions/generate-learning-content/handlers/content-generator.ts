
import { callOpenAI, checkExistingContent, saveContentToSupabase } from "../utils/openai.ts";

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
    
    // Modified prompt that requests shorter content (400-500 words instead of 800-1000)
    const prompt = `
    You are an expert educator creating concise, engaging educational content about "${topic}".
    
    Focus on creating clear, focused content for this topic: "${title}"
    
    Create informative educational content that efficiently explains this topic. Your content should be:
    
    1. CONCISE: Brief but thorough explanations covering the essential points
    2. ENGAGING: Use a conversational tone that draws the reader in
    3. WELL-STRUCTURED: Organize with clear sections and frequent paragraph breaks
    4. PRACTICAL: Include key examples where relevant
    
    Content structure:
    - Begin directly with the core content - no introductions identifying this as "part X" or "section Y"
    - Develop 3-4 distinct points or concepts related to the topic (not too many)
    - For each major concept:
      * Explain the core idea clearly and briefly
      * Provide a relevant example or application 
      * Connect it to the broader topic of ${topic}
    - Include practical applications or real-world relevance
    - End with a brief summary of key takeaways
    
    Formatting requirements:
    - Use SHORT PARAGRAPHS of 2-3 sentences maximum - this is critically important
    - Create frequent paragraph breaks to improve readability
    - Maintain clear transitions between paragraphs and ideas
    - Aim for ~400-500 words of focused, valuable content (HALF the typical length)
    - Write in a way that's accessible but intellectually stimulating
    
    Important language restrictions:
    - AVOID using the words "realm" and "delve" entirely
    - Do not refer to this content as "part 1", "part 2", etc.
    - Do not include introductory lines like "In this section..."
    - Focus purely on explaining the topic without meta-references
    
    Remember to stay precisely focused on "${title}" as it relates to ${topic}.
    `;

    const systemMessage = `You are an expert educator creating concise, engaging learning content with well-structured short paragraphs (2-3 sentences max) and examples. Your writing is informative yet conversational, with clear organization and practical applications. IMPORTANT: Never use the words "realm" or "delve" in your content. Keep content to about 400-500 words maximum.`;
    const data = await callOpenAI(prompt, systemMessage, undefined, 800);
    
    const generatedContent = data.choices[0].message.content;
    console.log(`Content successfully generated (${generatedContent.length} characters)`);

    // Save generated content to the database
    await saveContentToSupabase(stepId, generatedContent, supabaseUrl, supabaseServiceKey);
    
    console.log(`Successfully saved content for step ${stepId}`);

    return new Response(
      JSON.stringify({ content: generatedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in content generation:', error);
    return new Response(
      JSON.stringify({ error: `Content generation failed: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
