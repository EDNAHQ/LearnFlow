
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { UserNav } from "@/components/UserNav";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles } from "lucide-react";

export function MainNav() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navItems = [
    { name: "Projects", path: "/projects" },
  ];

  return (
    <header className="nav-light sticky top-0 z-40">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/home" className="logo-container">
              <div className="logo-bg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="logo-text">LearnFlow</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="ml-8 hidden md:flex space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    location.pathname === item.path 
                      ? "text-white bg-[#6D42EF]" 
                      : "text-gray-700 hover:text-[#6D42EF] hover:bg-gray-100"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center">
            <UserNav />
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden ml-2 text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pb-4 bg-white border-b border-gray-200">
          <nav className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === item.path 
                    ? "text-white bg-[#6D42EF]" 
                    : "text-gray-700 hover:text-[#6D42EF] hover:bg-gray-100"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
