
import { LearningProject } from "./types";
import { getProjectStatusLabel } from "./projectStylingUtils";

interface ProjectStatusLabelProps {
  project: LearningProject;
}

const ProjectStatusLabel = ({ project }: ProjectStatusLabelProps) => {
  const status = getProjectStatusLabel(project);
  
  return (
    <span className={`inline-flex items-center py-1 px-2 rounded-full text-xs font-medium ${status.bgColor}`}>
      {status.icon}
      {status.label}
    </span>
  );
};

export default ProjectStatusLabel;
