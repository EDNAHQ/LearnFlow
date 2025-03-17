
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
    const { content, title, topic } = await req.json();

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating podcast transcript for: ${title || 'Untitled'}`);
    
    // Remove markdown formatting if needed
    const cleanContent = content
      .replace(/```[^`]*```/g, '') // Remove code blocks
      .replace(/#{1,6}\s+/g, '') // Remove heading markers
      .replace(/\*\*/g, ''); // Remove bold markers

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY
    });

    // Use OpenAI to convert content to dialog format
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: 'system', 
          content: `You are an AI assistant that converts educational content into an engaging podcast script. 
Format the output EXACTLY like this:

**Podcast Script: [TITLE]**

**[Intro Music Fades Out]**

**Host 1:** Welcome back to Tech Talk, where we explore the fascinating world of technology and how it shapes our lives! I'm your host, Alex.

**Host 2:** And I'm Jamie! Today, we're going to discuss APIs—those interfaces that allow different software applications to communicate.

Use this format with "**Host 1:**" and "**Host 2:**" prefixes exactly. Make the conversation flow naturally and be engaging. Aim for about 5-10 minutes of dialog. Do NOT use markdown formatting - use the exact formatting with asterisks as shown.

IMPORTANT RESTRICTIONS:
- NEVER use the words "realm" or "delve" in your script
- Don't include meta-references like "in this episode" or "part X of our series"
- Focus purely on the educational content in a conversational style`
        },
        { 
          role: 'user', 
          content: `Please convert the following educational content about "${topic || 'this topic'}" titled "${title || 'this lesson'}" into a podcast script:\n\n${cleanContent}`
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
