
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MainNavProps extends React.HTMLAttributes<HTMLElement> {}

export function MainNav({ className }: MainNavProps) {
  const location = useLocation();
  const { user } = useAuth();
  const isActive = (path: string) => location.pathname === path;
  const isHomePage = location.pathname === "/" || location.pathname === "/home";

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
        toast.error("Failed to sign out. Please try again.");
        return;
      }
      toast.success("Successfully signed out");
      closeMobileMenu();
      navigate("/auth");
    } catch (err) {
      console.error("Exception during sign out:", err);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <div className="p-1.5 bg-gradient-to-br from-brand-purple to-brand-pink rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="hidden font-bold sm:inline-block">
              LearnFlow
            </span>
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
            <Link
              to="/why-free"
              className={cn(
                "transition-colors hover:text-foreground/80",
                isActive("/why-free")
                  ? "text-foreground font-semibold"
                  : "text-foreground/60"
              )}
            >
              Why Free?
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
                <Link
                  to="/projects"
                  className="flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-secondary"
                  onClick={closeMobileMenu}
                >
                  <User className="h-5 w-5 text-brand-purple" />
                  <span>Projects</span>
                </Link>
                <Link
                  to="/why-free"
                  className="flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-secondary"
                  onClick={closeMobileMenu}
                >
                  <HelpCircle className="h-5 w-5 text-brand-purple" />
                  <span>Why Free?</span>
                </Link>
                {user && (
                  <Button
                    variant="outline"
                    className="w-full mt-3"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
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
