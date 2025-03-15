
import { motion } from "framer-motion";
import PlanPageHeader from "@/components/plan/PlanPageHeader";
import PlanHeader from "@/components/plan/PlanHeader";
import PlanLoading from "@/components/plan/PlanLoading";
import PlanAuthError from "@/components/plan/PlanAuthError";
import PlanStepsList from "@/components/plan/PlanStepsList";
import PlanActionButtons from "@/components/plan/PlanActionButtons";
import { usePlanPage } from "@/hooks/usePlanPage";

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

  return (
    <div className="min-h-screen bg-white">
      <PlanPageHeader handleReset={handleReset} />

      <div className="container max-w-3xl mx-auto py-10 px-4">
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
