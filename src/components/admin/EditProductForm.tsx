import { useState } from "react";
import { SupabaseProduct } from "@/lib/supabase-products";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { X, Loader2, Edit3, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EditProductFormProps {
  product: SupabaseProduct;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  "notebooks",
  "pens-pencils",
  "books",
  "school-supplies",
  "office-supplies",
  "art-craft",
  "files-folders",
  "calculators",
  "bags",
  "exam-essentials",
];

export function EditProductForm({ product, onClose, onSuccess }: EditProductFormProps) {
  const currentStock = typeof product.stock === "number" ? Math.max(0, Math.floor(product.stock)) : product.stock ? 50 : 0;

  const [name, setName] = useState(product.name || "");
  const [description, setDescription] = useState(product.description || "");
  const [category, setCategory] = useState(product.category || "notebooks");
  const [brand, setBrand] = useState(product.brand || "Classmate");
  const [price, setPrice] = useState(product.price ? product.price.toString() : "0");
  const [originalPrice, setOriginalPrice] = useState(product.original_price ? product.original_price.toString() : "");
  const [stock, setStock] = useState(currentStock.toString());
  const [imageUrl, setImageUrl] = useState(product.image_url || "");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Product name is required.");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setErrorMessage("Please enter a valid price.");
      return;
    }

    const stockNum = parseInt(stock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      setErrorMessage("Please enter a valid stock quantity.");
      return;
    }

    setLoading(true);

    try {
      const payload: Record<string, unknown> = {
        name: name.trim(),
        description: description.trim() || null,
        category: category.trim(),
        brand: brand.trim() || "Classmate",
        price: priceNum,
        stock: stockNum,
        image_url: imageUrl.trim() || null,
      };

      if (originalPrice.trim() !== "") {
        const origNum = parseFloat(originalPrice);
        if (!isNaN(origNum) && origNum >= priceNum) {
          payload["original_price"] = origNum;
        } else {
          payload["original_price"] = null;
        }
      } else {
        payload["original_price"] = null;
      }

      // Update existing Supabase row using product ID
      const { error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", product.id);

      if (error) throw error;

      toast.success("Product updated successfully.", {
        description: `${name} has been updated.`,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.message || "Failed to update product.";
      setErrorMessage(msg);
      toast.error("Failed to update product.", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-ink/50 backdrop-blur-xs" onClick={onClose} />

      <div className="card-lift relative w-full max-w-lg my-8 rounded-3xl border border-border bg-background p-6 shadow-lift sm:p-8 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h3 className="flex items-center gap-2 font-display text-lg font-extrabold">
            <Edit3 className="size-5 text-primary" /> Edit Product
          </h3>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-secondary">
            <X className="size-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs font-medium text-destructive">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 overflow-y-auto pr-1 flex-1">
          <div className="space-y-1.5">
            <Label htmlFor="edit-name" className="text-xs font-bold uppercase text-muted-foreground">
              Product Name *
            </Label>
            <Input
              id="edit-name"
              placeholder="e.g. Classmate Long Notebook 172 Pages"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-10 rounded-xl text-sm"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-cat" className="text-xs font-bold uppercase text-muted-foreground">
                Category *
              </Label>
              <select
                id="edit-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-brand" className="text-xs font-bold uppercase text-muted-foreground">
                Brand
              </Label>
              <Input
                id="edit-brand"
                placeholder="Classmate"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="h-10 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-price" className="text-xs font-bold uppercase text-muted-foreground">
                Price (₹) *
              </Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="h-10 rounded-xl text-sm font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-orig-price" className="text-xs font-bold uppercase text-muted-foreground">
                MRP (₹)
              </Label>
              <Input
                id="edit-orig-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="120"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="h-10 rounded-xl text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-stock" className="text-xs font-bold uppercase text-muted-foreground">
                Stock Units *
              </Label>
              <Input
                id="edit-stock"
                type="number"
                min="0"
                placeholder="50"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
                className="h-10 rounded-xl text-sm font-bold"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-img" className="text-xs font-bold uppercase text-muted-foreground">
              Image URL
            </Label>
            <Input
              id="edit-img"
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="h-10 rounded-xl text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-desc" className="text-xs font-bold uppercase text-muted-foreground">
              Description
            </Label>
            <Textarea
              id="edit-desc"
              rows={3}
              placeholder="Detailed description of the product..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl text-xs resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-border">
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
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
