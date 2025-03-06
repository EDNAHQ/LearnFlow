
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  Menu,
  Sparkles,
  Github,
  Moon,
  Sun,
  User,
  HelpCircle,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";

interface MainNavProps extends React.HTMLAttributes<HTMLElement> {}

export function MainNav({ className }: MainNavProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const isActive = (path: string) => location.pathname === path;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { setTheme } = useTheme();

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
          <Link to="/home" className="mr-6 flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-brand-purple" />
            <span className="hidden font-bold sm:inline-block">
              LearnFlow
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/home"
              className={cn(
                "transition-colors hover:text-foreground/80",
                isActive("/home")
                  ? "text-foreground font-semibold"
                  : "text-foreground/60"
              )}
            >
              Home
            </Link>
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
              to="/podcast"
              className={cn(
                "transition-colors hover:text-foreground/80",
                isActive("/podcast")
                  ? "text-foreground font-semibold"
                  : "text-foreground/60"
              )}
            >
              Podcast Creator
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"))
            }
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url as string} />
                    <AvatarFallback>
                      {user?.user_metadata?.name
                        ?.slice(0, 2)
                        .toUpperCase() || "XX"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <div className="text-sm font-medium leading-none">
                    {user?.user_metadata?.name}
                  </div>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate("/projects")} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Projects</span>
                  <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate("/why-free")} className="cursor-pointer">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Why is this free?</span>
                  <DropdownMenuShortcut>⌘?</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <Github className="mr-2 h-4 w-4" />
                  <span>Github</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                  <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                  to="/home"
                  className="flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-secondary"
                  onClick={closeMobileMenu}
                >
                  <Sparkles className="h-5 w-5 text-brand-purple" />
                  <span>Home</span>
                </Link>
                <Link
                  to="/projects"
                  className="flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-secondary"
                  onClick={closeMobileMenu}
                >
                  <User className="h-5 w-5 text-brand-purple" />
                  <span>Projects</span>
                </Link>
                <Link
                  to="/podcast"
                  className="flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-secondary"
                  onClick={closeMobileMenu}
                >
                  <User className="h-5 w-5 text-brand-purple" />
                  <span>Podcast Creator</span>
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
