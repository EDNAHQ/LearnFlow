import React from 'react';
import { motion } from 'framer-motion';
import { Topic } from './TopicExploration';
import JourneyLoadingAnimation from '../JourneyLoadingAnimation';

export interface Skill {
  id: string;
  name: string;
  description: string;
  level: 'foundational' | 'core' | 'advanced';
  estimatedTime: string;
  prerequisites: string[];
  outcomes: string[];
  selected?: boolean;
}

interface SkillBreakdownProps {
  skills: Skill[];
  topic: Topic | null;
  onSelectSkills: (skills: Skill[]) => void;
  selectedSkills: Skill[];
  isLoading: boolean;
}

const SkillBreakdown: React.FC<SkillBreakdownProps> = ({
  skills,
  topic,
  onSelectSkills,
  selectedSkills,
  isLoading
}) => {
  const toggleSkill = (skill: Skill) => {
    const isSelected = selectedSkills.some(s => s.id === skill.id);
    if (isSelected) {
      onSelectSkills(selectedSkills.filter(s => s.id !== skill.id));
    } else {
      onSelectSkills([...selectedSkills, skill]);
    }
  };

  const selectAllByLevel = (level: string) => {
    const levelSkills = skills.filter(s => s.level === level);
    const allSelected = levelSkills.every(s => selectedSkills.some(sel => sel.id === s.id));

    if (allSelected) {
      onSelectSkills(selectedSkills.filter(s => !levelSkills.some(ls => ls.id === s.id)));
    } else {
      const newSkills = [...selectedSkills];
      levelSkills.forEach(skill => {
        if (!newSkills.some(s => s.id === skill.id)) {
          newSkills.push(skill);
        }
      });
      onSelectSkills(newSkills);
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'foundational':
        return 'Foundational Skills';
      case 'core':
        return 'Core Skills';
      case 'advanced':
        return 'Advanced Skills';
      default:
        return level;
    }
  };

  const getLevelDescription = (level: string) => {
    switch (level) {
      case 'foundational':
        return 'Essential basics to get started';
      case 'core':
        return 'Key skills for practical application';
      case 'advanced':
        return 'Expert-level mastery';
      default:
        return '';
    }
  };

  const getTotalTime = () => {
    const totalHours = selectedSkills.reduce((acc, skill) => {
      const match = skill.estimatedTime.match(/(\d+)/);
      return acc + (match ? parseInt(match[1]) : 0);
    }, 0);
    return `~${totalHours} hours total`;
  };

  if (isLoading) {
    return (
      <JourneyLoadingAnimation
        message="Building your skill roadmap"
        subMessage="Creating a personalized learning path based on your topic..."
      />
    );
  }

  if (!skills || skills.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60">No skills available yet. Please go back and select a topic.</p>
      </div>
    );
  }

  const groupedSkills = {
    foundational: skills.filter(s => s.level === 'foundational'),
    core: skills.filter(s => s.level === 'core'),
    advanced: skills.filter(s => s.level === 'advanced')
  };

  return (
    <div className="space-y-6">
      {/* Topic Context */}
      {topic && (
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <h4 className="text-sm text-white/60 mb-1">Learning Path for</h4>
          <p className="text-white font-semibold">{topic.title}</p>
        </div>
      )}

      {/* Selection Summary */}
      {selectedSkills.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
          <span className="text-sm text-white/80">
            {selectedSkills.length} skills selected
          </span>
          <span className="text-sm text-white/60">{getTotalTime()}</span>
        </div>
      )}

      {/* Skill Levels */}
      <div className="space-y-8">
        {Object.entries(groupedSkills).map(([level, levelSkills]) => {
          if (levelSkills.length === 0) return null;

          const allSelected = levelSkills.every(s => selectedSkills.some(sel => sel.id === s.id));

          return (
            <div key={level} className="space-y-4">
              {/* Level Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {getLevelLabel(level)}
                  </h3>
                  <p className="text-xs text-white/40 mt-1">
                    {getLevelDescription(level)}
                  </p>
                </div>
                <button
                  onClick={() => selectAllByLevel(level)}
                  className={`text-xs px-4 py-1.5 rounded-full border transition-all ${
                    allSelected
                      ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                      : 'border-white/20 text-white/80 hover:bg-white/5'
                  }`}
                >
                  {allSelected ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {/* Skills in this level */}
              <div className="grid grid-cols-1 gap-3">
                {levelSkills.map((skill, index) => {
                  const isSelected = selectedSkills.some(s => s.id === skill.id);

                  return (
                    <motion.button
                      key={skill.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => toggleSkill(skill)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-white/30 bg-white/5'
                          : 'border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-white flex-1 pr-4">{skill.name}</h4>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-white/40">
                            {skill.estimatedTime}
                          </span>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 bg-white rounded-full"
                            />
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-white/60 mb-3">{skill.description}</p>

                      {/* Prerequisites */}
                      {skill.prerequisites.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs text-white/40 mb-1">Prerequisites</p>
                          <div className="flex flex-wrap gap-1">
                            {skill.prerequisites.map((prereq) => (
                              <span key={prereq} className="text-xs px-2 py-0.5 bg-white/5 text-white/50 rounded">
                                {prereq}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Outcomes */}
                      <div className="text-xs text-white/40">
                        You'll be able to: {skill.outcomes[0]}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tip */}
      <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
        <p className="text-sm text-white/80 font-medium mb-1">Smart Selection</p>
        <p className="text-xs text-white/60">
          We recommend starting with foundational skills. You can always add more advanced skills as you progress!
        </p>
      </div>
    </div>
  );
};

export default SkillBreakdown;