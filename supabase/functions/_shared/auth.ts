import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from './utils.ts';

interface AuthContext {
  supabaseClient: ReturnType<typeof createClient>;
  user: {
    id: string;
    email?: string;
  };
}

export async function getAuthContext(req: Request): Promise<
  | AuthContext
  | {
      errorResponse: Response;
    }
> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  if (!supabaseUrl || !serviceRoleKey) {
    return {
      errorResponse: new Response(
        JSON.stringify({ error: 'Supabase environment variables are not configured' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      ),
    };
  }

  const authHeader = req.headers.get('Authorization') || '';
  const accessToken = authHeader.replace('Bearer', '').trim();

  if (!accessToken) {
    return {
      errorResponse: new Response(JSON.stringify({ error: 'Missing access token' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      }),
    };
  }

  const supabaseClient = createClient(supabaseUrl, serviceRoleKey);
  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser(accessToken);

  if (error || !user) {
    return {
      errorResponse: new Response(JSON.stringify({ error: 'Invalid or expired access token' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      }),
    };
  }

  return { supabaseClient, user };
}

