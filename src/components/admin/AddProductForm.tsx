import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { X, Loader2, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AddProductFormProps {
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

export function AddProductForm({ onClose, onSuccess }: AddProductFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("notebooks");
  const [brand, setBrand] = useState("Classmate");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [stock, setStock] = useState("50");
  const [imageUrl, setImageUrl] = useState("");
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
        rating: 4.5,
        review_count: 0,
      };

      if (originalPrice.trim() !== "") {
        const origNum = parseFloat(originalPrice);
        if (!isNaN(origNum) && origNum >= priceNum) {
          payload["original_price"] = origNum;
        }
      }

      // Insert into Supabase `products` table
      const { error } = await supabase.from("products").insert([payload]);

      if (error) throw error;

      toast.success("Product added successfully.", {
        description: `${name} has been added to the catalog.`,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.message || "Failed to add product.";
      setErrorMessage(msg);
      toast.error("Failed to add product.", { description: msg });
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
            <Plus className="size-5 text-primary" /> Add New Product
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
            <Label htmlFor="prod-name" className="text-xs font-bold uppercase text-muted-foreground">
              Product Name *
            </Label>
            <Input
              id="prod-name"
              placeholder="e.g. Classmate Long Notebook 172 Pages"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-10 rounded-xl text-sm"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="prod-cat" className="text-xs font-bold uppercase text-muted-foreground">
                Category *
              </Label>
              <select
                id="prod-cat"
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
              <Label htmlFor="prod-brand" className="text-xs font-bold uppercase text-muted-foreground">
                Brand
              </Label>
              <Input
                id="prod-brand"
                placeholder="Classmate"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="h-10 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="prod-price" className="text-xs font-bold uppercase text-muted-foreground">
                Price (₹) *
              </Label>
              <Input
                id="prod-price"
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
              <Label htmlFor="prod-orig-price" className="text-xs font-bold uppercase text-muted-foreground">
                MRP (₹)
              </Label>
              <Input
                id="prod-orig-price"
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
              <Label htmlFor="prod-stock" className="text-xs font-bold uppercase text-muted-foreground">
                Stock Units *
              </Label>
              <Input
                id="prod-stock"
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
            <Label htmlFor="prod-img" className="text-xs font-bold uppercase text-muted-foreground">
              Image URL
            </Label>
            <Input
              id="prod-img"
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="h-10 rounded-xl text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prod-desc" className="text-xs font-bold uppercase text-muted-foreground">
              Description
            </Label>
            <Textarea
              id="prod-desc"
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
                  <Loader2 className="size-3.5 animate-spin" /> Inserting...
                </span>
              ) : (
                "Add Product"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
