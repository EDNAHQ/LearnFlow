import React from "react";

interface WaveFlowProps {
  className?: string;
  intensity?: "subtle" | "medium" | "strong";
}

/**
 * WaveFlow - Subtle flowing wave animation using brand colors
 * Perfect for background animations during content generation
 */
export const WaveFlow: React.FC<WaveFlowProps> = ({ 
  className = "", 
  intensity = "subtle" 
}) => {
  // Opacity based on intensity
  const opacityMap = {
    subtle: "opacity-[0.08]",
    medium: "opacity-[0.15]",
    strong: "opacity-[0.25]",
  };

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Wave 1 - Purple to Pink */}
      <svg
        className={`absolute inset-0 w-[200%] h-full wave-flow-1 ${opacityMap[intensity]}`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="waveGradient1-flow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6654f5" />
            <stop offset="100%" stopColor="#ca5a8b" />
          </linearGradient>
        </defs>
        <path
          d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          fill="url(#waveGradient1-flow)"
        />
      </svg>
      
      {/* Wave 2 - Pink to Gold */}
      <svg
        className={`absolute inset-0 w-[200%] h-full wave-flow-2 ${opacityMap[intensity]}`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="waveGradient2-flow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ca5a8b" />
            <stop offset="100%" stopColor="#f2b347" />
          </linearGradient>
        </defs>
        <path
          d="M0,192L48,197.3C96,203,192,213,288,213.3C384,213,480,203,576,186.7C672,171,768,149,864,154.7C960,160,1056,192,1152,197.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          fill="url(#waveGradient2-flow)"
        />
      </svg>
      
      {/* Wave 3 - Gold to Purple */}
      <svg
        className={`absolute inset-0 w-[200%] h-full wave-flow-3 ${opacityMap[intensity]}`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="waveGradient3-flow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f2b347" />
            <stop offset="100%" stopColor="#6654f5" />
          </linearGradient>
        </defs>
        <path
          d="M0,256L48,245.3C96,235,192,213,288,208C384,203,480,213,576,218.7C672,224,768,224,864,213.3C960,203,1056,181,1152,181.3C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          fill="url(#waveGradient3-flow)"
        />
      </svg>
    </div>
  );
};

