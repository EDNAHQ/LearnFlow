import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAIClient } from "../_shared/ai-provider/index.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Mode = 'mental_models' | 'socratic' | 'worked_examples';

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
    const system = `You extract concise, practical mental models. Keep outputs scannable and strictly grounded in the provided content. Audience level: ${readingLevel}.`;
    const user = `${baseContext}\nFormat exactly:\n\n# Core principles (3–5)\n- ...\n\n# Invariants (2–4)\n- ...\n\n# Trade-offs (2–3)\n- ...\n\n# If/Then heuristics (3–6)\n- If ..., then ... because ...\n\n# Failure modes (2–3)\n- ...\n`;
    return { system, user, maxTokens: 900, temperature: 0.5 };
  }

  if (mode === 'socratic') {
    const system = `You are a Socratic tutor. Ask questions only. Do not reveal answers unless explicitly asked. Keep each question 1–2 lines. Audience level: ${readingLevel}.`;
    const user = `${baseContext}\nProduce:\n\n1. Warm-up recall (2)\n2. Concept probes (3)\n3. Application scenario (1)\n4. Reflection (1)\n\nNumber each item; keep questions concrete and tied to the content.`;
    return { system, user, maxTokens: 500, temperature: 0.7 };
  }

  // worked_examples
  const system = `You produce worked examples that directly reference the provided content. Be clear and stepwise. Audience level: ${readingLevel}.`;
  const user = `${baseContext}\nCreate 2–3 worked examples of increasing difficulty. For each example, use this format:\n\n## Example N: Title\n### Problem\n...\n### Solution steps\n1. ...\n2. ...\n3. ...\n### Why this works\nTie to the content above.\n### Quick check\nOne short check question.`;
  return { system, user, maxTokens: 1200, temperature: 0.7 };
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


