
import ContentLoading from "@/components/content/ContentLoading";
import ContentError from "@/components/content/ContentError";

interface ContentErrorBoundaryProps {
  isLoading: boolean;
  topic: string | null;
  pathId: string | null;
  goToProjects: () => void;
  children: React.ReactNode;
}

const ContentErrorBoundary = ({
  isLoading,
  topic,
  pathId,
  goToProjects,
  children
}: ContentErrorBoundaryProps) => {
  if (isLoading) {
    return <ContentLoading goToProjects={goToProjects} />;
  }

  if (!topic || !pathId) {
    return <ContentError goToProjects={goToProjects} />;
  }

  return <>{children}</>;
};

export default ContentErrorBoundary;
