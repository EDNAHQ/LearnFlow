
import React from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Users, BookOpen } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getProjectStyling } from "@/components/projects/projectStylingUtils";

interface RecentProject {
  id: string;
  topic: string;
  created_at: string;
  is_completed: boolean;
}

const RecentProjectsSection = () => {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['recent-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_paths')
        .select('id, topic, created_at, is_completed')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) {
        console.error("Error fetching recent projects:", error);
        return [];
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRandomUserCount = () => {
    return Math.floor(Math.random() * 150) + 50; // Random between 50-200
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-gray-600 text-lg">
              Discover what others are learning on the platform
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-pulse text-gray-400">Loading recent projects...</div>
          </div>
        </div>
      </section>
    );
  }

  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-gray-600 text-lg">
            Discover what others are learning on the platform
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative px-12"
        >
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {projects.map((project) => {
                const styling = getProjectStyling(project.topic);
                const userCount = getRandomUserCount();
                
                return (
                  <CarouselItem key={project.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                    <Card className={`h-full transition-all duration-300 hover:translate-y-[-2px] bg-gradient-to-br ${styling.color} backdrop-blur-sm ${styling.border} hover:shadow-lg`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="bg-white/80 backdrop-blur-sm p-1.5 rounded-full border border-white/50 shadow-sm">
                              {styling.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2">
                                {project.topic}
                              </h3>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0 space-y-3">
                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div className="flex items-center space-x-1 text-gray-600">
                            <Users className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{userCount} learners</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-600">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{formatDate(project.created_at)}</span>
                          </div>
                        </div>

                        {/* Status badge */}
                        <div className="flex justify-start">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            project.is_completed 
                              ? 'bg-brand-purple/20 text-brand-purple' 
                              : 'bg-brand-pink/20 text-brand-pink'
                          }`}>
                            <BookOpen className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{project.is_completed ? 'Completed' : 'In Progress'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
};

export default RecentProjectsSection;
