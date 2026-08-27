import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useSupabaseProducts } from "@/lib/supabase-products";
import { inr, useShop } from "@/lib/shop-store";
import { ShopLayout } from "@/components/ShopLayout";

import { useScrollRestoration } from "@/lib/useScrollRestoration";


export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useShop();
  const { data: products = [], isLoading } = useSupabaseProducts();
  
  useScrollRestoration(!isLoading);

  const items = products.filter((p) => wishlist.includes(p.id));

  return (
    <ShopLayout>
      <div className="section-shell py-10">
        <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Your Wishlist</h1>
        <p className="text-sm text-muted-foreground">{items.length} saved items</p>

        {items.length === 0 ? (
          <div className="surface-card mt-8 flex flex-col items-center gap-3 p-12 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-primary-soft text-primary">
              <Heart className="size-7" />
            </span>
            <p className="font-display text-lg font-bold">Nothing saved yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Tap the heart on any product to keep it here for later.
            </p>
            <Link
              to="/shop"
              className="mt-2 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {items.map((p) => (
              <li
                key={p.id}
                className="surface-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
              >
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  className="size-24 shrink-0 rounded-xl border border-border object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold tracking-wide text-primary uppercase">{p.brand}</p>
                  <Link to={`/product/${p.id }`}
                    className="font-display font-semibold hover:text-primary"
                  >
                    {p.name}
                  </Link>
                  <p className="mt-1 flex items-baseline gap-2">
                    <span className="font-display text-lg font-bold">{inr(p.price)}</span>
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => {
                      addToCart(p.id);
                      toggleWishlist(p.id);
                    }}
                    className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
                  >
                    <ShoppingBag className="size-4" /> Move to Cart
                  </button>
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className="grid size-11 place-items-center rounded-full border border-border text-muted-foreground hover:text-destructive"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ShopLayout>
  );
}
