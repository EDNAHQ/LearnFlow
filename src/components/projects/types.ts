
export interface LearningProject {
  id: string;
  topic: string;
  created_at: string;
  is_approved: boolean;
  is_completed: boolean;
  progress?: number;
}

export interface ProjectCardProps {
  project: LearningProject;
  onDeleteProject: (id: string) => void;
  isDeleting: boolean;
}

export interface ProjectCategoryStyling {
  icon: JSX.Element;
  color: string;
  border: string;
}

export interface ProjectStatus {
  label: string;
  bgColor: string;
  icon: JSX.Element | null;
}
