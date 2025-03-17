
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
      console.error('No job ID provided');
      return new Response(
        JSON.stringify({ error: 'Job ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Checking status of podcast job: ${jobId}`);
    console.log(`User ID: ${PLAYDIALOG_USER_ID ? 'Available' : 'Missing'}`);
    console.log(`Secret Key: ${PLAYDIALOG_SECRET_KEY ? 'Available (length: ' + PLAYDIALOG_SECRET_KEY.length + ')' : 'Missing'}`);
    
    // Validate API credentials
    if (!PLAYDIALOG_USER_ID || !PLAYDIALOG_SECRET_KEY) {
      console.error('Missing Play.ai API credentials');
      return new Response(
        JSON.stringify({ error: 'API credentials are not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Prepare the headers for Play.ai API
    const headers = {
      'X-USER-ID': PLAYDIALOG_USER_ID,
      'Authorization': `Bearer ${PLAYDIALOG_SECRET_KEY}`,
      'Content-Type': 'application/json',
    };
    
    // Check job status
    const statusUrl = `https://api.play.ai/api/v1/tts/${jobId}`;
    console.log(`Sending status check request to: ${statusUrl}`);
    console.log('Using headers:', JSON.stringify({
      'X-USER-ID': PLAYDIALOG_USER_ID,
      'Authorization': 'Bearer [SECRET_KEY_PROVIDED]',
      'Content-Type': 'application/json',
    }));
    
    const statusResponse = await fetch(statusUrl, { headers });
    
    const responseStatus = statusResponse.status;
    const responseStatusText = statusResponse.statusText;
    console.log(`Response status: ${responseStatus} ${responseStatusText}`);
    
    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      console.error(`Error checking job status:`, errorText);
      throw new Error(`Error checking job status: ${responseStatus} ${errorText}`);
    }
    
    const statusData = await statusResponse.json();
    console.log(`Status response:`, JSON.stringify(statusData));
    
    // Extract status, handling different status formats from the API
    let status = statusData.output?.status || statusData.status || 'UNKNOWN';
    // Map Play.ai specific statuses to our standard statuses
    if (status === 'queued' || status === 'running') {
      status = 'PROCESSING';
    } else if (status === 'completed') {
      status = 'COMPLETED';
    } else if (status === 'failed') {
      status = 'FAILED';
    }
    
    // Get podcast URL if available
    const podcastUrl = status === 'COMPLETED' ? (statusData.output?.url || statusData.url) : null;
    
    console.log(`Mapped job status: ${status}, URL available: ${Boolean(podcastUrl)}`);

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
