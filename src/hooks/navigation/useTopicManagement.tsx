
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useTopicManagement(pathId: string | null, user: any) {
  const [topic, setTopic] = useState<string | null>(null);
  const navigate = useNavigate();

  // User authentication and path validation
  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    if (!pathId) {
      navigate("/projects");
      console.log("Learning path not found. Please select a project.");
      return;
    }

    // Get the topic from sessionStorage initially
    const storedTopic = sessionStorage.getItem("learn-topic");
    
    if (!storedTopic) {
      navigate("/projects");
      console.log("Learning topic not found. Please start a new learning path.");
      return;
    }

    setTopic(storedTopic);
  }, [navigate, user, pathId]);

  return { topic };
}
