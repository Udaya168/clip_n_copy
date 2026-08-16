import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { type Product } from "@/lib/data";
import { inr, useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";

export function ProductCard({ product, compact }: { product: Product; compact?: boolean }) {
  const { addToCart, toggleWishlist, inWishlist } = useShop();
  const saved = inWishlist(product.id);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.25rem] bg-white shadow-[0_4px_16px_-4px_rgba(11,92,255,0.08)] ring-1 ring-[#EAF2FF] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_-6px_rgba(11,92,255,0.2)] hover:ring-[#DCEBFF]">
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="relative flex items-center justify-center aspect-4/3 overflow-hidden bg-[#F4F8FF]"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="max-w-full max-h-full object-contain object-center p-4 transition-transform duration-500 group-hover:scale-105"
        />

      </Link>

      <button
        onClick={() => toggleWishlist(product.id)}
        aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
        className={cn(
          "absolute top-3 right-3 grid size-9 place-items-center rounded-full border border-border bg-card/90 backdrop-blur transition-colors",
          saved ? "text-destructive" : "text-muted-foreground hover:text-destructive",
        )}
      >
        <Heart className={cn("size-4", saved && "fill-current pop-once")} />
      </button>

      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <p className="text-[11px] font-semibold tracking-wide text-primary uppercase">
          {product.brand}
        </p>
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className={cn(
            "line-clamp-2 font-display font-semibold hover:text-primary",
            compact ? "text-sm" : "text-sm sm:text-[15px]",
          )}
        >
          {product.name}
        </Link>
        <div className="flex items-center justify-between gap-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            {product.reviews > 0 && (
              <span className="flex items-center gap-1 rounded-md bg-success/12 px-1.5 py-0.5 font-semibold text-success">
                {product.rating.toFixed(1)} <Star className="size-3 fill-current" />
              </span>
            )}
            <span>({product.reviews.toLocaleString("en-IN")})</span>
          </div>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-semibold",
              product.stock > 5
                ? "bg-success/12 text-success"
                : product.stock > 0
                  ? "bg-amber-500/15 font-bold text-amber-600"
                  : "bg-destructive/15 font-bold text-destructive",
            )}
          >
            {product.stock > 5
              ? "In Stock"
              : product.stock > 0
                ? `Only ${product.stock} left`
                : "Out of Stock"}
          </span>
        </div>
        <div className="mt-auto flex flex-wrap items-baseline gap-2">
          <span className="font-display text-lg font-bold">{inr(product.price)}</span>
        </div>
        <button
          onClick={() => addToCart(product.id)}
          disabled={product.stock <= 0}
          className={cn(
            "mt-1 inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-all duration-300 active:scale-95",
            product.stock <= 0
              ? "cursor-not-allowed bg-muted text-muted-foreground opacity-60"
              : "bg-[#075BFF] text-white shadow-sm hover:bg-[#0B5CFF] hover:shadow-[0_4px_12px_-4px_rgba(11,92,255,0.4)]",
          )}
        >
          <ShoppingBag className="size-4" /> {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}

export function ProductSkeleton() {
  return (
    <div className="surface-card overflow-hidden">
      <div className="aspect-4/3 animate-pulse bg-secondary" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-secondary" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-secondary" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-secondary" />
        <div className="h-10 animate-pulse rounded-full bg-secondary" />
      </div>
    </div>
  );
}
