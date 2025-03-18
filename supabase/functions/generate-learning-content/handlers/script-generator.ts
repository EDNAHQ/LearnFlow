
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.5.0";
import { callOpenAI } from "../utils/openai.ts";

export async function generateScripts(
  stepId: string,
  topic: string,
  supabaseUrl: string,
  supabaseServiceKey: string,
  corsHeaders: Record<string, string>
) {
  if (!stepId || !topic) {
    return new Response(
      JSON.stringify({ error: 'Missing required parameters' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log(`Generating podcast and audio scripts for topic: ${topic}`);
  
  try {
    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // First, we need to get the path_id from the step
    const { data: stepData, error: stepError } = await supabase
      .from('learning_steps')
      .select('path_id')
      .eq('id', stepId)
      .single();
      
    if (stepError) {
      console.error('Error fetching step data:', stepError);
      throw new Error('Failed to fetch step information');
    }
    
    const pathId = stepData.path_id;
    
    // Get all steps in this learning path
    const { data: stepsData, error: stepsError } = await supabase
      .from('learning_steps')
      .select('id, title, content, detailed_content')
      .eq('path_id', pathId)
      .order('order_index');
      
    if (stepsError) {
      console.error('Error fetching steps data:', stepsError);
      throw new Error('Failed to fetch learning steps');
    }
    
    // Check if we already have scripts for this path
    const { data: pathData, error: pathError } = await supabase
      .from('learning_paths')
      .select('podcast_script, audio_script')
      .eq('id', pathId)
      .single();
      
    if (pathError) {
      console.error('Error fetching path data:', pathError);
      throw new Error('Failed to fetch learning path data');
    }
    
    // Only generate scripts if they don't already exist
    let podcastScript = pathData.podcast_script;
    let audioScript = pathData.audio_script;
    
    if (!podcastScript) {
      // Generate podcast script
      console.log('Generating podcast script...');
      
      const podcastPrompt = `
      You're creating a conversational podcast script about "${topic}". The podcast should be informative yet engaging, 
      featuring two hosts discussing the topic in a natural way.
      
      Create a script for a 10-15 minute podcast episode covering these key points:
      ${stepsData.map(step => `- ${step.title}: ${step.detailed_content || step.content || 'No content available'}`).join('\n')}
      
      Format the script like this:
      HOST 1: [Introduction and welcome]
      
      HOST 2: [Response and introduction of topic]
      
      HOST 1: [Discussion of first point]
      
      And so on...
      
      Make the conversation flow naturally, with hosts building on each other's points. 
      Include occasional questions between hosts to maintain the conversational tone.
      The script should be comprehensive but concise, focusing on the most important aspects of the topic.
      `;
      
      const systemMessage = `You are an expert podcast script writer who creates engaging, conversational scripts between two hosts. Your scripts are informative, easy to follow, and maintain a natural flow. You excel at turning educational content into entertaining dialogue.`;
      
      try {
        const podcastResponse = await callOpenAI(podcastPrompt, systemMessage, undefined, 2000);
        podcastScript = podcastResponse.choices[0].message.content;
        console.log('Podcast script generated successfully');
      } catch (error) {
        console.error('Error generating podcast script:', error);
        podcastScript = "Failed to generate podcast script.";
      }
    }
    
    if (!audioScript) {
      // Generate audio script
      console.log('Generating audio script...');
      
      const audioPrompt = `
      Create a comprehensive audio summary of a learning project about "${topic}".
      
      This summary should:
      1. Provide a brief overview of the topic (1-2 paragraphs)
      2. Discuss the key points clearly and concisely
      3. Use a conversational, engaging tone appropriate for spoken content
      
      The summary should cover these main areas:
      ${stepsData.map(step => `- ${step.title}: ${step.detailed_content || step.content || 'No content available'}`).join('\n')}
      
      Keep the script flowing naturally, with clear transitions between topics.
      Aim for a script that would take about 5-7 minutes to read aloud.
      Focus on making complex topics accessible to listeners.
      `;
      
      const systemMessage = `You are an expert at creating clear, engaging audio scripts that effectively summarize educational content. You excel at distilling complex topics into concise summaries that maintain key information while being natural to read aloud.`;
      
      try {
        const audioResponse = await callOpenAI(audioPrompt, systemMessage, undefined, 1500);
        audioScript = audioResponse.choices[0].message.content;
        console.log('Audio script generated successfully');
      } catch (error) {
        console.error('Error generating audio script:', error);
        audioScript = "Failed to generate audio script.";
      }
    }
    
    // Save the scripts to the learning path
    const { error: updateError } = await supabase
      .from('learning_paths')
      .update({
        podcast_script: podcastScript,
        audio_script: audioScript
      })
      .eq('id', pathId);
      
    if (updateError) {
      console.error('Error saving scripts:', updateError);
      throw new Error('Failed to save generated scripts');
    }
    
    console.log('Scripts saved successfully');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        podcastScript, 
        audioScript 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in script generation:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Script generation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
