import { memo } from "react";
import { Link } from "react-router-dom";
import { Heart, Plus, Minus, ShoppingBag } from "lucide-react";
import { type Product, CATEGORY_NAME } from "@/lib/data";
import { inr, useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";

export const ProductCard = memo(function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addToCart, toggleWishlist, inWishlist, cart, setQty, setCartOpen } = useShop();
  const saved = inWishlist(product.id);
  const cartItem = cart.find(item => item.id === product.id);
  const currentQty = cartItem ? cartItem.qty : 0;
  
  const hasDiscount = product.mrp > product.price;
  const savings = product.mrp - product.price;

  // Real category name if available, otherwise just use the slug formatted
  const categoryName = CATEGORY_NAME[product.category] || product.category;

  return (
    <article 
      className="group relative flex flex-col animate-catalogue-enter isolate"
      style={{ animationDelay: `${(index % 12) * 70}ms` }}
    >
      {/* Decorative Background Number */}
      <div 
        className="absolute -top-3 -left-1 text-[80px] sm:-top-5 sm:-left-2 sm:text-[120px] md:-top-8 md:-left-4 md:text-[200px] font-display font-bold leading-none select-none z-[-1] text-[#E8F0FE]"
        aria-hidden="true"
      >
        {String(index + 1).padStart(2, '0')}
      </div>

      {/* Image Stage Panel */}
      <div 
        className="relative aspect-square md:aspect-[4/5] bg-white border border-border transition-all duration-300 shadow-[6px_6px_0_#CBD8F0] sm:shadow-[10px_10px_0_#CBD8F0] md:shadow-[14px_14px_0_#CBD8F0]"
      >
        <Link 
          to={`/product/${product.id}`}
          className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 md:p-8 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          tabIndex={-1}
        >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.035] group-hover:-translate-y-1"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 pointer-events-none">
          {hasDiscount ? (
            <span className="inline-block bg-secondary text-white text-[8px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-[2px]">
              Save {inr(savings)}
            </span>
          ) : product.rating >= 4.5 ? (
            <span className="inline-block bg-primary text-white text-[8px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-[2px]">
              Shelf Pick
            </span>
          ) : null}
        </div>

        {/* Wishlist Control */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={saved}
          title={saved ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 grid size-7 sm:size-10 place-items-center rounded-md bg-[#F4F8FF] text-muted-foreground hover:text-destructive transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary z-10"
        >
          <Heart className={cn("size-3 sm:size-[18px] transition-transform duration-300", saved && "fill-destructive text-destructive scale-[1.18] pop-once")} />
        </button>
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-1 mt-4 sm:mt-6 px-1 sm:px-0">
        <p className="text-[8px] sm:text-[10px] font-bold text-primary uppercase tracking-wider truncate">
          {product.brand} &middot; {categoryName}
        </p>
        
        <Link 
          to={`/product/${product.id}`}
          className="mt-1 sm:mt-1.5 font-display text-[13px] sm:text-[15px] md:text-[22px] font-bold text-foreground uppercase leading-[1.15] line-clamp-2 min-h-[2.3em] outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm hover:text-primary transition-colors"
        >
          {product.name}
        </Link>

        {/* Price and Action Row */}
        <div className="mt-auto pt-2 sm:pt-4 flex flex-col xl:flex-row xl:items-end justify-between gap-2.5 sm:gap-4">
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="font-display text-base sm:text-xl md:text-2xl font-bold text-foreground tracking-tight">
              {inr(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs sm:text-sm font-medium text-muted-foreground line-through decoration-muted-foreground/50">
                {inr(product.mrp)}
              </span>
            )}
          </div>

          <div className="shrink-0 h-8 sm:h-10 w-full xl:w-auto xl:min-w-[100px] flex items-center">
            {currentQty > 0 ? (
              <div className="flex items-center h-full w-full bg-secondary text-secondary-foreground rounded-[4px] overflow-hidden transition-transform active:scale-[0.97]">
                <button
                  aria-label={`Decrease quantity of ${product.name}`}
                  onClick={(e) => { e.preventDefault(); setQty(product.id, currentQty - 1); }}
                  className="flex-1 h-full flex items-center justify-center hover:bg-white/20 transition-colors outline-none focus-visible:bg-white/30"
                >
                  <Minus className="size-3 sm:size-4" />
                </button>
                <span className="w-8 text-center text-xs sm:text-sm font-bold" aria-live="polite">
                  {currentQty}
                </span>
                <button
                  aria-label={`Increase quantity of ${product.name}`}
                  onClick={(e) => { e.preventDefault(); setQty(product.id, currentQty + 1); setCartOpen(true); }}
                  disabled={currentQty >= product.stock}
                  className="flex-1 h-full flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed outline-none focus-visible:bg-white/30"
                >
                  <Plus className="size-3 sm:size-4" />
                </button>
              </div>
            ) : (
              <button
                aria-label={`Add ${product.name} to cart`}
                onClick={(e) => { e.preventDefault(); addToCart(product.id, 1, undefined, true); }}
                disabled={product.stock <= 0}
                className={cn(
                  "flex items-center justify-center h-full w-full rounded-[4px] text-xs sm:text-sm font-bold transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  product.stock <= 0
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/90 active:scale-[0.97]"
                )}
              >
                {product.stock <= 0 ? "Out of Stock" : (
                  <>
                    Add <Plus className="size-3 sm:size-4 ml-1.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
});

export function ProductSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="aspect-square md:aspect-[4/5] bg-muted/50 rounded-[4px] animate-pulse border border-border shadow-[14px_14px_0_var(--color-muted)]" />
      <div className="mt-6 space-y-3 px-1">
        <div className="h-3 w-1/3 rounded bg-muted animate-pulse" />
        <div className="h-6 w-4/5 rounded bg-muted animate-pulse" />
        <div className="h-6 w-2/3 rounded bg-muted animate-pulse" />
        <div className="mt-4 flex justify-between">
          <div className="h-8 w-1/3 rounded bg-muted animate-pulse" />
          <div className="h-10 w-24 rounded-[4px] bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  );
}
