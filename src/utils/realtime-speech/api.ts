
import { supabase } from "@/integrations/supabase/client";
import { RealtimeSpeechOptions, RealtimeSpeechSession } from "./types";

export async function createRealtimeSpeechSession(options: RealtimeSpeechOptions = {}): Promise<RealtimeSpeechSession> {
  try {
    const { data, error } = await supabase.functions.invoke('realtime-speech', {
      body: options
    });

    if (error) {
      throw new Error(`Error invoking realtime-speech function: ${error.message}`);
    }

    if (!data.success || !data.session) {
      throw new Error('Failed to create speech session');
    }

    return data.session;
  } catch (err: any) {
    console.error('Failed to create realtime speech session:', err);
    throw err;
  }
}
