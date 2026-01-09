
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function useTopicManagement(pathId: string | null, user: any) {
  const [topic, setTopic] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // User authentication and path validation
  useEffect(() => {
    let isMounted = true;

    const initializeTopic = async () => {
      if (!user) {
        if (isMounted) navigate("/");
        return;
      }

      if (!pathId) {
        if (isMounted) navigate("/projects");
        return;
      }

      // First, try to get the topic from sessionStorage (faster, already loaded)
      const storedTopic = sessionStorage.getItem("learn-topic");
      if (storedTopic) {
        if (isMounted) {
          setTopic(storedTopic);
          setIsLoading(false);
        }
        return;
      }

      // If not in sessionStorage, fetch from database
      try {
        const { data: project, error } = await supabase
          .from('learning_paths')
          .select('topic')
          .eq('id', pathId)
          .single();

        if (error || !project) {
          console.error("Failed to fetch learning path:", error);
          if (isMounted) {
            navigate("/projects");
          }
          return;
        }

        if (isMounted) {
          setTopic(project.topic);
          // Store in sessionStorage for future reference
          sessionStorage.setItem("learn-topic", project.topic);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error fetching topic:", err);
        if (isMounted) {
          setIsLoading(false);
          navigate("/projects");
        }
      }
    };

    initializeTopic();

    return () => {
      isMounted = false;
    };
  }, [navigate, user, pathId]);

  return { topic, isLoading };
}
