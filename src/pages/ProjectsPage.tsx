
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MainNav } from "@/components/MainNav";
import ProjectCard from "@/components/projects/ProjectCard";
import EmptyProjectsState from "@/components/projects/EmptyProjectsState";
import ProjectsLoading from "@/components/projects/ProjectsLoading";
import ProjectsHeader from "@/components/projects/ProjectsHeader";
import { useProjects } from "@/hooks/useProjects";

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { projects, loading, isDeleting, handleDeleteProject } = useProjects();

  const handleNewProject = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background pattern elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-brand-purple/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 z-0"></div>
      <div className="absolute bottom-0 left-0 w-2/3 h-2/3 bg-brand-gold/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 z-0"></div>
      
      <MainNav />
      
      <div className="container max-w-5xl mx-auto py-12 px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ProjectsHeader />
          
          {loading ? (
            <ProjectsLoading />
          ) : projects.length === 0 ? (
            <EmptyProjectsState onNewProject={handleNewProject} />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {projects.map((project) => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    onDeleteProject={handleDeleteProject}
                    isDeleting={isDeleting}
                  />
                ))}
              </div>
              
              <div className="text-center">
                <Button 
                  onClick={handleNewProject}
                  className="gap-2 bg-brand-purple hover:bg-brand-purple/90 text-white btn-hover-effect"
                >
                  Start a New Learning Project
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectsPage;
