import React, { Suspense, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoadingSpinner } from "./components/ui/loading-spinner";
import { validateConfig } from "./config/environment";

// Lazy load pages for code splitting
const HomePage = React.lazy(() => import("./pages/HomePage").then(module => ({ default: module.HomePage })));
const AuthPage = React.lazy(() => import("./pages/AuthPage").then(module => ({ default: module.AuthPage })));
const CategoryPage = React.lazy(() => import("./pages/CategoryPage").then(module => ({ default: module.CategoryPage })));
const ChatPage = React.lazy(() => import("./pages/ChatPage").then(module => ({ default: module.ChatPage })));
const VoicePage = React.lazy(() => import("./pages/VoicePage").then(module => ({ default: module.VoicePage })));
const NotFound = React.lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <LoadingSpinner size="lg" text="جاري تحميل الصفحة..." />
  </div>
);

const App = () => {
  useEffect(() => {
    try {
      validateConfig();
    } catch (error) {
      console.error('Configuration validation failed:', error);
    }
  }, []);

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/auth" element={<AuthPage />} />
                  
                  {/* Protected routes */}
                  <Route 
                    path="/" 
                    element={
                      <ProtectedRoute>
                        <HomePage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/category/:categoryId" 
                    element={
                      <ProtectedRoute>
                        <CategoryPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/chat/:agentId" 
                    element={
                      <ProtectedRoute>
                        <ChatPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/voice/:agentId" 
                    element={
                      <ProtectedRoute>
                        <VoicePage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Catch-all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;
