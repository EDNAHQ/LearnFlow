import { ReactNode } from "react";

interface PlanFullPageLayoutProps {
  children: ReactNode;
  topRef: React.RefObject<HTMLDivElement>;
}

const PlanFullPageLayout = ({
  children,
  topRef,
}: PlanFullPageLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white w-full relative overflow-hidden">
      <div ref={topRef}></div>

      {/* Background decoration patterns - full page */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-gradient-to-br from-brand-primary/3 to-brand-accent/3 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-gradient-to-br from-brand-highlight/3 to-brand-primary/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-br from-brand-accent/3 to-brand-highlight/3 rounded-full blur-3xl" />
      </div>

      {/* Full-page content - no max-width constraints */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default PlanFullPageLayout;



