
import { useState, useEffect, createContext, useContext, ReactNode } from "react";

type ContentMode = "text" | "slides" | "images" | "podcast" | "chat";

interface ContentModeContextProps {
  mode: ContentMode;
  setMode: (mode: ContentMode) => void;
  toggleMode: () => void;
}

const ContentModeContext = createContext<ContentModeContextProps | undefined>(undefined);

export const ContentModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ContentMode>(() => {
    const savedMode = localStorage.getItem("content-mode");
    // Convert any previously saved modes to valid ones
    if (savedMode === "audio" || savedMode === "e-book") return "text";
    if (savedMode === "presentation") return "slides";
    return (savedMode as ContentMode) || "text";
  });

  useEffect(() => {
    localStorage.setItem("content-mode", mode);
  }, [mode]);

  const toggleMode = () => {
    setMode(prev => {
      if (prev === "text") return "slides";
      if (prev === "slides") return "images";
      if (prev === "images") return "podcast";
      if (prev === "podcast") return "chat";
      return "text";
    });
  };

  return (
    <ContentModeContext.Provider value={{ mode, setMode, toggleMode }}>
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
