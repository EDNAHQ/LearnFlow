
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    
    // Generate a margin note for each paragraph
    for (const [index, paragraph] of selectedParagraphs.entries()) {
      const prompt = `
        You are an expert educator creating insightful margin notes for learning content about "${topic}".
        
        Below is a paragraph from a learning resource:
        """
        ${paragraph}
        """
        
        Create a short, insightful note (50-80 words) that provides ONE of the following:
        1. An interesting fact that extends the knowledge in this paragraph
        2. A practical application of the concept discussed
        3. A clarification of a potentially confusing aspect
        4. A "did you know" insight that's relevant but not mentioned
        5. A connection to another important concept in this field
        
        Your margin note should feel like an interesting aside that enriches the reader's understanding.
        Be concise, engaging, and directly relevant to this specific paragraph.
        Do not summarize the paragraph itself - add new information or perspective.
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
            { 
              role: 'system', 
              content: `You are an expert educator creating concise and insightful margin notes about topics related to ${topic}.`
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
      const insight = data.choices[0].message.content;
      
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
