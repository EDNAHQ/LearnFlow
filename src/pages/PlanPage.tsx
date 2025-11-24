import PlanHeader from "@/components/plan/PlanHeader";
import PlanLoading from "@/components/plan/PlanLoading";
import PlanAuthError from "@/components/plan/PlanAuthError";
import PlanStepsList from "@/components/plan/PlanStepsList";
import PlanActionButtons from "@/components/plan/PlanActionButtons";
import StepDetailModal from "@/components/plan/StepDetailModal";
import { usePlanPage } from "@/hooks/projects";
import { useEffect, useRef, useState } from "react";
import PlanImmersiveLayout from "@/components/plan/layout/PlanImmersiveLayout";
import { Step } from "@/components/learning/LearningStep";

const PlanPage = () => {
  const {
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
  } = usePlanPage();

  const [selectedStepDetail, setSelectedStepDetail] = useState<{ step: Step; index: number } | null>(null);

  // Debug logging to help trace pathId issues
  useEffect(() => {
    if (pathId) {
      console.log("Plan page has pathId:", pathId);
      // Store pathId in session storage to ensure it's available
      sessionStorage.setItem("learning-path-id", pathId);
    } else {
      console.log("Plan page does not have pathId yet");
    }
  }, [pathId]);

  // Ensure pathId persists on page reloads or navigation
  useEffect(() => {
    const storedPathId = sessionStorage.getItem("learning-path-id");
    if (storedPathId && !pathId) {
      console.log("Restoring pathId from session storage:", storedPathId);
    }
  }, [pathId]);

  const topRef = useRef<HTMLDivElement | null>(null);

  return (
    <PlanImmersiveLayout topRef={topRef}>
      <div className="relative w-full h-screen flex flex-col overflow-hidden">
        {/* Header - Compact */}
        <PlanHeader
          topic={topic}
          pathId={pathId}
          loading={loading}
          authError={authError}
          isDeleting={isDeleting}
          handleReset={handleReset}
          handleDeletePlan={handleDeletePlan}
        />

        {/* Main content area - Flexible, fills space */}
        <div className="flex-1 flex items-center justify-center overflow-hidden min-h-0">
          {loading ? (
            <PlanLoading />
          ) : authError ? (
            <PlanAuthError handleLogin={handleLogin} />
          ) : (
            <div className="w-full h-full flex flex-col md:px-2 lg:px-4 xl:px-6">
              {/* Steps grid - Scrollable on mobile, centered on desktop */}
              <div className="flex-1 flex items-start md:items-center justify-center min-h-0 py-2 md:py-2 overflow-y-auto md:overflow-hidden">
                <PlanStepsList
                  steps={steps}
                  activeStep={activeStep}
                  setActiveStep={(index) => {
                    setActiveStep(index);
                    // Open detail modal when clicking a step
                    if (steps[index]) {
                      setSelectedStepDetail({ step: steps[index], index });
                    }
                  }}
                />
              </div>
              
              {/* Action buttons - Fixed at bottom with space for widget */}
              <PlanActionButtons
                handleReset={handleReset}
                handleApprove={handleApprove}
              />
            </div>
          )}
        </div>

        {/* Step Detail Modal */}
        <StepDetailModal
          step={selectedStepDetail?.step || null}
          index={selectedStepDetail?.index ?? null}
          isOpen={selectedStepDetail !== null}
          onClose={() => setSelectedStepDetail(null)}
        />
      </div>
    </PlanImmersiveLayout>
  );
};

export default PlanPage;
