import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AdminProvider, useAdmin } from "@/context/AdminContext";
import SplashScreen from "@/components/SplashScreen";
import Index from "./pages/Index";
import Search from "./pages/Search";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminRiders from "./pages/admin/AdminRiders";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isAdmin } = useAdmin();

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/pricing" element={<AdminPricing />} />
        <Route path="/admin/riders" element={<AdminRiders />} />
        <Route path="*" element={<AdminDashboard />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/search" element={<Search />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

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
        <CartProvider>
          <AdminProvider>
            <Toaster />
            <Sonner position="top-center" />
            
            {showSplash && isFirstVisit && (
              <SplashScreen onComplete={handleSplashComplete} duration={3000} />
            )}
            
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </AdminProvider>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
