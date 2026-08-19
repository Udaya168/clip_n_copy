import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useLocation,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";

import { CartDrawer } from "@/components/CartDrawer";
import { ShopProvider } from "@/lib/shop-store";
import { AuthProvider } from "@/lib/auth-store";
import { Toaster } from "@/components/ui/sonner";
import { ScrollToTop } from "@/components/ScrollToTop";

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
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  
  useEffect(() => {


    const isChunkLoadError = 
      error.name === 'ChunkLoadError' || 
      (error.message && (
        error.message.includes('Failed to fetch dynamically imported module') ||
        error.message.includes('Importing a module script failed') ||
        error.message.includes('loading chunk')
      ));

    if (isChunkLoadError) {
      const reloadKey = `chunk_reload_${window.location.pathname}`;
      const hasReloaded = sessionStorage.getItem(reloadKey);
      
      if (!hasReloaded) {
        sessionStorage.setItem(reloadKey, 'true');
        window.location.reload();
      } else {
        sessionStorage.removeItem(reloadKey);
      }
    }
  }, [error]);

  const handleTryAgain = () => {
    const isChunkLoadError = 
      error.name === 'ChunkLoadError' || 
      (error.message && (
        error.message.includes('Failed to fetch dynamically imported module') ||
        error.message.includes('Importing a module script failed') ||
        error.message.includes('loading chunk')
      ));

    if (isChunkLoadError) {
      window.location.reload();
    } else {
      router.invalidate();
      reset();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={handleTryAgain}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Clip N Copy — Stationery & Printing in Bengaluru" },
      {
        name: "description",
        content:
          "Shop stationery, school and office supplies from Clip N Copy, Kundalahalli. Printing, photocopy and binding with same-day delivery.",
      },
      { name: "author", content: "Clip N Copy" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap",
      },
      { rel: "icon", href: "/favicon.webp", type: "image/png" },
      { rel: "shortcut icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();
  const pathname = location.pathname.toLowerCase();

  const isHome = pathname === "/";
  // This covers /admin, /admin/*, /admin-portal, /admin-portal/*
  const isAdmin = pathname.startsWith("/admin");
  const isLogin = pathname === "/login";
  const isCheckout = pathname === "/checkout";
  const isStore = pathname === "/store";
  const hideStorefrontNavigation = isAdmin || isLogin || isCheckout || isStore;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ShopProvider>
          <ScrollToTop />
          <div className="flex flex-col min-h-[100dvh]">
            <main className="flex-1 flex flex-col min-h-0">
              {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
              <Outlet />
            </main>
          </div>
          {!hideStorefrontNavigation && <CartDrawer />}
          <Toaster position="bottom-right" />
        </ShopProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
