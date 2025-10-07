
const ProjectsLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-brand-purple/30 border-t-brand-purple animate-spin mb-3 sm:mb-4"></div>
      <p className="text-gray-500 text-sm sm:text-base animate-pulse-soft">Loading your projects...</p>
    </div>
  );
};

export default ProjectsLoading;
