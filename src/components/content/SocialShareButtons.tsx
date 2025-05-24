
import React from "react";
import { Button } from "@/components/ui/button";
import { Share2, Twitter, Linkedin, Facebook } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface SocialShareButtonsProps {
  title: string;
  path?: string;
}

const SocialShareButtons = ({ title, path = window.location.pathname }: SocialShareButtonsProps) => {
  const { toast } = useToast();
  
  const getShareUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}${path}`;
  };
  
  const getEncodedText = () => {
    return encodeURIComponent(`I'm learning about ${title} on LearnFlow! Check it out:`);
  };
  
  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${getEncodedText()}&url=${encodeURIComponent(getShareUrl())}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareUrl())}`
  };
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      toast({
        title: "Link copied!",
        description: "Share link has been copied to clipboard."
      });
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={copyToClipboard} className="cursor-pointer">
          <Share2 className="h-4 w-4 mr-2" /> Copy link
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex w-full items-center">
            <Twitter className="h-4 w-4 mr-2" /> Share on Twitter
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex w-full items-center">
            <Facebook className="h-4 w-4 mr-2" /> Share on Facebook
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex w-full items-center">
            <Linkedin className="h-4 w-4 mr-2" /> Share on LinkedIn
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SocialShareButtons;
