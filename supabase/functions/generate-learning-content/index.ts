
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
    const { stepId, topic, title, stepNumber, totalSteps, generatePlan, generateQuestions, content, silent } = await req.json();

    // Create a Supabase client for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // If generateQuestions is true, generate related questions for the content
    if (generateQuestions) {
      if (!content || !topic) {
        return new Response(
          JSON.stringify({ error: 'Missing required content or topic parameters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Generating questions for topic: ${topic}, title: ${title}`);
      
      // Generate related questions using OpenAI
      const prompt = `
      You are an expert educator helping students explore a topic in more depth.
      
      Below is content about "${topic}" with the title "${title}".
      
      CONTENT:
      ${content.substring(0, 4000)}
      
      Based on this specific content, generate exactly 5 thought-provoking questions that would help a learner explore this topic more deeply.
      
      Requirements for the questions:
      1. Each question should address an important concept or idea from THIS SPECIFIC content
      2. Questions should encourage critical thinking, not just recall facts
      3. Questions should be concise but specific (15-30 words each)
      4. Each question should explore a different aspect of the content
      5. Make sure questions end with a question mark
      6. Questions must be DIRECTLY related to the content provided, not generic questions about the topic
      
      Your response should be structured as an array of question strings formatted as valid JSON.
      Example format:
      {
        "questions": [
          "How does concept X relate to concept Y in the context of ${topic}?",
          "What would happen if we applied principle Z to a different scenario?",
          "Why is the relationship between A and B important for understanding ${topic}?"
        ]
      }
      `;

      console.log(`Calling OpenAI API to generate related questions for: ${title}`);
      
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
              { 
                role: 'system', 
                content: `You are an expert educator creating thoughtful questions to explore topics in depth based on specific content.` 
              },
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

        console.log(`OpenAI response received successfully for questions about: ${title}`);
        
        try {
          // Parse the generated questions
          const generatedContent = data.choices[0].message.content;
          console.log(`Generated questions content length: ${generatedContent.length}`);
          
          const parsedContent = JSON.parse(generatedContent);
          
          if (!Array.isArray(parsedContent.questions)) {
            console.error("Invalid response format - questions is not an array:", parsedContent);
            throw new Error('Invalid response format: questions is not an array');
          }
          
          console.log(`Successfully parsed ${parsedContent.questions.length} questions for: ${title}`);
          
          return new Response(
            JSON.stringify({ questions: parsedContent.questions }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (parseError) {
          console.error('Error parsing generated questions:', parseError, data.choices[0].message.content);
          
          // Attempt to fix malformed JSON
          try {
            const content = data.choices[0].message.content;
            // Try to extract JSON part if it's wrapped in markdown or other text
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const extractedJson = jsonMatch[0];
              const parsedJson = JSON.parse(extractedJson);
              
              if (Array.isArray(parsedJson.questions) && parsedJson.questions.length > 0) {
                console.log(`Successfully recovered JSON from malformed response for: ${title}`);
                return new Response(
                  JSON.stringify({ questions: parsedJson.questions }),
                  { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
              }
            }
          } catch (recoveryError) {
            console.error("Recovery attempt failed:", recoveryError);
          }
          
          // Return fallback questions
          return new Response(
            JSON.stringify({ 
              questions: [
                `What are the key concepts covered in "${title}"?`,
                `How might you apply the knowledge from "${title}" in a real-world scenario?`,
                `What challenges might you encounter when implementing concepts from "${title}"?`,
                `How does "${title}" relate to other aspects of ${topic}?`,
                `What questions do you still have about "${title}" after studying this content?`
              ] 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (error) {
        console.error(`Error generating questions for ${title}:`, error);
        
        // Return fallback questions on error
        return new Response(
          JSON.stringify({ 
            questions: [
              `What are the key concepts covered in "${title}"?`,
              `How might you apply the knowledge from "${title}" in a real-world scenario?`,
              `What challenges might you encounter when implementing concepts from "${title}"?`,
              `How does "${title}" relate to other aspects of ${topic}?`,
              `What questions do you still have about "${title}" after studying this content?`
            ] 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // If generatePlan is true, we'll generate a learning plan
    if (generatePlan) {
      if (!topic) {
        return new Response(
          JSON.stringify({ error: 'Missing required topic parameter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate a learning plan using OpenAI with a focused prompt
      const prompt = `
      You are an expert educator creating a highly focused and specialized learning plan for the topic: "${topic}".
      
      Please create a comprehensive 10-step learning plan that will guide someone from beginner to advanced level SPECIFICALLY on the topic of ${topic}. 
      The plan should be laser-focused on ${topic} without including tangential or loosely related topics.
      
      For each step, provide:
      1. A clear, concise title (5-7 words max) that directly relates to ${topic}
      2. A brief one-sentence description of what the learner will understand about ${topic} after completing this step
      
      Each step should build logically on the previous one, creating a coherent progression from fundamentals to advanced concepts, 
      all while staying strictly within the boundaries of ${topic}.
      
      Your response should be structured as an array of step objects with 'title' and 'description' fields, formatted as valid JSON.
      
      Example format:
      {
        "steps": [
          {
            "title": "Introduction to [Specific Aspect of ${topic}]",
            "description": "Understand the core principles of ${topic} and essential terminology."
          },
          {
            "title": "Second Step Title About ${topic}",
            "description": "Brief description focusing specifically on ${topic}"
          }
        ]
      }
      
      Make sure to include exactly 10 steps, starting with fundamentals and moving to more advanced concepts,
      all directly related to ${topic}.
      `;

      console.log("Calling OpenAI API to generate focused learning plan for topic:", topic);
      
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
              { 
                role: 'system', 
                content: `You are an expert educator creating highly focused learning plans. Your plans should always be extremely specific to the requested topic without introducing unrelated concepts.` 
              },
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

        console.log("OpenAI response received successfully");
        
        try {
          // Parse the generated steps
          const generatedContent = data.choices[0].message.content;
          console.log("Generated content:", generatedContent);
          
          const parsedContent = JSON.parse(generatedContent);
          
          if (!Array.isArray(parsedContent.steps)) {
            console.error("Invalid response format - steps is not an array:", parsedContent);
            throw new Error('Invalid response format: steps is not an array');
          }
          
          if (parsedContent.steps.length < 5) {
            console.error("Insufficient learning plan steps:", parsedContent.steps.length);
            throw new Error('Insufficient learning plan generated');
          }
          
          console.log(`Successfully parsed ${parsedContent.steps.length} steps`);
          
          return new Response(
            JSON.stringify({ steps: parsedContent.steps }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (parseError) {
          console.error('Error parsing generated content:', parseError, data.choices[0].message.content);
          
          // Attempt to fix malformed JSON
          try {
            const content = data.choices[0].message.content;
            // Try to extract JSON part if it's wrapped in markdown or other text
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const extractedJson = jsonMatch[0];
              const parsedJson = JSON.parse(extractedJson);
              
              if (Array.isArray(parsedJson.steps) && parsedJson.steps.length >= 5) {
                console.log("Successfully recovered JSON from malformed response");
                return new Response(
                  JSON.stringify({ steps: parsedJson.steps }),
                  { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
              }
            }
          } catch (recoveryError) {
            console.error("Recovery attempt failed:", recoveryError);
          }
          
          // If all recovery attempts fail, return fallback learning plan
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
        console.error("Error in plan generation:", error);
        
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
          JSON.stringify({ error: 'Missing required parameters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Received content generation request for: ${title} (ID: ${stepId})`);

      // Check if content already exists
      try {
        const { data: existingData, error: fetchError } = await supabase
          .from('learning_steps')
          .select('detailed_content')
          .eq('id', stepId)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error("Error fetching step:", fetchError);
          throw new Error("Failed to check existing content");
        }

        if (existingData?.detailed_content) {
          console.log(`Content already exists for step ${stepId} (${title}), returning existing content`);
          return new Response(
            JSON.stringify({ content: existingData.detailed_content }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Generating content for step: ${title} (${stepNumber || '?'}/${totalSteps || '?'})`);
        
        // Generate content with OpenAI with improved focus
        const prompt = `
        You are an expert educator creating highly specialized learning content about "${topic}". 
        
        This is part of a learning path about ${topic}.
        
        The title of this section is: "${title}"
        
        Please generate detailed, educational content for this specific section. The content should be:
        - Laser-focused on the exact aspect of ${topic} indicated in the title
        - Relevant only to ${topic} without tangential discussions
        - Educational and well-structured
        
        Include:
        
        1. A clear introduction to this specific aspect of ${topic}
        2. Key concepts and principles that are directly relevant to "${title}" within the context of ${topic}
        3. Practical examples or applications that demonstrate this specific aspect of ${topic}
        4. Common misconceptions or challenges related specifically to this aspect of ${topic}
        5. Summary of key takeaways that relate strictly to this aspect of ${topic}
        
        Make it educational, engaging, and around 500-700 words. Format with paragraphs for readability.
        
        Remember to stay strictly on topic and focused on ${topic} as it relates to "${title}" - avoid introducing tangential concepts or going off on unrelated tangents.
        `;

        try {
          console.log("Calling OpenAI API to generate content");
          
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAIApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'o3-mini',
              messages: [
                { 
                  role: 'system', 
                  content: `You are an expert educator creating highly focused learning content. Your content should always be extremely specific to the requested topic and title without introducing unrelated concepts.` 
                },
                { role: 'user', content: prompt }
              ],
              temperature: 0.7,
              max_tokens: 2000
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenAI API error:', errorData);
            throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
          }

          const data = await response.json();
          const generatedContent = data.choices[0].message.content;
          console.log(`Content successfully generated (${generatedContent.length} characters)`);

          // Check if content is valid
          if (!generatedContent || generatedContent.length < 200) {
            console.error("Generated content too short or invalid:", generatedContent);
            throw new Error("Generated content too short or invalid");
          }

          // Save generated content to the database
          const { error: updateError } = await supabase
            .from('learning_steps')
            .update({ detailed_content: generatedContent })
            .eq('id', stepId);
            
          if (updateError) {
            console.error("Error saving generated content:", updateError);
            throw new Error(`Failed to save generated content: ${updateError.message}`);
          }
          
          console.log(`Successfully saved content for step ${stepId}`);

          return new Response(
            JSON.stringify({ content: generatedContent }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (apiError) {
          console.error('Error in content generation:', apiError);
          
          // Create fallback content
          const fallbackContent = `# ${title}

## Introduction to ${title}

This section covers important aspects of ${title} within the broader context of ${topic}. As we explore this topic, we'll look at key concepts, practical applications, and common challenges.

## Key Concepts

Understanding ${title} requires familiarizing yourself with several core principles:

- The fundamental elements that make up ${title}
- How these elements interact within the ${topic} ecosystem
- Why ${title} is important for mastering ${topic}

## Practical Applications

${title} has several real-world applications, including:

1. Solving common problems in ${topic}
2. Improving efficiency in related processes
3. Enabling new capabilities within the field

## Common Challenges

When working with ${title}, you might encounter these challenges:

- Misconceptions about how it works
- Integration issues with other aspects of ${topic}
- Performance considerations in different contexts

## Summary

${title} is a critical component of ${topic}. By understanding its core principles, applications, and potential challenges, you'll be better equipped to apply this knowledge effectively.

*Note: This is temporary content. We're experiencing technical difficulties generating the full detailed content for this step. Please try refreshing the page or check back later.*`;

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
      } catch (error) {
        console.error('Error in content generation process:', error);
        
        // Return generic fallback content on error
        const emergencyFallbackContent = `# ${title || "Learning Content"}

We're currently experiencing technical difficulties with our content generation system.

**What you should know about this topic:**

- This section would normally cover aspects of ${title || topic}
- The content relates to ${topic}

Please try refreshing the page or check back later. Our team is working to resolve this issue.`;

        return new Response(
          JSON.stringify({ content: emergencyFallbackContent }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
  } catch (error) {
    console.error('Error in generate-learning-content function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        fallbackContent: `# Technical Difficulties\n\nWe're experiencing some issues with our content generation system. Please try refreshing the page or check back later.` 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
