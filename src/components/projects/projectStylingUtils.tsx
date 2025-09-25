
import { ProjectCategoryStyling, LearningProject, ProjectStatus } from "./types";

// Project topic categories with associated colors
export const projectCategories: Record<string, ProjectCategoryStyling> = {
  "machine learning": {
    color: "from-brand-purple/20 to-brand-pink/20",
    border: "border-brand-purple"
  },
  "ai": {
    color: "from-brand-purple/20 to-brand-pink/20",
    border: "border-brand-purple"
  },
  "javascript": {
    color: "from-brand-gold/20 to-brand-purple/5",
    border: "border-brand-gold"
  },
  "react": {
    color: "from-brand-purple/20 to-brand-pink/10",
    border: "border-brand-purple"
  },
  "typescript": {
    color: "from-brand-purple/20 to-brand-gold/10",
    border: "border-brand-purple"
  },
  "python": {
    color: "from-brand-purple/20 to-brand-gold/10",
    border: "border-brand-purple"
  },
  "data": {
    color: "from-brand-pink/20 to-brand-purple/10",
    border: "border-brand-pink"
  },
  "design": {
    color: "from-brand-pink/20 to-brand-gold/10",
    border: "border-brand-pink"
  },
  "api": {
    color: "from-brand-pink/20 to-brand-gold/10",
    border: "border-brand-pink"
  },
  "web": {
    color: "from-brand-gold/20 to-brand-purple/10",
    border: "border-brand-gold"
  },
  "full-stack": {
    color: "from-brand-purple/30 to-brand-pink/10",
    border: "border-brand-purple"
  },
};

// Helper function to determine project styling based on topic
export const getProjectStyling = (topic: string): ProjectCategoryStyling => {
  const lowerTopic = topic.toLowerCase();
  
  for (const [key, value] of Object.entries(projectCategories)) {
    if (lowerTopic.includes(key)) {
      return value;
    }
  }
  
  // Default styling if no match
  return {
    color: "from-brand-purple/20 to-brand-pink/10",
    border: "border-brand-purple"
  };
};

export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const getProjectStatusLabel = (project: LearningProject): ProjectStatus => {
  if (project.is_completed) return {
    label: 'Completed',
    bgColor: 'bg-gradient-to-r from-[#6654f5]/10 to-[#ca5a8b]/10 text-[#6654f5] border border-[#6654f5]/20 font-medium',
    icon: null
  };

  if (project.is_approved) return {
    label: 'In Progress',
    bgColor: 'bg-gradient-to-r from-[#ca5a8b]/10 to-[#f2b347]/10 text-[#ca5a8b] border border-[#ca5a8b]/20 font-medium',
    icon: null
  };

  return {
    label: 'Plan Created',
    bgColor: 'bg-gradient-to-r from-[#f2b347]/10 to-[#6654f5]/10 text-[#f2b347] border border-[#f2b347]/20 font-medium',
    icon: null
  };
};
