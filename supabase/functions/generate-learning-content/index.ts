
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
        
        throw new Error(`Failed to parse questions: ${parseError.message}`);
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
        
        throw new Error(`Failed to parse learning plan: ${parseError.message}`);
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
        throw new Error(`Content generation failed: ${apiError.message}`);
      }
    }
  } catch (error) {
    console.error('Error in generate-learning-content function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
