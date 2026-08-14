import { Link, useLocation } from "@tanstack/react-router";
import {
  Heart,
  MapPin,
  Menu,
  Phone,
  Search,
  ShoppingBag,
  ShoppingCart,
  Store,
  User,
  X,
  Home,
  Tag,
  Sparkles,
  LogOut,
  Shield,
  UserCheck,
  BookOpen,
  PenTool,
  School,
  Briefcase,
  Palette,
  Folder,
  Calculator,
  Backpack,
  Printer,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { SearchBar } from "./SearchBar";
import { STORE } from "@/lib/data";
import { useShop } from "@/lib/shop-store";
import { useAuth } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavItem = { label: string; to: string; icon?: React.ReactNode; search?: Record<string, string> };

const NAV_CATEGORIES: NavItem[] = [
  { label: "Stationery", to: "/shop", search: { category: "pens-pencils" }, icon: <PenTool className="size-4 text-primary" /> },
  { label: "Books", to: "/shop", search: { category: "books" }, icon: <BookOpen className="size-4 text-primary" /> },
  { label: "School Supplies", to: "/shop", search: { category: "school-supplies" }, icon: <School className="size-4 text-primary" /> },
  { label: "Office Supplies", to: "/shop", search: { category: "office-supplies" }, icon: <Briefcase className="size-4 text-primary" /> },
  { label: "Art & Craft", to: "/shop", search: { category: "art-craft" }, icon: <Palette className="size-4 text-primary" /> },
  { label: "Files & Folders", to: "/shop", search: { category: "files-folders" }, icon: <Folder className="size-4 text-primary" /> },
  { label: "Calculators", to: "/shop", search: { category: "calculators" }, icon: <Calculator className="size-4 text-primary" /> },
  { label: "Bags & Backpacks", to: "/shop", search: { category: "bags" }, icon: <Backpack className="size-4 text-primary" /> },
  { label: "Printing & Services", to: "/services", icon: <Printer className="size-4 text-primary" /> },
];

export function Header() {
  const { cartCount, wishlist, setCartOpen, mobileMenuOpen, setMobileMenuOpen } = useShop();
  const { user, profile, role, signOut } = useAuth();
  const [mobileSearch, setMobileSearch] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;

  const fullName = profile?.full_name || (user?.user_metadata?.["full_name"] as string) || "User";

  // Active state calculations
  const isHomeActive = pathname === "/";
  const isShopActive = pathname === "/shop";
  const isCartActive = pathname === "/checkout";
  const isAccountActive = pathname === "/account" || pathname === "/store" || pathname === "/login" || pathname === "/signup";
  const isAdminActive = pathname.startsWith("/admin");

  const getNavItemStyle = (isActive: boolean) =>
    cn(
      "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition-all cursor-pointer",
      isActive
        ? "bg-primary-soft text-primary font-black border-l-4 border-primary shadow-xs"
        : "text-foreground hover:bg-secondary"
    );

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="hidden bg-ink py-1.5 text-center text-xs text-ink-foreground md:block">
          Free delivery around ITPL Main Road on orders above ₹499 · Printing &amp; binding ready in
          minutes
        </div>

        <div className="section-shell flex h-16 items-center gap-3 md:h-20 md:gap-6">
          {/* Top-left Hamburger Menu (Three Lines ☰ Icon) */}
          <button
            className="grid size-10 shrink-0 place-items-center rounded-full border border-border lg:hidden transition-colors hover:bg-secondary cursor-pointer"
            aria-label="Open menu"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="size-5 text-foreground" />
          </button>

          <Link to="/" className="flex min-w-0 shrink-0 items-center gap-2.5">
            <img src="/logo.png" alt="Clip N Copy" className="h-10 w-auto object-contain md:h-12" />
          </Link>

          <div className="hidden flex-1 lg:block">
            <SearchBar />
          </div>

          <div className="ml-auto flex items-center gap-1.5 md:gap-2">
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

            {/* User Account Menu (Desktop) */}
            {user ? (
              <DropdownMenu>
                <div className="hidden md:flex items-center gap-1.5">
                  <DropdownMenuTrigger asChild>
                    <button
                      className="rounded-full border border-primary/30 bg-primary-soft/80 px-3.5 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary-soft max-w-28 sm:max-w-44 truncate focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                      aria-label="User Full Name"
                    >
                      {fullName}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="grid size-10 place-items-center rounded-full border border-primary bg-primary/10 text-primary transition-colors hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                      aria-label="User Account Menu"
                    >
                      <User className="size-5" />
                    </button>
                  </DropdownMenuTrigger>
                </div>

                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-lift">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none truncate">{fullName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      {role === "admin" && (
                        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-extrabold text-primary">
                          <Shield className="size-3" /> Admin
                        </span>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1.5" />
                  <DropdownMenuItem asChild>
                    <Link to="/store" className="cursor-pointer font-medium">
                      <UserCheck className="mr-2 size-4" /> My Account &amp; Orders
                    </Link>
                  </DropdownMenuItem>
                  {role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer font-semibold text-primary">
                        <Shield className="mr-2 size-4" /> Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="my-1.5" />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="cursor-pointer text-destructive focus:bg-destructive/10 font-medium"
                  >
                    <LogOut className="mr-2 size-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-1.5">
                <Link
                  to="/login"
                  className="rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
                >
                  Login
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="grid size-10 place-items-center rounded-full border border-border hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                      aria-label="User Account Menu"
                    >
                      <User className="size-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-lift">
                    <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Account Access
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem asChild>
                      <Link to="/login" className="cursor-pointer font-semibold">
                        Login
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/signup" className="cursor-pointer font-semibold text-primary">
                        Sign Up
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

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
              className="relative grid size-10 place-items-center rounded-full bg-ink text-ink-foreground transition-colors hover:bg-primary cursor-pointer"
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

        {/* Desktop Category Bar */}
        <nav className="hidden border-t border-border lg:block">
          <div className="section-shell flex h-12 items-center gap-1 overflow-x-auto no-scrollbar">
            {NAV_CATEGORIES.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                search={item.search as never}
                className="shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                activeProps={{ className: "bg-primary-soft text-primary" }}
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
      </header>

      {/* Mobile Slide-Out Navigation Drawer (rendered as sibling outside header) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop (Tapping outside closes drawer) */}
          <div
            className="absolute inset-0 bg-ink/60 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-out Drawer Panel */}
          <div className="fixed inset-y-0 left-0 flex w-[85%] max-w-80 flex-col bg-background shadow-2xl z-[101]">
            
            {/* Drawer Header */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-4">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5">
                <img src="/logo.png" alt="Clip N Copy" className="h-8 w-auto object-contain" />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="grid size-9 place-items-center rounded-full border border-border hover:bg-secondary transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Drawer Menu Options in Exact Order */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              <nav className="flex flex-col gap-1.5">
                {/* 1. Home */}
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={getNavItemStyle(isHomeActive)}
                >
                  <div className="flex items-center gap-3">
                    <Home className="size-5 shrink-0" />
                    <span>Home</span>
                  </div>
                </Link>

                {/* 2. Shop */}
                <Link
                  to="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className={getNavItemStyle(isShopActive)}
                >
                  <div className="flex items-center gap-3">
                    <Store className="size-5 shrink-0" />
                    <span>Shop</span>
                  </div>
                </Link>


                {/* 4. Cart */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setCartOpen(true);
                  }}
                  className={getNavItemStyle(isCartActive)}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="size-5 shrink-0" />
                    <span>Cart</span>
                  </div>
                  {cartCount > 0 && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-extrabold text-primary-foreground shadow-xs">
                      {cartCount}
                    </span>
                  )}
                </button>

                {/* 5. Account */}
                <Link
                  to={user ? "/store" : "/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className={getNavItemStyle(isAccountActive)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <User className="size-5 shrink-0" />
                    <div className="flex flex-col text-left min-w-0">
                      <span className="leading-tight">Account</span>
                      <span className="text-xs font-normal text-muted-foreground truncate">
                        {user ? fullName : "Sign In"}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Admin Portal (ONLY for users with profiles.role === 'admin') */}
                {user && role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getNavItemStyle(isAdminActive)}
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="size-5 shrink-0 text-primary" />
                      <span className="text-primary font-bold">Admin Portal</span>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-primary" />
                  </Link>
                )}
              </nav>

              {/* Logged in User Actions & Sign Out */}
              {user && (
                <div className="border-t border-border pt-3">
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <LogOut className="size-4" /> Sign Out
                    </span>
                  </button>
                </div>
              )}

              {/* Categories & Services */}
              <div className="border-t border-border pt-3 space-y-1">
                <p className="px-2 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1">
                  Browse Categories
                </p>

                {NAV_CATEGORIES.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    search={item.search as never}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-foreground hover:bg-secondary transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      {item.icon}
                      {item.label}
                    </span>
                    <ChevronRight className="size-3.5 text-muted-foreground" />
                  </Link>
                ))}
              </div>

            </div>

            {/* Call Store Footer */}
            <div className="shrink-0 border-t border-border bg-background p-3.5 mb-0">
              <a
                href={`tel:${STORE.phoneRaw}`}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary font-bold text-xs text-primary-foreground shadow-glow"
              >
                <Phone className="size-4" /> Call {STORE.phone}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full accent-gradient px-1 text-[10px] font-bold text-accent-foreground">
      {children}
    </span>
  );
}
