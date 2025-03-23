
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY') ?? '';

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
    const { content, topic } = await req.json();
    
    if (!content || !topic) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Only process content that has enough substance
    if (content.length < 200) {
      console.log("Content too short for concept extraction");
      return new Response(
        JSON.stringify({ concepts: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Extracting concepts for topic: ${topic}`);
    
    // Extract a sample of the content if it's very long
    const contentSample = content.length > 8000 
      ? content.substring(0, 8000) + "..." 
      : content;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert educator who identifies key concepts from learning content and explains them clearly. Extract important terms or concepts that appear EXACTLY as written in the text. Focus on finding exact phrases that can be highlighted for the reader.'
          },
          { 
            role: 'user', 
            content: `Analyze this educational content about "${topic}" and identify 4-7 important terms or concepts that appear EXACTLY in the text. 

For each concept:
1. The "term" MUST be an EXACT string that appears in the text (with exact capitalization and spacing)
2. Provide a concise definition (2-3 sentences maximum)
3. List 1-3 related concepts also mentioned in the text

IMPORTANT RULES:
- ONLY include concepts where the exact term appears in the text
- Focus on significant, multi-word terms (avoid single common words)
- For each concept, verify it appears EXACTLY in the text before including it
- Choose terms that appear in full sentences, not in headings or lists
- Choose terms that are at least 3-4 characters long

Content to analyze:
${contentSample}

Return the results as a JSON object with a "concepts" array, with each item having "term", "definition", and "relatedConcepts" fields.`
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error('Failed to extract concepts');
    }

    const data = await response.json();
    let conceptsData = [];
    
    try {
      // Parse the response content to extract the JSON
      const content = data.choices[0].message.content;
      const parsedContent = JSON.parse(content);
      conceptsData = parsedContent.concepts || [];
      
      // Generate IDs for concepts
      conceptsData = conceptsData.map((concept, index) => ({
        ...concept,
        id: `concept-${index}-${Date.now()}`
      }));
      
      console.log(`Successfully extracted ${conceptsData.length} concepts`);
      
      // Log each extracted concept for debugging
      conceptsData.forEach(concept => {
        console.log(`Extracted concept: "${concept.term}" (${concept.term.length} chars) with definition: "${concept.definition.substring(0, 50)}..."`);
      });
      
      // Additional verification - check that each concept actually appears in the content
      const validatedConcepts = conceptsData.filter(concept => {
        const appears = contentSample.includes(concept.term);
        if (!appears) {
          console.log(`WARNING: Concept "${concept.term}" does not appear exactly in the content`);
        }
        return appears;
      });
      
      if (validatedConcepts.length < conceptsData.length) {
        console.log(`Filtered out ${conceptsData.length - validatedConcepts.length} concepts that don't appear in the content`);
        conceptsData = validatedConcepts;
      }
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      throw new Error('Invalid format in concept extraction response');
    }

    return new Response(
      JSON.stringify({ concepts: conceptsData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in extract-key-concepts function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
