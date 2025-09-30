import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { getMarkdownComponents } from "@/utils/markdown/markdownComponents";
import AILoadingState from "@/components/ai/AILoadingState";
import AIErrorState from "@/components/ai/AIErrorState";

export type AIContentType = "insight" | "deep-dive" | "explore-further" | "related-topic";

interface AIContentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  content: string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  topic?: string;
  widthVariant?: "full" | "halfRight";
  contentType?: AIContentType;
}

const AIContentModal = ({
  open,
  onOpenChange,
  title,
  subtitle,
  content,
  isLoading = false,
  error = null,
  onRetry,
  topic = "",
  widthVariant = "full",
  contentType = "insight"
}: AIContentModalProps) => {
  const handleClose = () => {
    onOpenChange(false);
  };

  // Get markdown components matching content area style, but customize for modal
  const markdownComponents = {
    ...getMarkdownComponents(topic),
    // Override headings to be smaller in modal
    h1: ({ children }: any) => (
      <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3 first:mt-0">
        {children}
      </h2>
    ),
    h2: ({ children }: any) => (
      <h3 className="text-lg font-semibold text-gray-800 mt-5 mb-2">
        {children}
      </h3>
    ),
    h3: ({ children }: any) => (
      <h4 className="text-base font-medium text-gray-700 mt-4 mb-2">
        {children}
      </h4>
    ),
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop overlay (transparent – no dimming) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-transparent z-[100]"
            onClick={handleClose}
          />

          {/* Bottom sheet modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={
              `fixed bottom-0 h-[25vh] md:h-[50vh] bg-white z-[120] overflow-hidden flex flex-col rounded-t-2xl shadow-2xl border-t border-gray-200 ` +
              (widthVariant === "halfRight"
                ? "w-full md:w-1/2 right-0 left-auto"
                : "inset-x-0 w-full")
            }
          >
            {/* Header */}
            <div className="flex-shrink-0 border-b border-gray-200 bg-white px-8 pt-2 pb-3">
              {/* Drag handle */}
              <div className="w-12 h-1.5 rounded-full bg-gray-300 mx-auto mb-3" />
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-[#6654f5] via-[#ca5a8b] to-[#f2b347] bg-clip-text text-transparent mb-1">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="text-sm text-gray-600">
                      {subtitle}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleClose}
                  className="flex-shrink-0 text-2xl leading-none text-gray-400 hover:text-gray-600 transition-colors w-8 h-8 flex items-center justify-center"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content area with scrolling */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-8 py-6">
                {isLoading && (
                  <div className="py-12">
                    <AILoadingState variant="animated" />
                  </div>
                )}

                {error && !isLoading && (
                  <AIErrorState message={error} onRetry={onRetry} />
                )}

                {!isLoading && !error && content && (
                  <div className="prose prose-sm max-w-none text-gray-700">
                    <ReactMarkdown components={markdownComponents}>
                      {content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>

            {/* Footer with action buttons */}
            {!isLoading && content && (
              <div className="flex-shrink-0 border-t border-gray-200 bg-white px-8 py-4">
                <div className="flex justify-end">
                  <button
                    onClick={handleClose}
                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#6654f5] via-[#ca5a8b] to-[#f2b347] text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AIContentModal;