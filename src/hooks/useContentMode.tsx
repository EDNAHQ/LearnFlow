
import { createContext, useContext, useState } from "react";

export type ContentMode = "text" | "slides" | "podcast" | "audio";

interface ContentModeContextType {
  mode: ContentMode;
  setMode: (mode: ContentMode) => void;
}

const ContentModeContext = createContext<ContentModeContextType | undefined>(undefined);

export const ContentModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<ContentMode>("text");

  return (
    <ContentModeContext.Provider value={{ mode, setMode }}>
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
