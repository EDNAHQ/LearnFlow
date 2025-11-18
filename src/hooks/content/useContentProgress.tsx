import { useState, useEffect, useCallback, useRef } from 'react';

export interface Section {
  id: string;
  title: string;
  level: number;
  element: HTMLElement | null;
}

interface UseContentProgressProps {
  stepId?: string;
  contentRef: React.RefObject<HTMLDivElement>;
  content: string;
}

export const useContentProgress = ({
  stepId,
  contentRef,
  content,
}: UseContentProgressProps) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Extract sections from markdown content (h2 and h3 headings)
  const extractSections = useCallback((markdownContent: string): Section[] => {
    const sections: Section[] = [];
    const lines = markdownContent.split('\n');
    let currentIndex = 0;

    lines.forEach((line, index) => {
      const h2Match = line.match(/^##\s+(.+)$/);
      const h3Match = line.match(/^###\s+(.+)$/);

      if (h2Match) {
        const title = h2Match[1].trim();
        const id = `section-${title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
        sections.push({
          id,
          title,
          level: 2,
          element: null,
        });
        currentIndex = index;
      } else if (h3Match) {
        const title = h3Match[1].trim();
        const id = `section-${title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
        sections.push({
          id,
          title,
          level: 3,
          element: null,
        });
        currentIndex = index;
      }
    });

    return sections;
  }, []);

  // Update sections when content changes
  useEffect(() => {
    if (!content) return;
    
    const extractedSections = extractSections(content);
    setSections(extractedSections);
  }, [content, extractSections]);

  // Find and attach elements to sections after DOM updates
  useEffect(() => {
    if (!contentRef.current || sections.length === 0) return;

    // Wait for next frame to ensure DOM is updated
    const timeoutId = setTimeout(() => {
      const updatedSections = sections.map(section => {
        // Try to find heading element by text content
        const headings = contentRef.current?.querySelectorAll('h2, h3');
        if (!headings) return section;

        let foundElement: HTMLElement | null = null;
        headings.forEach((heading) => {
          if (heading.textContent?.trim() === section.title) {
            foundElement = heading as HTMLElement;
            // Add ID if not present
            if (!foundElement.id) {
              foundElement.id = section.id;
            }
          }
        });

        return { ...section, element: foundElement };
      });

      setSections(updatedSections);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [sections, contentRef]);

  // Set up IntersectionObserver to track scroll progress
  useEffect(() => {
    if (!contentRef.current || sections.length === 0) return;

    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const completed = new Set<string>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionId = entry.target.id;
          if (!sectionId) return;

          // Mark as complete when 80% of the section is scrolled past
          if (entry.intersectionRatio < 0.2 && entry.boundingClientRect.top < 0) {
            completed.add(sectionId);
          } else {
            completed.delete(sectionId);
          }
        });

        setCompletedSections(new Set(completed));
      },
      {
        root: null,
        rootMargin: '-20% 0px -20% 0px', // Trigger when section is 20% from top/bottom
        threshold: [0, 0.2, 0.5, 0.8, 1],
      }
    );

    // Observe all section elements
    sections.forEach((section) => {
      if (section.element) {
        observerRef.current?.observe(section.element);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [sections, contentRef]);

  // Load progress from localStorage
  useEffect(() => {
    if (!stepId) return;

    try {
      const key = `content-progress-${stepId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const savedSet = new Set(JSON.parse(saved) as string[]);
        setCompletedSections(savedSet);
      }
    } catch (e) {
      console.error('Error loading progress:', e);
    }
  }, [stepId]);

  // Save progress to localStorage
  useEffect(() => {
    if (!stepId || completedSections.size === 0) return;

    try {
      const key = `content-progress-${stepId}`;
      localStorage.setItem(key, JSON.stringify(Array.from(completedSections)));
    } catch (e) {
      console.error('Error saving progress:', e);
    }
  }, [completedSections, stepId]);

  const markSectionComplete = useCallback((sectionId: string) => {
    setCompletedSections(prev => new Set(prev).add(sectionId));
  }, []);

  const getSectionProgress = useCallback((sectionId: string): boolean => {
    return completedSections.has(sectionId);
  }, [completedSections]);

  const scrollToSection = useCallback((sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section?.element) {
      section.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [sections]);

  const progressPercentage = sections.length > 0
    ? (completedSections.size / sections.length) * 100
    : 0;

  return {
    sections,
    completedSections,
    markSectionComplete,
    getSectionProgress,
    scrollToSection,
    progressPercentage,
  };
};

