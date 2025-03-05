
import { useState, useEffect, createContext, useContext, ReactNode } from "react";

type ContentMode = "e-book" | "presentation";

interface ContentModeContextProps {
  mode: ContentMode;
  setMode: (mode: ContentMode) => void;
  toggleMode: () => void;
}

const ContentModeContext = createContext<ContentModeContextProps | undefined>(undefined);

export const ContentModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ContentMode>(() => {
    // Check localStorage for saved preference
    const savedMode = localStorage.getItem("content-mode");
    return (savedMode as ContentMode) || "e-book";
  });

  useEffect(() => {
    // Save preference to localStorage
    localStorage.setItem("content-mode", mode);
  }, [mode]);

  const toggleMode = () => {
    setMode(prev => prev === "e-book" ? "presentation" : "e-book");
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
