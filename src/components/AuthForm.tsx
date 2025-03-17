import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, LogIn, Mail, AlertCircle, Globe } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

type AuthMode = "signin" | "signup";

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<AuthMode>("signin");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        
        toast.success("Account created successfully! Check your email for verification.");
        setSuccess("Sign up successful! Check your email for verification.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        toast.success("Signed in successfully!");
        setSuccess("Signed in successfully!");
      }
    } catch (error: any) {
      const errorMessage = error.message || "Authentication failed";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth'
        }
      });
      
      if (error) throw error;
      
      // No success message needed here as we're redirecting to Google
    } catch (error: any) {
      const errorMessage = error.message || "Google authentication failed";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="glass-panel-strong max-w-md w-full p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {mode === "signin" ? "Sign In" : "Create Account"}
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          {success}
        </div>
      )}
      
      {/* Google Sign In Button */}
      <Button 
        type="button" 
        className="w-full mb-4 bg-white text-gray-800 border border-gray-300 hover:bg-gray-100" 
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
      >
        {googleLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Globe className="mr-2 h-4 w-4" />
            Continue with Google
          </>
        )}
      </Button>
      
      <div className="relative my-6">
        <Separator />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-background px-2 text-xs text-muted-foreground">
            OR
          </span>
        </div>
      </div>
      
      <form onSubmit={handleAuth} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className="pl-9"
            />
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            minLength={6}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-learn-600 hover:bg-learn-700" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === "signin" ? "Signing in..." : "Signing up..."}
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              {mode === "signin" ? "Sign In" : "Sign Up"}
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-learn-600 hover:underline font-medium"
            type="button"
          >
            {mode === "signin" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}
