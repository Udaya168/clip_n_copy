import { useState, useEffect, useCallback } from "react";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar, AdminTab } from "./AdminSidebar";
import { DashboardOverview } from "./DashboardOverview";
import { InventoryManagement } from "./InventoryManagement";
import { ProductManagement } from "./ProductManagement";
import { OrderManagement } from "./OrderManagement";
import { RejectOrderModal } from "./RejectOrderModal";
import { fetchSupabaseProducts, SupabaseProduct, mapSupabaseProduct } from "@/lib/supabase-products";
import { setProductsCache } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { acceptOrderInDb, rejectOrderInDb } from "@/lib/orders-store";
import { triggerOrderAcceptanceEmail, triggerOrderRejectionEmail } from "@/lib/order-email-service";
import { AdminSettingsStoreStatusCard } from "./AdminSettingsStoreStatusCard";
import { Sliders, ShieldCheck, BellRing, VolumeX, Eye, X, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { AdminNotificationProvider, useAdminNotifications } from "@/lib/admin-notification-context";
import { inr } from "@/lib/shop-store";
import { toast } from "sonner";

import { NewOrderAlertModal } from "./NewOrderAlertModal";

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
  const [isAccepting, setIsAccepting] = useState<boolean>(false);
  const [rejectModalOpen, setRejectModalOpen] = useState<boolean>(false);

  const {
    activeAlarm,
    stopAlarm,
    latestNotification,
    acknowledgeNotification,
    permissionStatus,
    requestNotificationPermission,
  } = useAdminNotifications();

  const handleAcceptOrder = async () => {
    if (!latestNotification || isAccepting) return;
    setIsAccepting(true);
    try {
      const ok = await acceptOrderInDb(latestNotification.orderId);
      if (ok) {
        stopAlarm();
        triggerOrderAcceptanceEmail(latestNotification.orderId, latestNotification.orderNumber);
        acknowledgeNotification(latestNotification.id);
        toast.success(`Order #${latestNotification.orderNumber} accepted successfully!`);
      } else {
        toast.error("Failed to update order status.");
      }
    } catch (err) {
      toast.error("Error accepting order.");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleConfirmRejectOrder = async (reason: string) => {
    if (!latestNotification) return;
    try {
      const ok = await rejectOrderInDb(latestNotification.orderId, reason);
      if (ok) {
        stopAlarm();
        triggerOrderRejectionEmail(latestNotification.orderId, latestNotification.orderNumber, reason);
        acknowledgeNotification(latestNotification.id);
        toast.error(`Order #${latestNotification.orderNumber} rejected.`);
      } else {
        toast.error("Failed to update order status.");
      }
    } catch (err) {
      toast.error("Error rejecting order.");
    }
  };

  const loadAdminProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("products").select("*").order("name");

      if (error) {
        console.error("Supabase admin fetch error:", error);
      }

      if (data && data.length > 0) {
        const rawItems = (data as SupabaseProduct[]).filter((p) => {
          const n = (p.name || "").toLowerCase().trim();
          const c = (p.category || "").toLowerCase();
          const id = (p.id || "").toLowerCase();
          return !(
            c === "books" ||
            n.includes("python") ||
            n.includes("data structure") ||
            n.includes("data sturcture") ||
            n.includes("engineering math") ||
            n.includes("engineering mathematics") ||
            n.includes("exam guide") ||
            n.includes("competitive") ||
            n.includes("robotics") ||
            n.includes("mini stapler") ||
            id.includes("mini-stapler") ||
            n.includes("oil pastel set") ||
            (n.includes("oil pastel") && n.includes("24")) ||
            id.includes("oil-pastel")
          );
        });
        setProducts(rawItems);
        const mapped = rawItems.map(mapSupabaseProduct);
        setProductsCache(mapped);
      } else {
        const fallbackList = await fetchSupabaseProducts();
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

        {/* PROMINENT REAL-TIME NEW ORDER MODAL */}
        <NewOrderAlertModal
          notification={latestNotification && (!latestNotification.acknowledged || activeAlarm) ? latestNotification : null}
          activeAlarm={activeAlarm}
          isAccepting={isAccepting}
          onAcceptOrder={handleAcceptOrder}
          onRejectOrder={() => setRejectModalOpen(true)}
          onStopAlarm={stopAlarm}
          onDismiss={() => latestNotification && acknowledgeNotification(latestNotification.id)}
        />

        <RejectOrderModal
          orderId={latestNotification?.orderId ?? null}
          orderNumber={latestNotification?.orderNumber ?? null}
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          onConfirmReject={handleConfirmRejectOrder}
        />

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
            <div className="space-y-6 max-w-4xl">
              <AdminSettingsStoreStatusCard />

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
