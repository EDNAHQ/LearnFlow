
import { callOpenAI, checkExistingContent, saveContentToSupabase } from "../utils/openai/index.ts";

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
    
    // Streamlined, cleaner prompt to prevent truncation
    const prompt = `
    Create focused educational content about "${title}" related to ${topic}.

    Write 400-500 words covering these key areas:
    - Core concepts and principles
    - 1-2 practical examples or applications
    - Connections to the broader topic
    - Brief takeaway points

    Style requirements:
    - SHORT PARAGRAPHS (2-3 sentences maximum)
    - Clear, engaging educational tone
    - Frequent paragraph breaks for readability
    - No meta-references (don't call this "Part X" or refer to other sections)
    - Direct approach that starts with substantive content
    - Avoid redundant language patterns
    
    Keep the content concise but complete, making every word count.
    `;

    const systemMessage = `You are a concise educational content writer specializing in clear, focused explanations. Your writing features short paragraphs, practical examples, and readable formatting. Avoid filler words, redundancy, and overly complex terminology. Always complete your thoughts fully without getting cut off.`;
    
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
