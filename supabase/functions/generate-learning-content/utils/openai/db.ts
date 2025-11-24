
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

// Clean meta-commentary from generated content
export function cleanMetaCommentary(content: string): string {
  if (!content) return content;
  
  let cleaned = content;
  
  // Remove word count patterns - catch ALL variations including parentheses
  // Patterns: "Word Count: 682", "(Word count: 378)", "### Word Count: 682", etc.
  cleaned = cleaned.replace(/\(?\s*Word\s+Count\s*:\s*\d+\s*\)?/gi, '');
  cleaned = cleaned.replace(/\(?\s*word\s+count\s*:\s*\d+\s*\)?/gi, '');
  cleaned = cleaned.replace(/\(?\s*WORD\s+COUNT\s*:\s*\d+\s*\)?/gi, '');
  cleaned = cleaned.replace(/^#{1,6}\s*Word\s+Count\s*:\s*\d+.*$/gmi, '');
  cleaned = cleaned.replace(/^Word\s+Count\s*:\s*\d+.*$/gmi, '');
  cleaned = cleaned.replace(/###\s*Word\s+Count.*$/gmi, '');
  
  // Remove meta-commentary patterns
  cleaned = cleaned.replace(/^This\s+content\s+is.*$/gmi, '');
  cleaned = cleaned.replace(/^In\s+summary.*$/gmi, '');
  cleaned = cleaned.replace(/^Note\s*:\s*This\s+content.*$/gmi, '');
  
  // Remove lines that are purely meta-commentary
  const metaPatterns = [
    /^This\s+section\s+contains.*$/gmi,
    /^The\s+above\s+content.*$/gmi,
    /^Content\s+generated\s+for.*$/gmi,
    /^Word\s+count\s+target.*$/gmi,
  ];
  
  metaPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  
  // Clean up multiple consecutive newlines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  // Trim whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
}

// Save generated content to Supabase
export async function saveContentToSupabase(
  stepId: string,
  content: string,
  supabaseUrl: string,
  supabaseServiceKey: string
) {
  // Clean meta-commentary before saving
  const cleanedContent = cleanMetaCommentary(content);
  
  // Validate content before saving
  if (!cleanedContent || cleanedContent.length < 200) {
    console.error("Content appears to be truncated or too short:", cleanedContent);
    throw new Error("Generated content is too short or incomplete");
  }
  
  // Check for common truncation patterns
  if (cleanedContent.endsWith("...") || cleanedContent.endsWith("…")) {
    console.error("Content appears to be truncated at the end:", cleanedContent.slice(-50));
    throw new Error("Generated content appears to be truncated");
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { error } = await supabase
    .from('learning_steps')
    .update({ detailed_content: cleanedContent })
    .eq('id', stepId);
    
  if (error) {
    console.error("Error saving generated content:", error);
    throw new Error(`Failed to save generated content: ${error.message}`);
  }
  
  console.log(`Successfully saved content for step ${stepId} (${cleanedContent.length} characters)`);
}

// Get step context including description and previous step title
export async function getStepContext(
  stepId: string,
  supabaseUrl: string,
  supabaseServiceKey: string
) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get current step details
  const { data: currentStep, error } = await supabase
    .from('learning_steps')
    .select('path_id, order_index, content')
    .eq('id', stepId)
    .single();

  if (error) {
    console.error("Error fetching step context:", error);
    throw new Error("Failed to fetch step context");
  }

  // Get previous step title if it exists
  let previousStepTitle = null;
  if (currentStep.order_index > 0) {
    const { data: prevStep } = await supabase
      .from('learning_steps')
      .select('title')
      .eq('path_id', currentStep.path_id)
      .eq('order_index', currentStep.order_index - 1)
      .single();

    previousStepTitle = prevStep?.title || null;
  }

  return {
    description: currentStep.content || "",
    previousStepTitle
  };
}
