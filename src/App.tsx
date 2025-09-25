import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ContentModeProvider } from './hooks/useContentMode';
import { LearningCommandCenter } from './components/LearningCommandCenter';
import { FloatingNewProjectButton } from './components/FloatingNewProjectButton';
import HomePage from './pages/HomePage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import SignUpSuccess from './pages/SignUpSuccess';
import ForgotPassword from './pages/ForgotPassword';
import ProjectsPage from './pages/ProjectsPage';
import PlanPage from './pages/PlanPage';
import ContentPage from './pages/ContentPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  console.log('App rendering with real HomePage...');

  return (
    <BrowserRouter>
      <AuthProvider>
        <ContentModeProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/signup-success" element={<SignUpSuccess />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth" element={<Navigate to="/sign-in" replace />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/plan" element={<PlanPage />} />
            <Route path="/content/:pathId" element={<ContentPage />} />
            <Route path="/content/:pathId/step/:stepIndex" element={<ContentPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
          <LearningCommandCenter />
          <FloatingNewProjectButton />
        </ContentModeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}