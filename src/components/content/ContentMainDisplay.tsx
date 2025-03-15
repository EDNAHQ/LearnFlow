
import { motion } from "framer-motion";
import ContentProgress from "@/components/content/ContentProgress";
import ContentDisplay from "@/components/ContentDisplay";
import ContentNavigation from "@/components/content/ContentNavigation";
import ContentLoader from "@/components/content/ContentLoader";

interface ContentMainDisplayProps {
  topic: string | null;
  pathTitle: string | null;
  currentStep: number;
  steps: any[];
  currentStepData: any;
  safeContent: string;
  handleBack: () => void;
  handleComplete: () => void;
  isLastStep: boolean;
  isSubmitting: boolean;
  projectCompleted: boolean;
  pathId: string | null;
}

const ContentMainDisplay = ({
  topic,
  pathTitle,
  currentStep,
  steps,
  currentStepData,
  safeContent,
  handleBack,
  handleComplete,
  isLastStep,
  isSubmitting,
  projectCompleted,
  pathId
}: ContentMainDisplayProps) => {
  if (!topic) return null;
  
  const isGeneratingContent = currentStepData && !currentStepData.detailed_content;
  
  return (
    <div className="container max-w-[860px] mx-auto py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <div className="flex justify-between items-center mb-6 w-full">
          <ContentProgress 
            topic={topic} 
            pathTitle={pathTitle}
            currentStep={currentStep} 
            totalSteps={steps.length} 
          />
        </div>

        <div className="mb-6 w-full">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-gray-800 w-full">
              {currentStepData?.title || "Loading..."}
            </h2>
          </div>
          
          {isGeneratingContent ? (
            <ContentLoader message={`Generating content for "${currentStepData?.title}"...`} />
          ) : (
            <ContentDisplay 
              title={currentStepData?.title || ""}
              content={safeContent}
              index={currentStep}
              detailedContent={currentStepData?.detailed_content}
              pathId={pathId}
              topic={topic}
              isFirstStep={currentStep === 0}
            />
          )}
        </div>

        <div>
          <ContentNavigation 
            currentStep={currentStep}
            totalSteps={steps.length}
            onPrevious={handleBack}
            onComplete={handleComplete}
            isLastStep={isLastStep}
            isSubmitting={isSubmitting}
            projectCompleted={projectCompleted}
            isGeneratingContent={isGeneratingContent}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default ContentMainDisplay;
