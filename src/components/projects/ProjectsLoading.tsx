
const ProjectsLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-12 h-12 rounded-full border-4 border-brand-purple/30 border-t-brand-purple animate-spin mb-4"></div>
      <p className="text-gray-500 animate-pulse-soft">Loading your projects...</p>
    </div>
  );
};

export default ProjectsLoading;
