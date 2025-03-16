
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Shared OpenAI API call function
export async function callOpenAI(prompt: string, systemMessage: string, responseFormat?: "json_object", maxTokens = 1000) {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key is not set');
  }

  console.log("Calling OpenAI API");
  
  const body: any = {
    model: 'gpt-4o-mini',  // Updated to use the current recommended model
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
    body.response_format = { type: responseFormat };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    return await response.json();
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
