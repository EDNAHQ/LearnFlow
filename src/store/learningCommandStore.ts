import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LearningCommandStore {
  isOpen: boolean;
  isMinimized: boolean;
  input: string;
  recentTopics: string[];
  suggestions: string[];
  isLoading: boolean;

  // Actions
  openWidget: () => void;
  closeWidget: () => void;
  toggleWidget: () => void;
  minimizeWidget: () => void;
  expandWidget: () => void;
  setInput: (input: string) => void;
  addRecentTopic: (topic: string) => void;
  setSuggestions: (suggestions: string[]) => void;
  setLoading: (loading: boolean) => void;
  clearInput: () => void;
}

export const useLearningCommandStore = create<LearningCommandStore>()(
  persist(
    (set) => ({
      isOpen: false,
      isMinimized: true,
      input: '',
      recentTopics: [],
      suggestions: [],
      isLoading: false,

      openWidget: () => set({ isOpen: true, isMinimized: false }),
      closeWidget: () => set({ isOpen: false, isMinimized: true, input: '' }),
      toggleWidget: () => set((state) => ({
        isOpen: !state.isOpen,
        isMinimized: state.isOpen
      })),
      minimizeWidget: () => set({ isMinimized: true }),
      expandWidget: () => set({ isMinimized: false }),
      setInput: (input) => set({ input }),
      addRecentTopic: (topic) => set((state) => ({
        recentTopics: [topic, ...state.recentTopics.filter(t => t !== topic)].slice(0, 5)
      })),
      setSuggestions: (suggestions) => set({ suggestions }),
      setLoading: (loading) => set({ isLoading: loading }),
      clearInput: () => set({ input: '', suggestions: [] }),
    }),
    {
      name: 'learning-command-store',
      partialize: (state) => ({
        recentTopics: state.recentTopics,
        input: state.input
      }),
    }
  )
);