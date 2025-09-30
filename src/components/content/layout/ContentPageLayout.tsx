
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContentPageLayoutProps {
  children: ReactNode;
  onGoToProjects: () => void;
  topRef: React.RefObject<HTMLDivElement>;
  topic: string | null;
  miniMapSidebar?: ReactNode;
}

const ContentPageLayout = ({
  children,
  onGoToProjects,
  topRef,
  topic,
  miniMapSidebar
}: ContentPageLayoutProps) => {

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white w-full relative overflow-hidden">
      <div ref={topRef}></div>

      {/* Background decoration patterns */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-gradient-to-br from-brand-primary/3 to-brand-accent/3 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-gradient-to-br from-brand-highlight/3 to-brand-primary/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-br from-brand-accent/3 to-brand-highlight/3 rounded-full blur-3xl" />
      </div>

      {/* Top navigation mount point: renders ContentTopNavigation (ContentHeader) */}
      <div className="relative z-20">
        {/* The first child is expected to be the ContentHeader component */}
        {Array.isArray(children) ? children[0] : null}
      </div>

      {/* Mobile/Tablet: Show navigation full-width above the content */}
      {miniMapSidebar && (
        <div className="relative z-10 block lg:hidden">
          <div className="mx-auto px-4 pt-4">
            {miniMapSidebar}
          </div>
        </div>
      )}

      {/* Split-screen layout: Content on left (70%), Mini-map on right (30%) */}
      <div className="relative z-10 bg-transparent text-gray-800">
        <div className="mx-auto px-4 max-w-full">
          <div className={cn(
            "flex gap-6",
            miniMapSidebar ? "grid grid-cols-1 lg:grid-cols-[1fr_400px]" : ""
          )}>
            {/* Main content area */}
            <div className="w-full min-w-0">
              {/* The remaining children (content) */}
              {Array.isArray(children) ? children.slice(1) : children}
            </div>

            {/* Mini-map sidebar - only visible on large screens */}
            {miniMapSidebar && (
              <div className="hidden lg:block">
                {miniMapSidebar}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default ContentPageLayout;
