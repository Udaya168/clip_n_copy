import { useState, useEffect, useCallback } from "react";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar, AdminTab } from "./AdminSidebar";
import { DashboardOverview } from "./DashboardOverview";
import { InventoryManagement } from "./InventoryManagement";
import { ProductManagement } from "./ProductManagement";
import { OrderManagement } from "./OrderManagement";
import { fetchSupabaseProducts, SupabaseProduct, mapSupabaseProduct } from "@/lib/supabase-products";
import { setProductsCache } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { Sliders, ShieldCheck, BellRing, VolumeX, Eye, X } from "lucide-react";
import { AdminNotificationProvider, useAdminNotifications } from "@/lib/admin-notification-context";
import { inr } from "@/lib/shop-store";

export function AdminLayout() {
  return (
    <AdminNotificationProvider>
      <AdminLayoutInner />
    </AdminNotificationProvider>
  );
}

function AdminLayoutInner() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [products, setProducts] = useState<SupabaseProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    activeAlarm,
    stopAlarm,
    latestNotification,
    acknowledgeNotification,
    permissionStatus,
    requestNotificationPermission,
  } = useAdminNotifications();

  const loadAdminProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch fresh raw products from Supabase
      const { data, error } = await supabase.from("products").select("*").order("name");

      if (error) {
        console.error("Supabase admin fetch error:", error);
      }

      if (data && data.length > 0) {
        const rawItems = data as SupabaseProduct[];
        setProducts(rawItems);
        // Requirement 15: Re-sync user-side catalog cache
        const mapped = rawItems.map(mapSupabaseProduct);
        setProductsCache(mapped);
      } else {
        const fallbackList = await fetchSupabaseProducts();
        // Convert mapped fallback back to SupabaseProduct structure for admin UI
        setProducts(
          fallbackList.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description ?? null,
            category: p.category,
            brand: p.brand,
            price: p.price,
            original_price: p.mrp > p.price ? p.mrp : null,
            stock: p.stock,
            image_url: p.image,
            rating: p.rating,
            review_count: p.reviews,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load products in admin:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminProducts();
  }, [loadAdminProducts]);

  // Scroll to top when tab changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [activeTab]);

  const titles: Record<AdminTab, string> = {
    dashboard: "Dashboard Overview",
    inventory: "Inventory Management",
    products: "Product Catalog",
    orders: "Order Management",
    settings: "Admin Settings",
  };

  const handleSelectOrderFromHeader = (_orderId: string) => {
    setActiveTab("orders");
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-secondary/30 overflow-x-hidden">
      {/* Admin Sidebar */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <AdminHeader title={titles[activeTab]} onSelectOrder={handleSelectOrderFromHeader} />

        {/* PROMINENT REAL-TIME NEW ORDER BANNER */}
        {latestNotification && (!latestNotification.acknowledged || activeAlarm) && (
          <div className="mx-4 mt-4 md:mx-8 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/15 via-primary/10 to-card p-4 shadow-lg animate-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shrink-0 shadow-md animate-bounce">
                  <BellRing className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-extrabold uppercase tracking-wider text-primary">
                      🔔 New Order Received!
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-extrabold text-[10px]">
                      JUST NOW
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-foreground font-bold">
                    Order #{latestNotification.orderNumber} — {latestNotification.customerName} {latestNotification.customerPhone ? `(${latestNotification.customerPhone})` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                    Total: <span className="text-primary font-black">{inr(latestNotification.totalAmount)}</span> ({latestNotification.itemsCount} {latestNotification.itemsCount === 1 ? "item" : "items"})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {activeAlarm && (
                  <button
                    type="button"
                    onClick={stopAlarm}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-bold transition-all cursor-pointer border border-border"
                  >
                    <VolumeX className="size-3.5" /> Stop Alarm
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    acknowledgeNotification(latestNotification.id);
                    setActiveTab("orders");
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  <Eye className="size-3.5" /> View Order Details
                </button>
                <button
                  type="button"
                  onClick={() => acknowledgeNotification(latestNotification.id)}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg"
                  title="Dismiss notification"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 md:p-8">
          {activeTab === "dashboard" && (
            <DashboardOverview
              products={products}
              loading={loading}
              onRefresh={loadAdminProducts}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "inventory" && (
            <InventoryManagement
              products={products}
              loading={loading}
              onRefresh={loadAdminProducts}
            />
          )}

          {activeTab === "products" && (
            <ProductManagement
              products={products}
              loading={loading}
              onRefresh={loadAdminProducts}
            />
          )}

          {activeTab === "orders" && <OrderManagement />}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-border bg-background p-6 shadow-soft">
                <h2 className="font-display text-xl font-bold flex items-center gap-2">
                  <Sliders className="size-5 text-primary" /> Admin Settings & Configuration
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Configuration panel for Clip N Copy store administration.
                </p>

                <div className="mt-6 space-y-4 max-w-xl">
                  <div className="rounded-2xl border border-border bg-secondary/40 p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-foreground">Real-Time Order Notifications</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Web Audio Alarm, Instant Toast Banners & Browser Push Notifications
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={requestNotificationPermission}
                      className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer"
                    >
                      {permissionStatus === "granted" ? "Notifications Enabled" : "Enable Push Alerts"}
                    </button>
                  </div>

                  <div className="rounded-2xl border border-border bg-secondary/40 p-4">
                    <p className="text-xs font-bold text-foreground">Role Level Security (RLS)</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Admin mutations (INSERT, UPDATE, DELETE on products) are restricted to authenticated profiles with <code className="font-mono text-primary font-bold">role = 'admin'</code>.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-secondary/40 p-4">
                    <p className="text-xs font-bold text-foreground">Store Syncing</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Stock adjustments and product additions synchronize immediately with Supabase and flush local React Query cache.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-secondary/40 p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-foreground">Admin Session Status</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                        Authenticated & Authorized
                      </p>
                    </div>
                    <ShieldCheck className="size-6 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
