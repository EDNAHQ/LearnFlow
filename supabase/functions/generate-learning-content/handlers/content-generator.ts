
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
    
    // Enhanced prompt that avoids specific words and removes part references
    const prompt = `
    You are an expert educator creating in-depth, engaging educational content about "${topic}".
    
    Focus on creating rich content for this topic: "${title}"
    
    Create informative educational content that thoroughly explores this topic. Your content should be:
    
    1. COMPREHENSIVE: Cover the subject thoroughly with clear explanations
    2. ENGAGING: Use a conversational tone that draws the reader in
    3. WELL-STRUCTURED: Organize with clear sections, paragraphs, and transitions
    4. PRACTICAL: Include real-world examples and applications where relevant
    
    Content structure:
    - Begin directly with the core content - no introductions identifying this as "part X" or "section Y"
    - Develop 4-6 distinct points or concepts related to the topic, each in its own paragraph(s)
    - For each major concept:
      * Explain the core idea clearly
      * Provide relevant examples or analogies 
      * Connect it to the broader topic of ${topic}
    - Include practical applications or real-world relevance
    - Address common misconceptions or challenges
    - End with a concise summary of key takeaways
    
    Formatting requirements:
    - Write in clear paragraphs with logical transitions between ideas
    - Use proper formatting and spacing between paragraphs
    - Aim for ~800-1000 words of substantial, valuable content
    - Write in a way that's accessible but intellectually stimulating
    
    Important language restrictions:
    - AVOID using the words "realm" and "delve" entirely
    - Do not refer to this content as "part 1", "part 2", etc.
    - Do not include introductory lines like "In this section..."
    - Focus purely on explaining the topic without meta-references
    
    Remember to stay precisely focused on "${title}" as it relates to ${topic}.
    `;

    const systemMessage = `You are an expert educator creating engaging, comprehensive learning content with well-structured paragraphs and examples. Your writing is informative yet conversational, with clear organization and practical applications. IMPORTANT: Never use the words "realm" or "delve" in your content.`;
    const data = await callOpenAI(prompt, systemMessage, undefined, 1500);
    
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
