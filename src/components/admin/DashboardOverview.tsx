import { useMemo } from "react";
import { SupabaseProduct } from "@/lib/supabase-products";
import { inr } from "@/lib/shop-store";
import {
  Package,
  Boxes,
  AlertTriangle,
  XCircle,
  IndianRupee,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminTab } from "./AdminSidebar";

interface DashboardOverviewProps {
  products: SupabaseProduct[];
  loading: boolean;
  onRefresh: () => void;
  setActiveTab: (tab: AdminTab) => void;
}

export function DashboardOverview({
  products,
  loading,
  onRefresh,
  setActiveTab,
}: DashboardOverviewProps) {
  const metrics = useMemo(() => {
    let totalProducts = products.length;
    let totalStockUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalInventoryValue = 0;

    const lowStockItems: SupabaseProduct[] = [];
    const outOfStockItems: SupabaseProduct[] = [];

    products.forEach((p) => {
      const stock = typeof p.stock === "number" ? Math.max(0, Math.floor(p.stock)) : p.stock ? 50 : 0;
      const price = Number(p.price) || 0;

      totalStockUnits += stock;
      totalInventoryValue += price * stock;

      if (stock === 0) {
        outOfStockCount++;
        outOfStockItems.push(p);
      } else if (stock <= 5) {
        lowStockCount++;
        lowStockItems.push(p);
      }
    });

    return {
      totalProducts,
      totalStockUnits,
      lowStockCount,
      outOfStockCount,
      totalInventoryValue,
      lowStockItems,
      outOfStockItems,
    };
  }, [products]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 shadow-soft">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-extrabold text-primary">
            <ShieldCheck className="size-3.5" /> E-commerce Operations Overview
          </span>
          <h2 className="mt-2 font-display text-2xl font-black tracking-tight sm:text-3xl">
            Inventory & Store Performance
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Live inventory values and stock levels calculated directly from Supabase.
          </p>
        </div>
        <Button
          onClick={onRefresh}
          disabled={loading}
          variant="outline"
          className="rounded-full text-xs font-bold gap-2 self-start sm:self-center cursor-pointer"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Data
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Total Products"
          value={metrics.totalProducts.toString()}
          icon={<Package className="size-5 text-primary" />}
          subText="Catalog Items"
        />
        <MetricCard
          title="Total Stock Units"
          value={metrics.totalStockUnits.toLocaleString()}
          icon={<Boxes className="size-5 text-emerald-600 dark:text-emerald-400" />}
          subText="Units in Stock"
        />
        <MetricCard
          title="Low Stock (≤5)"
          value={metrics.lowStockCount.toString()}
          icon={<AlertTriangle className="size-5 text-amber-500" />}
          subText="Needs Reorder"
          highlight={metrics.lowStockCount > 0}
        />
        <MetricCard
          title="Out of Stock (0)"
          value={metrics.outOfStockCount.toString()}
          icon={<XCircle className="size-5 text-destructive" />}
          subText="Disabled on User Side"
          highlight={metrics.outOfStockCount > 0}
        />
        <MetricCard
          title="Inventory Value"
          value={inr(metrics.totalInventoryValue)}
          icon={<IndianRupee className="size-5 text-primary" />}
          subText="Total Stock Value"
        />
      </div>

      {/* Quick Action Navigation */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-background p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Boxes className="size-5 text-primary" />
              <h3 className="font-display font-bold text-base">Quick Stock Management</h3>
            </div>
            <Button
              onClick={() => setActiveTab("inventory")}
              variant="ghost"
              size="sm"
              className="text-xs font-bold text-primary gap-1"
            >
              Open Inventory <ArrowUpRight className="size-4" />
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Adjust stock levels, add stock, remove stock, set stock or clear stock for any product.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              onClick={() => setActiveTab("inventory")}
              size="sm"
              className="rounded-full bg-primary text-xs font-bold text-primary-foreground"
            >
              Manage Inventory Stock
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-background p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="size-5 text-primary" />
              <h3 className="font-display font-bold text-base">Product Management</h3>
            </div>
            <Button
              onClick={() => setActiveTab("products")}
              variant="ghost"
              size="sm"
              className="text-xs font-bold text-primary gap-1"
            >
              Manage Products <ArrowUpRight className="size-4" />
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Add new products to the shop, edit details, update pricing, or delete obsolete items.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              onClick={() => setActiveTab("products")}
              size="sm"
              className="rounded-full bg-primary text-xs font-bold text-primary-foreground"
            >
              Add / Edit Products
            </Button>
          </div>
        </div>
      </div>

      {/* Stock Alerts Lists */}
      {(metrics.outOfStockItems.length > 0 || metrics.lowStockItems.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Out of Stock Alert */}
          {metrics.outOfStockItems.length > 0 && (
            <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-display font-bold text-sm text-destructive">
                  <XCircle className="size-4" /> Out of Stock ({metrics.outOfStockItems.length})
                </h3>
                <button
                  onClick={() => setActiveTab("inventory")}
                  className="text-xs font-bold text-destructive hover:underline"
                >
                  Restock Now
                </button>
              </div>
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
                {metrics.outOfStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl bg-background p-2.5 text-xs border border-destructive/20"
                  >
                    <span className="font-semibold truncate max-w-[200px]">{item.name}</span>
                    <span className="rounded-full bg-destructive/15 px-2 py-0.5 font-bold text-destructive">
                      0 left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Low Stock Alert */}
          {metrics.lowStockItems.length > 0 && (
            <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-6">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-display font-bold text-sm text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="size-4" /> Low Stock Warning ({metrics.lowStockItems.length})
                </h3>
                <button
                  onClick={() => setActiveTab("inventory")}
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  Manage Stock
                </button>
              </div>
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
                {metrics.lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl bg-background p-2.5 text-xs border border-amber-500/20"
                  >
                    <span className="font-semibold truncate max-w-[200px]">{item.name}</span>
                    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 font-bold text-amber-600 dark:text-amber-400">
                      {Number(item.stock)} units
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  subText,
  highlight,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  subText: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border p-5 transition-all shadow-xs ${
        highlight
          ? "border-amber-500/40 bg-amber-500/5"
          : "border-border bg-background"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <div className="grid size-9 place-items-center rounded-xl bg-secondary">{icon}</div>
      </div>
      <p className="mt-3 font-display text-2xl font-black tracking-tight">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{subText}</p>
    </div>
  );
}
