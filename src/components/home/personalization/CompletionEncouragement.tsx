import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useProjects } from '@/hooks/projects/useProjects';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ArrowRight, X, ChevronDown, ChevronUp, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/auth';

const STORAGE_KEY = 'completion-encouragement-dismissed';
const STORAGE_KEY_EXPANDED = 'completion-encouragement-expanded';
const STORAGE_KEY_SHOWN_PROJECTS = 'completion-encouragement-shown-projects';
const STORAGE_KEY_EXCLUDED_PROJECTS = 'completion-encouragement-excluded-projects';
const ROTATION_INTERVAL_DAYS = 3;

export const CompletionEncouragement = () => {
  const { projects } = useProjects();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [excludedProjects, setExcludedProjects] = useState<string[]>([]);
  const lastSelectedIdsRef = useRef<string>('');

  useEffect(() => {
    if (!user) return;
    const dismissed = localStorage.getItem(`${STORAGE_KEY}-${user.id}`) === 'true';
    const expanded = localStorage.getItem(`${STORAGE_KEY_EXPANDED}-${user.id}`) === 'true';
    
    try {
      const excluded = JSON.parse(localStorage.getItem(`${STORAGE_KEY_EXCLUDED_PROJECTS}-${user.id}`) || '[]');
      setExcludedProjects(Array.isArray(excluded) ? excluded : []);
    } catch (e) {
      // Ignore errors
    }
    
    setIsDismissed(dismissed);
    setIsExpanded(expanded);
    setIsCollapsed(!expanded);
  }, [user]);

  const incompleteProjects = useMemo(() => 
    projects.filter(p => 
      !p.is_completed && 
      (p.progress || 0) > 0 &&
      !excludedProjects.includes(p.id)
    ), [projects, excludedProjects]
  );
  
  const completedCount = useMemo(() => 
    projects.filter(p => p.is_completed).length, [projects]
  );
  
  const totalCount = projects.length;

  // Smart project selection - pure function, no side effects
  const topIncomplete = useMemo(() => {
    if (incompleteProjects.length === 0 || !user) return [];
    
    const now = Date.now();
    let recentlyShownIds: string[] = [];
    
    try {
      const shownData = JSON.parse(localStorage.getItem(`${STORAGE_KEY_SHOWN_PROJECTS}-${user.id}`) || '[]');
      if (Array.isArray(shownData)) {
        recentlyShownIds = shownData
          .filter((p: any) => {
            if (p.timestamp) {
              const daysSinceShown = (now - p.timestamp) / (1000 * 60 * 60 * 24);
              return daysSinceShown < ROTATION_INTERVAL_DAYS;
            }
            return false;
          })
          .map((p: any) => p.id);
      }
    } catch (e) {
      // Ignore errors
    }

    const availableProjects = incompleteProjects.filter(p => !recentlyShownIds.includes(p.id));
    const candidates = availableProjects.length >= 3 ? availableProjects : incompleteProjects;

    if (candidates.length === 0) {
      return incompleteProjects
        .sort((a, b) => (b.progress || 0) - (a.progress || 0))
        .slice(0, 3);
    }

    const scoredProjects = candidates.map(project => {
      const progress = project.progress || 0;
      const daysSinceUpdate = project.updated_at 
        ? (now - new Date(project.updated_at).getTime()) / (1000 * 60 * 60 * 24)
        : 999;
      
      let score = progress * 0.4;
      score += Math.max(0, 30 - daysSinceUpdate) * 0.3;
      score += Math.random() * 20;
      
      if (!recentlyShownIds.includes(project.id)) {
        score += 30;
      }
      
      return { project, score };
    });

    return scoredProjects
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.project);
  }, [incompleteProjects, user?.id]);

  // Update localStorage only when selection changes
  useEffect(() => {
    if (!user || topIncomplete.length === 0) return;
    
    const selectedIds = topIncomplete.map(p => p.id).sort().join(',');
    if (selectedIds === lastSelectedIdsRef.current) return;
    
    lastSelectedIdsRef.current = selectedIds;
    const now = Date.now();
    
    try {
      const newShown = topIncomplete.map(p => ({
        id: p.id,
        timestamp: now
      }));
      
      const existingShown = JSON.parse(localStorage.getItem(`${STORAGE_KEY_SHOWN_PROJECTS}-${user.id}`) || '[]');
      const updatedShown = [
        ...existingShown.filter((p: any) => {
          if (p.timestamp) {
            const daysSince = (now - p.timestamp) / (1000 * 60 * 60 * 24);
            return daysSince < 7;
          }
          return false;
        }),
        ...newShown
      ];
      localStorage.setItem(`${STORAGE_KEY_SHOWN_PROJECTS}-${user.id}`, JSON.stringify(updatedShown));
    } catch (e) {
      // Ignore errors
    }
  }, [topIncomplete.map(p => p.id).join(','), user?.id]);

  if (incompleteProjects.length === 0 || totalCount === 0 || isDismissed) {
    return null;
  }

  const handleContinueProject = (projectId: string) => {
    navigate(`/content/${projectId}/step/0`);
  };

  const handleDismiss = () => {
    if (!user) return;
    setIsDismissed(true);
    localStorage.setItem(`${STORAGE_KEY}-${user.id}`, 'true');
  };

  const handleExcludeProject = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    const newExcluded = [...excludedProjects, projectId];
    setExcludedProjects(newExcluded);
    localStorage.setItem(`${STORAGE_KEY_EXCLUDED_PROJECTS}-${user.id}`, JSON.stringify(newExcluded));
  };

  const handleToggleExpand = () => {
    if (!user) return;
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    setIsCollapsed(!newExpanded);
    localStorage.setItem(`${STORAGE_KEY_EXPANDED}-${user.id}`, String(newExpanded));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        {/* Compact Header - Always Visible */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-brand-purple/10 rounded-lg">
              <Target className="w-4 h-4 text-brand-purple" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-[#0b0c18]">
                  {completedCount} of {totalCount} projects completed
                </span>
                {completedCount < 3 && (
                  <span className="text-xs text-brand-pink font-medium">
                    • {3 - completedCount} more for insights
                  </span>
                )}
              </div>
              <button
                onClick={handleToggleExpand}
                className="text-xs text-[#0b0c18]/60 hover:text-brand-purple transition-colors flex items-center gap-1"
              >
                {isCollapsed ? 'Show projects' : 'Hide projects'}
                {isCollapsed ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronUp className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-[#0b0c18]/40 hover:text-[#0b0c18] ml-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                <p className="text-xs text-[#0b0c18]/60 font-light mb-4">
                  Complete projects to unlock better personalization
                </p>
                {topIncomplete.length > 0 && (
                  <div className="space-y-2">
                    {topIncomplete.map((project) => (
                      <motion.div
                        key={project.id}
                        whileHover={{ scale: 1.01 }}
                        className="bg-gray-50 rounded-lg p-3 border border-gray-100 hover:border-brand-purple/30 transition-all cursor-pointer group relative"
                        onClick={() => handleContinueProject(project.id)}
                      >
                        <button
                          onClick={(e) => handleExcludeProject(project.id, e)}
                          className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100 z-10"
                          title="Don't show this project"
                        >
                          <XCircle className="w-3.5 h-3.5 text-[#0b0c18]/40" />
                        </button>
                        <div className="flex items-center justify-between gap-3 pr-6">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-[#0b0c18] mb-1.5 group-hover:text-brand-purple transition-colors truncate">
                              {project.topic}
                            </h4>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                              <div
                                className="bg-gradient-to-r from-brand-purple to-brand-pink h-1.5 rounded-full transition-all"
                                style={{ width: `${project.progress || 0}%` }}
                              />
                            </div>
                            <div className="text-xs text-[#0b0c18]/50">
                              {project.progress || 0}% complete
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2 shrink-0 group-hover:bg-brand-purple/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleContinueProject(project.id);
                            }}
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
