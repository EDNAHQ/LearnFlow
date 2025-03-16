
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4.28.0";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
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
    const { paragraphs, topic } = await req.json();
    
    if (!paragraphs || !Array.isArray(paragraphs) || paragraphs.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid paragraphs parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!topic) {
      return new Response(
        JSON.stringify({ error: 'Missing required topic parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Select at most 3 paragraphs
    const selectedParagraphs = paragraphs.slice(0, 3);
    const marginNotes = [];

    console.log(`Generating margin notes for ${selectedParagraphs.length} paragraphs on topic: ${topic}`);
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: openAIApiKey
    });
    
    // Generate a margin note for each paragraph
    for (const [index, paragraph] of selectedParagraphs.entries()) {
      const prompt = `
        You are creating small insight bubbles to enhance learning content about "${topic}".
        
        Below is a paragraph from a learning resource:
        """
        ${paragraph}
        """
        
        Create a very concise insight (30-40 words max) that provides ONE of the following:
        1. A fascinating fact related to this paragraph's content
        2. A practical application of the concept
        3. A clarification of a complex point
        4. A "did you know" insight
        
        Make it extremely brief but valuable - it will appear in a small popup beside the text.
        Focus on quality over quantity. Be concise and direct.
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: 'system', 
            content: `You create extremely concise and valuable learning insights about ${topic}.`
          },
          { role: 'user', content: prompt }
        ],
      });

      const insight = completion.choices[0].message.content;
      
      marginNotes.push({
        id: `note-${index + 1}`,
        paragraph: paragraph.substring(0, 100), // Store the start of the paragraph for matching
        insight
      });
    }
    
    console.log(`Successfully generated ${marginNotes.length} margin notes`);

    return new Response(
      JSON.stringify({ marginNotes }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-margin-notes function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
