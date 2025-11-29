
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { useContentMode } from "@/hooks/content";
import { useContentNavigation } from "@/hooks/navigation";
import { useLearningSession } from "@/hooks/analytics/useLearningSession";
import { useBehaviorTracking, usePromptTracking } from "@/hooks/analytics";
import { useProgressTracking } from "@/hooks/capability";
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

  // Track learning session for analytics and streaks
  useLearningSession({
    pathId: pathId,
    contentMode: 'learning',
    referrerSource: 'content_page',
  });

  // Track behavior and progress
  const { trackContentView, trackContentComplete, trackTaskSuccess, trackTaskFailure, trackHintRequest, logBehavior } = useBehaviorTracking();
  const { logPrompt } = usePromptTracking();
  const { logProgress, markComplete } = useProgressTracking();
  const contentViewStartTime = useRef<Date | null>(null);

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

  // Track content view when step loads
  useEffect(() => {
    if (currentStepData?.id && pathId) {
      contentViewStartTime.current = new Date();
      trackContentView(
        currentStepData.id,
        'step',
        pathId,
        currentStepData.id
      );
    }
  }, [currentStepData?.id, pathId, trackContentView]);

  // Handle Explore Further question clicks
  const handleQuestionClick = async (question: string, content?: string) => {
    console.log("Question clicked:", question);

    // Track hint/question request for behavior analysis
    trackHintRequest(
      currentStepData?.id || '',
      pathId || undefined,
      currentStepData?.id
    );

    // Track the question as a prompt (intent signal)
    logPrompt({
      promptText: question,
      contextUsed: content || currentStepData?.detailed_content || currentStepData?.content || "",
      category: 'explanation',
      pathId: pathId || undefined,
      stepId: currentStepData?.id,
      metadata: {
        source: 'explore_further',
        topic: topic || ''
      }
    });

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

      // Update prompt log with response length (already logged above)
      const responseLength = data.insight?.length || 0;
      // Note: Response length is already tracked in the initial logPrompt call above
      // We could enhance this to update the log, but for now single log is sufficient

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

  // Note: Redirect logic is handled in useContentNavigation hook to avoid duplicate redirects

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
  
  // Wrap completion handler to track progress
  const handleCompleteWithTracking = async () => {
    if (currentStepData?.id && pathId && contentViewStartTime.current) {
      const completionTime = Math.floor(
        (new Date().getTime() - contentViewStartTime.current.getTime()) / 1000
      );

      // Track content completion
      trackContentComplete(
        currentStepData.id,
        'step',
        completionTime,
        pathId,
        currentStepData.id
      );

      // Also log with metadata for discovery
      logBehavior({
        actionType: 'content_complete',
        contentId: currentStepData.id,
        contentType: 'step',
        timeOnContent: completionTime,
        pathId: pathId || undefined,
        stepId: currentStepData.id,
        metadata: { completionTime, timeOnContent: completionTime }
      });

      // Track progress
      await logProgress({
        moduleId: pathId,
        stepId: currentStepData.id,
        completionTime,
        successRate: 100, // Assume success if they completed it
        remediationNeeded: false
      });

      // Mark as complete in progress tracking
      await markComplete(pathId, completionTime, currentStepData.id);
    }

    // Call original handler
    if (isLastStep) {
      await completePath();
    } else {
      await handleMarkComplete();
    }
  };

  const handleComplete = handleCompleteWithTracking;

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
        projectTitle={topic}
      />

      <div className="relative w-full my-0 py-[24px] sm:py-[32px] px-2 lg:px-6">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-[#6654f5]/5 to-[#ca5a8b]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-[#f2b347]/5 to-[#6654f5]/5 rounded-full blur-3xl" />
        </div>

        {/* Content Generation Banner - Show when generating */}
        {generatingContent && generatedSteps < steps.length && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative mb-6 mx-auto max-w-[1400px]"
          >
            <div className="bg-gradient-to-r from-brand-purple/10 via-brand-pink/10 to-brand-gold/10 border-2 border-brand-purple/30 rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-brand-pink border-t-transparent animate-spin flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm sm:text-base font-medium text-gray-900">
                    Generating content for your learning path...
                  </p>
                  <p className="text-xs sm:text-sm font-light text-gray-600 mt-1">
                    {generatedSteps} of {steps.length} steps completed
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-24 sm:w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: `${(generatedSteps / steps.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-brand-purple via-brand-pink to-brand-gold rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

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
            className="mb-6 sm:mb-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 md:p-8"
          >
            <div className="max-w-[1400px] mx-auto">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#6654f5] via-[#ca5a8b] to-[#f2b347] bg-clip-text text-transparent mb-4 sm:mb-8">
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
