import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";
import Project from "./pages/Project";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import UserOnboarding from "./pages/UserOnboarding";
import Help from "./pages/Help";
import SettingsPage from "./pages/SettingsPage";
import Account from "./pages/Account";
import Welcome from "./pages/Welcome";
import FlashDemo from "./pages/FlashDemo";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider, useToast } from "./contexts/ToastContext";
import PageTransition from "./components/PageTransition";
import CookieConsentBanner from "./components/CookieConsentBanner";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Chargement...</div>;
  if (!user) return <Navigate to="/welcome" />;
  
  if (user.onboarding_completed === 0 && location.pathname !== '/user-onboarding') {
    return <Navigate to="/user-onboarding" />;
  }
  
  if (user.onboarding_completed === 1 && location.pathname === '/user-onboarding') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Chargement...</div>;
  if (!user) return <Navigate to="/welcome" />;
  if (user.role !== 'admin') return <Navigate to="/" />;

  return <>{children}</>;
};

const AnimatedRoutes = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global navigation shortcuts (Alt + Key)
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'h':
            e.preventDefault();
            navigate('/help');
            break;
          case 'p':
            e.preventDefault();
            navigate('/'); // Projects are on home
            break;
          case 'd':
            e.preventDefault();
            navigate('/help');
            break;
          case 's':
            e.preventDefault();
            if (user?.role === 'admin') {
              navigate('/settings');
            } else {
              addToast("Accès réservé aux administrateurs.", "error");
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/welcome" element={<PageTransition><Welcome /></PageTransition>} />
        <Route path="/flash-demo" element={<PageTransition><FlashDemo /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path="/" element={<ProtectedRoute><PageTransition><Home /></PageTransition></ProtectedRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute><PageTransition><Onboarding /></PageTransition></ProtectedRoute>} />
        <Route path="/user-onboarding" element={<ProtectedRoute><PageTransition><UserOnboarding /></PageTransition></ProtectedRoute>} />
        <Route path="/project/:id" element={<PageTransition><Project /></PageTransition>} />
        <Route path="/help" element={<ProtectedRoute><PageTransition><Help /></PageTransition></ProtectedRoute>} />
        <Route path="/settings" element={<AdminRoute><PageTransition><SettingsPage /></PageTransition></AdminRoute>} />
        <Route path="/account" element={<ProtectedRoute><PageTransition><Account /></PageTransition></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AnimatedRoutes />
          <CookieConsentBanner />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
