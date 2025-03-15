
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { stepId, topic, title, stepNumber, totalSteps, generatePlan, silent } = await req.json();
    
    // Create a Supabase client for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // If generatePlan is true, we'll generate a learning plan
    if (generatePlan) {
      if (!topic) {
        return new Response(
          JSON.stringify({ error: 'Missing required topic parameter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log("Generating learning plan for topic:", topic);
      
      const prompt = `
      You are an expert educator creating a learning plan for the topic: "${topic}".
      
      Create a comprehensive 10-step learning plan that guides someone from beginner to advanced level on this topic.
      
      For each step, provide:
      1. A clear title (5-7 words)
      2. A brief description (1-2 sentences)
      
      Each step should build logically on the previous one, creating a progression from fundamentals to advanced concepts.
      
      Format as valid JSON like:
      {
        "steps": [
          {
            "title": "Introduction to ${topic}",
            "description": "Brief description focusing on ${topic}"
          },
          {
            "title": "Second Step Title",
            "description": "Brief description"
          }
        ]
      }
      
      Include exactly 10 steps.
      `;

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'o3-mini',
            messages: [
              { role: 'system', content: 'You are an expert educator creating focused learning plans.' },
              { role: 'user', content: prompt }
            ],
            response_format: { type: "json_object" }
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          console.error('OpenAI API error:', data);
          throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
        }

        console.log("Generated learning plan successfully");
        
        try {
          const generatedContent = data.choices[0].message.content;
          const parsedContent = JSON.parse(generatedContent);
          
          if (!Array.isArray(parsedContent.steps)) {
            throw new Error('Invalid response format: steps is not an array');
          }
          
          return new Response(
            JSON.stringify({ steps: parsedContent.steps }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (parseError) {
          console.error('Error parsing plan:', parseError);
          
          // Return fallback learning plan on error
          const fallbackSteps = [
            {
              title: `Introduction to ${topic}`,
              description: `Learn the fundamental concepts and terminology related to ${topic}.`
            },
            {
              title: `Basic Principles of ${topic}`,
              description: `Understand the core principles that form the foundation of ${topic}.`
            },
            {
              title: `Key Components of ${topic}`,
              description: `Explore the essential components that make up ${topic} systems or frameworks.`
            },
            {
              title: `Common Applications of ${topic}`,
              description: `Discover the most widespread applications and use cases for ${topic}.`
            },
            {
              title: `Advanced ${topic} Concepts`,
              description: `Delve into more sophisticated aspects and techniques within ${topic}.`
            },
            {
              title: `${topic} in Practice`,
              description: `Apply your knowledge of ${topic} to solve practical problems.`
            },
            {
              title: `Troubleshooting ${topic} Issues`,
              description: `Learn to identify and resolve common problems related to ${topic}.`
            },
            {
              title: `${topic} Best Practices`,
              description: `Discover industry-standard approaches and methodologies for working with ${topic}.`
            },
            {
              title: `Future Trends in ${topic}`,
              description: `Explore emerging developments and future directions in the field of ${topic}.`
            },
            {
              title: `Mastering ${topic}`,
              description: `Consolidate your knowledge and achieve expertise in all aspects of ${topic}.`
            }
          ];
          
          return new Response(
            JSON.stringify({ steps: fallbackSteps }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (error) {
        console.error("Error generating plan:", error);
        
        // Return fallback learning plan on error
        const fallbackSteps = [
          {
            title: `Introduction to ${topic}`,
            description: `Learn the fundamental concepts and terminology related to ${topic}.`
          },
          {
            title: `Basic Principles of ${topic}`,
            description: `Understand the core principles that form the foundation of ${topic}.`
          },
          {
            title: `Key Components of ${topic}`,
            description: `Explore the essential components that make up ${topic} systems or frameworks.`
          },
          {
            title: `Common Applications of ${topic}`,
            description: `Discover the most widespread applications and use cases for ${topic}.`
          },
          {
            title: `Advanced ${topic} Concepts`,
            description: `Delve into more sophisticated aspects and techniques within ${topic}.`
          },
          {
            title: `${topic} in Practice`,
            description: `Apply your knowledge of ${topic} to solve practical problems.`
          },
          {
            title: `Troubleshooting ${topic} Issues`,
            description: `Learn to identify and resolve common problems related to ${topic}.`
          },
          {
            title: `${topic} Best Practices`,
            description: `Discover industry-standard approaches and methodologies for working with ${topic}.`
          },
          {
            title: `Future Trends in ${topic}`,
            description: `Explore emerging developments and future directions in the field of ${topic}.`
          },
          {
            title: `Mastering ${topic}`,
            description: `Consolidate your knowledge and achieve expertise in all aspects of ${topic}.`
          }
        ];
        
        return new Response(
          JSON.stringify({ steps: fallbackSteps }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // Detailed content generation
      if (!stepId || !topic || !title) {
        return new Response(
          JSON.stringify({ error: 'Missing required parameters for content generation' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Generating content for step: ${stepId}, topic: ${topic}, title: ${title}`);

      // Check if content already exists
      try {
        const { data: existingData, error: fetchError } = await supabase
          .from('learning_steps')
          .select('detailed_content')
          .eq('id', stepId)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error("Error fetching step:", fetchError);
        } else if (existingData?.detailed_content) {
          console.log(`Content already exists for step ${stepId}`);
          return new Response(
            JSON.stringify({ content: existingData.detailed_content }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Generate content with OpenAI
        const prompt = `
        You are an expert educator creating comprehensive learning content about "${topic}". 
        
        The title of this learning step (step ${stepNumber} of ${totalSteps}) is: "${title}"
        
        Create detailed, high-quality educational content for this section. Your content should be:
        - Deeply informative about ${topic}
        - Educational with concrete examples
        - Well-structured with clear headings
        - 800-1200 words in length
        - Professional but engaging tone
        
        Include:
        
        1. A brief introduction explaining what this specific aspect of ${topic} is about
        2. Detailed explanations of the key concepts with real examples
        3. How this fits into the broader ${topic} landscape
        4. Common challenges and solutions related to "${title}"
        5. Practical applications or implementations where relevant
        6. Best practices and tips for mastery
        7. A concise summary of the key takeaways
        
        Use markdown formatting:
        - # for main title (use the step title)
        - ## for major section headings
        - ### for subsections
        - Lists with bullets (-)
        - Code blocks with \`\`\` if relevant
        
        Make your content original, accurate, and valuable for someone wanting to master ${topic}.
        DO NOT be repetitive or use placeholder text. Provide actual valuable content and examples.
        `;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'o3-mini',
            messages: [
              { role: 'system', content: 'You are an expert educator who creates comprehensive, accurate, and detailed learning content.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 3000
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('OpenAI API error:', errorData);
          throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        const generatedContent = data.choices[0].message.content;
        console.log(`Content generated successfully (${generatedContent.length} chars)`);

        // Save generated content to the database
        const { error: updateError } = await supabase
          .from('learning_steps')
          .update({ detailed_content: generatedContent })
          .eq('id', stepId);
          
        if (updateError) {
          console.error("Error saving content:", updateError);
          throw new Error("Failed to save generated content");
        }
        
        console.log(`Content saved for step ${stepId}`);
        
        return new Response(
          JSON.stringify({ content: generatedContent }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Error in content generation:', error);
        
        // Create fallback content
        const fallbackContent = `# ${title}

## Introduction to ${title}

This section covers important concepts related to ${title} within the broader field of ${topic}. We're working on generating more detailed content for this section.

## Key Concepts

Understanding ${title} requires familiarizing yourself with several core principles and techniques.

## Practical Applications

${title} has numerous real-world applications that demonstrate its importance in ${topic}.

## Summary

${title} is a critical component of ${topic}. By understanding its principles and applications, you'll develop a stronger foundation in this field.`;

        // Save fallback content to the database
        const { error: updateError } = await supabase
          .from('learning_steps')
          .update({ detailed_content: fallbackContent })
          .eq('id', stepId);
          
        if (updateError) {
          console.error("Error saving fallback content:", updateError);
        } else {
          console.log(`Saved fallback content for step ${stepId}`);
        }

        return new Response(
          JSON.stringify({ content: fallbackContent }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
  } catch (error) {
    console.error('Error in generate-learning-content function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        content: "# Content Generation Error\n\nWe're experiencing technical difficulties with our content generation system. Please try refreshing the page."
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
