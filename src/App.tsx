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

// SpeedUp Pages
import LandingPage from "./pages/LandingPage";
import CustomerAuth from "./pages/auth/CustomerAuth";
import RiderAuth from "./pages/auth/RiderAuth";
import CustomerHome from "./pages/customer/CustomerHome";
import BookDelivery from "./pages/customer/BookDelivery";
import StoreCheckout from "./pages/customer/StoreCheckout";
import TrackDelivery from "./pages/customer/TrackDelivery";
import StorePage from "./pages/customer/StorePage";
import Wallet from "./pages/customer/Wallet";
import Referral from "./pages/customer/Referral";
import Notifications from "./pages/customer/Notifications";
import RiderDashboard from "./pages/rider/RiderDashboard";
import RiderProfile from "./pages/rider/RiderProfile";
import RiderHistory from "./pages/rider/RiderHistory";
import RiderBids from "./pages/rider/RiderBids";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import Orders from "./pages/Orders";
import BecomePartner from "./pages/BecomePartner";
import NotFound from "./pages/NotFound";
import CampusAmbassador from "./pages/CampusAmbassador";

// Ambassador Pages
import AmbassadorAuth from "./pages/auth/AmbassadorAuth";
import AmbassadorDashboard from "./pages/ambassador/AmbassadorDashboard";
import AmbassadorReferrals from "./pages/ambassador/AmbassadorReferrals";
import AmbassadorEarnings from "./pages/ambassador/AmbassadorEarnings";
import AmbassadorLeaderboard from "./pages/ambassador/AmbassadorLeaderboard";
import AmbassadorResources from "./pages/ambassador/AmbassadorResources";
import AmbassadorProfile from "./pages/ambassador/AmbassadorProfile";

// Rider Pages
import RiderEarnings from "./pages/rider/RiderEarnings";
import RiderDelivery from "./pages/rider/RiderDelivery";

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
    // Initialize native UI plugins (status bar, splash screen, keyboard)
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
                <Route path="/become-partner" element={<BecomePartner />} />
                <Route path="/campus-ambassador" element={<CampusAmbassador />} />
                <Route path="/campus-tour" element={<CampusT={<CustomerAuth />} />
                <Route path="/login" element={<CustomerAuth />} />
                <Route path="/signup" element={<CustomerAuth />} />
                
                {/* Rider Auth */}
                <Route path="/rider/auth" element={<RiderAuth />} />
                <Route path="/rider/login" element={<RiderAuth />} />
                <Route path="/rider/signup" element={<RiderAuth />} />
                
                {/* Customer Routes */}
                <Route path="/customer" element={<CustomerHome />} />
                <Route path="/customer/home" element={<CustomerHome />} />
                <Route path="/customer/dashboard" element={<CustomerHome />} />
                <Route path="/customer/store/:storeId" element={<StorePage />} />
                <Route path="/customer/store-checkout" element={<StoreCheckout />} />
                <Route path="/customer/book" element={<BookDelivery />} />
                <Route path="/customer/track/:orderId" element={<TrackDelivery />} />
                <Route path="/track/:orderId" element={<TrackDelivery />} />
                <Route path="/customer/wallet" element={<Wallet />} />
                <Route path="/customer/referral" element={<Referral />} />
                <Route path="/customer/orders" element={<Orders />} />
                <Route path="/customer/profile" element={<Profile />} />
                <Route path="/customer/notifications" element={<Notifications />} />
                
                {/* Shared Routes */}
                <Route path="/search" element={<Search />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/profile" element={<Profile />} />
                
                {/* Rider Routes */}
                <Route path="/rider" element={<RiderDashboard />} />
                <Route path="/rider/dashboard" element={<RiderDashboard />} />
                <Route path="/rider/earnings" element={<RiderEarnings />} />
                <Route path="/rider/profile" element={<RiderProfile />} />
                <Route path="/rider/history" element={<RiderHistory />} />
                <Route path="/rider/deliveries" element={<RiderHistory />} />
                <Route path="/rider/bids" element={<RiderBids />} />
                <Route path="/rider/delivery/:orderId" element={<RiderDelivery />} />
                
                {/* Ambassador Routes */}
                <Route path="/ambassador/auth" element={<AmbassadorAuth />} />
                <Route path="/ambassador" element={<AmbassadorDashboard />} />
                <Route path="/ambassador/dashboard" element={<AmbassadorDashboard />} />
                <Route path="/ambassador/referrals" element={<AmbassadorReferrals />} />
                <Route path="/ambassador/earnings" element={<AmbassadorEarnings />} />
                <Route path="/ambassador/leaderboard" element={<AmbassadorLeaderboard />} />
                <Route path="/ambassador/resources" element={<AmbassadorResources />} />
                <Route path="/ambassador/profile" element={<AmbassadorProfile />} />
                <Route path="/ambassador/notifications" element={<Notifications />} />
                
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
