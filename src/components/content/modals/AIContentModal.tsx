import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import SafeReactMarkdown from "@/components/ui/SafeReactMarkdown";
import remarkGfm from "remark-gfm";
import { getMarkdownComponents } from "@/utils/markdown/markdownComponents";
import { preprocessContent } from "@/utils/markdown/contentPreprocessor";
import AILoadingState from "@/components/ai/AILoadingState";
import AIErrorState from "@/components/ai/AIErrorState";
import { cn } from "@/lib/utils";

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
  placement?: "bottom" | "right";
  onReplaceContent?: () => void;
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
  contentType = "insight",
  placement = "bottom",
  onReplaceContent
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

  const modal = (
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

          {/* Modal container with gradient border */}
          <motion.div
            initial={placement === "right" ? { x: "100%" } : { y: "100%" }}
            animate={placement === "right" ? { x: 0 } : { y: 0 }}
            exit={placement === "right" ? { x: "100%" } : { y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={
              placement === "right"
                ? (
                  `fixed right-0 top-0 bottom-0 h-full z-[120] shadow-2xl p-[2px] bg-gradient-to-r from-[#6654f5] via-[#ca5a8b] to-[#f2b347] ` +
                  (widthVariant === "halfRight" ? "w-full md:w-1/2" : "w-full")
                )
                : (
                  `fixed bottom-0 h-[25vh] md:h-[50vh] z-[120] shadow-2xl p-[2px] bg-gradient-to-r from-[#6654f5] via-[#ca5a8b] to-[#f2b347] ` +
                  (widthVariant === "halfRight" ? "w-full md:w-1/2 right-0 left-auto" : "inset-x-0 w-full")
                )
            }
          >
            <div className={
              placement === "right"
                ? "h-full w-full bg-white rounded-l-2xl overflow-hidden flex flex-col"
                : "h-full w-full bg-white rounded-t-2xl overflow-hidden flex flex-col"
            }>
            {/* Header */}
            <div className="flex-shrink-0 border-b border-gray-200 bg-white px-8 pt-2 pb-3">
              {/* Drag handle only for bottom placement */}
              {placement === "bottom" && (
                <div className="w-12 h-1.5 rounded-full bg-gray-300 mx-auto mb-3" />
              )}
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
              <div className="px-8 py-6 pb-8">
                {isLoading && (
                  <div className="py-12">
                    <AILoadingState variant="animated" />
                  </div>
                )}

                {error && !isLoading && (
                  <AIErrorState message={error} onRetry={onRetry} />
                )}

                {!isLoading && !error && content && (
                  <div className="max-w-none text-gray-800 text-sm leading-6">
                    {/* Match modal heading sizes to other dialogs */}
                    <div className="space-y-3">
                      <SafeReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          ...markdownComponents,
                          h1: ({ children }: any) => (
                            <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">{children}</h2>
                          ),
                          h2: ({ children }: any) => (
                            <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">{children}</h3>
                          ),
                          h3: ({ children }: any) => (
                            <h4 className="text-sm font-semibold text-gray-900 mt-3 mb-1.5">{children}</h4>
                          ),
                          p: ({ children }: any) => (
                            <p className="text-sm text-gray-800 leading-6">{children}</p>
                          ),
                          li: ({ children }: any) => (
                            <li className="text-sm text-gray-800 leading-6 ml-4">{children}</li>
                          ),
                          ul: ({ children }: any) => (
                            <ul className="list-disc pl-5 space-y-1.5">{children}</ul>
                          ),
                          ol: ({ children }: any) => (
                            <ol className="list-decimal pl-5 space-y-1.5">{children}</ol>
                          ),
                          code: ({ children }: any) => (
                            <code className="px-1 py-0.5 rounded bg-gray-100 text-[12px]">{children}</code>
                          ),
                        }}
                      >
                        {preprocessContent(content)}
                      </SafeReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer with action buttons */}
            {!isLoading && content && (
              <div className="flex-shrink-0 border-t border-gray-200 bg-white px-8 py-4">
                <div className="flex justify-between gap-3">
                  {onReplaceContent && (
                    <button
                      onClick={onReplaceContent}
                      className="px-6 py-2 rounded-lg border-2 border-brand-purple text-brand-purple font-medium hover:bg-brand-purple/5 transition-colors"
                    >
                      Replace Content
                    </button>
                  )}
                  <button
                    onClick={handleClose}
                    className={cn(
                      "px-6 py-2 rounded-lg bg-gradient-to-r from-[#6654f5] via-[#ca5a8b] to-[#f2b347] text-white font-medium hover:opacity-90 transition-opacity",
                      onReplaceContent && "ml-auto"
                    )}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Render as a true page-level modal via portal
  if (typeof document !== 'undefined' && document.body) {
    return createPortal(modal, document.body);
  }
  return modal;
};

export default AIContentModal;