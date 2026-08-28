import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import "./styles.css";

import { CartDrawer } from "@/components/CartDrawer";
import { ShopProvider } from "@/lib/shop-store";
import { AuthProvider } from "@/lib/auth-store";
import { Toaster } from "@/components/ui/sonner";
import { ScrollToTop } from "@/components/ScrollToTop";

// Page Imports
import IndexPage from "@/routes/index";
import AdminPage from "@/routes/admin";
import CheckoutPage from "@/routes/checkout";
import LoginPage from "@/routes/login";
import SignupPage from "@/routes/signup";
import ShopPage from "@/routes/shop";
import ProductDetailsPage from "@/routes/product.$id";
import AccountPage from "@/routes/account";
import StorePage from "@/routes/store";
import ContactPage from "@/routes/contact";
import HelpPage from "@/routes/help";
import OffersPage from "@/routes/offers";
import ServicesPage from "@/routes/services";
import WishlistPage from "@/routes/wishlist";
import OrdersPage from "@/routes/orders";
import TrackOrderPage from "@/routes/track-order";
import ReturnsPage from "@/routes/returns";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-black text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const pathname = location.pathname.toLowerCase();

  const isHome = pathname === "/";
  const isAdmin = pathname.startsWith("/admin");
  const isLogin = pathname === "/login";
  const isCheckout = pathname === "/checkout";
  const isStore = pathname === "/store";
  const hideStorefrontNavigation = isAdmin || isLogin || isCheckout || isStore;

  // Add global head elements
  useEffect(() => {
    document.title = "Clip N Copy — Stationery & Printing in Bengaluru";
  }, []);

  return (
    <AuthProvider>
      <ShopProvider>
        <ScrollToTop />
        <div className="flex flex-col min-h-[100dvh]">
          <main className="flex-1 flex flex-col min-h-0">
            <Routes>
              <Route path="/" element={<IndexPage />} />
              <Route path="/admin/*" element={<AdminPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/product/:id" element={<ProductDetailsPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/store" element={<StorePage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/offers" element={<OffersPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/track-order" element={<TrackOrderPage />} />
              <Route path="/returns" element={<ReturnsPage />} />
              <Route path="*" element={<NotFoundComponent />} />
            </Routes>
          </main>
        </div>
        {!hideStorefrontNavigation && <CartDrawer />}
        <Toaster position="bottom-right" />
      </ShopProvider>
    </AuthProvider>
  );
}
