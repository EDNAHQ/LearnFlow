
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./utils/cors.ts";
import { generateLearningPlan } from "./handlers/plan-generator.ts";
import { generateQuestions } from "./handlers/questions-generator.ts";
import { generateStepContent } from "./handlers/content-generator.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { 
      stepId, 
      topic, 
      title, 
      stepNumber, 
      totalSteps, 
      generatePlan, 
      generateQuestions: shouldGenerateQuestions, 
      content, 
      silent 
    } = await req.json();

    // If generateQuestions is true, generate related questions for the content
    if (shouldGenerateQuestions) {
      return await generateQuestions(content, topic, title, corsHeaders);
    }
    
    // If generatePlan is true, we'll generate a learning plan
    if (generatePlan) {
      return await generateLearningPlan(topic, corsHeaders);
    } else {
      // Detailed content generation
      return await generateStepContent(
        stepId, 
        topic, 
        title, 
        stepNumber, 
        totalSteps, 
        supabaseUrl, 
        supabaseServiceKey, 
        corsHeaders
      );
    }
  } catch (error) {
    console.error('Error in generate-learning-content function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
