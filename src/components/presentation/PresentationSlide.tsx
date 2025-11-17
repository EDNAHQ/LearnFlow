
import { motion } from "framer-motion";
import { memo, useState, useEffect } from "react";
import SafeReactMarkdown from "@/components/ui/SafeReactMarkdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { SlideContent } from "./PresentationView";

interface PresentationSlideProps {
  slideContent: SlideContent;
  isActive: boolean;
  slideNumber: number;
  totalSlides: number;
  isLoadingImage?: boolean;
}

// Use memo to prevent unnecessary re-renders
const PresentationSlide = memo(({ slideContent, isActive, slideNumber, totalSlides, isLoadingImage = false }: PresentationSlideProps) => {
  // Track if slide has been activated to prevent unnecessary animations when switching slides
  const [wasActive, setWasActive] = useState(false);
  
  useEffect(() => {
    if (isActive && !wasActive) {
      setWasActive(true);
    }
  }, [isActive, wasActive]);

  // Don't render slides that have never been active to improve performance
  if (!isActive && !wasActive) {
    return null;
  }
  
  // Use a simpler version for inactive but previously shown slides
  if (!isActive) {
    return (
      <div className="absolute inset-0 opacity-0 z-0 pointer-events-none" />
    );
  }
  
  // Determine layout based on image presence
  const hasHeroImage = slideContent.imageUrl && slideContent.imageType === 'hero';
  const hasSplitImage = slideContent.imageUrl && ['concept', 'technical'].includes(slideContent.imageType || '');
  const shouldShowImagePlaceholder = isLoadingImage && (slideContent.imageType === 'hero' || ['concept', 'technical'].includes(slideContent.imageType || ''));

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center p-6 sm:p-10 md:p-16 opacity-100 z-10"
      initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      {/* Hero image layout - full background with overlay */}
      {hasHeroImage && (
        <>
          {/* Background image */}
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={slideContent.imageUrl}
              alt="Slide background"
              className="w-full h-full object-cover"
            />
            {/* Gradient overlays for readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/20 via-brand-pink/20 to-brand-gold/20" />
          </div>
        </>
      )}

      {/* Loading state for hero image */}
      {isLoadingImage && slideContent.imageType === 'hero' && !slideContent.imageUrl && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-brand-purple/20 via-brand-pink/20 to-brand-gold/20 animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white/60 text-sm font-medium">Generating visual...</div>
          </div>
        </div>
      )}

      {/* Glassmorphic container with gradient border */}
      <div className={`relative w-full ${hasSplitImage ? 'max-w-[90vw]' : 'max-w-[85vw]'} mx-auto`}>
        {/* Gradient border glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-brand-purple via-brand-pink to-brand-gold rounded-3xl opacity-20 blur-lg" />

        {/* Main slide container */}
        <motion.div
          className={`relative backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border ${
            hasHeroImage
              ? 'bg-white/10 border-white/20 text-white'
              : 'bg-white/80 border-white/40'
          } ${hasSplitImage ? 'px-8 sm:px-12 py-8 sm:py-12' : 'px-8 sm:px-16 md:px-20 py-10 sm:py-16 md:py-20'}`}
          animate={{
            scale: [1, 1.002, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Slide number indicator with gradient */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 flex items-center gap-2">
            <span className="text-sm font-medium bg-gradient-to-r from-brand-purple via-brand-pink to-brand-gold bg-clip-text text-transparent">
              {slideNumber} / {totalSlides}
            </span>
          </div>

          {/* Split-screen layout for concept/technical images */}
          {hasSplitImage ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Image side */}
              <div className="relative">
                <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                  <img
                    src={slideContent.imageUrl}
                    alt="Visual representation"
                    className="w-full h-full object-cover aspect-[4/3]"
                  />
                </div>
              </div>

              {/* Content side */}
              <div className="prose prose-lg sm:prose-xl lg:prose-2xl max-w-none">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-gray-800 text-2xl sm:text-3xl lg:text-4xl"
                  style={{ lineHeight: '1.6', letterSpacing: '0.02em' }}
                >
                  <SafeReactMarkdown
                    remarkPlugins={[]}
                    components={{
                      p: ({ children }) => <p style={{ marginTop: '1.5rem', marginBottom: '1.5rem', lineHeight: 'inherit' }}>{children}</p>,
                      strong: ({ children }) => (
                        <strong className="font-semibold bg-gradient-to-r from-brand-purple via-brand-pink to-brand-gold bg-clip-text text-transparent">
                          {children}
                        </strong>
                      ),
                      code: ({ children }) => (
                        <code className="px-2 py-1 bg-brand-purple/10 text-brand-pink rounded font-mono text-sm">
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {slideContent.content}
                  </SafeReactMarkdown>
                </motion.div>
              </div>
            </div>
          ) : isLoadingImage && ['concept', 'technical'].includes(slideContent.imageType || '') && !slideContent.imageUrl ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Loading skeleton for image side */}
              <div className="relative">
                <div className="relative overflow-hidden rounded-3xl aspect-[4/3] bg-gradient-to-br from-brand-purple/10 via-brand-pink/10 to-brand-gold/10 animate-pulse shadow-2xl">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-gray-500 text-sm font-medium">Generating visual...</div>
                  </div>
                </div>
              </div>

              {/* Content side */}
              <div className="prose prose-lg sm:prose-xl lg:prose-2xl max-w-none">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-gray-800 text-2xl sm:text-3xl lg:text-4xl"
                  style={{ lineHeight: '1.6', letterSpacing: '0.02em' }}
                >
                  <SafeReactMarkdown
                    remarkPlugins={[]}
                    components={{
                      p: ({ children }) => <p style={{ marginTop: '1.5rem', marginBottom: '1.5rem', lineHeight: 'inherit' }}>{children}</p>,
                      strong: ({ children }) => (
                        <strong className="font-semibold bg-gradient-to-r from-brand-purple via-brand-pink to-brand-gold bg-clip-text text-transparent">
                          {children}
                        </strong>
                      ),
                      code: ({ children }) => (
                        <code className="px-2 py-1 bg-brand-purple/10 text-brand-pink rounded font-mono text-sm">
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {slideContent.content}
                  </SafeReactMarkdown>
                </motion.div>
              </div>
            </div>
          ) : slideContent.type === 'code' ? (
            <div className="w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="w-full"
              >
                {/* Code language tag */}
                <div className="mb-4 flex items-center gap-2">
                  <div className="px-3 py-1.5 bg-gradient-to-r from-brand-purple/10 to-brand-pink/10 rounded-lg border border-brand-purple/20">
                    <span className="text-sm font-medium bg-gradient-to-r from-brand-purple via-brand-pink to-brand-gold bg-clip-text text-transparent">
                      {slideContent.language?.toUpperCase() || 'CODE'}
                    </span>
                  </div>
                </div>

                {/* Code block with glassmorphic container */}
                <div className="relative group">
                  {/* Subtle gradient glow behind code */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-brand-purple/10 via-brand-pink/10 to-brand-gold/10 rounded-2xl blur-sm" />

                  <div className="relative backdrop-blur-sm bg-gray-900/95 rounded-xl sm:rounded-2xl overflow-x-auto border border-white/10 shadow-2xl">
                    <SyntaxHighlighter
                      language={slideContent.language || 'text'}
                      style={vscDarkPlus}
                      customStyle={{
                        margin: 0,
                        padding: '1rem 1.25rem',
                        background: 'transparent',
                        fontSize: '0.9rem',
                        lineHeight: '1.6',
                      }}
                      showLineNumbers={slideContent.content.split('\n').length > 3}
                      wrapLines={false}
                    >
                      {slideContent.content}
                    </SyntaxHighlighter>
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="prose prose-2xl sm:prose-3xl lg:prose-4xl max-w-none text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                style={{
                  fontWeight: slideContent.content.length < 150 ? 500 : 400,
                  fontSize: slideContent.content.length < 100 ? '3rem' : slideContent.content.length < 200 ? '2.5rem' : '2rem',
                  lineHeight: '1.6',
                  letterSpacing: '0.02em'
                }}
                className={hasHeroImage ? 'text-white' : 'text-gray-800'}
              >
                <SafeReactMarkdown
                  remarkPlugins={[]}
                  components={{
                    p: ({ children }) => <p style={{ marginTop: '1.25rem', marginBottom: '1.25rem', lineHeight: 'inherit' }}>{children}</p>,
                    strong: ({ children }) => (
                      <strong className="font-semibold bg-gradient-to-r from-brand-purple via-brand-pink to-brand-gold bg-clip-text text-transparent">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => <em className="italic text-brand-purple/90">{children}</em>,
                    code: ({ children }) => (
                      <code className="px-2 py-1 bg-brand-purple/10 text-brand-pink rounded font-mono text-sm">
                        {children}
                      </code>
                    ),
                    ul: ({ children }) => <ul className="my-4 space-y-2 list-none">{children}</ul>,
                    li: ({ children }) => (
                      <li className="flex items-start gap-3">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-gradient-to-r from-brand-purple to-brand-pink mt-2.5 flex-shrink-0" />
                        <span>{children}</span>
                      </li>
                    ),
                  }}
                >
                  {slideContent.content}
                </SafeReactMarkdown>
              </motion.div>
            </div>
          )}

          {/* Bottom gradient accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-purple via-brand-pink to-brand-gold rounded-b-3xl opacity-30" />
        </motion.div>
      </div>
    </motion.div>
  );
});

// Add displayName for better debugging
PresentationSlide.displayName = "PresentationSlide";

export default PresentationSlide;
