
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function UserNav() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="bg-learn-100 h-8 w-8 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-learn-600" />
        </div>
        <span className="text-sm hidden md:inline-block">
          {user.email?.split('@')[0]}
        </span>
      </div>
      
      <Button 
        variant="ghost" 
        size="icon"
        onClick={handleSignOut}
        title="Sign out"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
