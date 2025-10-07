import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createAIClient } from '../_shared/ai-provider/index.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  action: 'generate-topics' | 'generate-skills' | 'generate-plan';
  interest?: {
    category: string;
    freeText?: string;
  };
  topic?: {
    id: string;
    title: string;
    description: string;
  };
  skills?: Array<{
    id: string;
    name: string;
    level: string;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, interest, topic, skills } = await req.json() as RequestBody;

    const aiClient = createAIClient();

    let prompt = '';
    let systemPrompt = 'You are an expert learning advisor who creates personalized learning journeys. Respond with valid JSON only.';

    switch (action) {
      case 'generate-topics':
        systemPrompt += ' Generate 6-8 specific learning topics based on the user\'s interest.';
        prompt = `Based on this interest: ${interest?.category}${interest?.freeText ? ` - "${interest.freeText}"` : ''}, generate learning topics.

Return a JSON array of topics with this structure:
[
  {
    "id": "unique-id",
    "title": "Topic Title",
    "description": "2-3 sentence description",
    "difficulty": "beginner|intermediate|advanced",
    "timeCommitment": "e.g., 20-30 hours",
    "careerPaths": ["Career 1", "Career 2", "Career 3"],
    "trending": true/false,
    "matchScore": 85-100
  }
]`;
        break;

      case 'generate-skills':
        systemPrompt += ' Generate a comprehensive skill breakdown for the selected topic. IMPORTANT: Return a JSON array, not a single object.';
        prompt = `For the topic "${topic?.title}" (${topic?.description}), create a skill roadmap.

IMPORTANT: You MUST return a JSON ARRAY containing MULTIPLE skill objects, NOT a single object.

Return exactly this structure - an ARRAY of skill objects:
[
  {
    "id": "skill-1",
    "name": "First Skill Name",
    "description": "Clear description of what this skill involves",
    "level": "foundational",
    "estimatedTime": "5 hours",
    "prerequisites": [],
    "outcomes": ["What you'll be able to do"]
  },
  {
    "id": "skill-2",
    "name": "Second Skill Name",
    "description": "Description of second skill",
    "level": "foundational",
    "estimatedTime": "3 hours",
    "prerequisites": [],
    "outcomes": ["Outcome 1", "Outcome 2"]
  },
  // ... more skills here
]

Include 3-4 foundational skills, 4-5 core skills, and 2-3 advanced skills. Total should be 9-12 skills in the array.`;
        break;

      case 'generate-plan':
        systemPrompt += ' Create a detailed, actionable learning plan.';
        const skillsList = skills?.map(s => `${s.name} (${s.level})`).join(', ');
        prompt = `Create a personalized learning plan for someone learning "${topic?.title}" with these selected skills: ${skillsList}

Return a JSON object with this structure:
{
  "title": "Personalized plan title",
  "description": "Overview of what they'll achieve",
  "totalDuration": "e.g., 12 weeks",
  "weeklyCommitment": "e.g., 10-15 hours",
  "milestones": [
    {
      "week": 1,
      "title": "Milestone title",
      "description": "What they'll accomplish",
      "tasks": ["Task 1", "Task 2", "Task 3"]
    }
  ],
  "firstProject": {
    "title": "Project name",
    "description": "What they'll build",
    "skills": ["Skill 1", "Skill 2"],
    "estimatedTime": "e.g., 8 hours"
  },
  "resources": [
    {
      "type": "video|article|course|documentation",
      "title": "Resource title",
      "duration": "e.g., 2 hours",
      "free": true/false
    }
  ],
  "nextSteps": ["Step 1", "Step 2", "Step 3"]
}`;
        break;

      default:
        throw new Error('Invalid action');
    }

    const response = await aiClient.chat({
      functionType: 'content-generation',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      maxTokens: 2000,
      temperature: 0.7,
      responseFormat: 'json_object'
    });

    let result;
    try {
      // Parse the JSON response
      if (!response.content) {
        throw new Error('Empty response from AI');
      }
      result = JSON.parse(response.content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', response.content);
      throw new Error('Invalid response format from AI');
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in generate-learning-journey:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred',
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});