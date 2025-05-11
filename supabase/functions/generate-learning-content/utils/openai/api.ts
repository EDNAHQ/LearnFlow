import OpenAI from "https://esm.sh/openai@4.28.0";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Core OpenAI API call function
export async function callOpenAI(prompt: string, systemMessage: string, responseFormat?: "json_object", maxTokens = 1500) {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key is not set');
  }

  console.log("Calling OpenAI API");
  
  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: openAIApiKey
  });
  
  // First try with gpt-4.1-mini model
  let currentModel = "gpt-4.1-mini";
  let fallbackAttempted = false;
  
  while (true) {
    try {
      console.log(`Attempting with model: ${currentModel}`);
      
      const params: any = {
        model: currentModel,
        messages: [
          { 
            role: 'system', 
            content: systemMessage
          },
          { role: 'user', content: prompt }
        ],
      };

      // Set max_tokens for models
      params.max_tokens = maxTokens;

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
        max_tokens: params.max_tokens,
        estimated_prompt_tokens: prompt.length / 4, // Rough estimate of prompt token count
      }));

      const completion = await openai.chat.completions.create(params);
      console.log("OpenAI response received");
      
      const content = completion.choices[0].message.content || "";
      
      // Check for potential truncation
      const contentLength = content.length;
      console.log(`Response length: ${contentLength} characters`);
      
      // Check if response might be truncated
      const mightBeTruncated = 
        content.endsWith("...") || 
        content.endsWith("…") ||
        content.endsWith("to be continued") ||
        content.endsWith("continued") ||
        !content.includes(".") || // Very unlikely for educational content
        (contentLength < 200 && !responseFormat); // Too short for educational content
      
      if (mightBeTruncated) {
        console.warn("Response appears to be truncated. Content ends with:", content.slice(-40));
        
        // If this is our first attempt, retry with increased token count or fallback model
        if (!fallbackAttempted) {
          console.log("Detected potential truncation, trying fallback model with higher token limit");
          currentModel = "gpt-4o-mini";
          fallbackAttempted = true;
          continue;
        }
      }
      
      // Handle JSON validation if needed
      if (responseFormat === "json_object") {
        return validateAndSanitizeJSON(completion);
      }
      
      // Return the completion if everything is fine
      return completion;
    } catch (error) {
      console.error(`Error with model ${currentModel}:`, error);
      
      // If we haven't tried the fallback model yet and this is a JSON parsing error, try the fallback
      if (!fallbackAttempted && 
          (error.message.includes("JSON") || error.message.includes("SyntaxError") || error.message.includes("truncated"))) {
        console.log("Falling back to gpt-4o-mini model due to error");
        currentModel = "gpt-4o-mini";
        fallbackAttempted = true;
        continue; // Retry with the fallback model
      }
      
      // Otherwise, propagate the error
      throw new Error(`Failed to call OpenAI API with ${currentModel}: ${error.message}`);
    }
  }
}

// Helper function to validate and sanitize JSON responses
function validateAndSanitizeJSON(completion: any) {
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
      return completion;
    } catch (jsonError) {
      console.error("JSON validation failed after sanitization:", jsonError);
      console.error("Sanitized content causing error:", sanitizedContent);
      throw jsonError;
    }
  } catch (error) {
    console.error("Error validating JSON:", error);
    throw new Error(`Failed to validate JSON: ${error.message}`);
  }
}
