
import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, LucideGithub } from "lucide-react";

const HomeFooter = () => {
  return (
    <footer className="w-full bg-gray-900 text-white py-12 relative overflow-hidden">
      {/* Footer pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="url(#grid)" />
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 0 10 L 40 10 M 10 0 L 10 40" 
                    stroke="#fff" strokeWidth="0.5" fill="none" />
            </pattern>
          </defs>
        </svg>
      </div>
      
      <div className="container relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="flex items-center mb-6 md:mb-0">
            <div className="bg-brand-purple rounded-lg w-10 h-10 flex items-center justify-center shadow-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold ml-2">LearnFlow</span>
          </div>
          
          <div className="flex space-x-6 items-center">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              <LucideGithub className="h-5 w-5" />
            </a>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            LearnFlow © {new Date().getFullYear()} • AI-Powered Learning Platform
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-gray-300 text-sm">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-gray-300 text-sm">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-gray-300 text-sm">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
