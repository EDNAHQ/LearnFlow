
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/theme-provider";
import { ContentModeProvider } from "@/hooks/useContentMode";
import Index from "./pages/Index";
import HomePage from "./pages/HomePage";
import PlanPage from "./pages/PlanPage";
import ContentPage from "./pages/ContentPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import ProjectsPage from "./pages/ProjectsPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <ContentModeProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <div className="w-full min-w-full h-full">
                <Routes>
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/" element={<Navigate to="/home" />} />
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/plan" element={<ProtectedRoute><PlanPage /></ProtectedRoute>} />
                  {/* Updated content routes with parameters */}
                  <Route path="/content/:pathId" element={<ProtectedRoute><ContentPage /></ProtectedRoute>} />
                  <Route path="/content/:pathId/step/:stepId" element={<ProtectedRoute><ContentPage /></ProtectedRoute>} />
                  <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
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
