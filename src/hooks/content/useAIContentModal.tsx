import { useState, useCallback } from "react";
import { AIContentType } from "@/components/content/modals/AIContentModal";

interface AIContentModalState {
  open: boolean;
  title: string;
  subtitle?: string;
  content: string;
  isLoading: boolean;
  error: string | null;
  topic: string;
  widthVariant: "full" | "halfRight";
  contentType: AIContentType;
}

const initialState: AIContentModalState = {
  open: false,
  title: "",
  subtitle: undefined,
  content: "",
  isLoading: false,
  error: null,
  topic: "",
  widthVariant: "full",
  contentType: "insight"
};

export const useAIContentModal = () => {
  const [modalState, setModalState] = useState<AIContentModalState>(initialState);

  const openModal = useCallback((config: Partial<AIContentModalState>) => {
    setModalState({
      ...initialState,
      ...config,
      open: true
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState(initialState);
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setModalState(prev => ({ ...prev, isLoading }));
  }, []);

  const setContent = useCallback((content: string) => {
    setModalState(prev => ({ ...prev, content, isLoading: false, error: null }));
  }, []);

  const setError = useCallback((error: string) => {
    setModalState(prev => ({ ...prev, error, isLoading: false }));
  }, []);

  const updateState = useCallback((updates: Partial<AIContentModalState>) => {
    setModalState(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    modalState,
    openModal,
    closeModal,
    setLoading,
    setContent,
    setError,
    updateState
  };
};