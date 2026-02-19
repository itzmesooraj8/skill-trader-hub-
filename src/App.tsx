import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ProtectedRoute, PublicRoute } from "@/components/ProtectedRoute";

// Lazy load pages for code splitting
const LandingPage = lazy(() => import("./pages/LandingPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const AssessmentPage = lazy(() => import("./pages/AssessmentPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const LabPage = lazy(() => import("./pages/LabPage"));
const ScannerPage = lazy(() => import("./pages/ScannerPage"));
const StrategiesPage = lazy(() => import("./pages/StrategiesPage"));
const AnalysisPage = lazy(() => import("./pages/AnalysisPage"));
const ExtensionPage = lazy(() => import("./pages/ExtensionPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />

                <Route path="/auth" element={
                  <PublicRoute>
                    <AuthPage />
                  </PublicRoute>
                } />

                <Route path="/assessment" element={
                  <ProtectedRoute>
                    <AssessmentPage />
                  </ProtectedRoute>
                } />

                {/* Protected Dashboard Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />

                <Route path="/lab" element={
                  <ProtectedRoute>
                    <LabPage />
                  </ProtectedRoute>
                } />

                {/* Level-Gated Routes */}
                <Route path="/scanner" element={
                  <ProtectedRoute minLevel={3}>
                    <ScannerPage />
                  </ProtectedRoute>
                } />

                <Route path="/strategies" element={
                  <ProtectedRoute>
                    <StrategiesPage />
                  </ProtectedRoute>
                } />

                <Route path="/analysis" element={
                  <ProtectedRoute>
                    <AnalysisPage />
                  </ProtectedRoute>
                } />

                <Route path="/extension" element={
                  <ProtectedRoute>
                    <ExtensionPage />
                  </ProtectedRoute>
                } />

                <Route path="/settings" element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } />



                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;
