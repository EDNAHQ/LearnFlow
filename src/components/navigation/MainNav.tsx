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
import { useAuth } from "@/hooks/auth";
import { cn } from "@/lib/utils";
import {
  Menu,
  Sparkles,
  User,
  UserCircle,
} from "lucide-react";
import { UserNav } from "@/components/navigation";

interface MainNavProps extends React.HTMLAttributes<HTMLElement> {}

export function MainNav({ className }: MainNavProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();
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

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-2 flex md:hidden">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-black bg-gradient-to-r from-[#6654f5] via-[#ca5a8b] to-[#f2b347] bg-clip-text text-transparent tracking-tight">
              LearnFlow
            </span>
          </Link>
        </div>
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center">
            <div className="flex flex-col">
              <span className="text-3xl font-black bg-gradient-to-r from-[#6654f5] via-[#ca5a8b] to-[#f2b347] bg-clip-text text-transparent tracking-tight">
                LearnFlow
              </span>
              <span className="text-[11px] font-semibold text-foreground/60 tracking-wide uppercase">
                by Enterprise DNA
              </span>
            </div>
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-4 md:space-x-8">
          <nav className="hidden md:flex items-center space-x-6 text-base font-medium">
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
              to="/community"
              className={cn(
                "transition-colors hover:text-foreground/80",
                isActive("/community")
                  ? "text-foreground font-semibold"
                  : "text-foreground/60"
              )}
            >
              Community
            </Link>
            <a
              href="https://builders.enterprisedna.co/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              EDNA Builders
            </a>
            {!user && (
              <a
                href="https://enterprisedna.co/pricing"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Pricing
              </a>
            )}
          </nav>
          {user ? (
            <UserNav />
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/sign-in")}
                className="border-2 border-[#6654f5] text-[#6654f5] rounded-full px-5 py-2.5 bg-white hover:bg-white/90 text-sm md:text-base"
              >
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/sign-up")}
                className="brand-gradient text-white rounded-full px-5 py-2.5 shadow hover:opacity-90 text-sm md:text-base"
              >
                Sign Up
              </Button>
            </div>
          )}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="mr-2 p-3 md:hidden"
                onClick={toggleMobileMenu}
              >
                <Menu className="h-6 w-6" />
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
                  <span className="text-2xl font-black bg-gradient-to-r from-[#6654f5] via-[#ca5a8b] to-[#f2b347] bg-clip-text text-transparent tracking-tight">
                    LearnFlow
                  </span>
                  <span className="text-[10px] font-semibold text-foreground/60 tracking-wide uppercase mt-1">
                    by Enterprise DNA
                  </span>
                </div>
                {user && (
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-secondary"
                    onClick={closeMobileMenu}
                  >
                    <UserCircle className="h-6 w-6 text-brand-purple" />
                    <span>My Profile</span>
                  </Link>
                )}
                <Link
                  to="/projects"
                  className="flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-secondary"
                  onClick={closeMobileMenu}
                >
                  <User className="h-6 w-6 text-brand-purple" />
                  <span>Projects</span>
                </Link>
                <Link
                  to="/community"
                  className="flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-secondary"
                  onClick={closeMobileMenu}
                >
                  <span className="text-brand-purple font-semibold text-sm">C</span>
                  <span>Community</span>
                </Link>
                <a
                  href="https://builders.enterprisedna.co/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-secondary"
                  onClick={closeMobileMenu}
                >
                  <span className="text-brand-purple font-semibold text-sm">B</span>
                  <span>EDNA Builders</span>
                </a>
                {!user && (
                  <a
                    href="https://enterprisedna.co/pricing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-secondary"
                    onClick={closeMobileMenu}
                  >
                    <Sparkles className="h-6 w-6 text-brand-purple" />
                    <span>Pricing</span>
                  </a>
                )}
                {!user && (
                  <div className="flex items-center gap-3 px-4 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        navigate("/sign-in");
                        closeMobileMenu();
                      }}
                    >
                      Sign In
                    </Button>
                    <Button
                      className="flex-1 brand-gradient text-white"
                      onClick={() => {
                        navigate("/sign-up");
                        closeMobileMenu();
                      }}
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
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



