
import { callOpenAI } from "../utils/openai/index.ts";
import { getUserProfile, getContentPreferences, buildPersonalizationContext } from "../utils/personalization.ts";

export async function generateLearningPlan(
  topic: string, 
  corsHeaders: Record<string, string>,
  userId?: string,
  pathId?: string,
  supabaseUrl?: string,
  supabaseServiceKey?: string
) {
  if (!topic) {
    return new Response(
      JSON.stringify({ error: 'Missing required topic parameter' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Fetch user profile and preferences if available
  let userProfile = null;
  let preferences = null;
  let personalizationContext = '';

  if (userId && pathId && supabaseUrl && supabaseServiceKey) {
    try {
      userProfile = await getUserProfile(userId, supabaseUrl, supabaseServiceKey);
      preferences = await getContentPreferences(pathId, supabaseUrl, supabaseServiceKey);
      personalizationContext = buildPersonalizationContext(userProfile, preferences);
    } catch (error) {
      console.log('Error fetching personalization data, using defaults:', error);
    }
  }

  // Build personalized prompt
  const personalizationNote = personalizationContext 
    ? `\n\n**IMPORTANT - Personalization:**\nThis learning plan is being created for a specific learner. Use the personalization context below to tailor the plan to their needs, goals, and learning style. Make the content feel like it's written specifically for them.\n${personalizationContext}`
    : '';

  // Generate a learning plan using OpenAI with a focused prompt
  const prompt = `
  You are an expert curriculum designer creating a highly focused and specialized learning plan for the topic: "${topic}".

  Create a comprehensive 10-step learning plan that guides someone from beginner to advanced level SPECIFICALLY on "${topic}".
  The plan should be laser-focused on ${topic} without including tangential or loosely related topics.
${personalizationNote}

  CRITICAL REQUIREMENTS:

  **Step Differentiation:**
  Each step must be DISTINCTLY DIFFERENT from all other steps. No two steps should cover similar ground or overlapping content.
  Think carefully about the full learning journey and ensure each step has a unique, well-defined scope.

  **For each step, provide:**
  1. **Title** (5-7 words max): A clear, specific title that captures THIS step's unique focus within ${topic}
  2. **Description** (2-3 detailed sentences, 40-60 words): A comprehensive description that:
     - Clearly defines the SPECIFIC aspect of ${topic} this step covers
     - Explains what makes this step DIFFERENT from the others
     - Describes the concrete knowledge or skills the learner will gain
     - Uses precise language to avoid ambiguity or overlap with other steps
     ${userProfile ? `- Consider the learner's background: ${userProfile.role || 'general learner'}, ${userProfile.experience_level || 'beginner'} level` : ''}
     ${userProfile?.goals_short_term ? `- Align with their goal: "${userProfile.goals_short_term}"` : ''}

  **Logical Progression:**
  Steps should build from fundamentals to advanced concepts, but each must maintain its distinct identity.
  Avoid generic descriptions - be specific about what makes each step unique.

  **Example of GOOD differentiation:**
  Step 1: "Understanding Core Concepts" - "Learn the fundamental definitions, terminology, and basic principles that form the foundation of ${topic}. This step establishes the vocabulary and conceptual framework needed for all subsequent learning."
  Step 2: "Practical Application Basics" - "Apply the core concepts through simple, hands-on exercises. This step focuses on translating theoretical knowledge into practical skills through guided practice and real-world examples."

  **Example of BAD differentiation (too similar):**
  Step 1: "Introduction to ${topic}" - "Learn about ${topic}."
  Step 2: "Understanding ${topic}" - "Understand the basics of ${topic}."

  YOUR RESPONSE MUST BE VALID JSON with this exact structure:
  {
    "steps": [
      {
        "title": "Foundations and Core Concepts",
        "description": "Master the fundamental definitions, terminology, and basic principles that form the foundation of ${topic}. This step establishes the essential vocabulary and conceptual framework needed for all subsequent learning, ensuring you have a solid base to build upon."
      },
      {
        "title": "Practical Application Methods",
        "description": "Learn how to apply core concepts through hands-on practice and real-world scenarios. This step focuses on translating theoretical knowledge into practical skills, helping you understand when and how to use different techniques in actual situations."
      }
      // ... and so on, exactly 10 steps total, each DISTINCTLY DIFFERENT
    ]
  }

  Ensure you format this as valid JSON with no trailing commas. Include exactly 10 steps with rich, detailed, differentiated descriptions.
  The response must be parseable by JSON.parse().
  `;

  console.log("Generating focused learning plan for topic:", topic);

  try {
    const systemMessage = `You are an expert curriculum designer and educational architect creating highly focused, well-differentiated learning plans.

    Your primary goal is to ensure each step in the learning path is CLEARLY DISTINCT from all others - no overlap, no repetition, no ambiguity.
    You write detailed descriptions that precisely define the scope and unique value of each step.
    You avoid generic language and instead use specific, concrete descriptions that make it crystal clear what each step covers.
    ${userProfile ? `You personalize content to match the learner's background, goals, and learning style. Make it feel like you're creating this plan specifically for them.` : ''}

    YOU MUST RETURN VALID JSON WITHOUT TRAILING COMMAS OR OTHER SYNTAX ERRORS.

    Do not include markdown formatting, code blocks, or any text outside the JSON object.
    The response must be parseable by JSON.parse().`;

    // Explicitly request JSON response format with increased token limit for detailed descriptions
    const data = await callOpenAI(prompt, systemMessage, "json_object", 1500);
    
    console.log("OpenAI response received successfully");
    
    try {
      // Parse the generated steps
      const generatedContent = data.choices[0].message.content;
      console.log("Generated content type:", typeof generatedContent);
      console.log("Generated content preview:", generatedContent.substring(0, 100) + "...");
      
      // Parse the content
      const parsedContent = JSON.parse(generatedContent);
      
      if (!parsedContent || !Array.isArray(parsedContent.steps)) {
        console.error("Invalid response format - steps is not an array:", parsedContent);
        return new Response(
          JSON.stringify({ 
            error: 'Invalid response format: steps is not an array',
            receivedContent: JSON.stringify(parsedContent).substring(0, 200) + "..."
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (parsedContent.steps.length < 5) {
        console.error("Insufficient learning plan steps:", parsedContent.steps.length);
        return new Response(
          JSON.stringify({ error: 'Insufficient learning plan generated', steps: parsedContent.steps }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log(`Successfully parsed ${parsedContent.steps.length} steps`);
      
      return new Response(
        JSON.stringify({ steps: parsedContent.steps }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error('Error parsing generated content:', parseError);
      console.error('Raw response content:', data.choices[0].message.content);
      
      return new Response(
        JSON.stringify({ 
          error: `Failed to parse learning plan: ${parseError.message}`,
          rawResponse: typeof data.choices[0].message.content === 'string' 
            ? data.choices[0].message.content.substring(0, 200) + "..."
            : JSON.stringify(data.choices[0].message.content) 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Error generating learning plan:", error);
    return new Response(
      JSON.stringify({ error: `Failed to generate learning plan: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
