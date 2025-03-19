
import { useState, useEffect, createContext, useContext, ReactNode } from "react";

type ContentMode = "text" | "e-book" | "presentation" | "podcast" | "slides";

interface ContentModeContextProps {
  mode: ContentMode;
  setMode: (mode: ContentMode) => void;
  toggleMode: () => void;
}

const ContentModeContext = createContext<ContentModeContextProps | undefined>(undefined);

export const ContentModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ContentMode>(() => {
    const savedMode = localStorage.getItem("content-mode");
    // Convert any previously saved "audio" mode to "text"
    if (savedMode === "audio") return "text";
    return (savedMode as ContentMode) || "text";
  });

  useEffect(() => {
    localStorage.setItem("content-mode", mode);
  }, [mode]);

  const toggleMode = () => {
    setMode(prev => {
      if (prev === "text" || prev === "e-book") return "slides";
      if (prev === "slides" || prev === "presentation") return "podcast";
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
