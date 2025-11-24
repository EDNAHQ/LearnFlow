import { useState, useCallback, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EDGE_FUNCTIONS } from '@/integrations/supabase/functions';

export type Mode = "mental_models" | "socratic" | "worked_examples" | "visual_summary" | "active_practice" | "story_mode";

interface UseContentModeToggleProps {
  originalContent: string;
  stepId?: string;
  topic?: string;
  title?: string;
  getSelection?: () => string | null;
}

interface ContentCache {
  [key: string]: string;
}

export const useContentModeToggle = ({
  originalContent,
  stepId,
  topic,
  title,
  getSelection
}: UseContentModeToggleProps) => {
  const [activeModes, setActiveModes] = useState<Mode[]>([]);
  const [contentCache, setContentCache] = useState<ContentCache>({});
  const [loadingModes, setLoadingModes] = useState<Set<Mode>>(new Set());
  const [errors, setErrors] = useState<Record<Mode, string | null>>({} as Record<Mode, string | null>);

  // Load cache from sessionStorage on mount
  useEffect(() => {
    if (!stepId) return;
    
    const cacheKey = `content-cache-${stepId}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as ContentCache;
        setContentCache(parsed);
      }
    } catch (e) {
      console.error('Error loading content cache:', e);
    }
  }, [stepId]);

  // Save cache to sessionStorage when it changes
  useEffect(() => {
    if (!stepId || Object.keys(contentCache).length === 0) return;
    
    const cacheKey = `content-cache-${stepId}`;
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(contentCache));
    } catch (e) {
      console.error('Error saving content cache:', e);
    }
  }, [contentCache, stepId]);

  const getCacheKey = useCallback((mode: Mode) => {
    return `${stepId || 'no-step'}-${mode}-${originalContent.slice(0, 50)}`;
  }, [stepId, originalContent]);

  const fetchTransformedContent = useCallback(async (mode: Mode): Promise<string> => {
    const cacheKey = getCacheKey(mode);
    
    // Check memory cache first
    if (contentCache[cacheKey]) {
      return contentCache[cacheKey];
    }

    // Check sessionStorage
    try {
      if (stepId) {
        const sessionKey = `content-cache-${stepId}`;
        const cached = sessionStorage.getItem(sessionKey);
        if (cached) {
          const parsed = JSON.parse(cached) as ContentCache;
          if (parsed[cacheKey]) {
            setContentCache(prev => ({ ...prev, [cacheKey]: parsed[cacheKey] }));
            return parsed[cacheKey];
          }
        }
      }
    } catch (e) {
      console.error('Error reading sessionStorage:', e);
    }

    // Fetch from API
    setLoadingModes(prev => new Set(prev).add(mode));
    setErrors(prev => ({ ...prev, [mode]: null }));

    try {
      const selection = getSelection ? (getSelection() || "") : "";

      const { data, error: fnError } = await supabase.functions.invoke(EDGE_FUNCTIONS.learningModesTransform, {
        body: {
          mode,
          content: originalContent,
          topic,
          title,
          selection,
        }
      });

      if (fnError) throw fnError;
      
      const transformedContent = data?.content || "";
      
      // Cache the result
      const newCacheKey = getCacheKey(mode);
      setContentCache(prev => ({ ...prev, [newCacheKey]: transformedContent }));
      
      return transformedContent;
    } catch (e: any) {
      const errorMessage = e?.message || "Failed to transform content";
      setErrors(prev => ({ ...prev, [mode]: errorMessage }));
      throw e;
    } finally {
      setLoadingModes(prev => {
        const next = new Set(prev);
        next.delete(mode);
        return next;
      });
    }
  }, [originalContent, topic, title, getSelection, getCacheKey, contentCache, stepId]);

  const toggleMode = useCallback(async (mode: Mode) => {
    const isActive = activeModes[0] === mode;
    
    if (isActive) {
      // Deselect mode - reset to default
      setActiveModes([]);
    } else {
      // Select this mode (replacing any existing selection)
      setActiveModes([mode]);
      
      const cacheKey = getCacheKey(mode);
      if (!contentCache[cacheKey]) {
        try {
          await fetchTransformedContent(mode);
        } catch (e) {
          // Error already set in state
          setActiveModes([]);
        }
      }
    }
  }, [activeModes, contentCache, getCacheKey, fetchTransformedContent]);

  const resetToDefault = useCallback(() => {
    setActiveModes([]);
  }, []);

  // Compute final content based on active mode
  const transformedContent = useMemo(() => {
    if (activeModes.length === 0) {
      return originalContent;
    }

    // Only one mode can be active at a time now
    const activeMode = activeModes[0];
    const cacheKey = getCacheKey(activeMode);
    return contentCache[cacheKey] || originalContent;
  }, [activeModes, contentCache, originalContent, getCacheKey]);

  const isLoading = loadingModes.size > 0;
  const isLoadingMode = useCallback((mode: Mode) => loadingModes.has(mode), [loadingModes]);
  const getError = useCallback((mode: Mode) => errors[mode] || null, [errors]);

  return {
    activeModes,
    transformedContent,
    isLoading,
    isLoadingMode,
    errors,
    getError,
    toggleMode,
    resetToDefault,
  };
};

