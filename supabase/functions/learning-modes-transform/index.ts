import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAIClient } from "../_shared/ai-provider/index.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Mode = 'mental_models' | 'socratic' | 'worked_examples' | 'visual_summary' | 'active_practice' | 'story_mode';

interface RequestBody {
  mode: Mode;
  content: string; // markdown or plaintext
  topic?: string;
  title?: string;
  selection?: string; // optional focused excerpt
  readingLevel?: 'beginner' | 'intermediate' | 'expert';
  domain?: string;
}

function buildPrompt(mode: Mode, body: RequestBody): { system: string; user: string; maxTokens: number; temperature?: number } {
  const baseContext = `Topic: ${body.topic || 'General'}\nTitle: ${body.title || 'Section'}\n\nLearning content (markdown):\n"""\n${body.content}\n"""\n\n${body.selection ? `Focus on this selected excerpt when relevant:\n"""\n${body.selection}\n"""\n\n` : ''}`;

  const readingLevel = body.readingLevel || 'intermediate';

  if (mode === 'mental_models') {
    const system = `Extract 2-3 key mental models. Be extremely concise.`;
    
    const user = `${baseContext}

Extract 2-3 mental models. For each: **Name** - What it is (1 sentence) - How it works (1 sentence).

Maximum 200 words total.`;
    
    return { system, user, maxTokens: 300, temperature: 0.5 };
  }

  if (mode === 'socratic') {
    const system = `Create 4-5 thought-provoking questions. Be concise.`;
    
    const user = `${baseContext}

Create 4-5 questions that help learners discover insights. Questions should be open-ended and reference specific concepts from the content.

Maximum 150 words total.`;
    
    return { system, user, maxTokens: 250, temperature: 0.6 };
  }

  if (mode === 'worked_examples') {
    const system = `Create 1-2 practical examples. Be brief.`;
  
    const user = `${baseContext}

Create 1-2 examples showing how to apply concepts. For each: **Example: [Title]** - Scenario (1-2 sentences) - Solution (2-3 steps) - Takeaway (1 sentence).

Maximum 200 words total.`;
  
    return { system, user, maxTokens: 300, temperature: 0.6 };
  }

  if (mode === 'visual_summary') {
    const system = `Create a brief visual summary with clear structure.`;
  
    const user = `${baseContext}

Create a visual summary: **Key Concepts** (2-3 with 1-sentence definitions) - **Process Flow** (if applicable, steps with →) - **Relationships** (how concepts connect).

Maximum 200 words total.`;
  
    return { system, user, maxTokens: 300, temperature: 0.5 };
  }

  if (mode === 'active_practice') {
    const system = `Create 1-2 practical exercises. Be brief.`;
  
    const user = `${baseContext}

Create 1-2 exercises. For each: **Exercise: [Name]** - Task (1 sentence) - Steps (1-2-3) - Success check (1 sentence).

Maximum 200 words total.`;
  
    return { system, user, maxTokens: 300, temperature: 0.6 };
  }

  if (mode === 'story_mode') {
    const system = `Tell a brief story that illustrates the concepts.`;
  
    const user = `${baseContext}

Create a short story: **Story: [Title]** - Situation (1-2 sentences) - What happens (2-3 sentences showing concepts) - Lesson (1 sentence).

Maximum 200 words total.`;
  
    return { system, user, maxTokens: 300, temperature: 0.7 };
  }

  // Fallback for unknown modes
  return { 
    system: `You are an expert educator helping learners understand content.`, 
    user: `${baseContext}\n\nTransform this content into a helpful learning format.`, 
    maxTokens: 2000, 
    temperature: 0.6 
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as RequestBody;

    if (!body?.mode || !body?.content) {
      return new Response(
        JSON.stringify({ error: 'mode and content are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ai = createAIClient();
    const { system, user, maxTokens, temperature } = buildPrompt(body.mode, body);

    const response = await ai.chat({
      functionType: 'deep-analysis',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      maxTokens,
      temperature,
    });

    const content = response.content || '';

    return new Response(
      JSON.stringify({ content, mode: body.mode }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('learning-modes-transform error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});


