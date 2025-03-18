
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/theme-provider";
import { ContentModeProvider } from "@/hooks/useContentMode";
import HomePage from "./pages/HomePage";
import PlanPage from "./pages/PlanPage";
import ContentPage from "./pages/ContentPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import ProjectsPage from "./pages/ProjectsPage";
import WhyFreePage from "./pages/WhyFreePage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import PodcastPage from "./pages/PodcastPage";
import AudioPage from "./pages/AudioPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <ContentModeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="w-full min-w-full h-full">
                <Routes>
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/" element={<HomePage />} />
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/plan" element={<ProtectedRoute><PlanPage /></ProtectedRoute>} />
                  
                  {/* Content routes */}
                  <Route path="/content/:pathId" element={<ProtectedRoute><ContentPage /></ProtectedRoute>} />
                  <Route path="/content/:pathId/step/:stepId" element={<ProtectedRoute><ContentPage /></ProtectedRoute>} />
                  
                  {/* Dedicated routes for podcast and audio */}
                  <Route path="/podcast/:pathId" element={<ProtectedRoute><ContentPage initialMode="podcast" /></ProtectedRoute>} />
                  <Route path="/audio/:pathId" element={<ProtectedRoute><ContentPage initialMode="audio" /></ProtectedRoute>} />
                  
                  <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
                  <Route path="/why-free" element={<WhyFreePage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </ContentModeProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
