import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, Heart, ShoppingBag, Star, Truck, Minus, Plus, Store } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORY_NAME, REVIEWS, discountOf } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import {
  mapSupabaseProduct,
  fetchSupabaseProducts,
  useSupabaseProducts,
  type SupabaseProduct,
} from "@/lib/supabase-products";
import { inr, useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$id")({
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", params.id)
      .maybeSingle();

    if (data) {
      return { product: mapSupabaseProduct(data as SupabaseProduct) };
    }

    const products = await fetchSupabaseProducts();
    const found = products.find(
      (p) => String(p.id) === params.id || String(p.id).toLowerCase() === params.id.toLowerCase(),
    );
    if (!found) throw notFound();
    return { product: found };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Product not found — Clip N Copy" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { product } = loaderData;
    return {
      meta: [
        { title: `${product.name} — Clip N Copy` },
        {
          name: "description",
          content: `Buy ${product.name} by ${product.brand} at ${inr(product.price)} from Clip N Copy, Kundalahalli Bengaluru.`,
        },
        { property: "og:title", content: `${product.name} — Clip N Copy` },
        {
          property: "og:description",
          content: `${product.brand} · ${inr(product.price)} · rated ${product.rating} by ${product.reviews} customers.`,
        },
      ],
    };
  },
  component: ProductDetail,
});

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const { addToCart, toggleWishlist, inWishlist, setCartOpen } = useShop();
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [tab, setTab] = useState<"desc" | "specs" | "reviews">("desc");

  const { data: products = [] } = useSupabaseProducts();
  const gallery = [product.image, product.image, product.image, product.image];
  const similar = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
  const saved = inWishlist(product.id);

  return (
    <div className="section-shell py-8">
      <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <span>/</span>
        <Link to="/shop" search={{ category: product.category }} className="hover:text-primary">
          {CATEGORY_NAME[product.category] ?? product.category.replace(/-/g, " ")}
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="space-y-4">
          <div
            className="surface-card relative aspect-square overflow-hidden"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setZoom({
                x: ((e.clientX - r.left) / r.width) * 100,
                y: ((e.clientY - r.top) / r.height) * 100,
              });
            }}
            onMouseLeave={() => setZoom(null)}
          >
            <img
              src={gallery[active]}
              alt={product.name}
              className="size-full object-cover transition-transform duration-300"
              style={
                zoom
                  ? { transform: "scale(1.9)", transformOrigin: `${zoom.x}% ${zoom.y}%` }
                  : undefined
              }
            />
            {discountOf(product) > 0 && (
              <span className="absolute top-4 left-4 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                {discountOf(product)}% OFF
              </span>
            )}
            <span className="absolute right-4 bottom-4 rounded-full bg-card/90 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              Hover to zoom
            </span>
          </div>
          <div className="flex gap-3">
            {gallery.map((g, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={cn(
                  "size-20 overflow-hidden rounded-xl border-2 transition-colors",
                  active === i ? "border-primary" : "border-border hover:border-primary/50",
                )}
              >
                <img
                  src={g}
                  alt={`${product.name} view ${i + 1}`}
                  loading="lazy"
                  className="size-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-xs font-bold tracking-widest text-primary uppercase">
              {product.brand}
            </p>
            <h1 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">
              {product.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
              <span className="flex items-center gap-1 rounded-md bg-success/12 px-2 py-0.5 font-bold text-success">
                {product.rating.toFixed(1)} <Star className="size-3.5 fill-current" />
              </span>
              <span className="text-muted-foreground">
                {product.reviews.toLocaleString("en-IN")} reviews
              </span>
              <span
                className={cn(
                  "flex items-center gap-1 font-semibold text-xs px-2.5 py-1 rounded-full",
                  product.stock > 5
                    ? "text-success bg-success/12"
                    : product.stock > 0
                      ? "text-amber-600 bg-amber-500/12 font-bold"
                      : "text-destructive bg-destructive/12 font-bold",
                )}
              >
                <Check className="size-4" />{" "}
                {product.stock > 5
                  ? "In Stock"
                  : product.stock > 0
                    ? `Only ${product.stock} left`
                    : "Out of Stock"}
              </span>
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-display text-3xl font-black">{inr(product.price)}</span>
              <span className="text-lg text-muted-foreground line-through">{inr(product.mrp)}</span>
              <span className="rounded-full bg-success/12 px-2 py-0.5 text-sm font-bold text-success">
                Save {inr(product.mrp - product.price)}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes</p>

            <div className="mt-5 flex items-center gap-4">
              <span className="text-sm font-semibold">Quantity</span>
              <div className="flex items-center gap-1 rounded-full border border-border">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={product.stock <= 0 || qty <= 1}
                  className="grid size-9 place-items-center rounded-full hover:bg-secondary disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-8 text-center font-bold">{product.stock <= 0 ? 0 : qty}</span>
                <button
                  onClick={() => {
                    if (qty >= product.stock) {
                      toast.error(`Maximum available quantity is ${product.stock}.`);
                      return;
                    }
                    setQty((q) => Math.min(product.stock, q + 1));
                  }}
                  disabled={product.stock <= 0 || qty >= product.stock}
                  className="grid size-9 place-items-center rounded-full hover:bg-secondary disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button
                onClick={() => addToCart(product.id, qty)}
                disabled={product.stock <= 0}
                className={cn(
                  "inline-flex h-12 items-center justify-center gap-2 rounded-full font-semibold transition-colors",
                  product.stock <= 0
                    ? "cursor-not-allowed bg-muted text-muted-foreground opacity-60"
                    : "bg-ink text-ink-foreground hover:bg-primary",
                )}
              >
                <ShoppingBag className="size-4" />{" "}
                {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
              </button>
              {product.stock > 0 ? (
                <Link
                  to="/checkout"
                  onClick={() => {
                    addToCart(product.id, qty);
                    setCartOpen(false);
                  }}
                  className="inline-flex h-12 items-center justify-center rounded-full accent-gradient font-bold text-accent-foreground shadow-glow"
                >
                  Buy Now
                </Link>
              ) : (
                <button
                  disabled
                  className="inline-flex h-12 items-center justify-center rounded-full bg-muted font-bold text-muted-foreground cursor-not-allowed opacity-60"
                >
                  Out of Stock
                </button>
              )}
            </div>
            <button
              onClick={() => toggleWishlist(product.id)}
              className={cn(
                "mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border font-semibold",
                saved && "border-destructive/40 text-destructive",
              )}
            >
              <Heart className={cn("size-4", saved && "fill-current")} />{" "}
              {saved ? "Saved to Wishlist" : "Add to Wishlist"}
            </button>
          </div>

          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Truck className="size-4 text-primary" /> Same-day delivery within 5 km of ITPL Main
              Road
            </li>
            <li className="flex items-center gap-2">
              <Store className="size-4 text-primary" /> Free pickup at Kundalahalli Colony store
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12">
        <div className="flex gap-2 border-b border-border">
          {(
            [
              ["desc", "Description"],
              ["specs", "Specifications"],
              ["reviews", "Customer Reviews"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition-colors",
                tab === key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="py-6">
          {tab === "desc" && (
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          )}
          {tab === "specs" && (
            <dl className="grid max-w-2xl gap-x-8 gap-y-3 sm:grid-cols-2">
              {Object.entries(product.specs ?? {}).map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between gap-4 border-b border-border pb-2 text-sm"
                >
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          )}
          {tab === "reviews" && (
            <ul className="grid gap-4 sm:grid-cols-2">
              {REVIEWS.map((r) => (
                <li key={r.name} className="surface-card p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">{r.name}</span>
                    <span className="flex items-center gap-0.5 text-accent">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="size-3.5 fill-current" />
                      ))}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">“{r.text}”</p>
                  <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    {r.date}
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/12 px-2 py-0.5 font-semibold text-success">
                      <Check className="size-3" /> Verified Purchase
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <section className="mt-6">
        <h2 className="mb-5 font-display text-2xl font-extrabold">Similar Products</h2>
        <div className="grid-products">
          {similar.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
