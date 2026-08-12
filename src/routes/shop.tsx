import { createFileRoute, Link } from "@tanstack/react-router";
import { SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { BRANDS, CATEGORIES, CATEGORY_NAME, PRODUCTS, discountOf } from "@/lib/data";
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
      { title: "Shop Stationery, Books & Office Supplies — Clip N Copy" },
      {
        name: "description",
        content:
          "Filter and compare notebooks, pens, books, art supplies and office essentials at Clip N Copy Bengaluru. Sort by price, rating or discount.",
      },
      { property: "og:title", content: "Shop all products — Clip N Copy" },
      {
        property: "og:description",
        content: "Notebooks, pens, books, art and office supplies with student-friendly prices.",
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
  "Biggest Discount",
] as const;

function Shop() {
  const { category, q, tag } = Route.useSearch();
  const [maxPrice, setMaxPrice] = useState(5000);
  const [brands, setBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [minDiscount, setMinDiscount] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Popularity");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const results = useMemo(() => {
    const term = q?.trim().toLowerCase();
    let list = PRODUCTS.filter((p) => {
      if (category && p.category !== category) return false;
      if (tag && !p.tags?.includes(tag)) return false;
      if (
        term &&
        !`${p.name} ${p.brand} ${p.category} ${p.bookCategory ?? ""}`.toLowerCase().includes(term)
      )
        return false;
      if (p.price > maxPrice) return false;
      if (brands.length && !brands.includes(p.brand)) return false;
      if (p.rating < minRating) return false;
      if (discountOf(p) < minDiscount) return false;
      if (inStockOnly && !p.stock) return false;
      return true;
    });
    list = [...list];
    if (sort === "Price: Low to High") list.sort((a, b) => a.price - b.price);
    if (sort === "Price: High to Low") list.sort((a, b) => b.price - a.price);
    if (sort === "Highest Rated") list.sort((a, b) => b.rating - a.rating);
    if (sort === "Biggest Discount") list.sort((a, b) => discountOf(b) - discountOf(a));
    if (sort === "Popularity") list.sort((a, b) => b.reviews - a.reviews);
    return list;
  }, [category, q, tag, maxPrice, brands, minRating, minDiscount, inStockOnly, sort]);

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
          {CATEGORIES.map((c) => (
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
          max={5000}
          step={50}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[var(--primary)]"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>₹0</span>
          <span className="font-semibold text-foreground">
            up to {maxPrice >= 5000 ? "₹5,000+" : inr(maxPrice)}
          </span>
        </div>
      </FilterBlock>

      <FilterBlock title="Brand">
        <div className="max-h-44 space-y-1.5 overflow-y-auto pr-1">
          {BRANDS.map((b) => (
            <label key={b} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={brands.includes(b)}
                onChange={() =>
                  setBrands((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]))
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

      <FilterBlock title="Discount">
        <div className="space-y-1.5">
          {[0, 10, 20, 25].map((d) => (
            <label key={d} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="discount"
                checked={minDiscount === d}
                onChange={() => setMinDiscount(d)}
                className="size-4 accent-[var(--primary)]"
              />
              {d === 0 ? "Any discount" : `${d}% or more`}
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
          {results.length ? (
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
