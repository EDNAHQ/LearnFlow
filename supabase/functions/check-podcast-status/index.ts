
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const PLAYDIALOG_USER_ID = Deno.env.get('PLAYDIALOG_USER_ID');
const PLAYDIALOG_SECRET_KEY = Deno.env.get('PLAYDIALOG_SECRET_KEY');

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
    // Parse request body
    const { jobId } = await req.json();

    if (!jobId) {
      return new Response(
        JSON.stringify({ error: 'Job ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Checking status for job ID: ${jobId}`);

    // Validate API credentials
    if (!PLAYDIALOG_USER_ID || !PLAYDIALOG_SECRET_KEY) {
      return new Response(
        JSON.stringify({ error: 'API credentials are not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare the request to Play.ai API
    const headers = {
      'X-USER-ID': PLAYDIALOG_USER_ID,
      'Authorization': `Bearer ${PLAYDIALOG_SECRET_KEY}`,
      'Content-Type': 'application/json',
    };

    // Check status from the Play.ai API
    const response = await fetch(`https://api.play.ai/api/v1/tts/${jobId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Play.ai API error response:', errorText);
      throw new Error(`Play.ai API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log('Play.ai status response:', JSON.stringify(data));

    // Determine status and return appropriate response
    let status = 'PROCESSING';
    let podcastUrl = null;

    if (data.status === 'done') {
      status = 'COMPLETED';
      podcastUrl = data.file_path;
    } else if (data.status === 'failed') {
      status = 'FAILED';
    } else {
      // Anything else is considered still in progress
      status = 'PROCESSING';
    }

    return new Response(
      JSON.stringify({
        status,
        podcastUrl,
        jobId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in check-podcast-status function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
