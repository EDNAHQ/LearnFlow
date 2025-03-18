import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, BookOpen, Headphones, Music } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { LearningProject } from "@/hooks/useProjects";
import { ProjectCardProps } from "./types";

export function ProjectCard({ project, onDeleteProject, isDeleting }: ProjectCardProps) {
  const navigate = useNavigate();
  const linkBaseStyles = "flex items-center text-sm font-medium";
  
  // Handle navigation to content pages
  const handleViewContent = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If the project is completed, go directly to content page
    // Otherwise, go to generation page first
    if (project.is_completed) {
      navigate(`/content/${project.id}/step/0`);
    } else {
      navigate(`/generate/${project.id}`);
    }
  };
  
  // Handle navigation to podcast page
  const handlePodcast = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/podcast/${project.id}`);
  };
  
  // Handle navigation to audio page
  const handleAudio = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/audio/${project.id}`);
  };

  return (
    <Card className="brand-card transform transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold text-white">{project.topic}</CardTitle>
          {project.is_completed && (
            <Badge variant="outline" className="bg-brand-gold/10 text-brand-gold border-brand-gold/20">
              Completed
            </Badge>
          )}
        </div>
        <CardDescription className="text-gray-400">
          Created {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-gray-300">
          {project.progress !== undefined ? 
            `Progress: ${project.progress}%` : 
            "Start your learning journey"
          }
        </p>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="flex space-x-4">
          <button
            onClick={handleViewContent}
            className={cn(linkBaseStyles, "text-brand-purple hover:text-brand-purple/80")}
          >
            <BookOpen className="mr-1 h-4 w-4" />
            <span>Learn</span>
          </button>
          <button
            onClick={handlePodcast}
            className={cn(linkBaseStyles, "text-brand-pink hover:text-brand-pink/80")}
          >
            <Music className="mr-1 h-4 w-4" />
            <span>Podcast</span>
          </button>
          <button
            onClick={handleAudio}
            className={cn(linkBaseStyles, "text-brand-gold hover:text-brand-gold/80")}
          >
            <Headphones className="mr-1 h-4 w-4" />
            <span>Audio</span>
          </button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteProject(project.id);
          }}
          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50/10"
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
