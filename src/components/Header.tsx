import { Link, useLocation } from "@tanstack/react-router";
import {
  Heart,
  MapPin,
  Menu,
  Phone,
  Search,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Store,
  User,
  X,
  Home,
  Tag,
  Sparkles,
  LogOut,
  UserCheck,
  BookOpen,
  BookText,
  PenTool,
  School,
  Briefcase,
  Palette,
  Folder,
  Calculator,
  Backpack,
  Printer,
  ChevronRight,
  HelpCircle,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
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
  { label: "Home", to: "/", icon: <Home className="size-4 text-primary" /> },
  { label: "Stationery", to: "/shop", search: { category: "pens-pencils" }, icon: <PenTool className="size-4 text-primary" /> },
  { label: "Notebook", to: "/shop", search: { category: "notebooks" }, icon: <BookText className="size-4 text-primary" /> },
  { label: "School Supplies", to: "/shop", search: { category: "school-supplies" }, icon: <School className="size-4 text-primary" /> },
  { label: "Office Supplies", to: "/shop", search: { category: "office-supplies" }, icon: <Briefcase className="size-4 text-primary" /> },
  { label: "Art & Craft", to: "/shop", search: { category: "art-craft" }, icon: <Palette className="size-4 text-primary" /> },
  { label: "Files & Folders", to: "/shop", search: { category: "files-folders" }, icon: <Folder className="size-4 text-primary" /> },
  { label: "Calculators", to: "/shop", search: { category: "calculators" }, icon: <Calculator className="size-4 text-primary" /> },
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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="hidden bg-ink py-1.5 text-center text-xs text-ink-foreground md:block"
        >
          Free delivery around ITPL Main Road on orders above ₹79 · Printing &amp; binding ready in
          minutes
        </motion.div>

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
            <img src="/logo.webp" alt="Clip N Copy" className="h-11 w-auto object-contain sm:h-13 md:h-14" />
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
                      className="grid size-10 place-items-center rounded-full border border-primary bg-primary/10 text-primary transition-all duration-300 hover:bg-primary/20 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
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
                      className="grid size-10 place-items-center rounded-full border border-border transition-all duration-300 hover:bg-secondary hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
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
              className="relative grid size-10 place-items-center rounded-full border border-border transition-all duration-300 hover:scale-105 hover:bg-secondary active:scale-95"
              aria-label="Wishlist"
            >
              <Heart className="size-5" />
              {wishlist.length > 0 && <Badge>{wishlist.length}</Badge>}
            </Link>

            <button
              onClick={() => setCartOpen(true)}
              className="relative grid size-10 place-items-center rounded-full bg-ink text-ink-foreground transition-all duration-300 hover:bg-primary hover:scale-105 active:scale-95 cursor-pointer"
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
            {NAV_CATEGORIES.map((item) => {
              const isRouteActive = pathname === item.to;
              const isSearchMatch = !item.search?.['category'] || (location.search as Record<string, unknown>)?.['category'] === item.search['category'];
              const isActive = isRouteActive && isSearchMatch;
              
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  search={item.search as never}
                  activeOptions={{ exact: true, includeSearch: true }}
                  className="relative shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary group"
                  activeProps={{ className: "text-primary" }}
                >
                  {item.label}
                  <span className={cn(
                    "absolute -bottom-1 left-1/2 h-[2px] w-0 -translate-x-1/2 bg-primary transition-all duration-300 group-hover:w-full",
                    isActive ? "w-full" : "w-0"
                  )} />
                </Link>
              );
            })}
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
            className="absolute inset-0 bg-ink/60 backdrop-blur-sm cursor-pointer animate-in fade-in duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-out Drawer Panel */}
          <div className="fixed inset-y-0 left-0 flex w-[85vw] max-w-[360px] flex-col bg-white shadow-xl z-[101] rounded-r-[18px] overflow-hidden animate-in slide-in-from-left fade-in duration-300 ease-out">
            
            {/* 1. Header */}
            <div className="shrink-0 flex items-center justify-between px-4 h-[68px] border-b border-[#E5EAF2] bg-white">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
                <img src="/logo.webp" alt="Clip N Copy" className="w-[42px] h-auto object-contain" />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="grid size-9 place-items-center rounded-full hover:bg-secondary transition-colors text-muted-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Main Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 no-scrollbar">
              
              {/* 2. Main Navigation */}
              <nav className="flex flex-col gap-1.5">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`group flex items-center gap-3 h-[48px] px-3.5 rounded-xl transition-colors ${isHomeActive ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground hover:bg-secondary font-medium'}`}
                >
                  <Home className="size-[18px]" />
                  <span className="text-[14px] flex-1">Home</span>
                  <ChevronRight className="size-[18px] text-muted-foreground/50 group-hover:text-foreground/50" />
                </Link>

                <Link
                  to="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`group flex items-center gap-3 h-[48px] px-3.5 rounded-xl transition-colors ${isShopActive ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground hover:bg-secondary font-medium'}`}
                >
                  <Store className="size-[18px]" />
                  <span className="text-[14px] flex-1">Shop</span>
                  <ChevronRight className="size-[18px] text-muted-foreground/50 group-hover:text-foreground/50" />
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setCartOpen(true);
                  }}
                  className={`group flex items-center gap-3 h-[48px] px-3.5 rounded-xl transition-colors cursor-pointer w-full text-left ${isCartActive ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground hover:bg-secondary font-medium'}`}
                >
                  <ShoppingBag className="size-[18px]" />
                  <span className="text-[14px] flex-1">Cart</span>
                  {cartCount > 0 && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {cartCount}
                    </span>
                  )}
                  <ChevronRight className="size-[18px] text-muted-foreground/50 group-hover:text-foreground/50" />
                </button>

                <Link
                  to="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`group flex items-center gap-3 h-[48px] px-3.5 rounded-xl transition-colors ${location.pathname === '/wishlist' ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground hover:bg-secondary font-medium'}`}
                >
                  <Heart className="size-[18px]" />
                  <span className="text-[14px] flex-1">Wishlist</span>
                  {wishlist.length > 0 && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {wishlist.length}
                    </span>
                  )}
                  <ChevronRight className="size-[18px] text-muted-foreground/50 group-hover:text-foreground/50" />
                </Link>
              </nav>

              {/* 3. Browse Categories */}
              <div className="pt-1">
                <h3 className="text-[12px] font-bold uppercase tracking-[0.08em] text-muted-foreground px-2 mb-3">
                  Browse Categories
                </h3>
                
                <div className="flex flex-col gap-1.5">
                  {NAV_CATEGORIES.filter(item => item.label !== 'Home').map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      search={item.search as never}
                      onClick={() => setMobileMenuOpen(false)}
                      className="group flex items-center gap-3 h-[48px] px-3.5 rounded-xl bg-white border border-[#E5EAF2] text-foreground hover:border-primary/30 hover:bg-secondary/50 transition-colors shadow-sm"
                    >
                      <span className="text-primary flex items-center justify-center size-[18px] [&>svg]:size-full">
                        {item.icon}
                      </span>
                      <span className="text-[13px] font-medium flex-1">
                        {item.label}
                      </span>
                      <ChevronRight className="size-[14px] text-muted-foreground/50 group-hover:text-foreground/50" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* 4. Account / Login */}
              <div className="pt-2">
                <div className="h-[1px] w-full bg-[#E5EAF2] mb-4" />
                <div className="flex flex-col gap-1.5">
                  {!user ? (
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="group flex items-center gap-3 h-[48px] px-3.5 rounded-xl text-foreground hover:bg-secondary transition-colors font-medium"
                    >
                      <User className="size-[18px] text-primary" />
                      <span className="text-[14px] flex-1">Login</span>
                      <ChevronRight className="size-[18px] text-muted-foreground/50" />
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/store"
                        onClick={() => setMobileMenuOpen(false)}
                        className="group flex items-center gap-3 h-[48px] px-3.5 rounded-xl text-foreground hover:bg-secondary transition-colors font-medium"
                      >
                        <UserCheck className="size-[18px] text-primary" />
                        <span className="text-[14px] flex-1">My Account</span>
                        <ChevronRight className="size-[18px] text-muted-foreground/50" />
                      </Link>
                      
                      {role === "admin" && (
                        <Link
                          to="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="group flex items-center gap-3 h-[48px] px-3.5 rounded-xl text-foreground hover:bg-secondary transition-colors font-medium"
                        >
                          <Shield className="size-[18px] text-primary" />
                          <span className="text-[14px] flex-1">Admin Dashboard</span>
                          <ChevronRight className="size-[18px] text-muted-foreground/50" />
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          signOut();
                        }}
                        className="group w-full text-left flex items-center gap-3 h-[48px] px-3.5 rounded-xl text-destructive hover:bg-destructive/10 transition-colors font-medium cursor-pointer"
                      >
                        <LogOut className="size-[18px]" />
                        <span className="text-[14px] flex-1">Logout</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Spacing for call button */}
              <div className="h-16" />
            </div>

            {/* 5. Call Store Footer */}
            <div className="shrink-0 p-4 pt-0 bg-white border-t border-[#E5EAF2]">
              <a
                href={`tel:${STORE.phoneRaw}`}
                className="flex items-center justify-center gap-2 w-full h-[48px] rounded-[12px] bg-primary text-primary-foreground font-semibold text-[14px] transition-colors hover:bg-primary/90 mt-4"
              >
                <Phone className="size-[18px]" /> 
                Call {STORE.phone}
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
