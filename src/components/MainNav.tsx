
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/UserNav";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, LogIn } from "lucide-react";

export function MainNav() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-[#6D42EF] rounded-lg w-7 h-7 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold">LearnFlow</span>
        </Link>
        <nav className="ml-auto flex gap-2 items-center">
          {user ? (
            <UserNav />
          ) : (
            <Button 
              onClick={() => navigate("/auth")}
              className="bg-[#6D42EF] hover:bg-[#5832d8]"
              size="sm"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
