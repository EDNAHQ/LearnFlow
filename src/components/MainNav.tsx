
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { UserNav } from "@/components/UserNav";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function MainNav() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navItems = [
    { name: "Home", path: "/home" },
    { name: "Learn", path: "/" },
    { name: "Projects", path: "/projects" },
  ];

  return (
    <header className="border-b border-gray-800 bg-[#1A1A1A] sticky top-0 z-40">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/home" className="flex items-center">
              <div className="relative w-10 h-10 bg-[#6D42EF] rounded-lg flex items-center justify-center mr-2">
                <span className="text-white text-lg font-bold">L</span>
              </div>
              <span className="text-xl font-bold text-white">LearnFlow</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="ml-8 hidden md:flex space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    location.pathname === item.path 
                      ? "text-white bg-gray-800" 
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
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
              className="md:hidden ml-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pb-4 border-b border-gray-800">
          <nav className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === item.path 
                    ? "text-white bg-gray-800" 
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
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
