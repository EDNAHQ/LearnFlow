
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
      model: "o3-mini",
      messages: [
        { 
          role: 'system', 
          content: systemMessage
        },
        { role: 'user', content: prompt }
      ],
    };

    // Use max_completion_tokens instead of max_tokens for o3-mini model
    params.max_completion_tokens = maxTokens;

    // Set response_format for json_object requests
    if (responseFormat === "json_object") {
      params.response_format = { type: responseFormat };
      console.log("Using JSON response format");
      
      // Add extra JSON instructions to both system and user messages
      params.messages[0].content += "\n\nYOU MUST RESPOND WITH VALID JSON IN THE EXACT FORMAT SPECIFIED. Do not include markdown formatting, code blocks, or any text outside the JSON object. The response must be parseable by JSON.parse().";
      
      // Add JSON structure reminder to the end of the prompt
      params.messages[1].content += "\n\nIMPORTANT: Respond with ONLY a valid JSON object. No explanations, no markdown, just pure JSON.";
    }

    console.log("OpenAI request params:", JSON.stringify({
      model: params.model,
      response_format: params.response_format,
      max_completion_tokens: params.max_completion_tokens
    }));

    const completion = await openai.chat.completions.create(params);
    console.log("OpenAI response received");
    
    if (responseFormat === "json_object") {
      // Validate and sanitize JSON response
      try {
        const content = completion.choices[0].message.content;
        if (!content || content.trim() === '') {
          console.error("Empty content received from OpenAI");
          throw new Error("Empty content received from OpenAI");
        }
        
        // Try to sanitize the JSON if needed
        let sanitizedContent = content;
        
        // Fix common JSON issues
        if (!sanitizedContent.trim().startsWith('{')) {
          // Extract JSON from possible text
          const jsonMatch = sanitizedContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            sanitizedContent = jsonMatch[0];
            console.log("Extracted JSON object from response");
          }
        }
        
        // Replace any escaped quotes or problematic characters
        sanitizedContent = sanitizedContent
          .replace(/\\"/g, '"') // Replace escaped quotes
          .replace(/\\n/g, ' ') // Replace newlines with spaces
          .replace(/\t/g, ' '); // Replace tabs with spaces
        
        // Fix unterminated strings (a common issue)
        let fixAttempt = sanitizedContent;
        try {
          JSON.parse(fixAttempt);
        } catch (parseError) {
          if (parseError.message.includes('Unterminated string')) {
            console.log("Attempting to fix unterminated string...");
            // Add missing quotes to the end of strings (crude but can work in simple cases)
            fixAttempt = fixAttempt.replace(/"([^"]*?)(\s*}|\s*,\s*"|\s*])/g, '"$1"$2');
            console.log("Fixed potential unterminated strings");
          }
        }
        
        // Test if our fix worked
        try {
          JSON.parse(fixAttempt);
          sanitizedContent = fixAttempt;
          console.log("Successfully fixed JSON issues");
        } catch (e) {
          // If fix didn't work, we'll continue with our original sanitized content
          console.log("Fix attempt failed, continuing with original sanitized content");
        }
        
        // Final parsing test
        try {
          JSON.parse(sanitizedContent);
          console.log("Successfully validated JSON response");
          // Replace original content with sanitized version
          completion.choices[0].message.content = sanitizedContent;
        } catch (jsonError) {
          console.error("JSON validation failed after sanitization:", jsonError);
          console.error("Sanitized content causing error:", sanitizedContent);
          throw new Error("Invalid JSON response from OpenAI");
        }
      } catch (jsonError) {
        console.error("Invalid JSON in OpenAI response:", jsonError);
        console.error("Response content:", completion.choices[0].message.content);
        throw new Error("Invalid JSON response from OpenAI");
      }
    }
    
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
