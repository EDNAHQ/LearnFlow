
import { Book, Code, FileCode, Beaker, GraduationCap, BookOpen, CheckCircle } from "lucide-react";
import { ProjectCategoryStyling, LearningProject, ProjectStatus } from "./types";

// Project topic categories with associated icons and background colors
export const projectCategories: Record<string, ProjectCategoryStyling> = {
  "machine learning": { 
    icon: <Beaker className="h-4 w-4" />, 
    color: "from-brand-purple/20 to-brand-pink/20", 
    border: "border-brand-purple" 
  },
  "javascript": { 
    icon: <Code className="h-4 w-4" />, 
    color: "from-brand-gold/20 to-brand-purple/5", 
    border: "border-brand-gold" 
  },
  "python": { 
    icon: <FileCode className="h-4 w-4" />, 
    color: "from-brand-purple/20 to-brand-gold/10", 
    border: "border-brand-purple" 
  },
  "history": { 
    icon: <BookOpen className="h-4 w-4" />, 
    color: "from-brand-pink/20 to-brand-purple/10", 
    border: "border-brand-pink" 
  },
  "vba": { 
    icon: <Code className="h-4 w-4" />, 
    color: "from-brand-gold/20 to-brand-pink/10", 
    border: "border-brand-gold" 
  },
  "api": { 
    icon: <FileCode className="h-4 w-4" />, 
    color: "from-brand-pink/20 to-brand-gold/10", 
    border: "border-brand-pink" 
  },
  "open source": { 
    icon: <Book className="h-4 w-4" />, 
    color: "from-brand-purple/30 to-brand-pink/10", 
    border: "border-brand-purple" 
  },
  "github": { 
    icon: <Code className="h-4 w-4" />, 
    color: "from-brand-pink/20 to-brand-purple/10", 
    border: "border-brand-pink" 
  },
  "website": { 
    icon: <GraduationCap className="h-4 w-4" />, 
    color: "from-brand-gold/20 to-brand-purple/10", 
    border: "border-brand-gold" 
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
    icon: <Book className="h-4 w-4" />, 
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
    bgColor: 'bg-brand-purple/20 text-brand-purple border border-brand-purple/30',
    icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />
  };
  
  if (project.is_approved) return { 
    label: 'In Progress', 
    bgColor: 'bg-brand-pink/20 text-brand-pink border border-brand-pink/30',
    icon: null
  };
  
  return { 
    label: 'Plan Created', 
    bgColor: 'bg-brand-gold/20 text-brand-gold border border-brand-gold/30',
    icon: null
  };
};
