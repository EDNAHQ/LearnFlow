
import React from 'react';
import PodcastCreator from '../podcast/PodcastCreator';

interface PodcastModeDisplayProps {
  content: string;
  title: string;
  pathId?: string;
  topic?: string;
}

const PodcastModeDisplay: React.FC<PodcastModeDisplayProps> = ({
  content,
  title,
  pathId,
  topic
}) => {
  return (
    <div>
      <PodcastCreator
        title={title}
        content={content}
        pathId={pathId}
        topic={topic}
      />
    </div>
  );
};

export default PodcastModeDisplay;
