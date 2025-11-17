import { DiscoveryType } from '@/components/personalization/PersonalizationDiscovery';

interface DiscoveryTrigger {
  type: DiscoveryType;
  message: string;
  detail?: string;
}

export const getDiscoveryForAction = (
  actionType: string,
  metadata?: Record<string, any>
): DiscoveryTrigger | null => {
  // Mode changes
  if (metadata?.modeChange) {
    const modeNames: Record<string, string> = {
      text: 'Reading',
      slides: 'Presentations',
      images: 'Visual',
      podcast: 'Audio',
      chat: 'Chat',
    };
    const toMode = modeNames[metadata.toMode] || metadata.toMode;
    return {
      type: 'preference',
      message: `We noticed you prefer ${toMode} mode!`,
      detail: 'Your LearnFlow profile has been updated with this preference.',
    };
  }

  // Content completion
  if (actionType === 'content_complete') {
    const timeOnContent = metadata?.timeOnContent || metadata?.completionTime || 0;
    const minutes = Math.floor(timeOnContent / 60);
    const seconds = timeOnContent % 60;
    
    if (minutes > 2) {
      return {
        type: 'achievement',
        message: `You spent ${minutes} minute${minutes > 1 ? 's' : ''} on this step!`,
        detail: 'Your deliberate learning pace is being tracked.',
      };
    } else if (minutes > 0) {
      return {
        type: 'achievement',
        message: `Step completed in ${minutes} minute${minutes > 1 ? 's' : ''}!`,
        detail: 'Your learning velocity is being tracked.',
      };
    } else if (seconds > 30) {
      return {
        type: 'achievement',
        message: 'Step completed!',
        detail: 'Your progress has been saved.',
      };
    }
    return null; // Don't show for very quick completions
  }

  // Hint requests
  if (actionType === 'hint_request') {
    return {
      type: 'learning',
      message: 'We see you\'re exploring deeper!',
      detail: 'Your curiosity helps us personalize your learning experience.',
    };
  }

  // Multiple steps completed
  if (actionType === 'content_view' && metadata?.stepCount) {
    const stepCount = metadata.stepCount;
    if (stepCount > 5 && stepCount % 5 === 0) {
      return {
        type: 'achievement',
        message: `You've completed ${stepCount} steps!`,
        detail: 'Keep up the great work!',
      };
    }
  }

  // Navigation patterns
  if (metadata?.navigation === 'minimap') {
    return {
      type: 'pattern',
      message: 'You\'re using the navigation map!',
      detail: 'We\'re learning how you prefer to navigate through content.',
    };
  }

  // Search queries
  if (actionType === 'search' && metadata?.query) {
    return {
      type: 'insight',
      message: 'We\'re tracking your search interests',
      detail: 'This helps us recommend relevant learning paths.',
    };
  }

  // Topic selection
  if (metadata?.topicSelected) {
    return {
      type: 'enhancement',
      message: 'New learning path started!',
      detail: 'Your profile is being enhanced with this topic preference.',
    };
  }

  // First time viewing content
  if (actionType === 'content_view' && metadata?.isFirstView) {
    return {
      type: 'learning',
      message: 'Welcome to this learning step!',
      detail: 'We\'re tracking your progress to personalize your experience.',
    };
  }

  return null;
};

export const getDiscoveryForPrompt = (promptText: string, category?: string): DiscoveryTrigger | null => {
  // Only show for certain types of prompts to avoid spam
  if (category === 'explanation' || category === 'troubleshooting') {
    return {
      type: 'insight',
      message: 'We\'re learning from your questions',
      detail: 'Your prompts help us understand what you want to learn.',
    };
  }

  return null;
};

