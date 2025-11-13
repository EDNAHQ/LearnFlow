import React from 'react';
import { motion } from 'framer-motion';
import { interestCategories } from '../journey/steps/InterestDiscovery';

interface FloatingCategoryCardsProps {
  onCategorySelect: (categoryId: string) => void;
}

export const FloatingCategoryCards: React.FC<FloatingCategoryCardsProps> = ({
  onCategorySelect
}) => {
  // Orbital positions - cards scattered around the hero in a visually interesting way
  const cardPositions = [
    // Top right cluster
    { top: '10%', right: '5%', rotate: 8, scale: 0.9 },
    { top: '5%', right: '20%', rotate: -5, scale: 0.85 },

    // Right side scattered
    { top: '35%', right: '3%', rotate: 12, scale: 1 },
    { top: '55%', right: '8%', rotate: -8, scale: 0.88 },

    // Bottom right
    { bottom: '15%', right: '10%', rotate: 6, scale: 0.92 },

    // Bottom left
    { bottom: '10%', left: '8%', rotate: -10, scale: 0.9 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {interestCategories.map((category, index) => {
        const position = cardPositions[index];
        const isLeft = 'left' in position;

        return (
          <motion.div
            key={category.id}
            className="absolute pointer-events-auto"
            style={{
              ...position,
              width: '280px',
            }}
            initial={{
              opacity: 0,
              scale: 0,
              rotate: position.rotate + 20,
            }}
            animate={{
              opacity: 1,
              scale: position.scale,
              rotate: position.rotate,
              y: [0, -10, 0],
            }}
            transition={{
              opacity: { duration: 0.6, delay: 0.2 + index * 0.1 },
              scale: { duration: 0.6, delay: 0.2 + index * 0.1, type: "spring" },
              rotate: { duration: 0.6, delay: 0.2 + index * 0.1 },
              y: {
                duration: 3 + index * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.2,
              }
            }}
            whileHover={{
              scale: (position.scale || 1) * 1.08,
              rotate: 0,
              zIndex: 50,
              transition: { duration: 0.2 }
            }}
          >
            <motion.button
              onClick={() => onCategorySelect(category.id)}
              className="w-full p-4 bg-white/95 backdrop-blur-xl border-2 border-white/60 rounded-2xl text-left shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] transition-all duration-300 group overflow-hidden"
            >
              {/* Gradient glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-[#6654f5]/20 via-[#ca5a8b]/20 to-[#f2b347]/20 blur-xl" />
              </div>

              {/* Content */}
              <div className="relative z-10">
                {/* Icon + Title Row */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6654f5] to-[#ca5a8b] flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
                    {category.title.charAt(0)}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-gradient transition-all leading-tight">
                    {category.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-xs font-light text-gray-600 mb-3 leading-snug line-clamp-2">
                  {category.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {category.examples.slice(0, 2).map((example, idx) => {
                    const colors = [
                      'bg-[#6654f5] text-white',
                      'bg-[#ca5a8b] text-white',
                    ];
                    return (
                      <span
                        key={example}
                        className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${colors[idx]} shadow-sm`}
                      >
                        {example}
                      </span>
                    );
                  })}
                </div>

                {/* Arrow indicator */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1">
                  <svg
                    className="w-5 h-5 text-[#6654f5]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>

              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[length:20px_20px]" />
            </motion.button>
          </motion.div>
        );
      })}
    </div>
  );
};

export default FloatingCategoryCards;
