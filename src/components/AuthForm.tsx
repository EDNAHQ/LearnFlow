
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, Lock } from "lucide-react";

type AuthMode = "signin" | "signup" | "forgot";

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<AuthMode>("signin");
  const [loading, setLoading] = useState(false);
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
        
        setSuccess("Check your email to verify your account");
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });

        if (error) throw error;
        
        setSuccess("Check your email for password reset instructions");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        setSuccess("Welcome back!");
      }
    } catch (error: any) {
      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "signup": return "Get Started";
      case "forgot": return "Reset Password";
      default: return "Welcome Back";
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case "signup": return "Create your account";
      case "forgot": return "Enter your email to reset your password";
      default: return "Sign in to continue";
    }
  };

  const getButtonText = () => {
    if (loading) {
      switch (mode) {
        case "signup": return "Creating account...";
        case "forgot": return "Sending reset email...";
        default: return "Signing in...";
      }
    }
    switch (mode) {
      case "signup": return "Create Account";
      case "forgot": return "Send Reset Email";
      default: return "Sign In";
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {getTitle()}
        </h2>
        <p className="text-gray-600">
          {getSubtitle()}
        </p>
      </div>
      
      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {success}
        </div>
      )}
      
      {/* Form */}
      <form onSubmit={handleAuth} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="pl-10 h-12"
            />
          </div>
        </div>

        {mode !== "forgot" && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                minLength={6}
                className="pl-10 h-12"
              />
            </div>
          </div>
        )}

        {mode === "signin" && (
          <div className="text-right">
            <button
              type="button"
              onClick={() => setMode("forgot")}
              className="text-sm text-brand-purple hover:text-brand-purple/80 transition-colors"
            >
              Forgot your password?
            </button>
          </div>
        )}

        <Button 
          type="submit" 
          variant="brand" 
          className="w-full h-12 text-base font-semibold" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {getButtonText()}
            </>
          ) : (
            getButtonText()
          )}
        </Button>
      </form>

      {/* Mode Toggle */}
      <div className="mt-8 text-center">
        {mode === "forgot" ? (
          <p className="text-sm text-gray-600">
            Remember your password?{" "}
            <button
              onClick={() => setMode("signin")}
              className="text-brand-purple hover:text-brand-purple/80 font-semibold transition-colors"
              type="button"
            >
              Sign In
            </button>
          </p>
        ) : (
          <p className="text-sm text-gray-600">
            {mode === "signin" ? "New here? " : "Have an account? "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-brand-purple hover:text-brand-purple/80 font-semibold transition-colors"
              type="button"
            >
              {mode === "signin" ? "Sign Up" : "Sign In"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
