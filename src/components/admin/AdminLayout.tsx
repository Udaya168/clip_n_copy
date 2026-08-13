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
import { useQueryClient } from "@tanstack/react-query";
import { Sliders, ShieldCheck } from "lucide-react";

export function AdminLayout() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [products, setProducts] = useState<SupabaseProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

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

      // Invalidate React Query cache so storefront updates
      await queryClient.invalidateQueries({ queryKey: ["supabase-products"] });
    } catch (err) {
      console.error("Failed to load products in admin:", err);
    } finally {
      setLoading(false);
    }
  }, [queryClient]);

  useEffect(() => {
    loadAdminProducts();
  }, [loadAdminProducts]);

  const titles: Record<AdminTab, string> = {
    dashboard: "Dashboard Overview",
    inventory: "Inventory Management",
    products: "Product Catalog",
    orders: "Order Management",
    settings: "Admin Settings",
  };

  return (
    <div className="flex min-h-screen bg-secondary/30">
      {/* Admin Sidebar */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <AdminHeader title={titles[activeTab]} />

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
