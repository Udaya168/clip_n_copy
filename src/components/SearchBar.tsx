import { useNavigate, useSearch } from "@tanstack/react-router";
import { Search, TrendingUp, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { POPULAR_SEARCHES, type Product } from "@/lib/data";
import { useSupabaseProducts } from "@/lib/supabase-products";
import { inr } from "@/lib/shop-store";
import { cn } from "@/lib/utils";

export function isProductMatch(p: Product, searchTerm: string): boolean {
  if (!searchTerm) return true;
  const term = searchTerm.trim().toLowerCase();
  if (!term) return true;

  const name = (p.name || "").toLowerCase();
  const brand = (p.brand || "").toLowerCase();
  const cat = (p.category || "").toLowerCase();
  const desc = (p.description || "").toLowerCase();

  if (name.includes(term) || brand.includes(term) || cat.includes(term) || desc.includes(term)) {
    return true;
  }

  const singular = term.endsWith("s") ? term.slice(0, -1) : term;
  const plural = term + "s";

  if (
    name.includes(singular) ||
    cat.includes(singular) ||
    desc.includes(singular) ||
    name.includes(plural) ||
    cat.includes(plural)
  ) {
    return true;
  }

  if (term.includes("notebook") || term.includes("register") || term.includes("copy")) {
    return name.includes("notebook") || cat.includes("notebook") || name.includes("register");
  }
  if (term.includes("pen") || term.includes("pencil")) {
    return (
      name.includes("pen") ||
      name.includes("pencil") ||
      cat.includes("pen") ||
      cat.includes("pencil")
    );
  }
  if (term.includes("paper")) {
    return name.includes("paper") || cat.includes("office") || desc.includes("paper");
  }
  if (term.includes("calc")) {
    return name.includes("calc") || cat.includes("calc");
  }
  if (term.includes("book")) {
    return name.includes("book") || cat.includes("book");
  }

  return false;
}

export function SearchBar({ className, autoFocus }: { className?: string; autoFocus?: boolean }) {
  const navigate = useNavigate();
  const routeSearch = useSearch({ strict: false }) as { q?: string; category?: string };

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: products = [] } = useSupabaseProducts();

  useEffect(() => {
    if (routeSearch?.q !== undefined) {
      setQ(routeSearch.q);
    }
  }, [routeSearch?.q]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const term = q.trim();
  const matches = term ? products.filter((p) => isProductMatch(p, term)).slice(0, 8) : [];

  const handleSearch = (value: string) => {
    const trimmed = value.trim();
    setOpen(false);
    if (!trimmed) {
      navigate({ to: "/shop" });
      return;
    }
    setQ(trimmed);
    navigate({ to: "/shop", search: { q: trimmed } });
  };

  const handlePopularSearch = (item: string) => {
    setOpen(false);
    setQ(item);
    const lower = item.toLowerCase();
    if (lower.includes("notebook")) {
      navigate({ to: "/shop", search: { category: "notebooks" } });
    } else if (lower.includes("pen")) {
      navigate({ to: "/shop", search: { category: "pens-pencils" } });
    } else if (lower.includes("calc")) {
      navigate({ to: "/shop", search: { category: "calculators" } });
    } else if (lower.includes("book")) {
      navigate({ to: "/shop", search: { category: "books" } });
    } else if (lower.includes("art")) {
      navigate({ to: "/shop", search: { category: "art-craft" } });
    } else {
      navigate({ to: "/shop", search: { q: item } });
    }
  };

  return (
    <div ref={wrap} className={cn("relative w-full", className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch(q);
        }}
      >
        <div className="flex h-11 items-center gap-2 rounded-full border border-border bg-card px-4 shadow-soft transition-colors focus-within:border-primary">
          <button
            type="submit"
            aria-label="Search"
            className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
          >
            <Search className="size-4" />
          </button>

          <input
            ref={inputRef}
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
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setQ("");
                setOpen(false);
                if (inputRef.current) inputRef.current.focus();
              }}
              aria-label="Clear search"
              className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="size-4" />
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
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setOpen(false);
                        navigate({ to: "/product/$id", params: { id: p.id } });
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-secondary"
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
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSearch(q)}
                    className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-primary hover:bg-secondary"
                  >
                    See all results for “{q.trim()}”
                  </button>
                </li>
              </ul>
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">No matches for “{q.trim()}”.</p>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSearch(q)}
                  className="mt-2 text-xs font-semibold text-primary hover:underline"
                >
                  Search all items for “{q.trim()}”
                </button>
              </div>
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
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handlePopularSearch(s)}
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
