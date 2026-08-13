import { useState, useMemo } from "react";
import { SupabaseProduct } from "@/lib/supabase-products";
import { inr } from "@/lib/shop-store";
import { StockManager, StockActionType } from "./StockManager";
import { Search, Plus, Minus, Edit3, Trash2, Boxes, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface InventoryManagementProps {
  products: SupabaseProduct[];
  loading: boolean;
  onRefresh: () => void;
}

export function InventoryManagement({
  products,
  loading,
  onRefresh,
}: InventoryManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "low" | "out">("all");

  const [selectedProduct, setSelectedProduct] = useState<SupabaseProduct | null>(null);
  const [stockAction, setStockAction] = useState<StockActionType>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const stock = typeof p.stock === "number" ? Math.max(0, Math.floor(p.stock)) : p.stock ? 50 : 0;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (filterStatus === "low") return stock > 0 && stock <= 5;
      if (filterStatus === "out") return stock === 0;
      return true;
    });
  }, [products, searchQuery, filterStatus]);

  const openStockModal = (product: SupabaseProduct, action: StockActionType) => {
    setSelectedProduct(product);
    setStockAction(action);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-border bg-background p-6 shadow-soft">
        <div>
          <h2 className="font-display text-2xl font-black tracking-tight">Inventory Management</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Manage stock levels across all catalog products. Changes immediately update Supabase.
          </p>
        </div>

        <Button
          onClick={onRefresh}
          disabled={loading}
          variant="outline"
          className="rounded-full text-xs font-bold gap-2 self-start sm:self-center cursor-pointer"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 rounded-2xl pl-10 text-xs border-border bg-background"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <Button
            size="sm"
            variant={filterStatus === "all" ? "default" : "outline"}
            onClick={() => setFilterStatus("all")}
            className="rounded-full text-xs font-bold cursor-pointer"
          >
            All Products ({products.length})
          </Button>
          <Button
            size="sm"
            variant={filterStatus === "low" ? "default" : "outline"}
            onClick={() => setFilterStatus("low")}
            className="rounded-full text-xs font-bold cursor-pointer"
          >
            Low Stock (≤5)
          </Button>
          <Button
            size="sm"
            variant={filterStatus === "out" ? "default" : "outline"}
            onClick={() => setFilterStatus("out")}
            className="rounded-full text-xs font-bold cursor-pointer"
          >
            Out of Stock (0)
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-3xl border border-border bg-background shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/70 text-muted-foreground uppercase tracking-wider font-bold border-b border-border">
              <tr>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Current Stock</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <Boxes className="mx-auto size-10 text-muted-foreground/50 mb-2" />
                    <p className="font-bold text-sm text-foreground">No inventory records found</p>
                    <p className="text-xs">Try adjusting search or filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const stock = typeof p.stock === "number" ? Math.max(0, Math.floor(p.stock)) : p.stock ? 50 : 0;
                  return (
                    <tr key={p.id} className="hover:bg-secondary/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image_url || "/placeholder.png"}
                            alt={p.name}
                            className="size-10 rounded-xl border border-border object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-foreground truncate max-w-48 sm:max-w-64">
                              {p.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{p.brand || "Clip N Copy"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-muted-foreground capitalize">
                        {p.category}
                      </td>
                      <td className="py-3 px-4 font-bold text-foreground">
                        {inr(Number(p.price) || 0)}
                      </td>
                      <td className="py-3 px-4 font-display font-extrabold text-sm">
                        {stock} units
                      </td>
                      <td className="py-3 px-4">
                        {stock > 5 ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            In Stock
                          </span>
                        ) : stock > 0 ? (
                          <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-destructive/15 px-2.5 py-0.5 text-[10px] font-bold text-destructive">
                            Out of Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openStockModal(p, "add")}
                            className="h-8 rounded-lg px-2 text-[11px] font-bold gap-1 cursor-pointer"
                          >
                            <Plus className="size-3" /> Add
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openStockModal(p, "remove")}
                            className="h-8 rounded-lg px-2 text-[11px] font-bold gap-1 cursor-pointer"
                          >
                            <Minus className="size-3" /> Remove
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openStockModal(p, "set")}
                            className="h-8 rounded-lg px-2 text-[11px] font-bold gap-1 cursor-pointer"
                          >
                            <Edit3 className="size-3" /> Set
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openStockModal(p, "clear")}
                            className="h-8 rounded-lg px-2 text-[11px] font-bold text-destructive hover:bg-destructive/10 cursor-pointer"
                          >
                            <Trash2 className="size-3" /> Clear
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Manager Modal */}
      {selectedProduct && stockAction && (
        <StockManager
          product={selectedProduct}
          action={stockAction}
          onClose={() => {
            setSelectedProduct(null);
            setStockAction(null);
          }}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}
