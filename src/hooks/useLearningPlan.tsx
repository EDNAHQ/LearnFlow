
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateLearningPlan, generateLearningTitle } from "@/utils/learning";
import { deleteLearningPath } from "@/utils/projectUtils";
import { Step } from "@/components/LearningStep";

export const useLearningPlan = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState<string>("");
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [pathId, setPathId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [pathTitle, setPathTitle] = useState<string | null>(null);
  const [generatingTitle, setGeneratingTitle] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    const storedTopic = sessionStorage.getItem("learn-topic");
    
    if (!storedTopic) {
      navigate("/");
      return;
    }
    
    setTopic(storedTopic);
    
    const fetchPlan = async () => {
      try {
        if (!user) {
          setAuthError(true);
          setLoading(false);
          return;
        }
        
        const plan = await generateLearningPlan(storedTopic);
        setSteps(plan);
        
        if (plan.length > 0) {
          const { data, error } = await supabase
            .from('learning_steps')
            .select('path_id')
            .eq('id', plan[0].id)
            .single();
            
          if (!error && data) {
            setPathId(data.path_id);
            
            // Check if there's already a title
            const { data: pathData, error: pathError } = await supabase
              .from('learning_paths')
              .select('title')
              .eq('id', data.path_id)
              .single();
              
            if (!pathError && pathData && pathData.title) {
              setPathTitle(pathData.title);
            } else {
              // Generate a title for the learning path
              await generateTitle(storedTopic, data.path_id);
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.message === "User is not authenticated") {
          setAuthError(true);
        } else {
          toast.error("Failed to generate learning plan. Please try again.");
          console.error("Error generating plan:", error);
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchPlan();
    }
  }, [navigate, user]);

  const generateTitle = async (topic: string, pathId: string) => {
    setGeneratingTitle(true);
    try {
      const title = await generateLearningTitle(topic, pathId);
      setPathTitle(title);
    } catch (error) {
      console.error("Error in title generation:", error);
    } finally {
      setGeneratingTitle(false);
    }
  };

  const handleApprove = async () => {
    if (pathId) {
      try {
        const { error } = await supabase
          .from('learning_paths')
          .update({ is_approved: true })
          .eq('id', pathId);
          
        if (error) {
          console.error("Error approving plan:", error);
          toast.error("Failed to approve plan. Please try again.");
          return;
        }
        
        sessionStorage.setItem("learning-path-id", pathId);
        
        toast.success("Learning plan approved! Content generation started in background.", {
          duration: 5000,
          id: "background-generation-start"
        });
        
        navigate("/content");
      } catch (error) {
        console.error("Error in handleApprove:", error);
        toast.error("Something went wrong. Please try again.");
      }
    } else {
      toast.error("No learning path found. Please try again.");
    }
  };

  const handleReset = () => {
    navigate("/");
    sessionStorage.removeItem("learn-topic");
    sessionStorage.removeItem("learning-path-id");
  };

  const handleLogin = () => {
    navigate("/auth");
  };

  const handleDeletePlan = async () => {
    if (!pathId) {
      toast.error("No project ID found");
      return;
    }
    
    setIsDeleting(true);
    try {
      const success = await deleteLearningPath(pathId);
      if (success) {
        navigate("/projects");
      }
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast.error("Failed to delete plan");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    topic,
    steps,
    loading,
    authError,
    activeStep,
    pathId,
    user,
    isDeleting,
    pathTitle,
    generatingTitle,
    setActiveStep,
    handleApprove,
    handleReset,
    handleLogin,
    handleDeletePlan
  };
};
