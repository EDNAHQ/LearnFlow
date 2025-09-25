
import { motion } from "framer-motion";
import PlanPageHeader from "@/components/plan/PlanPageHeader";
import PlanHeader from "@/components/plan/PlanHeader";
import PlanLoading from "@/components/plan/PlanLoading";
import PlanAuthError from "@/components/plan/PlanAuthError";
import PlanStepsList from "@/components/plan/PlanStepsList";
import PlanActionButtons from "@/components/plan/PlanActionButtons";
import { usePlanPage } from "@/hooks/usePlanPage";
import { useEffect } from "react";
import { Sparkles } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/30 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-[#6654f5]/5 to-[#ca5a8b]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-gradient-to-br from-[#f2b347]/5 to-[#6654f5]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-[#ca5a8b]/5 to-[#f2b347]/5 rounded-full blur-3xl" />
      </div>

      <PlanPageHeader handleReset={handleReset} />

      <div className="container max-w-4xl mx-auto py-10 px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
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
      </div>
    </div>
  );
};

export default PlanPage;
