import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SplashScreen from "@/components/SplashScreen";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AdminProvider } from "@/context/AdminContext";
import { AuthProvider } from "@/context/AuthContext";

// SpeedRush Pages
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
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import Orders from "./pages/Orders";
import BecomePartner from "./pages/BecomePartner";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminStores from "./pages/admin/AdminStores";
import AdminRiders from "./pages/admin/AdminRiders";
import AdminRiderApprovals from "./pages/admin/AdminRiderApprovals";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSubaccounts from "./pages/admin/AdminSubaccounts";
import AdminPartnerApplications from "./pages/admin/AdminPartnerApplications";
import AdminWhatsApp from "./pages/admin/AdminWhatsApp";

// Rider Pages
import RiderEarnings from "./pages/rider/RiderEarnings";
import RiderDelivery from "./pages/rider/RiderDelivery";

// Configure React Query with retry and error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 5, // 5 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 401/403 errors
        if (error instanceof Error && error.message.includes('401')) return false;
        if (error instanceof Error && error.message.includes('403')) return false;
        // Retry up to 3 times for other errors
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
    const isAdminRoute = window.location.pathname.startsWith('/admin');
    if (hasVisited || isAdminRoute) {
      setShowSplash(false);
      setIsFirstVisit(false);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem('hasVisited', 'true');
  };

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <AdminProvider>
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
                  <Route path="/auth" element={<CustomerAuth />} />
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
                  
                  {/* Shared Routes (Bottom Nav) */}
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
                  <Route path="/rider/delivery/:orderId" element={<RiderDelivery />} />
                  
                  {/* Admin Routes - Access via /admin */}
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/orders" element={<AdminOrders />} />
                  <Route path="/admin/stores" element={<AdminStores />} />
                  <Route path="/admin/riders" element={<AdminRiders />} />
                  <Route path="/admin/rider-approvals" element={<AdminRiderApprovals />} />
                  <Route path="/admin/subaccounts" element={<AdminSubaccounts />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/pricing" element={<AdminPricing />} />
                  <Route path="/admin/settings" element={<AdminSettings />} />
                  <Route path="/admin/analytics" element={<AdminAnalytics />} />
                  <Route path="/admin/partner-applications" element={<AdminPartnerApplications />} />
                  <Route path="/admin/whatsapp" element={<AdminWhatsApp />} />
                  
                  {/* Fallback */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </AdminProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
