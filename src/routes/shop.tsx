import { Link, useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { ProductCard, ProductSkeleton } from "@/components/ProductCard";
import { isProductMatch } from "@/components/SearchBar";
import { ShopLayout } from "@/components/ShopLayout";
import { BRANDS, CATEGORIES, CATEGORY_NAME, RAW_CATEGORIES } from "@/lib/data";
import { useSupabaseProducts } from "@/lib/supabase-products";
import { useScrollRestoration } from "@/lib/useScrollRestoration";
import { inr } from "@/lib/shop-store";
import { cn } from "@/lib/utils";

const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);

const SORTS = [
  "Popularity",
  "Price: Low to High",
  "Price: High to Low",
  "Highest Rated",
] as const;

export default function ShopPage() {
  const [searchParams] = useSearchParams();
  const category = str(searchParams.get('category'));
  const q = str(searchParams.get('q'));
  const tag = str(searchParams.get('tag'));
  const { data: products = [], isLoading, isError, error, refetch } = useSupabaseProducts();
  
  useScrollRestoration(!isLoading);

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
              to={`/shop?category=${c.slug}`}
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
    <ShopLayout>
      <div className="section-shell py-8">
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
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <div className="surface-card p-8 text-center border border-destructive/20 space-y-4">
              <p className="font-display text-xl font-bold text-destructive">Failed to load products</p>
              <p className="text-muted-foreground">{error?.message}</p>
              <button
                onClick={() => refetch()}
                className="inline-flex h-10 items-center justify-center rounded-full bg-[#0B2455] px-5 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95"
              >
                Try Again
              </button>
            </div>
          ) : results.length === 0 ? (
            <div className="surface-card flex flex-col items-center justify-center py-16 text-center shadow-[0_4px_24px_-8px_rgba(11,92,255,0.08)] border border-[#EAF2FF]">
              <div className="grid size-16 place-items-center rounded-full bg-[#F4F8FF] text-[#075BFF] mb-4">
                <SlidersHorizontal className="size-8" />
              </div>
              <p className="font-display text-xl font-bold text-[#0B2455]">No matching products</p>
              <p className="mt-2 text-[#0B2455]/60 max-w-sm">Try adjusting your filters, searching for a different term, or browsing another category.</p>
              {(brands.length > 0 || inStockOnly || minRating > 0 || currentMaxPrice !== catalogMaxPrice) && (
                <button
                  onClick={() => {
                    setBrands([]);
                    setInStockOnly(false);
                    setMinRating(0);
                    setMaxPrice(null);
                  }}
                  className="mt-6 font-semibold text-[#075BFF] hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid-products">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {filtersOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-[#0B2455]/40 backdrop-blur-sm animate-in fade-in" onClick={() => setFiltersOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-[320px] max-w-full flex-col bg-white shadow-2xl animate-in slide-in-from-right rounded-l-3xl overflow-hidden">
            <div className="flex h-16 items-center justify-between border-b border-[#EAF2FF] px-6">
              <span className="font-display text-lg font-bold text-[#0B2455]">Filters</span>
              <button
                onClick={() => setFiltersOpen(false)}
                className="grid size-8 place-items-center rounded-full text-[#0B2455]/50 hover:bg-[#F4F8FF] hover:text-[#0B2455]"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">{filters}</div>
            <div className="border-t border-[#EAF2FF] p-4 bg-[#F4F8FF]/50">
              <button
                onClick={() => setFiltersOpen(false)}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-[#075BFF] text-sm font-bold text-white shadow-[0_8px_16px_-4px_rgba(7,91,255,0.4)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Show {results.length} products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </ShopLayout>
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
