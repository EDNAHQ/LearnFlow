import React from 'react';
import { motion } from 'framer-motion';
import JourneyLoadingAnimation from '../JourneyLoadingAnimation';

export interface LearningPlanData {
  title: string;
  description: string;
  totalDuration: string;
  weeklyCommitment: string;
  milestones: {
    week: number;
    title: string;
    description: string;
    tasks: string[];
  }[];
  firstProject: {
    title: string;
    description: string;
    skills: string[];
    estimatedTime: string;
  };
  resources: {
    type: 'video' | 'article' | 'course' | 'documentation';
    title: string;
    url?: string;
    duration?: string;
    free?: boolean;
  }[];
  nextSteps: string[];
}

interface LearningPlanProps {
  plan: LearningPlanData | null;
  isLoading: boolean;
  onStartLearning: () => void;
}

const LearningPlan: React.FC<LearningPlanProps> = ({ plan, isLoading, onStartLearning }) => {
  const getResourceType = (type: string) => {
    switch (type) {
      case 'video':
        return 'Video';
      case 'article':
        return 'Article';
      case 'course':
        return 'Course';
      case 'documentation':
        return 'Docs';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <JourneyLoadingAnimation
        message="Creating your personalized learning plan"
        subMessage="Designing the perfect curriculum just for you..."
      />
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60">No plan available yet. Please complete the previous steps.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Plan Overview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 bg-white/5 rounded-2xl border border-white/10"
      >
        <h3 className="text-xl font-bold text-white mb-2">{plan.title}</h3>
        <p className="text-white/60 mb-4">{plan.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-white/40 mb-1">Duration</p>
            <p className="text-white font-semibold">{plan.totalDuration}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">Weekly</p>
            <p className="text-white font-semibold">{plan.weeklyCommitment}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">Milestones</p>
            <p className="text-white font-semibold">{plan.milestones.length}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">Resources</p>
            <p className="text-white font-semibold">{plan.resources.length}</p>
          </div>
        </div>
      </motion.div>

      {/* First Project */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="p-5 bg-white/5 rounded-xl border border-white/10"
      >
        <h4 className="text-lg font-semibold text-white mb-3">Your First Project</h4>
        <h5 className="text-white font-medium mb-2">{plan.firstProject.title}</h5>
        <p className="text-white/60 text-sm mb-3">{plan.firstProject.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {plan.firstProject.skills.map((skill) => (
              <span key={skill} className="text-xs px-3 py-1 bg-white/5 text-white/50 rounded-full">
                {skill}
              </span>
            ))}
          </div>
          <span className="text-xs text-white/40">
            {plan.firstProject.estimatedTime}
          </span>
        </div>
      </motion.div>

      {/* Learning Milestones */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Your Learning Journey</h4>
        <div className="space-y-4">
          {plan.milestones.map((milestone, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-4"
            >
              {/* Week Number */}
              <div className="flex-shrink-0 w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                <span className="text-sm font-bold text-white/80">W{milestone.week}</span>
              </div>

              {/* Milestone Content */}
              <div className="flex-1 p-4 bg-white/[0.02] rounded-xl border border-white/10">
                <h5 className="font-semibold text-white mb-1">{milestone.title}</h5>
                <p className="text-sm text-white/60 mb-3">{milestone.description}</p>
                <div className="space-y-1">
                  {milestone.tasks.map((task, taskIndex) => (
                    <div key={taskIndex} className="flex items-start gap-2 text-sm text-white/40">
                      <span className="mt-1.5 w-1 h-1 bg-white/40 rounded-full flex-shrink-0" />
                      <span>{task}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Resources */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Recommended Resources</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {plan.resources.map((resource, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="p-3 bg-white/[0.02] rounded-xl border border-white/10"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h5 className="text-sm font-medium text-white mb-1">{resource.title}</h5>
                  <div className="flex items-center gap-3 text-xs text-white/40">
                    <span>{getResourceType(resource.type)}</span>
                    {resource.duration && (
                      <>
                        <span>•</span>
                        <span>{resource.duration}</span>
                      </>
                    )}
                    {resource.free && (
                      <>
                        <span>•</span>
                        <span className="text-green-400">Free</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
        <h5 className="font-medium text-white mb-2">Next Steps</h5>
        <ul className="space-y-2">
          {plan.nextSteps.map((step, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-white/60">
              <span className="mt-1.5 w-1 h-1 bg-white/40 rounded-full flex-shrink-0" />
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 pt-4">
        <button
          onClick={onStartLearning}
          className="flex-1 px-6 py-3 brand-gradient text-white font-medium rounded-full hover:opacity-90 transition-all"
        >
          Start Learning Journey
        </button>
        <button className="px-6 py-3 bg-white/5 text-white/60 font-medium rounded-full hover:bg-white/10 transition-all border border-white/10">
          Save Plan
        </button>
        <button className="px-6 py-3 bg-white/5 text-white/60 font-medium rounded-full hover:bg-white/10 transition-all border border-white/10">
          Share
        </button>
      </div>
    </div>
  );
};

export default LearningPlan;