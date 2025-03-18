
import { createContext, useContext, useState, useMemo } from "react";

export type ContentMode = "text" | "slides" | "podcast" | "audio";

interface ContentModeContextType {
  mode: ContentMode;
  setMode: (mode: ContentMode) => void;
}

const ContentModeContext = createContext<ContentModeContextType | undefined>(undefined);

export const ContentModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<ContentMode>("text");
  
  // Use useMemo to prevent unnecessary context value recreations
  const contextValue = useMemo(() => ({
    mode,
    setMode
  }), [mode]);

  return (
    <ContentModeContext.Provider value={contextValue}>
      {children}
    </ContentModeContext.Provider>
  );
};

export const useContentMode = () => {
  const context = useContext(ContentModeContext);
  
  if (context === undefined) {
    throw new Error("useContentMode must be used within a ContentModeProvider");
  }
  
  return context;
};
