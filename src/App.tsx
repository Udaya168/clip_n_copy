import React, { useEffect, Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import "./styles.css";

import { CartDrawer } from "@/components/CartDrawer";
import { ShopProvider } from "@/lib/shop-store";
import { AuthProvider } from "@/lib/auth-store";
import { Toaster } from "@/components/ui/sonner";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PrintModalManager } from "@/components/PrintModalManager";

// Page Imports (Lazy Loaded)
import IndexPage from "@/routes/index";
const AdminPage = lazy(() => import("@/routes/admin"));
const CheckoutPage = lazy(() => import("@/routes/checkout"));
const LoginPage = lazy(() => import("@/routes/login"));
const SignupPage = lazy(() => import("@/routes/signup"));
const ForgotPasswordPage = lazy(() => import("@/routes/forgot-password"));
const UpdatePasswordPage = lazy(() => import("@/routes/update-password"));
const ShopPage = lazy(() => import("@/routes/shop"));
const ProductDetailsPage = lazy(() => import("@/routes/product.$id"));
const AccountPage = lazy(() => import("@/routes/account"));
const StorePage = lazy(() => import("@/routes/store"));
const ContactPage = lazy(() => import("@/routes/contact"));
const HelpPage = lazy(() => import("@/routes/help"));
const OffersPage = lazy(() => import("@/routes/offers"));
const ServicesPage = lazy(() => import("@/routes/services"));
const WishlistPage = lazy(() => import("@/routes/wishlist"));
const OrdersPage = lazy(() => import("@/routes/orders"));
const TrackOrderPage = lazy(() => import("@/routes/track-order"));
const TermsAndConditionsPage = lazy(() => import("@/routes/terms-and-conditions"));
const PrivacyPolicyPage = lazy(() => import("@/routes/privacy-policy"));

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
  const isAuthPage = isLogin || pathname === "/signup" || pathname === "/forgot-password" || pathname === "/update-password";
  const hideStorefrontNavigation = isAdmin || isAuthPage || isCheckout || isStore;

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
            <Suspense fallback={<div className="flex h-[100dvh] items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
              <Routes>
                <Route path="/" element={<IndexPage />} />
                <Route path="/admin/*" element={<AdminPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/update-password" element={<UpdatePasswordPage />} />
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
                <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="*" element={<NotFoundComponent />} />
              </Routes>
            </Suspense>
          </main>
        </div>
        {!hideStorefrontNavigation && <CartDrawer />}
        <PrintModalManager />
        <Toaster position="bottom-right" />
      </ShopProvider>
    </AuthProvider>
  );
}
