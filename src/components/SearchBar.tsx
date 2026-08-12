import { useNavigate } from "@tanstack/react-router";
import { Search, TrendingUp, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { POPULAR_SEARCHES } from "@/lib/data";
import { useSupabaseProducts } from "@/lib/supabase-products";
import { inr } from "@/lib/shop-store";
import { cn } from "@/lib/utils";

export function SearchBar({ className, autoFocus }: { className?: string; autoFocus?: boolean }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const { data: products = [] } = useSupabaseProducts();

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const term = q.trim().toLowerCase();
  const matches = term
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(term) ||
            p.brand.toLowerCase().includes(term) ||
            p.category.includes(term),
        )
        .slice(0, 6)
    : [];

  const submit = (value: string) => {
    setOpen(false);
    setQ(value);
    navigate({ to: "/shop", search: { q: value } });
  };

  return (
    <div ref={wrap} className={cn("relative w-full", className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (term) submit(q.trim());
        }}
      >
        <div className="flex h-11 items-center gap-2 rounded-full border border-border bg-card px-4 shadow-soft transition-colors focus-within:border-primary">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={q}
            autoFocus={autoFocus}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search books, pens, notebooks, stationery..."
            aria-label="Search products"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {q && (
            <button type="button" onClick={() => setQ("")} aria-label="Clear search">
              <X className="size-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
      </form>

      {open && (
        <div className="absolute inset-x-0 top-13 z-50 overflow-hidden rounded-2xl border border-border bg-popover shadow-lift rise-in">
          {term ? (
            matches.length ? (
              <ul className="max-h-80 overflow-y-auto p-2">
                {matches.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => {
                        setOpen(false);
                        navigate({ to: "/product/$id", params: { id: p.id } });
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-secondary"
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        loading="lazy"
                        className="size-10 shrink-0 rounded-lg border border-border object-cover"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{p.name}</span>
                        <span className="block text-xs text-muted-foreground">{p.brand}</span>
                      </span>
                      <span className="shrink-0 text-sm font-semibold">{inr(p.price)}</span>
                    </button>
                  </li>
                ))}
                <li className="border-t border-border pt-1">
                  <button
                    onClick={() => submit(q.trim())}
                    className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-primary hover:bg-secondary"
                  >
                    See all results for “{q.trim()}”
                  </button>
                </li>
              </ul>
            ) : (
              <p className="p-4 text-sm text-muted-foreground">
                No matches for “{q.trim()}”. Try “pen”, “notebook” or “calculator”.
              </p>
            )
          ) : (
            <div className="p-3">
              <p className="mb-2 flex items-center gap-2 px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                <TrendingUp className="size-3.5" /> Popular searches
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((s) => (
                  <button
                    key={s}
                    onClick={() => submit(s)}
                    className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary hover:text-primary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
