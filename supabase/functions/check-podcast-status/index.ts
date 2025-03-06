
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

    console.log(`Checking status of podcast job: ${jobId}`);
    
    // Prepare the headers for Play.ai API
    const headers = {
      'X-USER-ID': PLAYDIALOG_USER_ID,
      'Authorization': PLAYDIALOG_SECRET_KEY,
      'Content-Type': 'application/json',
    };
    
    // Check job status
    const statusUrl = `https://api.play.ai/api/v1/tts/${jobId}`;
    const statusResponse = await fetch(statusUrl, { headers });
    
    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      console.error(`Error checking job status:`, errorText);
      throw new Error(`Error checking job status: ${statusResponse.status} ${errorText}`);
    }
    
    const statusData = await statusResponse.json();
    const status = statusData.output?.status || 'UNKNOWN';
    const podcastUrl = status === 'COMPLETED' ? statusData.output?.url : null;
    
    console.log(`Job status: ${status}, URL available: ${Boolean(podcastUrl)}`);

    return new Response(
      JSON.stringify({ 
        status,
        podcastUrl,
        jobId
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
