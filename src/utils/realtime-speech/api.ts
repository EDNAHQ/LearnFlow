
import { supabase } from "@/integrations/supabase/client";
import { RealtimeSpeechOptions, RealtimeSpeechSession } from "./types";

export async function createRealtimeSpeechSession(options: RealtimeSpeechOptions = {}): Promise<RealtimeSpeechSession> {
  try {
    console.log("Creating realtime speech session with options:", options);
    
    // Pass the content from the options
    const { data, error } = await supabase.functions.invoke('realtime-speech', {
      body: {
        instructions: options.instructions,
        voice: options.voice || 'nova',
        topic: options.topic,
        initialPrompt: options.initialPrompt,
        pathId: options.pathId,
        content: options.content // Make sure to include content
      }
    });

    if (error) {
      console.error("Error invoking realtime-speech function:", error);
      throw new Error(`Error invoking realtime-speech function: ${error.message}`);
    }

    if (!data?.success || !data?.session) {
      console.error("Failed to create speech session, response:", data);
      throw new Error('Failed to create speech session');
    }

    return data.session;
  } catch (err: any) {
    console.error('Failed to create realtime speech session:', err);
    throw err;
  }
}
