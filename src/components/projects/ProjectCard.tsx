import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, BookOpen, Headphones, Music } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    created_at: string;
    updated_at: string;
    is_completed: boolean;
    completion_date?: string;
  };
  onDeleteClick: (id: string) => void;
}

export function ProjectCard({ project, onDeleteClick }: ProjectCardProps) {
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
    <Card className="w-full transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold">{project.title}</CardTitle>
          {project.is_completed && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Completed
            </Badge>
          )}
        </div>
        <CardDescription className="text-sm text-gray-500">
          Created {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-gray-700 line-clamp-2">{project.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="flex space-x-4">
          <button
            onClick={handleViewContent}
            className={cn(linkBaseStyles, "text-blue-600 hover:text-blue-800")}
          >
            <BookOpen className="mr-1 h-4 w-4" />
            <span>Learn</span>
          </button>
          <button
            onClick={handlePodcast}
            className={cn(linkBaseStyles, "text-purple-600 hover:text-purple-800")}
          >
            <Music className="mr-1 h-4 w-4" />
            <span>Podcast</span>
          </button>
          <button
            onClick={handleAudio}
            className={cn(linkBaseStyles, "text-amber-600 hover:text-amber-800")}
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
            onDeleteClick(project.id);
          }}
          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
