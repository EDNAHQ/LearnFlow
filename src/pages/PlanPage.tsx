
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LearningStep, { Step } from "@/components/LearningStep";
import { generateLearningPlan } from "@/utils/learningUtils";
import { motion } from "framer-motion";
import { ArrowLeft, Check, RefreshCw, LogIn } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UserNav } from "@/components/UserNav";

const PlanPage = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState<string>("");
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [pathId, setPathId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is authenticated
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
        
        // Find the path ID for the first step
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

  const handleApprove = async () => {
    if (pathId) {
      try {
        // Update the path as approved
        const { error } = await supabase
          .from('learning_paths')
          .update({ is_approved: true })
          .eq('id', pathId);
          
        if (error) {
          console.error("Error approving plan:", error);
          toast.error("Failed to approve plan. Please try again.");
          return;
        }
        
        // Store path ID in sessionStorage
        sessionStorage.setItem("learning-path-id", pathId);
        
        navigate("/content");
        toast.success("Learning plan approved! Let's start learning.");
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

  return (
    <div className="min-h-screen py-10 px-4 md:px-6 bg-white">
      <div className="absolute top-4 right-4">
        <UserNav />
      </div>
      
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Button 
            variant="ghost" 
            className="flex items-center gap-1" 
            onClick={handleReset}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">LearnFlow</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Your Learning Plan</h1>
            <p className="text-muted-foreground">
              A personalized 10-step journey to master <span className="text-foreground font-medium">{topic}</span>
            </p>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 rounded-full border-4 border-learn-200 border-t-learn-500 animate-spin mb-4"></div>
              <p className="text-muted-foreground">Crafting your learning journey...</p>
            </div>
          ) : authError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <LogIn className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Authentication Required</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                You need to be logged in to create and save learning plans. Your plans will be stored in your account so you can access them anytime.
              </p>
              <Button onClick={handleLogin} className="gap-2">
                <LogIn className="h-4 w-4" />
                Sign In or Create Account
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                {steps.map((step, index) => (
                  <LearningStep
                    key={step.id}
                    step={step}
                    index={index}
                    isActive={activeStep === index}
                    onClick={() => setActiveStep(index)}
                  />
                ))}
              </div>
              
              <motion.div 
                className="flex gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Another Topic
                </Button>
                <Button 
                  onClick={handleApprove}
                  className="gap-2 bg-learn-600 hover:bg-learn-700"
                >
                  <Check className="h-4 w-4" />
                  Approve Plan & Continue
                </Button>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PlanPage;
