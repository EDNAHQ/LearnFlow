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

  const getLevelLabel = (level: string) => level;

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
        <p className="text-gray-600">No skills available yet. Please go back and select a topic.</p>
      </div>
    );
  }

  const groupedSkills = {
    foundational: skills.filter(s => s.level === 'foundational'),
    core: skills.filter(s => s.level === 'core'),
    advanced: skills.filter(s => s.level === 'advanced')
  };

  return (
    <div className="space-y-6 text-gray-900">
      {/* Topic Context */}
      {topic && (
        <div className="p-2">
          <p className="text-sm text-gray-700">{topic.title}</p>
        </div>
      )}

      {/* Selection Summary */}
      {selectedSkills.length > 0 && (
        <div className="text-sm text-gray-600">{selectedSkills.length} selected</div>
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
                <h3 className="text-sm font-medium text-gray-700">{getLevelLabel(level)}</h3>
                <button onClick={() => selectAllByLevel(level)} className="text-xs text-purple-700 hover:underline">
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
                      className={`px-3 py-2 rounded-lg border text-left transition-colors ${
                        isSelected
                          ? 'border-purple-300 bg-purple-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm text-gray-900">{skill.name}</h4>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-purple-500" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SkillBreakdown;