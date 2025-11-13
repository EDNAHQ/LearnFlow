import { useState, useMemo, startTransition, useDeferredValue } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MainNav } from "@/components/navigation";
import ProjectCard from "@/components/projects/ProjectCard";
import EmptyProjectsState from "@/components/projects/EmptyProjectsState";
import ProjectsLoading from "@/components/projects/ProjectsLoading";
import { useProjects } from "@/hooks/projects";
import type { LearningProject } from "@/components/projects/types";
import { useAuth } from "@/hooks/auth";
import VideoBackground from "@/components/common/VideoBackground";
import LearningJourneyWizard from "@/components/journey/LearningJourneyWizard";
import { FloatingNewProjectButton } from "@/components/projects/FloatingNewProjectButton";
import { LearningStreak } from "@/components/profile/LearningStreak";
// Icons removed for cleaner design

// Demo projects for non-logged in users
const demoProjects = [
  {
    id: "demo-1",
    topic: "Introduction to React Development",
    created_at: new Date().toISOString(),
    is_approved: true,
    is_completed: false,
    progress: 45,
    title: "Introduction to React Development",
    description: "Learn the fundamentals of React including components, state, and props"
  },
  {
    id: "demo-2",
    topic: "Advanced TypeScript Patterns",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    is_approved: true,
    is_completed: false,
    progress: 72,
    title: "Advanced TypeScript Patterns",
    description: "Master advanced TypeScript concepts for enterprise applications"
  },
  {
    id: "demo-3",
    topic: "Full-Stack Web Development",
    created_at: new Date(Date.now() - 172800000).toISOString(),
    is_approved: true,
    is_completed: true,
    progress: 100,
    title: "Full-Stack Web Development",
    description: "Build complete web applications from frontend to backend"
  }
];

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, loading, isDeleting, handleDeleteProject } = useProjects();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const deferredSearch = useDeferredValue(searchQuery);
  const [showJourneyWizard, setShowJourneyWizard] = useState(false);

  // Use demo projects if not logged in
  const displayProjects = user ? projects : demoProjects;

  const handleNewProject = () => {
    // Check if user is logged in
    if (!user) {
      navigate('/sign-in');
      return;
    }
    // Open the Learning Journey Wizard
    setShowJourneyWizard(true);
  };

  // Filter projects based on search and filter (memoized for snappy UI)
  const filteredProjects = useMemo(() => {
    const list = displayProjects as Array<LearningProject & { title?: string; description?: string }>;
    const searchLower = deferredSearch.toLowerCase();
    return list.filter(project => {
      if (!project) return false;
      const matchesSearch =
        (project.title && (project.title as string).toLowerCase().includes(searchLower)) ||
        (project.topic && project.topic.toLowerCase().includes(searchLower)) ||
        (project.description && (project.description as string).toLowerCase().includes(searchLower));

      if (activeFilter === "all") return matchesSearch;
      if (activeFilter === "in-progress") return matchesSearch && !project.is_completed;
      if (activeFilter === "completed") return matchesSearch && project.is_completed;
      return matchesSearch;
    });
  }, [displayProjects, deferredSearch, activeFilter]);

  // Calculate stats
  const totalProjects = displayProjects.length;
  const completedProjects = displayProjects.filter(p => p.is_completed).length;
  const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

  const filters = [
    { id: "all", label: "All Projects", count: totalProjects },
    { id: "in-progress", label: "In Progress", count: totalProjects - completedProjects },
    { id: "completed", label: "Completed", count: completedProjects }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <MainNav />

      {/* Hero Section with Video Background */}
      <VideoBackground
        videoSrc="/videos/social_sam.mckay.edna_Network_of_nodes_connected_by_glowing_lines_ea_68369123-6a21-4b9e-8697-722a42766ab7_0.mp4"
        imageSrc="/images/sam.mckay.edna_Network_of_nodes_connected_by_glowing_lines_ea_1fa62e10-cb69-40e5-bb59-618e8919caf8_1.png"
        className="min-h-[32vh] sm:h-[40vh] overflow-hidden"
        overlayClassName="bg-black/40"
      >
        {/* Additional Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
        <div className="absolute inset-0 brand-gradient opacity-30" />

        {/* Content */}
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white px-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
            >
              Your Learning Journey
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-white/80 max-w-2xl mx-auto"
            >
              Track your progress, celebrate achievements, and continue growing
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-md mx-auto mt-8"
            >
              <div>
                <div className="text-3xl font-bold text-white">{totalProjects}</div>
                <div className="text-sm text-white/70">Projects</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gradient">{completionRate}%</div>
                <div className="text-sm text-white/70">Complete</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">{completedProjects}</div>
                <div className="text-sm text-white/70">Achieved</div>
              </div>
            </motion.div>
          </div>
        </div>
      </VideoBackground>

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 py-12">
        {/* Learning Streak - only for logged in users */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <LearningStreak />
          </motion.div>
        )}

        {/* Show sign-in prompt for non-logged in users */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 p-6 bg-gradient-to-r from-[#6654f5]/10 to-[#ca5a8b]/10 rounded-2xl border border-[#6654f5]/20"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-[#0b0c18]">Demo Mode</h3>
                <p className="text-sm text-gray-600">Sign in to access your personal learning projects and track progress</p>
              </div>
              <Button
                onClick={() => navigate("/sign-in")}
                className="brand-gradient text-white hover:opacity-90"
              >
                Sign In
              </Button>
            </div>
          </motion.div>
        )}

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <input
              type="text"
              placeholder="Search your learning projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-gray-100 hover:border-[#6654f5]/20 focus:border-[#6654f5] focus:outline-none focus:ring-4 focus:ring-[#6654f5]/10 transition-all duration-300 text-base shadow-sm hover:shadow-md"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {filters.map((filter) => (
              <motion.button
                key={filter.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startTransition(() => setActiveFilter(filter.id))}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                  activeFilter === filter.id
                    ? 'brand-gradient text-white shadow-lg shadow-[#6654f5]/20'
                    : 'bg-white text-gray-600 hover:text-[#6654f5] hover:shadow-md border-2 border-gray-100 hover:border-[#6654f5]/20'
                }`}
              >
                {filter.label}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeFilter === filter.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {filter.count}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Projects Grid or Empty State */}
        {loading ? (
          <ProjectsLoading />
        ) : filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <EmptyProjectsState onNewProject={handleNewProject} />
          </motion.div>
        ) : (
          <>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              layout
            >
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProjectCard
                    project={project}
                    onDeleteProject={user ? handleDeleteProject : () => {}}
                    isDeleting={isDeleting}
                  />
                </motion.div>
              ))}
            </motion.div>
          </>
        )}

        {/* Bottom CTA for new projects */}
        {filteredProjects.length > 0 && (
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#6654f5]/10 mb-6">
              <span className="text-sm font-medium text-[#6654f5]">Ready to learn something new?</span>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-[#0b0c18]">Continue Your Journey</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Every expert was once a beginner. Start your next learning adventure today.
            </p>
            <Button
              onClick={handleNewProject}
              size="lg"
              className="brand-gradient text-white hover:opacity-90 transform hover:scale-105 transition-all duration-300 px-10 py-6 text-lg rounded-xl shadow-xl"
            >
              Start New Project
            </Button>
          </motion.div>
        )}
      </div>

      {/* Learning Journey Wizard Modal */}
      <LearningJourneyWizard
        isOpen={showJourneyWizard}
        onClose={() => setShowJourneyWizard(false)}
      />

      {/* Floating New Project Button */}
      {filteredProjects.length > 0 && user && (
        <FloatingNewProjectButton onClick={handleNewProject} />
      )}
    </div>
  );
};

export default ProjectsPage;