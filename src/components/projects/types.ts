
export interface LearningProject {
  id: string;
  topic: string;
  created_at: string;
  is_approved: boolean;
  is_completed: boolean;
  progress?: number;
  title?: string;
  description?: string;
}

export interface ProjectCardProps {
  project: LearningProject;
  onDeleteProject: (id: string) => void;
  isDeleting: boolean;
}

export interface ProjectCategoryStyling {
  color: string;
  border: string;
}

export interface ProjectStatus {
  label: string;
  bgColor: string;
  icon: JSX.Element | null;
}
