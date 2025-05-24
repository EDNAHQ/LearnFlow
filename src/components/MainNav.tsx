
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  Menu,
  Sparkles,
  Github,
  User,
  HelpCircle,
  LogOut,
  Brain,
} from "lucide-react";
import { UserNav } from "@/components/UserNav";

interface MainNavProps extends React.HTMLAttributes<HTMLElement> {}

export function MainNav({ className }: MainNavProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const isActive = (path: string) => location.pathname === path;
  const isHomePage = location.pathname === "/home";

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/home" className="mr-6 flex items-center">
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-gradient-to-br from-brand-purple to-brand-pink rounded-lg flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <span className="hidden font-bold sm:inline-block">
                  LearnFlow
                </span>
              </div>
              <span className="hidden text-xs text-foreground/60 sm:inline-block ml-7">
                by Enterprise DNA
              </span>
            </div>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/projects"
              className={cn(
                "transition-colors hover:text-foreground/80",
                isActive("/projects")
                  ? "text-foreground font-semibold"
                  : "text-foreground/60"
              )}
            >
              Projects
            </Link>
          </nav>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          {user ? (
            <UserNav />
          ) : (
            <Button size="sm" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          )}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="mr-2 p-2 md:hidden"
                onClick={toggleMobileMenu}
              >
                <Menu className="h-4 w-4" />
                <span className="sr-only">Open sidebar</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-sm">
              <SheetHeader className="text-left">
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>
                  Navigate through LearnFlow
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4">
                <div className="flex flex-col mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-gradient-to-br from-brand-purple to-brand-pink rounded-lg flex items-center justify-center">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold">LearnFlow</span>
                  </div>
                  <span className="text-xs text-foreground/60 ml-7">
                    by Enterprise DNA
                  </span>
                </div>
                <Link
                  to="/projects"
                  className="flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-secondary"
                  onClick={closeMobileMenu}
                >
                  <User className="h-5 w-5 text-brand-purple" />
                  <span>Projects</span>
                </Link>
                {user && (
                  <Button
                    variant="outline"
                    className="w-full mt-3"
                    onClick={() => {
                      signOut();
                      closeMobileMenu();
                    }}
                  >
                    Logout
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
