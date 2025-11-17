import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { usePersonalizationDiscovery } from '@/hooks/personalization/usePersonalizationDiscovery';
import { DiscoveryType } from '@/components/personalization/PersonalizationDiscovery';
import { PersonalizationDiscovery } from '@/components/personalization/PersonalizationDiscovery';
import { setDiscoveryContext } from '@/hooks/analytics/useBehaviorTracking';
import { setPromptDiscoveryContext } from '@/hooks/analytics/usePromptTracking';

interface PersonalizationDiscoveryContextType {
  showDiscovery: (type: DiscoveryType, message: string, detail?: string) => void;
}

const PersonalizationDiscoveryContext = createContext<PersonalizationDiscoveryContextType | undefined>(undefined);

export const usePersonalizationDiscoveryContext = () => {
  const context = useContext(PersonalizationDiscoveryContext);
  if (!context) {
    throw new Error('usePersonalizationDiscoveryContext must be used within PersonalizationDiscoveryProvider');
  }
  return context;
};

export const PersonalizationDiscoveryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showDiscovery, currentDiscovery, dismissDiscovery } = usePersonalizationDiscovery();

  // Set the discovery context for tracking hooks
  useEffect(() => {
    setDiscoveryContext({ showDiscovery });
    setPromptDiscoveryContext({ showDiscovery });
    return () => {
      setDiscoveryContext(null);
      setPromptDiscoveryContext(null);
    };
  }, [showDiscovery]);

  return (
    <PersonalizationDiscoveryContext.Provider value={{ showDiscovery }}>
      {children}
      {currentDiscovery && (
        <PersonalizationDiscovery
          type={currentDiscovery.type}
          message={currentDiscovery.message}
          detail={currentDiscovery.detail}
          isVisible={true}
          onDismiss={dismissDiscovery}
        />
      )}
    </PersonalizationDiscoveryContext.Provider>
  );
};

