
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAIClient } from "../_shared/ai-provider/index.ts";

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
    const { content, title, topic } = await req.json();

    if (!content || !topic) {
      return new Response(
        JSON.stringify({ error: 'Content and topic are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating deep dive topics for: ${topic} - ${title}`);

    // Initialize AI client
    const aiClient = createAIClient();

    // Create a prompt for generating deep dive topics
    const prompt = `You are an expert learning assistant. Based on the following content about "${topic}",
suggest exactly 4 related topics for deep dives that would enhance understanding.
These should be specific concepts or ideas that are related to but extend beyond the main content.

Content: ${content}

For each topic, provide:
1. A concise title (3-6 words)
2. A brief description (1-2 sentences)
3. A relevance score between 0.7 and 1.0 (higher = more relevant)

Respond in JSON format:
{
  "topics": [
    {
      "id": "unique-id-1",
      "title": "Topic Title",
      "description": "Brief description of why this topic is relevant",
      "similarity": 0.9
    },
    ...
  ]
}`;

    // Call AI via centralized client
    try {
      console.log("Calling AI client with 'related-topics' function type");

      const response = await aiClient.chat({
        functionType: 'related-topics',
        messages: [{ role: 'user', content: prompt }],
        responseFormat: 'json_object',
      });

      // Parse the response
      if (!response.content) {
        throw new Error("Empty response from AI");
      }

      try {
        const parsedTopics = JSON.parse(response.content);
        console.log(`Generated ${parsedTopics.topics?.length || 0} deep dive topics using ${response.model}`);

        // Add random IDs if they don't exist
        const topicsWithIds = parsedTopics.topics.map(topic => ({
          ...topic,
          id: topic.id || crypto.randomUUID()
        }));

        return new Response(
          JSON.stringify({ topics: topicsWithIds }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError);
        throw new Error("Invalid JSON response from AI");
      }
    } catch (aiError) {
      console.error("AI API error:", aiError);
      
      // Fallback to simpler approach if API call fails
      const fallbackTopics = [
        {
          id: crypto.randomUUID(),
          title: `Advanced ${topic}`,
          description: `Explore deeper concepts related to ${topic}.`,
          similarity: 0.9
        },
        {
          id: crypto.randomUUID(),
          title: `${topic} in Practice`,
          description: `How to apply ${topic} concepts in real-world scenarios.`,
          similarity: 0.85
        },
        {
          id: crypto.randomUUID(),
          title: `History of ${topic}`,
          description: `The evolution and development of ${topic} over time.`,
          similarity: 0.8
        },
        {
          id: crypto.randomUUID(),
          title: `Common ${topic} Patterns`,
          description: `Frequently used patterns and approaches in ${topic}.`,
          similarity: 0.75
        }
      ];

      return new Response(
        JSON.stringify({ topics: fallbackTopics, error: aiError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in generate-deep-dive-topics function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
