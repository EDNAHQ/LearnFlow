
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
    const { transcript, voice1, voice2 } = await req.json();

    if (!transcript) {
      return new Response(
        JSON.stringify({ error: 'Transcript is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting podcast creation with transcript of length: ${transcript.length}`);
    console.log(`User ID: ${PLAYDIALOG_USER_ID ? 'Available' : 'Missing'}`);
    console.log(`Secret Key: ${PLAYDIALOG_SECRET_KEY ? 'Available' : 'Missing'}`);
    
    // Default voices if not provided
    const selectedVoice1 = voice1 || 's3://voice-cloning-zero-shot/baf1ef41-36b6-428c-9bdf-50ba54682bd8/original/manifest.json';
    const selectedVoice2 = voice2 || 's3://voice-cloning-zero-shot/e040bd1b-f190-4bdb-83f0-75ef85b18f84/original/manifest.json';
    
    // Prepare the request to Play.ai API
    const headers = {
      'X-USER-ID': PLAYDIALOG_USER_ID,
      'Authorization': PLAYDIALOG_SECRET_KEY,
      'Content-Type': 'application/json',
    };
    
    const payload = {
      model: 'PlayDialog',
      text: transcript,
      voice: selectedVoice1,
      voice2: selectedVoice2,
      turnPrefix: 'Host 1:',
      turnPrefix2: 'Host 2:',
      outputFormat: 'mp3',
    };

    console.log('Sending request to Play.ai API...');

    // Initiate the podcast generation
    const response = await fetch('https://api.play.ai/api/v1/tts/', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Play.ai API error response:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(`Play.ai API error: ${JSON.stringify(errorData)}`);
      } catch (e) {
        throw new Error(`Play.ai API error (${response.status}): ${errorText}`);
      }
    }

    const data = await response.json();
    console.log('Play.ai API response:', JSON.stringify(data));
    
    const jobId = data.id;
    
    if (!jobId) {
      throw new Error('No job ID returned from Play.ai API');
    }

    console.log(`Podcast generation job initiated with ID: ${jobId}`);
    
    return new Response(
      JSON.stringify({ 
        jobId,
        status: 'PROCESSING',
        message: 'Podcast generation started successfully.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in generate-podcast function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
