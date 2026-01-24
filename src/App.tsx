import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SplashScreen from "@/components/SplashScreen";
import { AdminProvider } from "@/context/AdminContext";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";

// SpeedRush Pages
import LandingPage from "./pages/LandingPage";
import CustomerAuth from "./pages/auth/CustomerAuth";
import RiderAuth from "./pages/auth/RiderAuth";
import CustomerHome from "./pages/customer/CustomerHome";
import BookDelivery from "./pages/customer/BookDelivery";
import TrackDelivery from "./pages/customer/TrackDelivery";
import StorePage from "./pages/customer/StorePage";
import Wallet from "./pages/customer/Wallet";
import Referral from "./pages/customer/Referral";
import RiderDashboard from "./pages/rider/RiderDashboard";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminStores from "./pages/admin/AdminStores";
import AdminRiders from "./pages/admin/AdminRiders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

const queryClient = new QueryClient();

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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
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
                  <Route path="/customer/book" element={<BookDelivery />} />
                  <Route path="/customer/track/:orderId" element={<TrackDelivery />} />
                  <Route path="/customer/wallet" element={<Wallet />} />
                  <Route path="/customer/referral" element={<Referral />} />
                  <Route path="/customer/orders" element={<Orders />} />
                  <Route path="/customer/profile" element={<Profile />} />
                  <Route path="/customer/notifications" element={<Orders />} />
                  
                  {/* Shared Routes (Bottom Nav) */}
                  <Route path="/search" element={<Search />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/profile" element={<Profile />} />
                  
                  {/* Rider Routes */}
                  <Route path="/rider" element={<RiderDashboard />} />
                  <Route path="/rider/dashboard" element={<RiderDashboard />} />
                  <Route path="/rider/profile" element={<Profile />} />
                  <Route path="/rider/earnings" element={<Wallet />} />
                  <Route path="/rider/deliveries" element={<Orders />} />
                  
                  {/* Admin Routes - Access via /admin */}
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/orders" element={<AdminOrders />} />
                  <Route path="/admin/stores" element={<AdminStores />} />
                  <Route path="/admin/riders" element={<AdminRiders />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/pricing" element={<AdminPricing />} />
                  <Route path="/admin/settings" element={<AdminSettings />} />
                  <Route path="/admin/analytics" element={<AdminAnalytics />} />
                  
                  {/* Fallback */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </AdminProvider>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
