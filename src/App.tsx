import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SplashScreen from "@/components/SplashScreen";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AuthProvider } from "@/context/AuthContext";
import { CountryProvider } from "@/context/CountryContext";
import { initNativeUI } from "@/lib/nativeUI";

// SpeedUp Rider App Pages
import LandingPage from "./pages/LandingPage";
import RiderAuth from "./pages/auth/RiderAuth";
import RiderDashboard from "./pages/rider/RiderDashboard";
import RiderProfile from "./pages/rider/RiderProfile";
import RiderHistory from "./pages/rider/RiderHistory";
import RiderBids from "./pages/rider/RiderBids";
import RiderEarnings from "./pages/rider/RiderEarnings";
import RiderDelivery from "./pages/rider/RiderDelivery";
import NotFound from "./pages/NotFound";

// Configure React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 5,
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes('401')) return false;
        if (error instanceof Error && error.message.includes('403')) return false;
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  useEffect(() => {
    const hasVisited = sessionStorage.getItem('hasVisited');
    if (hasVisited) {
      setShowSplash(false);
      setIsFirstVisit(false);
    }
    initNativeUI();
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem('hasVisited', 'true');
  };

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <CountryProvider>
          <AuthProvider>
            <Toaster />
            <Sonner position="top-center" />
            
            {showSplash && isFirstVisit && (
              <SplashScreen onComplete={handleSplashComplete} duration={3000} />
            )}
            
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                
                {/* Rider Auth */}
                <Route path="/auth" element={<RiderAuth />} />
                <Route path="/login" element={<RiderAuth />} />
                <Route path="/signup" element={<RiderAuth />} />
                <Route path="/rider/auth" element={<RiderAuth />} />
                <Route path="/rider/login" element={<RiderAuth />} />
                <Route path="/rider/signup" element={<RiderAuth />} />
                
                {/* Rider Routes */}
                <Route path="/rider" element={<RiderDashboard />} />
                <Route path="/rider/dashboard" element={<RiderDashboard />} />
                <Route path="/rider/earnings" element={<RiderEarnings />} />
                <Route path="/rider/profile" element={<RiderProfile />} />
                <Route path="/rider/history" element={<RiderHistory />} />
                <Route path="/rider/deliveries" element={<RiderHistory />} />
                <Route path="/rider/bids" element={<RiderBids />} />
                <Route path="/rider/delivery/:orderId" element={<RiderDelivery />} />
                
                {/* Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
          </CountryProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
