import { createFileRoute, Link } from "@tanstack/react-router";
import { SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { ProductCard, ProductSkeleton } from "@/components/ProductCard";
import { isProductMatch } from "@/components/SearchBar";
import { BRANDS, CATEGORIES, CATEGORY_NAME, RAW_CATEGORIES } from "@/lib/data";
import { useSupabaseProducts } from "@/lib/supabase-products";
import { inr } from "@/lib/shop-store";
import { cn } from "@/lib/utils";

type Search = {
  category?: string | undefined;
  q?: string | undefined;
  tag?: string | undefined;
};

const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    category: str(search["category"]),
    q: str(search["q"]),
    tag: str(search["tag"]),
  }),
  head: () => ({
    meta: [
      { title: "Shop Stationery & Office Supplies — Clip N Copy" },
      {
        name: "description",
        content:
          "Filter and compare notebooks, pens, art supplies and office essentials at Clip N Copy Bengaluru. Sort by price, rating or discount.",
      },
      { property: "og:title", content: "Shop all products — Clip N Copy" },
      {
        property: "og:description",
        content: "Notebooks, pens, art and office supplies with student-friendly prices.",
      },
    ],
  }),
  component: Shop,
});

const SORTS = [
  "Popularity",
  "Price: Low to High",
  "Price: High to Low",
  "Highest Rated",
] as const;

function Shop() {
  const { category, q, tag } = Route.useSearch();
  const { data: products = [], isLoading, isError, error, refetch } = useSupabaseProducts();
  const catalogMaxPrice = useMemo(() => {
    if (!products || !Array.isArray(products) || products.length === 0) return 5000;
    
    let max = 0;
    for (const p of products) {
      const price = Number(p?.price);
      if (!isNaN(price) && price > max) {
        max = price;
      }
    }
    
    if (max <= 0) return 100;
    if (max <= 100) return 100;
    if (max <= 1000) return Math.ceil(max / 100) * 100;
    if (max <= 5000) return Math.ceil(max / 500) * 500;
    return Math.ceil(max / 1000) * 1000;
  }, [products]);

  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const currentMaxPrice = maxPrice !== null ? Math.min(maxPrice, catalogMaxPrice) : catalogMaxPrice;

  const [brands, setBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Popularity");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const availableBrands = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    const term = q?.trim().toLowerCase();
    
    const brandSet = new Set<string>();
    for (const p of products) {
      if (category && p.category !== category) continue;
      if (tag && !p.tags?.includes(tag)) continue;
      if (term && !isProductMatch(p, term)) continue;
      
      if (p.brand && typeof p.brand === 'string') {
        const b = p.brand.trim();
        if (b) brandSet.add(b);
      }
    }
    return Array.from(brandSet).sort((a, b) => a.localeCompare(b));
  }, [products, category, q, tag]);

  // Sync maxPrice if catalogMaxPrice changes and no custom maxPrice is set
  useEffect(() => {
    if (maxPrice === null) {
      setMaxPrice(catalogMaxPrice);
    }
  }, [catalogMaxPrice, maxPrice]);

  // Clear invalid brands when category or search changes
  useEffect(() => {
    setBrands((prev) => {
      if (prev.length === 0) return prev;
      const valid = prev.filter((b) => availableBrands.includes(b));
      if (valid.length !== prev.length) return valid;
      return prev;
    });
  }, [availableBrands]);

  const categoriesWithCounts = useMemo(() => {
    return RAW_CATEGORIES.map((c) => ({
      ...c,
      count: products.filter((p) => p.category === c.slug).length,
    }));
  }, [products]);

  const results = useMemo(() => {
    const term = q?.trim().toLowerCase();
    let list = products.filter((p) => {
      if (category && p.category !== category) return false;
      if (tag && !p.tags?.includes(tag)) return false;
      if (term && !isProductMatch(p, term)) return false;
      if (p.price > currentMaxPrice) return false;
      if (brands.length && !brands.includes(p.brand)) return false;
      if (p.rating < minRating) return false;
      if (inStockOnly && !p.stock) return false;
      return true;
    });
    list = [...list];
    if (sort === "Price: Low to High") list.sort((a, b) => a.price - b.price);
    if (sort === "Price: High to Low") list.sort((a, b) => b.price - a.price);
    if (sort === "Highest Rated") list.sort((a, b) => b.rating - a.rating);
    if (sort === "Popularity") list.sort((a, b) => b.reviews - a.reviews);
    return list;
  }, [products, category, q, tag, currentMaxPrice, brands, minRating, inStockOnly, sort]);

  const title = category ? CATEGORY_NAME[category] : q ? `Results for “${q}”` : "All Products";

  const filters = (
    <div className="space-y-6">
      <FilterBlock title="Category">
        <div className="space-y-1.5">
          <Link
            to="/shop"
            className={cn(
              "block rounded-lg px-2 py-1.5 text-sm hover:bg-secondary",
              !category && "bg-primary-soft font-semibold text-primary",
            )}
          >
            All categories
          </Link>
          {categoriesWithCounts.map((c) => (
            <Link
              key={c.slug}
              to="/shop"
              search={{ category: c.slug }}
              className={cn(
                "flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-secondary",
                category === c.slug && "bg-primary-soft font-semibold text-primary",
              )}
            >
              {c.name} <span className="text-xs text-muted-foreground">{c.count}</span>
            </Link>
          ))}
        </div>
      </FilterBlock>

      <FilterBlock title="Price">
        <input
          type="range"
          min={0}
          max={catalogMaxPrice}
          step={catalogMaxPrice <= 100 ? 10 : 50}
          value={currentMaxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[var(--primary)]"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>₹0</span>
          <span className="font-semibold text-foreground">
            up to {inr(currentMaxPrice)}
          </span>
        </div>
      </FilterBlock>

      <FilterBlock title="Brand">
        <div className="max-h-44 space-y-1.5 overflow-y-auto pr-1">
          {availableBrands.map((b) => (
            <label key={b} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={brands.includes(b)}
                onChange={() =>
                  setBrands((prev) =>
                    prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b],
                  )
                }
                className="size-4 accent-[var(--primary)]"
              />
              {b}
            </label>
          ))}
        </div>
      </FilterBlock>

      <FilterBlock title="Rating">
        <div className="space-y-1.5">
          {[0, 4, 4.3, 4.5].map((r) => (
            <label key={r} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="rating"
                checked={minRating === r}
                onChange={() => setMinRating(r)}
                className="size-4 accent-[var(--primary)]"
              />
              {r === 0 ? "Any rating" : `${r} ★ & above`}
            </label>
          ))}
        </div>
      </FilterBlock>


      <FilterBlock title="Availability">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="size-4 accent-[var(--primary)]"
          />
          In stock only
        </label>
      </FilterBlock>
    </div>
  );

  return (
    <div className="section-shell py-8">
      <nav className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <span>/</span>
        <span className="text-foreground">{title}</span>
      </nav>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-extrabold text-balance sm:text-3xl">{title}</h1>
          <p className="text-sm text-muted-foreground">{results.length} products found</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => setFiltersOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold lg:hidden"
          >
            <SlidersHorizontal className="size-4" /> Filters
          </button>
          <label className="flex h-10 items-center gap-2 rounded-full border border-border bg-card px-3 text-sm">
            <span className="hidden text-muted-foreground sm:inline">Sort By</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as (typeof SORTS)[number])}
              className="bg-transparent font-semibold outline-none"
            >
              {SORTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="surface-card sticky top-40 max-h-[calc(100vh-11rem)] overflow-y-auto p-5">
            <h2 className="mb-4 font-display text-lg font-bold">Filters</h2>
            {filters}
          </div>
        </aside>

        <div>
          {isLoading ? (
            <div className="grid-products">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <div className="surface-card space-y-4 p-10 text-center border border-destructive/20">
              <p className="font-display text-lg font-bold text-destructive">
                Failed to load products from Supabase
              </p>
              <p className="text-sm text-muted-foreground">
                {error?.message || "An error occurred while fetching products."}
              </p>
              <button
                onClick={() => refetch()}
                className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
              >
                Try Again
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="surface-card space-y-2 p-10 text-center">
              <p className="font-display text-lg font-bold">No products found</p>
              <p className="text-sm text-muted-foreground">
                The Supabase products table is currently empty.
              </p>
            </div>
          ) : results.length ? (
            <div className="grid-products">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="surface-card p-10 text-center">
              <p className="font-display text-lg font-bold">No products match those filters</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try widening the price range or clearing brand filters.
              </p>
            </div>
          )}
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-70 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setFiltersOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-84 flex-col bg-background">
            <div className="flex items-center justify-between border-b border-border p-4">
              <span className="font-display font-extrabold">Filters</span>
              <button onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{filters}</div>
            <button
              onClick={() => setFiltersOpen(false)}
              className="m-4 h-12 rounded-full bg-primary font-semibold text-primary-foreground"
            >
              Show {results.length} products
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5 border-b border-border pb-5 last:border-0 last:pb-0">
      <h3 className="text-xs font-bold tracking-widest uppercase">{title}</h3>
      {children}
    </div>
  );
}
