
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import KnowledgeNuggetLoading from "@/components/content/KnowledgeNuggetLoading";
import ContentError from "@/components/content/ContentError";
import { startBackgroundContentGeneration } from "@/utils/learning/backgroundContentGeneration";
import { Step } from "@/components/LearningStep";

const ContentGenerationPage = () => {
  const { pathId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<string | null>(null);
  const [generatingContent, setGeneratingContent] = useState<boolean>(true);
  const [generatedSteps, setGeneratedSteps] = useState<number>(0);
  const [totalSteps, setTotalSteps] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [hasStartedGeneration, setHasStartedGeneration] = useState<boolean>(false);

  useEffect(() => {
    // Get topic from session storage or from the database
    const storedTopic = sessionStorage.getItem("learn-topic");
    
    if (storedTopic) {
      setTopic(storedTopic);
    } else if (pathId) {
      // Fetch topic from database
      supabase
        .from('learning_paths')
        .select('topic')
        .eq('id', pathId)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error("Error fetching topic:", error);
            setError("Could not retrieve topic information");
          } else if (data) {
            setTopic(data.topic);
            sessionStorage.setItem("learn-topic", data.topic);
          }
        });
    }
  }, [pathId]);

  // Fetch steps and start generation
  useEffect(() => {
    if (!pathId || !topic || hasStartedGeneration) return;

    const fetchStepsAndStartGeneration = async () => {
      try {
        console.log(`Fetching steps for path ${pathId} with topic ${topic}`);
        
        const { data: steps, error } = await supabase
          .from('learning_steps')
          .select('*')
          .eq('path_id', pathId)
          .order('order_index', { ascending: true });

        if (error) {
          console.error("Error fetching steps:", error);
          setError("Failed to load learning steps");
          return;
        }

        if (!steps || steps.length === 0) {
          console.error("No steps found for this path");
          setError("No learning steps found for this project");
          return;
        }

        console.log(`Found ${steps.length} steps for path ${pathId}`);
        setTotalSteps(steps.length);

        // Map the learning step data to match the Step interface
        const stepsForGeneration: Step[] = steps.map(step => ({
          id: step.id,
          title: step.title,
          description: step.content || ""
        }));

        // Count already generated steps
        const generatedCount = steps.filter(step => !!step.detailed_content).length;
        setGeneratedSteps(generatedCount);
        
        if (generatedCount === steps.length) {
          console.log("All content already generated, redirecting to content page");
          setGeneratingContent(false);
          setTimeout(() => navigate(`/content/${pathId}/step/0`), 1500);
          return;
        }

        setHasStartedGeneration(true);
        console.log("Starting background content generation");
        
        // Start background generation and set up polling
        startBackgroundContentGeneration(stepsForGeneration, topic, pathId);
        
        // Set up polling to check generation progress
        const pollInterval = setInterval(async () => {
          const { data: updatedSteps, error: pollError } = await supabase
            .from('learning_steps')
            .select('detailed_content')
            .eq('path_id', pathId);
            
          if (pollError) {
            console.error("Error polling steps:", pollError);
            return;
          }
          
          const updatedGeneratedCount = updatedSteps.filter(step => !!step.detailed_content).length;
          console.log(`Generation progress: ${updatedGeneratedCount}/${steps.length} steps`);
          
          setGeneratedSteps(updatedGeneratedCount);
          
          if (updatedGeneratedCount === steps.length) {
            clearInterval(pollInterval);
            setGeneratingContent(false);
            console.log("All content generated, redirecting to content page");
            setTimeout(() => navigate(`/content/${pathId}/step/0`), 1500);
          }
        }, 5000); // Poll every 5 seconds
        
        return () => clearInterval(pollInterval);
      } catch (err) {
        console.error("Error in generation process:", err);
        setError("An error occurred during content generation");
      }
    };

    fetchStepsAndStartGeneration();
  }, [pathId, topic, navigate, hasStartedGeneration]);

  const goToProjects = () => {
    navigate("/projects");
  };

  if (error) {
    return <ContentError goToProjects={goToProjects} message={error} />;
  }

  return (
    <KnowledgeNuggetLoading 
      topic={topic} 
      goToProjects={goToProjects} 
      generatingContent={generatingContent} 
      generatedSteps={generatedSteps} 
      totalSteps={totalSteps} 
      pathId={pathId} 
    />
  );
};

export default ContentGenerationPage;
