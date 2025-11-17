import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/auth';
import { ContentModeProvider } from './hooks/content';
import { PersonalizationDiscoveryProvider } from './contexts/PersonalizationDiscoveryContext';
import { useEdnaMembership } from './hooks/auth/useEdnaMembership';
import HomePage from './pages/HomePage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import SignUpSuccess from './pages/SignUpSuccess';
import ForgotPassword from './pages/ForgotPassword';
import ProjectsPage from './pages/ProjectsPage';
import PlanPage from './pages/PlanPage';
import ContentPage from './pages/ContentPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import Community from './pages/Community';

function AppContent() {
  const { processAutoSSO } = useEdnaMembership();

  useEffect(() => {
    processAutoSSO();
  }, [processAutoSSO]);

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/signup-success" element={<SignUpSuccess />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth" element={<Navigate to="/sign-in" replace />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/community" element={<Community />} />
        <Route path="/plan" element={<PlanPage />} />
        <Route path="/content/:pathId" element={<ContentPage />} />
        <Route path="/content/:pathId/step/:stepIndex" element={<ContentPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </>
  );
}

export default function App() {
  console.log('App rendering with real HomePage...');

  return (
    <BrowserRouter>
      <AuthProvider>
        <ContentModeProvider>
          <PersonalizationDiscoveryProvider>
            <AppContent />
          </PersonalizationDiscoveryProvider>
        </ContentModeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}