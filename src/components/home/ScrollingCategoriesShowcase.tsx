import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { interestCategories, InterestCategory } from '../journey/steps/InterestDiscovery';

interface ScrollingCategoriesShowcaseProps {
  onCategorySelect: (categoryId: string) => void;
}

export const ScrollingCategoriesShowcase: React.FC<ScrollingCategoriesShowcaseProps> = ({
  onCategorySelect
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = React.useState(false);

  // Duplicate categories for seamless infinite scroll
  const duplicatedCategories = [...interestCategories, ...interestCategories];

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || isPaused) return;

    let scrollPosition = 0;
    const scrollSpeed = 0.4;
    const cardHeight = 140; // adjusted for new staggered layout
    const totalHeight = interestCategories.length * cardHeight;

    const scroll = () => {
      scrollPosition += scrollSpeed;

      if (scrollPosition >= totalHeight) {
        scrollPosition = 0;
      }

      scrollContainer.scrollTop = scrollPosition;
      requestAnimationFrame(scroll);
    };

    const animationFrame = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationFrame);
  }, [isPaused]);

  return (
    <div className="relative h-full overflow-hidden bg-gradient-to-br from-gray-50 to-white">
      {/* Decorative background elements */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-[#6654f5]/5 to-[#ca5a8b]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-40 left-10 w-40 h-40 bg-gradient-to-tr from-[#ca5a8b]/5 to-[#f2b347]/5 rounded-full blur-3xl" />

      {/* Fade gradient at top */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white via-white/80 to-transparent z-10 pointer-events-none" />

      {/* Scrolling container with staggered cards */}
      <div
        ref={scrollRef}
        className="h-full overflow-y-scroll scrollbar-hide py-8"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="space-y-3 px-8">
          {duplicatedCategories.map((category, index) => (
            <CategoryCard
              key={`${category.id}-${index}`}
              category={category}
              onSelect={() => onCategorySelect(category.id)}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Fade gradient at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/80 to-transparent z-10 pointer-events-none" />
    </div>
  );
};

interface CategoryCardProps {
  category: InterestCategory;
  onSelect: () => void;
  index: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onSelect, index }) => {
  // Stagger cards left and right for visual interest
  const isEven = index % 2 === 0;
  const offsetClass = isEven ? 'ml-0 mr-4' : 'ml-4 mr-0';

  // Different gradient backgrounds per card
  const gradients = [
    'from-[#6654f5]/5 to-[#6654f5]/[0.02]', // Blue
    'from-[#ca5a8b]/5 to-[#ca5a8b]/[0.02]', // Pink
    'from-[#f2b347]/5 to-[#f2b347]/[0.02]', // Yellow
  ];
  const gradientClass = gradients[index % gradients.length];

  // Brand colors for tags
  const brandColors = [
    { bg: 'bg-[#6654f5]', text: 'text-white' },
    { bg: 'bg-[#ca5a8b]', text: 'text-white' },
    { bg: 'bg-[#f2b347]', text: 'text-white' },
  ];

  return (
    <motion.button
      initial={{ opacity: 0, x: isEven ? -30 : 30, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{
        delay: index * 0.05,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      onClick={onSelect}
      className={`relative w-full p-5 bg-gradient-to-br ${gradientClass} backdrop-blur-sm border border-white/50 rounded-2xl text-left transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-white group ${offsetClass} overflow-hidden`}
    >
      {/* Animated gradient border effect on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-[#6654f5] via-[#ca5a8b] to-[#f2b347] p-[2px] -z-10">
        <div className={`w-full h-full rounded-2xl bg-gradient-to-br ${gradientClass}`} />
      </div>

      {/* Icon or visual element */}
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-[#6654f5] to-[#ca5a8b] flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
          {category.title.charAt(0)}
        </div>
        <svg
          className="w-5 h-5 text-gray-400 group-hover:text-[#6654f5] transition-all group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </div>

      {/* Category Title */}
      <h3 className="text-base font-medium text-gray-900 mb-2 group-hover:text-gradient transition-all">
        {category.title}
      </h3>

      {/* Description */}
      <p className="text-xs font-light text-gray-600 mb-3 leading-relaxed line-clamp-2">
        {category.description}
      </p>

      {/* Example Tags - Now with solid brand colors */}
      <div className="flex flex-wrap gap-2">
        {category.examples.slice(0, 2).map((example, idx) => {
          const colorScheme = brandColors[idx % brandColors.length];
          return (
            <span
              key={example}
              className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${colorScheme.bg} ${colorScheme.text} shadow-sm`}
            >
              {example}
            </span>
          );
        })}
      </div>
    </motion.button>
  );
};

export default ScrollingCategoriesShowcase;
