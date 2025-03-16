
import React from "react";

interface NuggetIndicatorsProps {
  nuggets: string[];
  currentIndex: number;
  onSelectNugget: (index: number) => void;
}

const NuggetIndicators: React.FC<NuggetIndicatorsProps> = ({ 
  nuggets, 
  currentIndex, 
  onSelectNugget 
}) => {
  return (
    <div className="flex space-x-3 mb-6">
      {nuggets.map((_, index) => (
        <button
          key={index}
          onClick={() => onSelectNugget(index)}
          className={`h-3 transition-all ${
            index === currentIndex 
              ? 'w-6 bg-[#6D42EF] rounded-full' 
              : 'w-3 bg-gray-300 rounded-full hover:bg-gray-400'
          }`}
          aria-label={`Knowledge nugget ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default NuggetIndicators;
