import { useState } from "react";
import { SupabaseProduct } from "@/lib/supabase-products";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Plus, Minus, Edit, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type StockActionType = "add" | "remove" | "set" | "clear" | null;

interface StockManagerProps {
  product: SupabaseProduct;
  action: StockActionType;
  onClose: () => void;
  onSuccess: () => void;
}

export function StockManager({ product, action, onClose, onSuccess }: StockManagerProps) {
  const currentStock = typeof product.stock === "number" ? Math.max(0, Math.floor(product.stock)) : product.stock ? 50 : 0;
  const [quantity, setQuantity] = useState<string>("1");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!action) return null;

  const handleUpdateStock = async (newStockValue: number) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      // Update Supabase products table
      const { error } = await supabase
        .from("products")
        .update({ stock: newStockValue })
        .eq("id", product.id);

      if (error) {
        throw error;
      }

      toast.success("Stock updated successfully.", {
        description: `${product.name} stock set to ${newStockValue}.`,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.message || "Failed to update stock.";
      setErrorMsg(msg);
      toast.error("Failed to update stock.", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const val = parseInt(quantity, 10);

    if (action === "add") {
      if (isNaN(val) || val <= 0) {
        setErrorMsg("Please enter a valid positive quantity to add.");
        return;
      }
      handleUpdateStock(currentStock + val);
    } else if (action === "remove") {
      if (isNaN(val) || val <= 0) {
        setErrorMsg("Please enter a valid positive quantity to remove.");
        return;
      }
      // Requirement 7: Cannot remove more stock than currently available
      if (val > currentStock) {
        setErrorMsg("Cannot remove more stock than currently available.");
        return;
      }
      handleUpdateStock(currentStock - val);
    } else if (action === "set") {
      if (isNaN(val) || val < 0) {
        setErrorMsg("Stock quantity cannot be negative.");
        return;
      }
      handleUpdateStock(val);
    } else if (action === "clear") {
      // Requirement 9: Clear Stock sets stock to 0
      handleUpdateStock(0);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-xs" onClick={onClose} />

      <div className="card-lift relative w-full max-w-md rounded-3xl border border-border bg-background p-6 shadow-lift sm:p-8">
        {/* Action Header */}
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
            {action === "add" && <Plus className="size-5" />}
            {action === "remove" && <Minus className="size-5" />}
            {action === "set" && <Edit className="size-5" />}
            {action === "clear" && <Trash2 className="size-5 text-destructive" />}
          </div>
          <div>
            <h3 className="font-display font-bold text-lg">
              {action === "add" && "Add Stock"}
              {action === "remove" && "Remove Stock"}
              {action === "set" && "Set Direct Stock"}
              {action === "clear" && "Clear Product Stock"}
            </h3>
            <p className="text-xs text-muted-foreground truncate max-w-[260px]">{product.name}</p>
          </div>
        </div>

        {/* Current Stock Info */}
        <div className="mt-4 rounded-2xl bg-secondary/70 p-3.5 flex items-center justify-between text-xs">
          <span className="font-semibold text-muted-foreground">Current Stock:</span>
          <span className="font-display font-extrabold text-sm text-foreground">
            {currentStock} units
          </span>
        </div>

        {errorMsg && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs font-medium text-destructive">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {action === "clear" ? (
          /* Requirement 9: Confirmation modal for Clear Stock */
          <div className="mt-6 space-y-4">
            <p className="text-sm font-medium text-foreground">
              Are you sure you want to clear the stock for this product?
            </p>
            <p className="text-xs text-muted-foreground">
              This will set stock to 0. The product will immediately display as <strong>Out of Stock</strong> on the user storefront and disable Add to Cart.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="rounded-full text-xs font-bold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => handleUpdateStock(0)}
                disabled={loading}
                className="rounded-full bg-destructive font-bold text-destructive-foreground hover:bg-destructive/90 text-xs cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="size-3.5 animate-spin" /> Clearing...
                  </span>
                ) : (
                  "Clear Stock"
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* Add / Remove / Set Stock Form */
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="stock-qty" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {action === "add" && "Quantity to Add"}
                {action === "remove" && "Quantity to Remove"}
                {action === "set" && "New Stock Value"}
              </Label>
              <Input
                id="stock-qty"
                type="number"
                min={action === "set" ? "0" : "1"}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                autoFocus
                required
                className="h-11 rounded-xl text-sm border-border bg-background focus-visible:ring-primary font-bold"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="rounded-full text-xs font-bold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="rounded-full bg-primary text-xs font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="size-3.5 animate-spin" /> Saving...
                  </span>
                ) : (
                  <>
                    {action === "add" && "Add Stock"}
                    {action === "remove" && "Remove Stock"}
                    {action === "set" && "Update Stock"}
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
