import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { StoreSection } from "@/components/StoreSection";
import { MyOrdersList } from "@/components/orders/MyOrdersList";
import { useAuth } from "@/lib/auth-store";
import { STORE } from "@/lib/data";
import { User, ShoppingBag, Shield, LogOut, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/store")({
  head: () => ({
    meta: [
      { title: "My Account & Visit Store — Clip N Copy" },
      {
        name: "description",
        content: "View your active orders, real-time tracking, store location, and account details at Clip N Copy, Kundalahalli Bengaluru.",
      },
    ],
  }),
  component: StorePage,
});

function StorePage() {
  const { user, profile, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"orders" | "profile" | "location">("orders");

  const fullName = profile?.full_name || (user?.user_metadata?.["full_name"] as string) || "Customer";

  if (loading) {
    return (
      <div className="section-shell flex min-h-[60vh] items-center justify-center py-16">
        <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-primary" /> Loading account details...
        </div>
      </div>
    );
  }

  // If user is not logged in, render store location page with login button
  if (!user) {
    return (
      <div className="pt-8">
        <div className="section-shell max-w-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-black sm:text-4xl">Visit Clip N Copy</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {STORE.tagline} — school &amp; office stationery, house keeping materials, project binding
                and printing on ITPL Main Road.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-primary px-6 text-xs font-bold text-primary-foreground shadow-glow hover:bg-primary/90"
            >
              Sign In to View My Orders
            </Link>
          </div>
        </div>
        <StoreSection />
      </div>
    );
  }

  // Logged-in user Account & My Orders Dashboard
  return (
    <div className="section-shell py-8 sm:py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Profile Banner */}
        <div className="card-lift rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 shadow-soft sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground font-black text-xl shadow-glow shrink-0">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-black tracking-tight text-foreground truncate">
                  {fullName}
                </h1>
                {role === "admin" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2.5 py-0.5 text-[10px] font-extrabold text-primary shrink-0">
                    <Shield className="size-3" /> Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {role === "admin" && (
              <Button
                onClick={() => navigate({ to: "/admin" })}
                className="rounded-full bg-primary text-xs font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer"
              >
                <Shield className="mr-1.5 size-3.5" /> Admin Portal
              </Button>
            )}
            <Button
              onClick={() => signOut()}
              variant="outline"
              className="rounded-full text-xs font-bold text-destructive hover:bg-destructive/10 border-destructive/20 cursor-pointer"
            >
              <LogOut className="mr-1.5 size-3.5" /> Logout
            </Button>
          </div>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex border-b border-border gap-6 text-sm font-bold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 transition-colors border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "orders"
                ? "border-primary text-primary font-black"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShoppingBag className="size-4" /> My Orders
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 transition-colors border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "profile"
                ? "border-primary text-primary font-black"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="size-4" /> Profile Details
          </button>

          <button
            onClick={() => setActiveTab("location")}
            className={`pb-3 transition-colors border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "location"
                ? "border-primary text-primary font-black"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <MapPin className="size-4" /> Visit Store Location
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === "orders" && <MyOrdersList />}

        {activeTab === "profile" && (
          <div className="card-lift rounded-3xl border border-border bg-background p-6 shadow-soft space-y-6">
            <h3 className="font-display text-lg font-black">Account Details</h3>
            
            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div className="rounded-2xl border border-border bg-secondary/30 p-4 space-y-1">
                <span className="text-muted-foreground uppercase font-extrabold text-[10px]">Full Name</span>
                <p className="text-sm font-bold text-foreground">{fullName}</p>
              </div>

              <div className="rounded-2xl border border-border bg-secondary/30 p-4 space-y-1">
                <span className="text-muted-foreground uppercase font-extrabold text-[10px]">Email Address</span>
                <p className="text-sm font-bold text-foreground">{user.email}</p>
              </div>

              <div className="rounded-2xl border border-border bg-secondary/30 p-4 space-y-1">
                <span className="text-muted-foreground uppercase font-extrabold text-[10px]">Account Role</span>
                <p className="text-sm font-bold text-foreground capitalize">{role || "User"}</p>
              </div>

              <div className="rounded-2xl border border-border bg-secondary/30 p-4 space-y-1">
                <span className="text-muted-foreground uppercase font-extrabold text-[10px]">User ID</span>
                <p className="text-xs font-mono font-bold text-foreground truncate">{user.id}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "location" && <StoreSection />}

      </div>
    </div>
  );
}
