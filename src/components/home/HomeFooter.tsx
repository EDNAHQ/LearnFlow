
import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, LucideGithub } from "lucide-react";

const HomeFooter = () => {
  return (
    <footer className="w-full bg-gray-900 text-white py-16 relative overflow-hidden">
      {/* Footer pattern - simplified for cleaner look */}
      <div className="absolute inset-0 opacity-3 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="url(#grid)" />
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 0 10 L 50 10 M 10 0 L 10 50" 
                    stroke="#fff" strokeWidth="0.3" fill="none" />
            </pattern>
          </defs>
        </svg>
      </div>
      
      <div className="container relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div className="flex items-center mb-6 md:mb-0">
            <div className="bg-brand-purple rounded-lg w-12 h-12 flex items-center justify-center shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold ml-3">LearnFlow</span>
          </div>
          
          <div className="flex space-x-6 items-center">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <LucideGithub className="h-6 w-6" />
            </a>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 mb-4 md:mb-0">
            LearnFlow © {new Date().getFullYear()} • AI-Powered Learning Platform
          </p>
          <div className="flex space-x-8">
            <Link to="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
            <Link to="#" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
