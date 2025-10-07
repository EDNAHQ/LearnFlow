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
    const { title, description } = await req.json();

    if (!title) {
      return new Response(
        JSON.stringify({ error: 'Project title is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating related topics for project: ${title}`);

    // Initialize AI client
    const aiClient = createAIClient();

    // Create a prompt for generating related topics
    const prompt = `You are an expert learning assistant. Based on the following project title: "${title}"${description ? ` and description: "${description}"` : ''},
suggest exactly 10 related topics that someone interested in this subject might want to explore as separate learning projects.

These should be:
- Related but distinct topics that expand knowledge in the domain
- Specific enough to be actionable project titles
- Varied in scope and difficulty
- Progressive (some building on the core topic, others exploring adjacent areas)

For each topic, provide:
1. A concise, engaging title (3-8 words)
2. A brief description of what the project would cover (1-2 sentences)
3. A difficulty level (beginner, intermediate, advanced)
4. A relevance score between 0.7 and 1.0

Respond in JSON format:
{
  "topics": [
    {
      "id": "unique-id",
      "title": "Topic Title",
      "description": "What this project would cover and why it's valuable",
      "difficulty": "intermediate",
      "relevance": 0.9
    }
  ]
}`;

    // Call AI via centralized client
    try {
      console.log("Calling AI client for related topics generation");

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
        console.log(`Generated ${parsedTopics.topics?.length || 0} related topics using ${response.model}`);

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
          title: `Advanced ${title}`,
          description: `Explore deeper concepts and advanced techniques.`,
          difficulty: "advanced",
          relevance: 0.9
        },
        {
          id: crypto.randomUUID(),
          title: `${title} Fundamentals`,
          description: `Master the core principles and foundational concepts.`,
          difficulty: "beginner",
          relevance: 0.95
        },
        {
          id: crypto.randomUUID(),
          title: `Practical ${title}`,
          description: `Apply concepts through hands-on projects and exercises.`,
          difficulty: "intermediate",
          relevance: 0.85
        },
        {
          id: crypto.randomUUID(),
          title: `${title} Best Practices`,
          description: `Learn industry standards and proven methodologies.`,
          difficulty: "intermediate",
          relevance: 0.8
        },
        {
          id: crypto.randomUUID(),
          title: `${title} Case Studies`,
          description: `Analyze real-world applications and success stories.`,
          difficulty: "intermediate",
          relevance: 0.75
        }
      ];

      return new Response(
        JSON.stringify({ topics: fallbackTopics.slice(0, 10), error: aiError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in generate-related-topics function:', error);

    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});