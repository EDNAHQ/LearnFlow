
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4.28.0";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Shared OpenAI API call function
export async function callOpenAI(prompt: string, systemMessage: string, responseFormat?: "json_object", maxTokens = 1000) {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key is not set');
  }

  console.log("Calling OpenAI API");
  
  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: openAIApiKey
  });
  
  try {
    const params: any = {
      model: "gpt-4o-mini",
      messages: [
        { 
          role: 'system', 
          content: systemMessage
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: maxTokens
    };

    if (responseFormat) {
      params.response_format = { type: responseFormat };
    }

    console.log("OpenAI request params:", JSON.stringify({
      model: params.model,
      response_format: params.response_format,
      max_tokens: params.max_tokens
    }));

    const completion = await openai.chat.completions.create(params);
    console.log("OpenAI response received");
    return completion;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw new Error(`Failed to call OpenAI API: ${error.message}`);
  }
}

// Helper function to check if content already exists in Supabase
export async function checkExistingContent(
  stepId: string, 
  supabaseUrl: string, 
  supabaseServiceKey: string
) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data, error } = await supabase
    .from('learning_steps')
    .select('detailed_content')
    .eq('id', stepId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching step:", error);
    throw new Error("Failed to check existing content");
  }

  return data?.detailed_content || null;
}

// Save generated content to Supabase
export async function saveContentToSupabase(
  stepId: string,
  content: string,
  supabaseUrl: string,
  supabaseServiceKey: string
) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { error } = await supabase
    .from('learning_steps')
    .update({ detailed_content: content })
    .eq('id', stepId);
    
  if (error) {
    console.error("Error saving generated content:", error);
    throw new Error(`Failed to save generated content: ${error.message}`);
  }
  
  console.log(`Successfully saved content for step ${stepId}`);
}
