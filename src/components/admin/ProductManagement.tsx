import { useState, useMemo } from "react";
import { SupabaseProduct } from "@/lib/supabase-products";
import { supabase } from "@/lib/supabase";
import { inr } from "@/lib/shop-store";
import { toast } from "sonner";
import { AddProductForm } from "./AddProductForm";
import { EditProductForm } from "./EditProductForm";
import { Search, Plus, Edit2, Trash2, Package, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ProductManagementProps {
  products: SupabaseProduct[];
  loading: boolean;
  onRefresh: () => void;
}

export function ProductManagement({ products, loading, onRefresh }: ProductManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SupabaseProduct | null>(null);

  const [deletingProduct, setDeletingProduct] = useState<SupabaseProduct | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category.toLowerCase());
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (selectedCategory !== "all" && p.category.toLowerCase() !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    setDeleteLoading(true);

    try {
      // Delete from Supabase products table
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", deletingProduct.id);

      if (error) throw error;

      toast.success("Product deleted successfully.", {
        description: `${deletingProduct.name} has been removed.`,
      });

      onRefresh();
      setDeletingProduct(null);
    } catch (err: any) {
      toast.error("Failed to delete product.", {
        description: err.message || "An error occurred during deletion.",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-border bg-background p-6 shadow-soft">
        <div>
          <h2 className="font-display text-2xl font-black tracking-tight">Product Catalog</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Add new items, update product details, or delete catalog records.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button
            onClick={() => setIsAddOpen(true)}
            className="rounded-full bg-primary text-xs font-bold text-primary-foreground gap-1.5 shadow-glow cursor-pointer"
          >
            <Plus className="size-4" /> Add Product
          </Button>

          <Button
            onClick={onRefresh}
            disabled={loading}
            variant="outline"
            className="rounded-full text-xs font-bold gap-2 cursor-pointer"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products by name, brand, SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 rounded-2xl pl-10 text-xs border-border bg-background"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 rounded-2xl border border-border bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary capitalize"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-3xl border border-border bg-background shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/70 text-muted-foreground uppercase tracking-wider font-bold border-b border-border">
              <tr>
                <th className="py-3.5 px-4">Product Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Brand</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <Package className="mx-auto size-10 text-muted-foreground/50 mb-2" />
                    <p className="font-bold text-sm text-foreground">No products found</p>
                    <p className="text-xs">Add a new product or adjust search parameters.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const stock = typeof p.stock === "number" ? Math.max(0, Math.floor(p.stock)) : p.stock ? 50 : 0;
                  const price = Number(p.price) || 0;
                  const origPrice = p.original_price ? Number(p.original_price) : null;

                  return (
                    <tr key={p.id} className="hover:bg-secondary/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image_url || "/placeholder.png"}
                            alt={p.name}
                            className="size-11 rounded-xl border border-border object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-foreground truncate max-w-48 sm:max-w-64">
                              {p.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate max-w-48">
                              {p.description || `ID: ${p.id}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 capitalize font-semibold text-muted-foreground">
                        {p.category}
                      </td>
                      <td className="py-3 px-4 font-semibold text-foreground">
                        {p.brand || "Classmate"}
                      </td>
                      <td className="py-3 px-4 font-bold text-foreground">
                        <span>{inr(price)}</span>
                        {origPrice && origPrice > price && (
                          <span className="block text-[10px] text-muted-foreground line-through">
                            {inr(origPrice)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-display font-extrabold text-xs">
                        {stock > 0 ? (
                          <span className="text-foreground">{stock} units</span>
                        ) : (
                          <span className="text-destructive font-bold">0 (Out of Stock)</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingProduct(p)}
                            className="h-8 rounded-lg px-2.5 text-xs font-bold gap-1 cursor-pointer"
                          >
                            <Edit2 className="size-3.5" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeletingProduct(p)}
                            className="h-8 rounded-lg px-2.5 text-xs font-bold text-destructive hover:bg-destructive/10 cursor-pointer"
                          >
                            <Trash2 className="size-3.5" /> Delete
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

      {/* Add Product Modal */}
      {isAddOpen && (
        <AddProductForm
          onClose={() => setIsAddOpen(false)}
          onSuccess={onRefresh}
        />
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <EditProductForm
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSuccess={onRefresh}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-ink/50 backdrop-blur-xs" onClick={() => setDeletingProduct(null)} />
          <div className="card-lift relative w-full max-w-md rounded-3xl border border-destructive/30 bg-background p-6 shadow-lift sm:p-8">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
                <AlertCircle className="size-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-foreground">Confirm Deletion</h3>
                <p className="text-xs text-muted-foreground">Action cannot be undone</p>
              </div>
            </div>

            <p className="mt-4 text-sm font-semibold text-foreground">
              Are you sure you want to delete this product?
            </p>
            <p className="mt-1 text-xs text-muted-foreground font-mono bg-secondary p-2 rounded-xl truncate">
              {deletingProduct.name}
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeletingProduct(null)}
                disabled={deleteLoading}
                className="rounded-full text-xs font-bold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="rounded-full bg-destructive font-bold text-destructive-foreground hover:bg-destructive/90 text-xs cursor-pointer"
              >
                {deleteLoading ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="size-3.5 animate-spin" /> Deleting...
                  </span>
                ) : (
                  "Delete Product"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
