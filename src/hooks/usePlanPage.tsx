
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { generateLearningPlan } from "@/utils/learning";
import { deleteLearningPath } from "@/utils/projectUtils";
import { supabase } from "@/integrations/supabase/client";
import { Step } from "@/components/LearningStep";

export const usePlanPage = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState<string>("");
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [pathId, setPathId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

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
          }
        }
      } catch (error) {
        if (error instanceof Error && error.message === "User is not authenticated") {
          setAuthError(true);
        } else {
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

  const handleApprove = async () => {
    if (pathId) {
      try {
        const { error } = await supabase
          .from('learning_paths')
          .update({ is_approved: true })
          .eq('id', pathId);
          
        if (error) {
          console.error("Error approving plan:", error);
          return;
        }
        
        sessionStorage.setItem("learning-path-id", pathId);
        
        // Navigate to the content page with the path ID to match the route structure
        navigate(`/content/${pathId}`);
      } catch (error) {
        console.error("Error in handleApprove:", error);
      }
    } else {
      console.error("No learning path found. Please try again.");
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
      console.error("No project ID found");
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
    isDeleting,
    setActiveStep,
    handleApprove,
    handleReset,
    handleLogin,
    handleDeletePlan
  };
};
