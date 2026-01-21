import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SplashScreen from "@/components/SplashScreen";

// SpeedRush Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import CustomerHome from "./pages/customer/CustomerHome";
import BookDelivery from "./pages/customer/BookDelivery";
import TrackDelivery from "./pages/customer/TrackDelivery";
import StorePage from "./pages/customer/StorePage";
import RiderDashboard from "./pages/rider/RiderDashboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  useEffect(() => {
    const hasVisited = sessionStorage.getItem('hasVisited');
    if (hasVisited) {
      setShowSplash(false);
      setIsFirstVisit(false);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem('hasVisited', 'true');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />
        
        {showSplash && isFirstVisit && (
          <SplashScreen onComplete={handleSplashComplete} duration={3000} />
        )}
        
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Customer Routes */}
            <Route path="/customer" element={<CustomerHome />} />
            <Route path="/customer/home" element={<CustomerHome />} />
            <Route path="/customer/dashboard" element={<CustomerHome />} />
            <Route path="/customer/store/:storeId" element={<StorePage />} />
            <Route path="/customer/book" element={<BookDelivery />} />
            <Route path="/customer/track/:orderId" element={<TrackDelivery />} />
            
            {/* Rider Routes */}
            <Route path="/rider" element={<RiderDashboard />} />
            <Route path="/rider/dashboard" element={<RiderDashboard />} />
            
            {/* Profile */}
            <Route path="/profile" element={<Profile />} />
            
            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
