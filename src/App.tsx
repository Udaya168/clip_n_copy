import React, { useEffect, Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import "./styles.css";

import { CartDrawer } from "@/components/CartDrawer";
import { ShopProvider } from "@/lib/shop-store";
import { AuthProvider, useAuth } from "@/lib/auth-store";
import { Toaster } from "@/components/ui/sonner";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PrintModalManager } from "@/components/PrintModalManager";
import { Loader2 } from "lucide-react";

import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { NotFoundPage } from "@/components/errors/NotFoundPage";
import { AccessDeniedPage } from "@/components/errors/AccessDeniedPage";
import { NetworkErrorState } from "@/components/errors/NetworkErrorState";

// Page Imports (Lazy Loaded)
import IndexPage from "@/routes/index";
const AdminPage = lazy(() => import("@/routes/admin"));
const CheckoutPage = lazy(() => import("@/routes/checkout"));
const LoginPage = lazy(() => import("@/routes/login"));
const SignupPage = lazy(() => import("@/routes/signup"));
const VerifyEmailPage = lazy(() => import("@/routes/verify-email"));
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

function GlobalSplashScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white font-sans">
      <div className="flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto">
        <div className="relative mb-6 flex items-center justify-center">
          <div className="absolute -inset-4 rounded-full bg-[#0647E8]/10 animate-ping opacity-75"></div>
          <img
            src="/logo.webp"
            alt="Clip N Copy Logo"
            className="relative h-16 w-auto object-contain drop-shadow-md"
          />
        </div>
        <div className="flex items-center gap-2.5 text-[#0647E8] font-bold text-sm tracking-wide">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading Clip N Copy...</span>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { loading } = useAuth();
  const location = useLocation();
  const pathname = location.pathname.toLowerCase();

  // Show splash loading screen while initial auth & session bootstrap is in progress
  if (loading) {
    return <GlobalSplashScreen />;
  }

  const isHome = pathname === "/";
  const isAdmin = pathname.startsWith("/admin");
  const isLogin = pathname === "/login";
  const isCheckout = pathname === "/checkout";
  const isStore = pathname === "/store";
  const isAuthPage = isLogin || pathname === "/signup" || pathname === "/register" || pathname === "/verify-email" || pathname === "/verify-registration-otp" || pathname === "/forgot-password" || pathname === "/update-password";
  const hideStorefrontNavigation = isAdmin || isAuthPage || isCheckout || isStore;

  return (
    <>
      <div className="flex flex-col min-h-[100dvh]">
        <main className="flex-1 flex flex-col min-h-0">
          <Suspense fallback={<GlobalSplashScreen />}>
            <Routes>
              <Route path="/" element={<IndexPage />} />
              <Route path="/admin/*" element={<AdminPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/register" element={<SignupPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/verify-registration-otp" element={<VerifyEmailPage />} />
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
              <Route path="/403" element={<AccessDeniedPage />} />
              <Route path="/access-denied" element={<AccessDeniedPage />} />
              <Route path="/network-error" element={<NetworkErrorState fullPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
      {!hideStorefrontNavigation && <CartDrawer />}
      <PrintModalManager />
      <Toaster position="bottom-right" />
    </>
  );
}

export default function App() {
  // Add global head elements
  useEffect(() => {
    document.title = "Clip N Copy — Stationery & Printing in Bengaluru";
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ShopProvider>
          <ScrollToTop />
          <AppContent />
        </ShopProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
