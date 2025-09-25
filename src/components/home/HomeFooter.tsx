
import React from 'react';

export const HomeFooter = () => {
  return (
    <footer className="border-t border-border/40">
      <div className="max-w-[2000px] mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gradient">LearnFlow</span>
          </div>
          
          <div className="flex items-center gap-8">
            <a href="https://enterprisedna.co/" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              About
            </a>
            <a href="https://enterprisedna.co/pricing" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Pricing
            </a>
            <a
              href="https://github.com/EDNAHQ/LearnFlow"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              aria-label="GitHub Repository"
            >
              <img
                src="/github-icon-1-logo.webp"
                alt="GitHub"
                className="h-4 w-4 object-contain"
              />
              <span>GitHub</span>
            </a>
          </div>
        </div>
        
        <div className="mt-8 text-center md:text-left">
          <p className="text-sm text-muted-foreground">
            © 2024 LearnFlow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
