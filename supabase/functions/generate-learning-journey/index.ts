// @ts-nocheck
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
        systemPrompt += ' Generate 30-40 diverse, specific learning topics. Just topic names, nothing else. Respond with valid JSON.';
        prompt = `Based on this interest: ${interest?.category}${interest?.freeText ? ` - "${interest.freeText}"` : ''}, generate 30-40 specific, diverse learning topics.

Make them concrete and actionable. Mix broad and narrow topics. No descriptions, just names.

Return ONLY this JSON structure:
{
  "topics": ["Topic name 1", "Topic name 2", "Topic name 3", ... 30-40 total]
}`;
        break;

      case 'generate-skills':
        systemPrompt += ' Generate 30-40 subtopics based on the parent topic. Just names. Respond with valid JSON.';
        prompt = `For the topic "${topic?.title}", generate 30-40 related subtopics someone could dive deeper into.

Make them specific and diverse. Mix different angles, applications, and specializations.

Return ONLY this JSON structure:
{
  "skills": ["Subtopic 1", "Subtopic 2", "Subtopic 3", ... 30-40 total]
}`;
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

    // Normalize result shape for each action to ensure consistent responses
    try {
      let normalized: any;
      if (action === 'generate-topics') {
        const topics: any = (result && Array.isArray(result.topics)) ? result.topics : Array.isArray(result) ? result : [];

        if (!Array.isArray(topics) || topics.some((t: any) => typeof t !== 'string')) {
          throw new Error('Invalid topics format');
        }

        normalized = { topics };
      } else if (action === 'generate-skills') {
        const skillsArr: any = (result && Array.isArray(result.skills)) ? result.skills : Array.isArray(result) ? result : [];
        if (!Array.isArray(skillsArr) || skillsArr.some((s: any) => typeof s !== 'string')) {
          throw new Error('Invalid skills format');
        }
        normalized = { skills: skillsArr };
      } else if (action === 'generate-plan') {
        // Accept a very small plan and forward as-is
        const plan = (result && result.plan) ? result.plan : result;
        if (!plan || typeof plan !== 'object') {
          throw new Error('Invalid plan format');
        }
        normalized = { plan };
      }

      return new Response(
        JSON.stringify(normalized),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (normalizationError) {
      console.error('Normalization error:', normalizationError);
      return new Response(
        JSON.stringify({ error: normalizationError.message || 'Response normalization failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

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