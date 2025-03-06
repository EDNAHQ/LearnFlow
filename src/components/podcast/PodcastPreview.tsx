
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PodcastPreviewProps {
  podcastUrl: string;
  onDownload: () => void;
}

const PodcastPreview = ({ podcastUrl, onDownload }: PodcastPreviewProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-6">
      <CheckCircle className="h-8 w-8 text-green-500 mb-4" />
      <h3 className="text-xl font-medium text-center mb-2">Your Podcast is Ready!</h3>
      <p className="text-gray-500 text-center mb-6">
        Listen to your AI-generated podcast below or download it for later.
      </p>
      
      <audio 
        controls 
        src={podcastUrl} 
        className="w-full max-w-md mb-6 rounded-lg"
      >
        Your browser does not support the audio element.
      </audio>
      
      <div className="flex gap-3">
        <a 
          href={podcastUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          Open in New Tab
        </a>
        
        <Button variant="outline" onClick={onDownload}>
          Download MP3
        </Button>
      </div>
    </div>
  );
};

export default PodcastPreview;
