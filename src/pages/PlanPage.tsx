import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/MainNav";
import LearningStep, { Step } from "@/components/LearningStep";
import { generateLearningPlan } from "@/utils/learning";
import { deleteLearningPath } from "@/utils/projectUtils";
import { motion } from "framer-motion";
import { ArrowLeft, Check, RefreshCw, LogIn, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UserNav } from "@/components/UserNav";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PlanPage = () => {
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

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 text-gray-700 hover:text-brand-purple" 
                onClick={handleReset}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
            </div>
            
            <div className="text-brand-purple font-medium text-lg">
              LearnFlow
            </div>
            
            <div>
              <UserNav />
            </div>
          </div>
        </div>
      </header>

      <div className="container max-w-3xl mx-auto py-10 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-10 text-center">
            <div className="inline-flex justify-center items-center mb-4">
              <div className="w-14 h-14 rounded-full bg-brand-purple/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-brand-purple" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-brand-purple">Your Learning Journey</h1>
            <p className="text-gray-600 max-w-lg mx-auto mb-2">
              A personalized 10-step plan to master <span className="text-brand-gold font-medium">{topic}</span>
            </p>
            
            {!loading && !authError && pathId && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 text-brand-pink hover:bg-brand-pink/10 hover:text-brand-pink border-brand-pink/30"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete Plan
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Learning Plan</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this learning plan and all its content.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-brand-pink hover:bg-brand-pink/90 text-white"
                      onClick={handleDeletePlan}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete Plan"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 rounded-full border-4 border-brand-purple/30 border-t-brand-purple animate-spin mb-4"></div>
              <p className="text-gray-500 animate-pulse-soft">Crafting your personalized learning journey...</p>
            </div>
          ) : authError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-brand-gold/20 flex items-center justify-center mb-4">
                <LogIn className="h-8 w-8 text-brand-gold" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Authentication Required</h3>
              <p className="text-gray-600 mb-6 max-w-md">
                You need to be logged in to create and save learning plans. Your plans will be stored in your account so you can access them anytime.
              </p>
              <Button onClick={handleLogin} className="gap-2 bg-brand-purple hover:bg-brand-purple/90 text-white btn-hover-effect">
                <LogIn className="h-4 w-4" />
                Sign In or Create Account
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-10 space-y-3">
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
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                  className="gap-2 border-brand-gold text-brand-gold hover:bg-brand-gold/10 hover:text-brand-gold btn-hover-effect"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Another Topic
                </Button>
                <Button 
                  onClick={handleApprove}
                  className="gap-2 bg-brand-purple hover:bg-brand-purple/90 text-white btn-hover-effect"
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
