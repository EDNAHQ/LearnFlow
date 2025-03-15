
import { motion } from "framer-motion";
import { useLearningPlan } from "@/hooks/useLearningPlan";
import { PlanHeader } from "@/components/plan/PlanHeader";
import { PlanTitle } from "@/components/plan/PlanTitle";
import { PlanLoading } from "@/components/plan/PlanLoading";
import { PlanAuthError } from "@/components/plan/PlanAuthError";
import { StepsList } from "@/components/plan/StepsList";
import { PlanActions } from "@/components/plan/PlanActions";

const PlanPage = () => {
  const {
    topic,
    steps,
    loading,
    authError,
    activeStep,
    pathId,
    isDeleting,
    pathTitle,
    generatingTitle,
    setActiveStep,
    handleApprove,
    handleReset,
    handleLogin,
    handleDeletePlan
  } = useLearningPlan();

  return (
    <div className="min-h-screen bg-white">
      <PlanHeader handleReset={handleReset} />

      <div className="container max-w-3xl mx-auto py-10 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <PlanTitle 
            topic={topic}
            pathTitle={pathTitle}
            generatingTitle={generatingTitle}
            authError={authError}
            loading={loading}
            pathId={pathId}
            handleDeletePlan={handleDeletePlan}
            isDeleting={isDeleting}
          />
          
          {loading ? (
            <PlanLoading />
          ) : authError ? (
            <PlanAuthError handleLogin={handleLogin} />
          ) : (
            <>
              <StepsList 
                steps={steps} 
                activeStep={activeStep} 
                setActiveStep={setActiveStep} 
              />
              
              <PlanActions 
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
