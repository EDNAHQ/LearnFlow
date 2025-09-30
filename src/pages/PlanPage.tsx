
import { motion } from "framer-motion";
import PlanHeader from "@/components/plan/PlanHeader";
import PlanLoading from "@/components/plan/PlanLoading";
import PlanAuthError from "@/components/plan/PlanAuthError";
import PlanStepsList from "@/components/plan/PlanStepsList";
import PlanActionButtons from "@/components/plan/PlanActionButtons";
import { usePlanPage } from "@/hooks/projects";
import { useEffect, useRef } from "react";
import ContentPageLayout from "@/components/content/layout/ContentPageLayout";
import ContentHeader from "@/components/content/ContentHeader";

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
    <ContentPageLayout onGoToProjects={handleReset} topRef={topRef} topic={topic}>
      <ContentHeader
        onHome={handleReset}
        generatingContent={false}
        generatedSteps={0}
        totalSteps={steps.length}
      />

      <div className="relative w-full my-0 py-[60px] px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-7xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-12 bg-gradient-to-br from-white via-white to-gray-50/30 rounded-3xl shadow-2xl border-2 border-gray-100/50 p-8 md:p-12"
          >
            <PlanHeader
              topic={topic}
              pathId={pathId}
              loading={loading}
              authError={authError}
              isDeleting={isDeleting}
              handleReset={handleReset}
              handleDeletePlan={handleDeletePlan}
            />

            {loading ? (
              <PlanLoading />
            ) : authError ? (
              <PlanAuthError handleLogin={handleLogin} />
            ) : (
              <>
                <PlanStepsList
                  steps={steps}
                  activeStep={activeStep}
                  setActiveStep={setActiveStep}
                />

                <PlanActionButtons
                  handleReset={handleReset}
                  handleApprove={handleApprove}
                />
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
    </ContentPageLayout>
  );
};

export default PlanPage;
