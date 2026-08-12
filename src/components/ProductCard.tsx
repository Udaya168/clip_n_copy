import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { discountOf, type Product } from "@/lib/data";
import { inr, useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";

export function ProductCard({ product, compact }: { product: Product; compact?: boolean }) {
  const { addToCart, toggleWishlist, inWishlist } = useShop();
  const saved = inWishlist(product.id);
  const discount = discountOf(product);

  return (
    <article className="group surface-card card-lift relative flex h-full flex-col overflow-hidden">
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="relative block aspect-4/3 overflow-hidden bg-secondary"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-108"
        />
        {discount > 0 && (
          <span className="absolute top-3 left-3 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground shadow-soft">
            {discount}% OFF
          </span>
        )}
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
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 rounded-md bg-success/12 px-1.5 py-0.5 font-semibold text-success">
            {product.rating.toFixed(1)} <Star className="size-3 fill-current" />
          </span>
          <span>({product.reviews.toLocaleString("en-IN")})</span>
        </div>
        <div className="mt-auto flex flex-wrap items-baseline gap-2">
          <span className="font-display text-lg font-bold">{inr(product.price)}</span>
          <span className="text-sm text-muted-foreground line-through">{inr(product.mrp)}</span>
        </div>
        <button
          onClick={() => addToCart(product.id)}
          className="mt-1 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-ink-foreground transition-all hover:bg-primary active:scale-97"
        >
          <ShoppingBag className="size-4" /> Add to Cart
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
