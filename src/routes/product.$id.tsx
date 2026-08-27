import { useParams, Link } from "react-router-dom";
import { Check, Heart, ShoppingBag, Star, Truck, Minus, Plus, Store } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ProductCard } from "@/components/ProductCard";
import { ProductCarousel, ProductCarouselItem } from "@/components/ProductCarousel";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { ShopLayout } from "@/components/ShopLayout";
import { useScrollRestoration } from "@/lib/useScrollRestoration";
import { CATEGORY_NAME, REVIEWS } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import {
  mapSupabaseProduct,
  fetchSupabaseProducts,
  useSupabaseProducts,
  type SupabaseProduct,
} from "@/lib/supabase-products";
import { inr, useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";

const getGradient = (name: string) => {
  if (name.toLowerCase() === 'blue') return 'linear-gradient(135deg, #2563EB, #0F3FBF)';
  if (name.toLowerCase() === 'black') return 'linear-gradient(135deg, #374151, #000000)';
  if (name.toLowerCase() === 'red') return 'linear-gradient(135deg, #EF4444, #991B1B)';
  return 'linear-gradient(135deg, #6B7280, #374151)';
};

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { data: products = [], isLoading } = useSupabaseProducts();
  const product = products.find((p) => String(p.id) === id || String(p.id).toLowerCase() === id?.toLowerCase());
  const { addToCart, toggleWishlist, inWishlist, setCartOpen } = useShop();
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [tab, setTab] = useState<"desc" | "specs" | "reviews">("desc");

  if (isLoading) return <div className="flex justify-center py-20">Loading...</div>;
  if (!product) return <div className="flex justify-center py-20">Product not found</div>;

  useEffect(() => {
    if (!api) return;
    
    // Set initial scroll if variant is selected initially
    api.scrollTo(active, true);

    api.on("select", () => {
      setActive(api.selectedScrollSnap());
    });
  }, [api]);

  
  
  useScrollRestoration(!isLoading);

  const [selectedVariant, setSelectedVariant] = useState(product?.variants?.[0]?.name || "");

  const currentVariantObj = product.variants?.find((v: import("@/lib/data").ProductVariant) => v.name === selectedVariant);
  const isSingleImageVariantProduct = 
    (product.name?.toLowerCase().includes('hauser') && product.name?.toLowerCase().includes('xo')) ||
    (product.name?.toLowerCase().includes('reynolds') && product.name?.toLowerCase().includes('trimax')) ||
    (product.name?.toLowerCase().includes('luxor') && product.name?.toLowerCase().includes('fine writer')) ||
    (product.name?.toLowerCase().includes('pentonic')) ||
    (product.name?.toLowerCase().includes('pilot') && product.name?.toLowerCase().includes('v7'));
  
  const allImages = product.variants && product.variants.length > 0
    ? Array.from(new Set(product.variants.flatMap((v: import("@/lib/data").ProductVariant) => v.images)))
    : (product.name?.toLowerCase().includes('apsara') && product.name?.toLowerCase().includes('drawing pencil')) ||
      (product.name?.toLowerCase().includes('apsara') && product.name?.toLowerCase().includes('absolute')) ||
      (product.name?.toLowerCase().includes('apsara') && product.name?.toLowerCase().includes('platinum')) ||
      (product.name?.toLowerCase().includes('cello') && product.name?.toLowerCase().includes('butterflow')) ||
      (product.name?.toLowerCase().includes('parker') && product.name?.toLowerCase().includes('vector')) ||
      (product.name?.toLowerCase().includes('classmate') && product.name?.toLowerCase().includes('octane')) ||
      (product.name?.toLowerCase().includes('nataraj') && product.name?.toLowerCase().includes('hb pencil')) ||
      (product.name?.toLowerCase().includes('fevicol') && product.name?.toLowerCase().includes('mr')) ||
      (product.name?.toLowerCase().includes('geometry') || product.id?.includes('geometry')) ||
      (product.name?.toLowerCase().includes('crayons') && product.name?.toLowerCase().includes('24')) ||
      (product.name?.toLowerCase().includes('apsara') && product.name?.toLowerCase().includes('non dust')) ||
      (product.name?.toLowerCase().includes('highlighter') || product.id?.includes('highlighter')) ||
      (product.name?.toLowerCase().includes('camlin') && product.name?.toLowerCase().includes('exam pad')) ||
      (product.name?.toLowerCase().includes('pencil box')) ||
      (product.name?.toLowerCase().includes('nataraj') && product.name?.toLowerCase().includes('eraser')) ||
      (product.name?.toLowerCase().includes('scissors') || product.id?.includes('scissors')) ||
      (product.name?.toLowerCase().includes('sharpener') || product.id?.includes('sharpener')) ||
      (product.name?.toLowerCase().includes('ruler') || product.id?.includes('ruler')) ||
      (product.name?.toLowerCase().includes('permanent marker') || product.id?.includes('permanent-marker')) ||
      (product.name?.toLowerCase().includes('printer paper') || product.id?.includes('printer-paper') || product.name?.toLowerCase().includes('jk copier')) ||
      (product.name?.toLowerCase().includes('whiteboard marker') || product.id?.includes('whiteboard-marker')) ||
      (product.name?.toLowerCase().includes('document folder') || product.id?.includes('document-folder')) ||
      (product.name?.toLowerCase().includes('stapler') || product.id?.includes('stapler')) ||
      (product.name?.toLowerCase().includes('file folder') || product.id?.includes('file-folder')) ||
      (product.name?.toLowerCase().includes('punch machine') || product.id?.includes('punch-machine')) ||
      (product.name?.toLowerCase().includes('sticky notes') || product.id?.includes('sticky-notes')) ||
      (product.name?.toLowerCase().includes('office register') || product.id?.includes('office-register')) ||
      (product.name?.toLowerCase().includes('paper clips') || product.id?.includes('paper-clips')) ||
      (product.name?.toLowerCase().includes('envelope') || product.id?.includes('envelope')) ||
      (product.name?.toLowerCase().includes('color pencil') || product.name?.toLowerCase().includes('colour pencil') || product.id?.includes('color-pencil') || product.id?.includes('colour-pencil')) ||
      (product.name?.toLowerCase().includes('oil pastel') || product.id?.includes('oil-pastel')) ||
      (product.name?.toLowerCase().includes('sketch pen') || product.id?.includes('sketch-pen')) ||
      (product.name?.toLowerCase().includes('poster colour') || product.name?.toLowerCase().includes('poster color') || product.id?.includes('poster-colour') || product.id?.includes('poster-color')) ||
      (product.name?.toLowerCase().includes('water colour') || product.name?.toLowerCase().includes('water color') || product.id?.includes('water-colour') || product.id?.includes('water-color')) ||
      (product.name?.toLowerCase().includes('drawing book') || product.id?.includes('drawing-book')) ||
      (product.name?.toLowerCase().includes('craft paper') || product.id?.includes('craft-paper')) ||
      (product.name?.toLowerCase().includes('paint brush') || product.id?.includes('paint-brush')) ||
      (product.name?.toLowerCase().includes('plastic file') || product.id?.includes('plastic-file')) ||
      (product.name?.toLowerCase().includes('button file') || product.id?.includes('button-file')) ||
      (product.name?.toLowerCase().includes('ring binder') || product.id?.includes('ring-binder')) ||
      (product.name?.toLowerCase().includes('expanding file') || product.id?.includes('expanding-file')) ||
      (product.name?.toLowerCase().includes('calculator') || product.id?.includes('calculator')) ||
      (product.name?.toLowerCase().includes('82ms') || product.id?.includes('82ms')) ||
      (product.name?.toLowerCase().includes('12d') || product.id?.includes('12d')) ||
      (product.name?.toLowerCase().includes('notebook') || product.id?.includes('notebook'))
      ? [product.image]
      : [product.image, product.image, product.image, product.image];

  const mainImgSrc = isSingleImageVariantProduct ? (currentVariantObj?.images[0] || product.image) : allImages[active];
  const thumbnailImages = isSingleImageVariantProduct ? [mainImgSrc] : allImages;
  const similar = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
  const saved = inWishlist(product.id);

  return (
    <ShopLayout>
    <div className="section-shell py-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="space-y-4">
          <div className="group/carousel relative">
            <Carousel setApi={setApi} className="w-full">
              <CarouselContent>
                {thumbnailImages.map((imgSrc: string, i: number) => (
                  <CarouselItem key={i}>
                    <div
                      className="surface-card relative flex items-center justify-center aspect-[4/3] max-h-[450px] w-full overflow-hidden"
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
                        src={imgSrc}
                        alt={`${product.name} - view ${i + 1}`}
                        className="max-w-full max-h-full object-contain object-center transition-transform duration-300"
                        style={
                          zoom && active === i
                            ? { transform: "scale(1.9)", transformOrigin: `${zoom.x}% ${zoom.y}%` }
                            : undefined
                        }
                      />
                      <span className="absolute right-4 bottom-4 rounded-full bg-card/90 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur pointer-events-none">
                        Hover to zoom
                      </span>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {thumbnailImages.length > 1 && (
                <>
                  <CarouselPrevious className="-left-4 hidden md:flex opacity-0 group-hover/carousel:opacity-100" />
                  <CarouselNext className="-right-4 hidden md:flex opacity-0 group-hover/carousel:opacity-100" />
                </>
              )}
            </Carousel>
          </div>
          <div className="flex gap-3">
            {thumbnailImages.map((g: string, i: number) => (
              <button
                key={i}
                onClick={() => {
                  setActive(i);
                  api?.scrollTo(i);
                  if (product.variants && product.variants.length > 0) {
                    const variant = product.variants.find((v: import("@/lib/data").ProductVariant) => v.images.includes(g));
                    if (variant) setSelectedVariant(variant.name);
                  }
                }}
                className={cn(
                  "flex items-center justify-center size-20 overflow-hidden rounded-xl border-2 transition-colors",
                  active === i ? "border-primary" : "border-border hover:border-primary/50",
                )}
              >
                <img
                  src={g}
                  alt={`${product.name} view ${i + 1}`}
                  loading="lazy"
                  className="max-w-full max-h-full object-contain object-center"
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
              {product.id === "reynolds-trimax" && selectedVariant 
                ? `Reynolds Trimax — ${selectedVariant}` 
                : product.id === "luxor-fine-writer" && selectedVariant
                ? `Luxor Fine Writer — ${selectedVariant}`
                : product.name?.toLowerCase().includes("hauser") && product.name?.toLowerCase().includes("xo") && selectedVariant
                ? `Hauser XO Ball Pen — ${selectedVariant}`
                : `${product.name}${selectedVariant ? ` — ${selectedVariant}` : ""}`}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
              {product.reviews > 0 && (
                <span className="flex items-center gap-1 rounded-md bg-success/12 px-2 py-0.5 font-bold text-success">
                  {product.rating.toFixed(1)} <Star className="size-3.5 fill-current" />
                </span>
              )}
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
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes</p>

            {product.variants && (
              <div className="mt-5">
                <p className="text-sm font-bold mb-3">
                  Selected Colour: <span className="text-muted-foreground ml-1">{selectedVariant}</span>
                </p>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((v: import("@/lib/data").ProductVariant) => (
                    <button
                      key={v.name}
                      onClick={() => {
                        setSelectedVariant(v.name);
                        const firstImg = v.images[0];
                        const idx = allImages.indexOf(firstImg);
                        if (idx !== -1) {
                          setActive(idx);
                          api?.scrollTo(idx);
                        } else {
                          setActive(0);
                          api?.scrollTo(0);
                        }
                      }}
                      style={{ background: getGradient(v.name) }}
                      className={cn(
                        "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-md",
                        selectedVariant === v.name
                          ? "ring-2 ring-primary ring-offset-2 scale-[1.02]"
                          : "opacity-85 hover:opacity-100 hover:scale-[1.02]"
                      )}
                    >
                      <span className="uppercase tracking-wider">{v.name}</span>
                      {selectedVariant === v.name && <Check className="size-4" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

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

            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <button
                onClick={() => addToCart(product.id, qty, selectedVariant || undefined)}
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
                    addToCart(product.id, qty, selectedVariant || undefined);
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
            <div className="max-w-3xl space-y-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
              {product.features && product.features.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold">Key Features</h3>
                  <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    {product.features.map((feature: string, i: number) => (
                      <li key={i}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {tab === "specs" && (
            <dl className="grid max-w-2xl gap-x-8 gap-y-3 sm:grid-cols-2">
              {Object.entries(product.specs ?? {}).map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between gap-4 border-b border-border pb-2 text-sm"
                >
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-semibold text-right">{(k === 'Ink Colour' || k === 'Colour' || k === 'Product Colour') && v === 'Selected Variant' ? (selectedVariant || 'Blue') : v as React.ReactNode}</dd>
                </div>
              ))}
            </dl>
          )}
          {tab === "reviews" && (
            <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
              <div className="space-y-4">
                <h3 className="font-display text-lg font-bold">Customer Rating Summary</h3>
                {product.reviews > 0 ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-4xl font-black">{product.rating.toFixed(1)}</span>
                      <Star className="size-6 fill-current text-primary" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Based on {product.reviews.toLocaleString("en-IN")} ratings
                    </p>
                    <div className="space-y-2 mt-4">
                      {[5, 4, 3, 2, 1].map((star) => (
                        <div key={star} className="flex items-center gap-2 text-sm">
                          <span className="flex w-8 items-center justify-end gap-1 font-semibold">
                            {star} <Star className="size-3 fill-current text-muted-foreground" />
                          </span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                            <div className="h-full bg-primary" style={{ width: "0%" }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No customer reviews yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {similar.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-5 font-display text-2xl font-extrabold">Similar Products</h2>
          {similar.length >= 4 ? (
            <ProductCarousel>
              {similar.map((p) => (
                <ProductCarouselItem key={p.id}>
                  <ProductCard product={p} />
                </ProductCarouselItem>
              ))}
            </ProductCarousel>
          ) : (
            <div className="grid-products">
              {similar.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
    </ShopLayout>
  );
}
