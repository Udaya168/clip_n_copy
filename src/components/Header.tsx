import { Link } from "@tanstack/react-router";
import {
  Heart,
  MapPin,
  Menu,
  Phone,
  Search,
  ShoppingBag,
  User,
  X,
  Home,
  Tag,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { SearchBar } from "./SearchBar";
import { STORE } from "@/lib/data";
import { useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";

type NavItem = { label: string; to: string; search?: Record<string, string> };

const NAV: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "Stationery", to: "/shop", search: { category: "pens-pencils" } },
  { label: "Books", to: "/shop", search: { category: "books" } },
  { label: "School Supplies", to: "/shop", search: { category: "school-supplies" } },
  { label: "Office Supplies", to: "/shop", search: { category: "office-supplies" } },
  { label: "Art & Craft", to: "/shop", search: { category: "art-craft" } },
  { label: "Printing", to: "/services" },
  { label: "Binding", to: "/services" },
  { label: "Offers", to: "/offers" },
];

export function Header() {
  const { cartCount, wishlist, setCartOpen } = useShop();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="hidden bg-ink py-1.5 text-center text-xs text-ink-foreground md:block">
        Free delivery around ITPL Main Road on orders above ₹499 · Printing &amp; binding ready in
        minutes
      </div>

      <div className="section-shell flex h-16 items-center gap-3 md:h-20 md:gap-6">
        <button
          className="grid size-10 shrink-0 place-items-center rounded-full border border-border lg:hidden"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="size-5" />
        </button>

        <Link to="/" className="flex min-w-0 shrink-0 items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-xl hero-gradient font-display text-sm font-black text-primary-foreground shadow-glow md:size-11">
            CNC
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-base leading-tight font-extrabold md:text-lg">
              Clip <span className="text-accent">N</span> Copy
            </span>
            <span className="hidden text-[11px] text-muted-foreground sm:block">
              Stationery · Books · Printing
            </span>
          </span>
        </Link>

        <div className="hidden flex-1 lg:block">
          <SearchBar />
        </div>

        <div className="ml-auto flex items-center gap-1 md:gap-2">
          <button
            className="grid size-10 place-items-center rounded-full border border-border lg:hidden"
            aria-label="Search"
            onClick={() => setMobileSearch((v) => !v)}
          >
            <Search className="size-5" />
          </button>

          <span className="hidden max-w-45 items-center gap-2 rounded-full border border-border px-3 py-2 text-left xl:flex">
            <MapPin className="size-4 shrink-0 text-primary" />
            <span className="min-w-0">
              <span className="block text-[10px] text-muted-foreground uppercase">Store</span>
              <span className="block truncate text-xs font-semibold">Kundalahalli, BLR</span>
            </span>
          </span>

          <Link
            to="/store"
            className="hidden size-10 place-items-center rounded-full border border-border md:grid"
            aria-label="Account"
          >
            <User className="size-5" />
          </Link>

          <Link
            to="/wishlist"
            className="relative grid size-10 place-items-center rounded-full border border-border"
            aria-label="Wishlist"
          >
            <Heart className="size-5" />
            {wishlist.length > 0 && <Badge>{wishlist.length}</Badge>}
          </Link>

          <button
            onClick={() => setCartOpen(true)}
            className="relative grid size-10 place-items-center rounded-full bg-ink text-ink-foreground transition-colors hover:bg-primary"
            aria-label="Open cart"
          >
            <ShoppingBag className="size-5" />
            {cartCount > 0 && <Badge>{cartCount}</Badge>}
          </button>
        </div>
      </div>

      {mobileSearch && (
        <div className="section-shell pb-3 lg:hidden">
          <SearchBar autoFocus />
        </div>
      )}

      <nav className="hidden border-t border-border lg:block">
        <div className="section-shell flex h-12 items-center gap-1 overflow-x-auto no-scrollbar">
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              search={item.search as never}
              className="shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
              activeProps={{ className: "bg-primary-soft text-primary" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={`tel:${STORE.phoneRaw}`}
            className="ml-auto hidden shrink-0 items-center gap-2 text-sm font-semibold text-primary xl:flex"
          >
            <Phone className="size-4" /> {STORE.phone}
          </a>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-60 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[82%] max-w-80 flex-col bg-background shadow-lift">
            <div className="flex items-center justify-between border-b border-border p-4">
              <span className="font-display font-extrabold">Browse</span>
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {NAV.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  search={item.search as never}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-3 py-3 text-sm font-semibold hover:bg-secondary"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/store"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-3 py-3 text-sm font-semibold hover:bg-secondary"
              >
                Visit Store
              </Link>
            </div>
            <a
              href={`tel:${STORE.phoneRaw}`}
              className="m-3 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary font-semibold text-primary-foreground"
            >
              <Phone className="size-4" /> Call {STORE.phone}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full accent-gradient px-1 text-[10px] font-bold text-accent-foreground">
      {children}
    </span>
  );
}

export function MobileBottomNav() {
  const { cartCount, setCartOpen } = useShop();
  const item = "flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-semibold";
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <Link
        to="/"
        className={cn(item, "text-muted-foreground")}
        activeProps={{ className: "text-primary" }}
        activeOptions={{ exact: true }}
      >
        <Home className="size-5" /> Home
      </Link>
      <Link
        to="/shop"
        className={cn(item, "text-muted-foreground")}
        activeProps={{ className: "text-primary" }}
      >
        <Sparkles className="size-5" /> Shop
      </Link>
      <Link
        to="/offers"
        className={cn(item, "text-muted-foreground")}
        activeProps={{ className: "text-primary" }}
      >
        <Tag className="size-5" /> Offers
      </Link>
      <Link
        to="/wishlist"
        className={cn(item, "text-muted-foreground")}
        activeProps={{ className: "text-primary" }}
      >
        <Heart className="size-5" /> Saved
      </Link>
      <button
        onClick={() => setCartOpen(true)}
        className={cn(item, "relative text-muted-foreground")}
      >
        <ShoppingBag className="size-5" /> Cart
        {cartCount > 0 && (
          <span className="absolute top-1 right-1/4 grid min-w-4.5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {cartCount}
          </span>
        )}
      </button>
    </nav>
  );
}
