import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster as HotToaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";

// Lazy load pages for better performance
const AuthPage = lazy(() => import("./pages/AuthPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));
const ResultsPage = lazy(() => import("./pages/ResultsPage"));
const ThreadsPage = lazy(() => import("./pages/ThreadsPage"));
const OptionsPage = lazy(() => import("./pages/OptionsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const LandingPageCreationPage = lazy(() => import("./pages/LandingPageCreationPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Configure React Query with better defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Root redirect component
const RootRedirect = () => {
  const { isAuthenticated } = useAuthStore();
  
  // If authenticated, go to dashboard, otherwise show auth page
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <AuthPage />;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<LoadingFallback />}>
        <Routes location={location} key={location.pathname}>
          {/* Root route - shows auth page or redirects to dashboard */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          {/* Protected routes - require authentication */}
          <Route path="/dashboard" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
          <Route path="/threads" element={<ProtectedRoute><ThreadsPage /></ProtectedRoute>} />
          <Route path="/options" element={<ProtectedRoute><OptionsPage /></ProtectedRoute>} />
          <Route path="/landing-creation" element={<ProtectedRoute><LandingPageCreationPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HotToaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1e293b',
              color: '#fff',
              borderRadius: '12px',
              padding: '16px',
            },
          }}
        />
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
