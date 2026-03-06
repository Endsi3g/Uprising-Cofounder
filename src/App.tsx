import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider, useToast } from "./contexts/ToastContext";
import PageTransition from "./components/PageTransition";
import CookieConsentBanner from "./components/CookieConsentBanner";

// Lazy-loaded pages for code splitting
const Home = React.lazy(() => import("./pages/Home"));
const Onboarding = React.lazy(() => import("./pages/Onboarding"));
const Project = React.lazy(() => import("./pages/Project"));
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const UserOnboarding = React.lazy(() => import("./pages/UserOnboarding"));
const Help = React.lazy(() => import("./pages/Help"));
const SettingsPage = React.lazy(() => import("./pages/SettingsPage"));
const Account = React.lazy(() => import("./pages/Account"));
const Documentation = React.lazy(() => import("./pages/Documentation"));
const OurStory = React.lazy(() => import("./pages/OurStory"));
const Welcome = React.lazy(() => import("./pages/Welcome"));
const FlashDemo = React.lazy(() => import("./pages/FlashDemo"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm text-slate-500">Chargement...</span>
    </div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingFallback />;
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

  if (loading) return <LoadingFallback />;
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
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'h':
            e.preventDefault();
            navigate('/help');
            break;
          case 'p':
            e.preventDefault();
            navigate('/');
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
    <Suspense fallback={<LoadingFallback />}>
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
          <Route path="/documentation" element={<PageTransition><Documentation /></PageTransition>} />
          <Route path="/our-story" element={<PageTransition><OurStory /></PageTransition>} />
          {/* Catch-all 404 route */}
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </Suspense>
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
