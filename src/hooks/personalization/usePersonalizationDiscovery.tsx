import { useState, useCallback, useRef } from 'react';
import { DiscoveryType } from '@/components/personalization/PersonalizationDiscovery';

interface DiscoveryMessage {
  id: string;
  type: DiscoveryType;
  message: string;
  detail?: string;
  timestamp: number;
}

interface UsePersonalizationDiscoveryReturn {
  showDiscovery: (type: DiscoveryType, message: string, detail?: string) => void;
  currentDiscovery: DiscoveryMessage | null;
  dismissDiscovery: () => void;
}

// Track which discoveries we've shown to avoid spam
const shownDiscoveries = new Set<string>();
const DISCOVERY_COOLDOWN = 30000; // 30 seconds between same type

export const usePersonalizationDiscovery = (): UsePersonalizationDiscoveryReturn => {
  const [currentDiscovery, setCurrentDiscovery] = useState<DiscoveryMessage | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const dismissDiscovery = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setCurrentDiscovery(null);
  }, []);

  const showDiscovery = useCallback(
    (type: DiscoveryType, message: string, detail?: string) => {
      // Create a unique key for this discovery
      const discoveryKey = `${type}-${message.substring(0, 30)}`;
      
      // Check if we've shown this recently
      if (shownDiscoveries.has(discoveryKey)) {
        return;
      }

      // Mark as shown
      shownDiscoveries.add(discoveryKey);
      
      // Remove from set after cooldown
      setTimeout(() => {
        shownDiscoveries.delete(discoveryKey);
      }, DISCOVERY_COOLDOWN);

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Dismiss current discovery if showing
      if (currentDiscovery) {
        dismissDiscovery();
        // Wait a bit before showing new one
        setTimeout(() => {
          const newDiscovery: DiscoveryMessage = {
            id: `${Date.now()}-${Math.random()}`,
            type,
            message,
            detail,
            timestamp: Date.now(),
          };
          setCurrentDiscovery(newDiscovery);
          
          // Auto-dismiss after 5 seconds
          timeoutRef.current = setTimeout(() => {
            dismissDiscovery();
          }, 5000);
        }, 300);
      } else {
        const newDiscovery: DiscoveryMessage = {
          id: `${Date.now()}-${Math.random()}`,
          type,
          message,
          detail,
          timestamp: Date.now(),
        };
        setCurrentDiscovery(newDiscovery);
        
        // Auto-dismiss after 5 seconds
        timeoutRef.current = setTimeout(() => {
          dismissDiscovery();
        }, 5000);
      }
    },
    [currentDiscovery, dismissDiscovery]
  );

  return {
    showDiscovery,
    currentDiscovery,
    dismissDiscovery,
  };
};

