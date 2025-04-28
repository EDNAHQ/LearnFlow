
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import OpenAI from "https://esm.sh/openai@4.28.0";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

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
    const { content, title, topic, isFullProjectSummary } = await req.json();

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating ${isFullProjectSummary ? 'project summary' : 'podcast transcript'} for: ${title || 'Untitled'}`);
    
    // Process content differently based on whether it's a full project summary
    let processedContent;
    let systemPrompt;
    
    if (isFullProjectSummary) {
      try {
        // Parse the content as JSON if it's a full project summary
        const parsedSteps = JSON.parse(content);
        // Extract content from steps for project summary
        processedContent = parsedSteps.map((step: any) => 
          `${step.title}:\n${step.content}`
        ).join('\n\n');
        
        console.log(`Parsed ${parsedSteps.length} steps for project summary`);
        
        systemPrompt = `You are an AI assistant that creates comprehensive audio summaries of educational content.
Format the output as a conversational monologue that covers the key points from the entire learning project.

Important:
- Keep it conversational and educational
- Focus on the most important concepts from the entire project
- Organize the information logically
- Aim for about 5-10 minutes of spoken content
- Don't use any special formatting or markdown
- Make it flow naturally for audio listening`;

      } catch (parseError) {
        console.error('Error parsing project steps:', parseError);
        processedContent = content.toString();
      }
    } else {
      // Format as podcast script for Play.ai
      // Remove markdown formatting for regular podcast transcript
      processedContent = content
        .replace(/```[^`]*```/g, '') // Remove code blocks
        .replace(/#{1,6}\s+/g, '') // Remove heading markers
        .replace(/\*\*/g, ''); // Remove bold markers
        
      systemPrompt = `You are an AI assistant that converts educational content into a simple podcast script.
Format the output EXACTLY like this example and NOTHING ELSE:

Host 1: Hello and welcome to our podcast!
Host 2: Today we're talking about...
Host 1: That sounds interesting!
Host 2: Let's get started!

Important:
- Use ONLY "Host 1:" and "Host 2:" prefixes exactly as shown
- Don't add any introduction, title, or additional formatting
- No spaces between paragraphs
- Don't use markdown or any special formatting
- Keep it conversational and educational
- Aim for about 5-10 minutes of dialog`;
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY
    });

    // Use OpenAI to convert content to desired format
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: 'system', 
          content: systemPrompt
        },
        { 
          role: 'user', 
          content: `Please convert the following educational content about "${topic || 'this topic'}" titled "${title || 'this lesson'}" into ${isFullProjectSummary ? 'a comprehensive audio summary' : 'a podcast script'}:\n\n${processedContent}`
        }
      ],
      temperature: 0.7,
    });

    const transcript = completion.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        success: true,
        transcript,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in generate-podcast-transcript function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
