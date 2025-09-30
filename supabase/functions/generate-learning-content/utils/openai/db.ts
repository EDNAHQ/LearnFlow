
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

// Save generated content to Supabase
export async function saveContentToSupabase(
  stepId: string,
  content: string,
  supabaseUrl: string,
  supabaseServiceKey: string
) {
  // Validate content before saving
  if (!content || content.length < 200) {
    console.error("Content appears to be truncated or too short:", content);
    throw new Error("Generated content is too short or incomplete");
  }
  
  // Check for common truncation patterns
  if (content.endsWith("...") || content.endsWith("…")) {
    console.error("Content appears to be truncated at the end:", content.slice(-50));
    throw new Error("Generated content appears to be truncated");
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { error } = await supabase
    .from('learning_steps')
    .update({ detailed_content: content })
    .eq('id', stepId);
    
  if (error) {
    console.error("Error saving generated content:", error);
    throw new Error(`Failed to save generated content: ${error.message}`);
  }
  
  console.log(`Successfully saved content for step ${stepId} (${content.length} characters)`);
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
