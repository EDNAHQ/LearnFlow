import { Step } from "@/components/learning/LearningStep";
import { generateStepContent } from "./generateStepContent";
import { withTimeout, withRetry, isRetryableError } from "@/utils/timeout";

const EDGE_FUNCTION_TIMEOUT_MS = 90000; // 90 seconds for edge function
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 2000; // Start with 2 second delay

/**
 * Generate step content with timeout and retry logic
 * This ensures the operation completes or fails reliably
 */
export const generateStepContentWithRetry = async (
  step: Step,
  topic: string,
  silent = false
): Promise<string> => {
  return withRetry(
    () => withTimeout(
      generateStepContent(step, topic, silent),
      EDGE_FUNCTION_TIMEOUT_MS,
      `Content generation for step "${step.title}" timed out after ${EDGE_FUNCTION_TIMEOUT_MS}ms`
    ),
    {
      maxRetries: MAX_RETRIES,
      initialDelayMs: INITIAL_RETRY_DELAY_MS,
      maxDelayMs: 10000,
      backoffMultiplier: 2,
      retryableErrors: (error) => {
        // Retry on timeouts and network errors
        if (isRetryableError(error)) {
          console.log(`Retrying step ${step.id} due to retryable error: ${error.message}`);
          return true;
        }
        // Don't retry on validation errors or missing parameters
        return false;
      },
    }
  );
};

