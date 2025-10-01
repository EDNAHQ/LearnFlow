
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useContentMode } from "@/hooks/content";
import { useContentNavigation } from "@/hooks/navigation";
import { supabase } from "@/integrations/supabase/client";
import { EDGE_FUNCTIONS } from "@/integrations/supabase/functions";
import ContentDisplay from "@/components/content/common/ContentDisplay";
import ContentHeader from "@/components/content/ContentHeader";
import ContentNavigation from "@/components/content/navigation/ContentNavigation";
import KnowledgeNuggetLoading from "@/components/content/loading/KnowledgeNuggetLoading";
import ContentError from "@/components/content/ContentError";
import ContentPageLayout from "@/components/content/layout/ContentPageLayout";
import ContentMiniMap from "@/components/content/navigation/ContentMiniMap";
import { useProjectCompletion } from "@/components/content/ProjectCompletion";
import DeepDiveSection from "@/components/content/deep-dive/DeepDiveSection";
import AIContentModal from "@/components/content/modals/AIContentModal";

const ContentPage = () => {
  const {
    pathId,
    stepIndex
  } = useParams();
  const navigate = useNavigate();
  const {
    setMode
  } = useContentMode();
  const {
    topic,
    currentStep,
    steps,
    isLoading,
    handleMarkComplete,
    handleBack,
    goToProjects,
    isLastStep,
    currentStepData,
    topRef,
    generatingContent,
    generatedSteps,
    navigateToStep
  } = useContentNavigation();

  // Track if we've already redirected to avoid loops
  const [hasRedirected, setHasRedirected] = useState(false);

  // Centralized modal state for Explore Further
  const [exploreFurtherModal, setExploreFurtherModal] = useState({
    open: false,
    question: "",
    content: "",
    isLoading: false,
    error: null as string | null
  });

  // Use the custom hook directly
  const {
    completePath,
    isSubmitting,
    projectCompleted
  } = useProjectCompletion(pathId, () => goToProjects());

  // Handle Explore Further question clicks
  const handleQuestionClick = async (question: string, content?: string) => {
    console.log("Question clicked:", question);

    // Open modal with loading state
    setExploreFurtherModal({
      open: true,
      question,
      content: "",
      isLoading: true,
      error: null
    });

    try {
      const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.generateAIInsight, {
        body: {
          selectedText: content || currentStepData?.detailed_content || currentStepData?.content || "",
          topic: topic || "",
          question: question,
        },
      });

      if (error) throw error;

      setExploreFurtherModal(prev => ({
        ...prev,
        content: data.insight || "Sorry, I couldn't generate an insight for this question.",
        isLoading: false
      }));
    } catch (err) {
      console.error("Error generating AI insight:", err);
      setExploreFurtherModal(prev => ({
        ...prev,
        error: "Failed to generate insight. Please try again.",
        isLoading: false
      }));
    }
  };

  const handleRetryInsight = () => {
    if (exploreFurtherModal.question) {
      handleQuestionClick(exploreFurtherModal.question, exploreFurtherModal.content);
    }
  };

  // Set "text" (Read) mode by default when component mounts
  useEffect(() => {
    setMode("text");
  }, [setMode]);

  // Handle generation complete redirect - only redirect if we're not on a step page
  useEffect(() => {
    const generationComplete = (!isLoading && !generatingContent) || (generatedSteps === steps.length && steps.length > 0);
    if (!hasRedirected && generationComplete && pathId && steps.length > 0 && !stepIndex) {
      setHasRedirected(true);
      navigate(`/content/${pathId}/step/0`);
    }
  }, [
    generatingContent, 
    generatedSteps, 
    steps.length, 
    pathId, 
    navigate, 
    hasRedirected, 
    stepIndex, 
    isLoading
  ]);


  // Show loading screen ONLY on the path-level route (no stepIndex)
  if ((isLoading || generatingContent) && !stepIndex) {
    return <KnowledgeNuggetLoading 
             topic={topic} 
             goToProjects={goToProjects} 
             generatingContent={generatingContent} 
             generatedSteps={generatedSteps} 
             totalSteps={steps.length} 
             pathId={pathId} 
           />;
  }
  
  if (!topic || !pathId) {
    return <ContentError goToProjects={goToProjects} />;
  }
  
  const handleComplete = isLastStep ? completePath : handleMarkComplete;

  // Ensure content is a string
  const safeContent = typeof currentStepData?.content === 'string' ? currentStepData.content : currentStepData?.content ? JSON.stringify(currentStepData.content) : "No content available";
  
  return (
    <ContentPageLayout
      onGoToProjects={goToProjects}
      topRef={topRef}
      topic={topic}
      miniMapSidebar={
        steps.length > 0 ? (
          <div className="space-y-12">
            {/* Mini Map Navigation */}
            <ContentMiniMap
              steps={steps.map(step => ({
                id: step.id,
                title: step.title,
                order_index: step.order_index || 0
              }))}
              currentStepIndex={currentStep}
              onNavigateToStep={navigateToStep}
            />

            {/* Deep Dive Related Topics */}
            <DeepDiveSection
              topic={topic}
              content={currentStepData?.detailed_content || safeContent}
              title={currentStepData?.title}
            />
          </div>
        ) : undefined
      }
    >
      <ContentHeader
        onHome={goToProjects}
        generatingContent={generatingContent}
        generatedSteps={generatedSteps}
        totalSteps={steps.length} 
      />

      <div className="relative w-full my-0 py-[40px] px-2 lg:px-6">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-[#6654f5]/5 to-[#ca5a8b]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-[#f2b347]/5 to-[#6654f5]/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.5, ease: "easeOut"}}
          className="relative w-full"
        >
          {/* Main Content Area with card styling */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
          >
            <div className="max-w-[1400px] mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#6654f5] via-[#ca5a8b] to-[#f2b347] bg-clip-text text-transparent mb-8">
                {currentStepData?.title || "Loading..."}
              </h1>
              <ContentDisplay
                content={safeContent}
                index={currentStep}
                detailedContent={currentStepData?.detailed_content}
                pathId={pathId}
                topic={topic}
                title={currentStepData?.title || ""}
                stepId={currentStepData?.id}
                onQuestionClick={handleQuestionClick}
              />
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="max-w-[1400px] mx-auto">
            <ContentNavigation currentStep={currentStep} totalSteps={steps.length} onPrevious={handleBack} onComplete={handleComplete} isLastStep={isLastStep} isSubmitting={isSubmitting} projectCompleted={projectCompleted} />
          </div>
        </motion.div>
      </div>

      {/* Explore Further Modal */}
      <AIContentModal
        open={exploreFurtherModal.open}
        onOpenChange={(open) => setExploreFurtherModal(prev => ({ ...prev, open }))}
        title="Explore Further"
        subtitle={exploreFurtherModal.question}
        content={exploreFurtherModal.content}
        isLoading={exploreFurtherModal.isLoading}
        error={exploreFurtherModal.error}
        onRetry={handleRetryInsight}
        topic={topic || ""}
        widthVariant="halfRight"
        contentType="explore-further"
      />
    </ContentPageLayout>
  );
};

export default ContentPage;
