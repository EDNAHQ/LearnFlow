
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_CACHE_KEY = 'learnflow_auth_session';
const SESSION_CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

function getCachedSession(): { session: Session | null; timestamp: number } | null {
  try {
    const cached = localStorage.getItem(SESSION_CACHE_KEY);
    if (!cached) return null;
    
    const parsed = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid (within timeout)
    if (now - parsed.timestamp < SESSION_CACHE_TIMEOUT && parsed.session) {
      // Verify session has required structure
      if (parsed.session.user && parsed.session.access_token) {
        return parsed;
      }
    }
    
    // Cache expired or invalid, remove it
    localStorage.removeItem(SESSION_CACHE_KEY);
    return null;
  } catch {
    // If deserialization fails, clear cache
    try {
      localStorage.removeItem(SESSION_CACHE_KEY);
    } catch {
      // Ignore cleanup errors
    }
    return null;
  }
}

function setCachedSession(session: Session | null): void {
  try {
    if (session) {
      localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify({
        session,
        timestamp: Date.now(),
      }));
    } else {
      localStorage.removeItem(SESSION_CACHE_KEY);
    }
  } catch {
    // Ignore localStorage errors
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => {
    // Try to get cached session for instant initial render
    const cached = getCachedSession();
    return cached?.session ?? null;
  });
  const [user, setUser] = useState<User | null>(() => {
    // Derive user from cached session
    const cached = getCachedSession();
    return cached?.session?.user ?? null;
  });
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting initial session:", error);
          setCachedSession(null);
          setSession(null);
          setUser(null);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          setCachedSession(session);
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
        setCachedSession(null);
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Check if we have a cached session for immediate display
    const cached = getCachedSession();
    if (cached?.session) {
      // Set loading to false immediately for cached session
      setLoading(false);
      // Verify session in background (don't await)
      getInitialSession();
    } else {
      // No cache, wait for session
      getInitialSession();
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setCachedSession(session);
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setCachedSession(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
