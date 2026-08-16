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
          Free delivery around ITPL Main Road on orders above ₹499 · Printing &amp; binding ready in
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
            <img src="/logo.webp" alt="Clip N Copy" className="h-13 w-auto object-contain sm:h-15 md:h-16 lg:h-[68px]" />
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
        <>
          <style>{`
            @keyframes shimmer {
              0% { transform: translateX(-100%); opacity: 0; }
              50% { opacity: 1; }
              100% { transform: translateX(100%); opacity: 0; }
            }
            @keyframes breathingGlow {
              0%, 100% { box-shadow: 0 12px 24px -8px rgba(6,71,232,0.6), 0 0 0px rgba(6,71,232,0); }
              50% { box-shadow: 0 16px 32px -8px rgba(6,71,232,0.7), 0 0 15px rgba(6,71,232,0.4); }
            }
            .animate-shimmer {
              animation: shimmer 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
            }
            .animate-breathing-glow {
              animation: breathingGlow 3s infinite ease-in-out;
            }
          `}</style>
          <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop (Tapping outside closes drawer) */}
          <div
            className="absolute inset-0 bg-ink/60 backdrop-blur-md cursor-pointer animate-in fade-in duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-out Drawer Panel */}
          {/* Slide-out Drawer Panel */}
          {/* Slide-out Drawer Panel */}
          {/* Slide-out Drawer Panel */}
          <div className="fixed inset-y-0 left-0 flex w-[92vw] max-w-[420px] flex-col bg-white shadow-[20px_0_50px_rgba(11,36,85,0.15)] z-[101] rounded-tr-[36px] rounded-br-[36px] overflow-hidden border-r border-[#EAF2FF] animate-in slide-in-from-left fade-in zoom-in-[0.98] duration-300 ease-out">
            
            {/* 1. Top Section (Premium Blue Decorative Wave Header) */}
            <div className="relative shrink-0 bg-white px-7 pt-12 pb-8 border-b border-[#EAF2FF] overflow-hidden">
              {/* Decorative Blue Wave Shape */}
              <div className="absolute top-0 left-0 w-full h-[140px] -z-10 overflow-hidden bg-gradient-to-br from-[#F4F8FF] to-white/30">
                <svg viewBox="0 0 400 150" preserveAspectRatio="none" className="absolute top-0 left-0 w-full h-full text-[#EAF2FF]/60">
                  <path d="M0,0 L400,0 L400,30 C300,100 150,150 0,60 Z" fill="currentColor" />
                </svg>
                {/* Dotted Pattern Overlay Inside Wave */}
                <svg width="80" height="80" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute top-0 left-0 text-[#075BFF]/5 rotate-12 translate-x-4 -translate-y-4">
                  <path d="M5 5h2v2H5V5zm10 0h2v2h-2V5zm10 0h2v2h-2V5zm10 0h2v2h-2V5zm10 0h2v2h-2V5zm10 0h2v2h-2V5zM5 15h2v2H5v-2zm10 0h2v2h-2v-2zm10 0h2v2h-2v-2zm10 0h2v2h-2v-2zm10 0h2v2h-2v-2zm10 0h2v2h-2v-2z" fill="currentColor"/>
                  <path d="M5 25h2v2H5v-2zm10 0h2v2h-2v-2zm10 0h2v2h-2v-2zm10 0h2v2h-2v-2zm10 0h2v2h-2v-2zm10 0h2v2h-2v-2z" fill="currentColor"/>
                </svg>
                {/* Small blue dot pattern along left edge */}
                <svg width="20" height="60" viewBox="0 0 20 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute top-1/2 left-2 text-[#075BFF]/10">
                  <path d="M5 5h2v2H5V5zm0 10h2v2H5v-2zm0 10h2v2H5v-2zm0 10h2v2H5v-2zm0 10h2v2H5v-2z" fill="currentColor"/>
                </svg>
              </div>
              <div className="flex items-center justify-between">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center animate-in fade-in slide-in-from-top-4 duration-500" style={{ animationFillMode: 'both', animationDelay: '100ms' }}>
                  <img src="/logo.webp" alt="Clip N Copy" className="h-14 w-auto object-contain drop-shadow-sm" />
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="grid size-11 place-items-center rounded-full border border-[#DCEBFF] bg-white hover:bg-[#F4F8FF] hover:scale-[1.08] active:scale-[0.95] hover:rotate-[15deg] transition-all duration-300 cursor-pointer text-[#075BFF] shadow-[0_4px_12px_rgba(7,91,255,0.08)] hover:shadow-[0_4px_16px_rgba(7,91,255,0.15)] animate-in fade-in spin-in-[-20deg] duration-500"
                  style={{ animationFillMode: 'both', animationDelay: '150ms' }}
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Main Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto px-7 py-8 space-y-10 no-scrollbar">
              
              {/* 2. Quick Actions (Large 2x2 Grid) */}
              <nav className="grid grid-cols-2 gap-5">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`group relative flex flex-col items-center justify-center gap-4 h-[140px] rounded-[28px] transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02] active:scale-[0.97] active:translate-y-0 animate-in fade-in slide-in-from-bottom-4 overflow-hidden ${isHomeActive ? 'bg-gradient-to-br from-[#075BFF] to-[#0B5CFF] text-white shadow-[0_12px_28px_-6px_rgba(7,91,255,0.5)]' : 'bg-[#F4F8FF] border border-[#EAF2FF] text-[#0B2455] hover:shadow-lg'}`}
                  style={{ animationFillMode: 'both', animationDelay: '150ms' }}
                >
                  <Home className={`size-8 transition-transform duration-300 group-hover:scale-[1.08] ${isHomeActive ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'text-[#075BFF] shadow-sm'}`} />
                  <span className="text-[13px] font-bold tracking-wide">Home</span>
                  {isHomeActive && (
                    <>
                      <Sparkles className="absolute top-4 right-4 size-4 text-white/80 animate-pulse" />
                      <span className="absolute bottom-4 h-[3px] w-6 rounded-full bg-white/90 shadow-[0_0_12px_rgba(255,255,255,0.9)] animate-pulse" />
                    </>
                  )}
                  {/* Subtle dots in corner for non-active */}
                  {!isHomeActive && (
                    <div className="absolute top-3 right-3 text-[#075BFF]/10">
                      <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 2h2v2H2V2zm4 0h2v2H6V2z" fill="currentColor"/></svg>
                    </div>
                  )}
                </Link>

                <Link
                  to="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`group relative flex flex-col items-center justify-center gap-4 h-[140px] rounded-[28px] transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02] active:scale-[0.97] active:translate-y-0 animate-in fade-in slide-in-from-bottom-4 overflow-hidden ${isShopActive ? 'bg-gradient-to-br from-[#075BFF] to-[#0B5CFF] text-white shadow-[0_12px_28px_-6px_rgba(7,91,255,0.5)]' : 'bg-[#F4F8FF] border border-[#EAF2FF] text-[#0B2455] hover:border-[#DCEBFF] hover:shadow-[0_8px_20px_-6px_rgba(7,91,255,0.15)]'}`}
                  style={{ animationFillMode: 'both', animationDelay: '200ms' }}
                >
                  <div className="grid size-12 place-items-center rounded-full bg-white/60 group-hover:bg-white shadow-[0_4px_12px_rgba(7,91,255,0.05)] transition-all">
                    <Store className={`size-6 transition-transform duration-300 group-hover:scale-[1.08] ${isShopActive ? 'text-white' : 'text-[#075BFF]'}`} />
                  </div>
                  <span className="text-[13px] font-bold tracking-wide">Shop</span>
                  {!isShopActive && (
                    <div className="absolute top-3 right-3 text-[#075BFF]/10">
                      <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 2h2v2H2V2zm4 0h2v2H6V2z" fill="currentColor"/></svg>
                    </div>
                  )}
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setCartOpen(true);
                  }}
                  className={`group relative flex flex-col items-center justify-center gap-4 h-[140px] rounded-[28px] transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02] active:scale-[0.97] active:translate-y-0 cursor-pointer animate-in fade-in slide-in-from-bottom-4 overflow-hidden ${isCartActive ? 'bg-gradient-to-br from-[#075BFF] to-[#0B5CFF] text-white shadow-[0_12px_28px_-6px_rgba(7,91,255,0.5)]' : 'bg-[#F4F8FF] border border-[#EAF2FF] text-[#0B2455] hover:border-[#DCEBFF] hover:shadow-[0_8px_20px_-6px_rgba(7,91,255,0.15)]'}`}
                  style={{ animationFillMode: 'both', animationDelay: '250ms' }}
                >
                  <div className="grid size-12 place-items-center rounded-full bg-white/60 group-hover:bg-white shadow-[0_4px_12px_rgba(7,91,255,0.05)] transition-all">
                    <ShoppingBag className={`size-6 transition-all duration-300 group-hover:scale-[1.08] group-hover:-translate-y-0.5 ${isCartActive ? 'text-white' : 'text-[#075BFF]'}`} />
                  </div>
                  <span className="text-[13px] font-bold tracking-wide">Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute top-4 right-4 flex size-7 items-center justify-center rounded-full bg-destructive text-[12px] font-bold text-white shadow-sm ring-4 ring-[#F4F8FF] group-hover:ring-white transition-all">
                      {cartCount}
                    </span>
                  )}
                  {!isCartActive && (
                    <div className="absolute top-3 left-3 text-[#075BFF]/10">
                      <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 2h2v2H2V2zm4 0h2v2H6V2z" fill="currentColor"/></svg>
                    </div>
                  )}
                </button>

                <Link
                  to="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`group relative flex flex-col items-center justify-center gap-4 h-[140px] rounded-[28px] transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02] active:scale-[0.97] active:translate-y-0 animate-in fade-in slide-in-from-bottom-4 overflow-hidden ${location.pathname === '/wishlist' ? 'bg-gradient-to-br from-[#075BFF] to-[#0B5CFF] text-white shadow-[0_12px_28px_-6px_rgba(7,91,255,0.5)]' : 'bg-[#F4F8FF] border border-[#EAF2FF] text-[#0B2455] hover:border-[#DCEBFF] hover:shadow-[0_8px_20px_-6px_rgba(7,91,255,0.15)]'}`}
                  style={{ animationFillMode: 'both', animationDelay: '300ms' }}
                >
                  <div className="grid size-12 place-items-center rounded-full bg-white/60 group-hover:bg-white shadow-[0_4px_12px_rgba(7,91,255,0.05)] transition-all">
                    <Heart className={`size-6 transition-transform duration-300 group-hover:scale-[1.15] ${location.pathname === '/wishlist' ? 'text-white' : 'text-[#075BFF]'}`} />
                  </div>
                  <span className="text-[13px] font-bold tracking-wide">Wishlist</span>
                  {wishlist.length > 0 && (
                    <span className="absolute top-4 right-4 flex size-7 items-center justify-center rounded-full bg-[#075BFF] text-[12px] font-bold text-white shadow-sm ring-4 ring-[#F4F8FF] group-hover:ring-white transition-all">
                      {wishlist.length}
                    </span>
                  )}
                  {location.pathname !== '/wishlist' && (
                    <div className="absolute top-3 left-3 text-[#075BFF]/10">
                      <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 2h2v2H2V2zm4 0h2v2H6V2z" fill="currentColor"/></svg>
                    </div>
                  )}
                </Link>
              </nav>

              {/* 3. Large Account Profile Card */}
              <Link
                to={user ? "/store" : "/login"}
                onClick={() => setMobileMenuOpen(false)}
                className="group flex items-center gap-4 h-[85px] rounded-[24px] bg-[#F4F8FF] p-4 border border-[#EAF2FF] transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.97] shadow-[0_4px_16px_-4px_rgba(7,91,255,0.1)] hover:shadow-[0_8px_24px_-6px_rgba(7,91,255,0.2)] animate-in fade-in slide-in-from-bottom-4"
                style={{ animationFillMode: 'both', animationDelay: '350ms' }}
              >
                <div className="grid size-[52px] shrink-0 place-items-center rounded-full bg-[#075BFF]/10 text-[#075BFF] transition-all duration-300 group-hover:bg-[#075BFF]/20 group-hover:scale-105 shadow-sm">
                  <User className="size-6 transition-transform group-hover:scale-110" />
                </div>
                <div className="flex flex-col text-left min-w-0 flex-1 justify-center">
                  <span className="text-[15px] font-bold text-[#0B2455] leading-tight">Account</span>
                  <span className="text-[13px] font-medium text-[#0B2455]/60">
                    {user ? fullName : "Sign In or Register"}
                  </span>
                </div>
                <ChevronRight className="size-5 text-[#075BFF]/40 shrink-0 transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-[#075BFF]" />
              </Link>

              {/* Admin Portal */}
              {user && role === "admin" && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="group flex items-center gap-4 h-[85px] rounded-[24px] bg-blue-600/5 p-4 border border-blue-600/20 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.97] animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationFillMode: 'both', animationDelay: '380ms' }}
                >
                  <div className="grid size-[52px] shrink-0 place-items-center rounded-full bg-blue-600 text-white shadow-sm group-hover:scale-105 transition-transform duration-300">
                    <Shield className="size-6 transition-transform group-hover:scale-110" />
                  </div>
                  <span className="text-[15px] font-bold text-blue-700 flex-1">Admin Dashboard</span>
                  <ChevronRight className="size-5 text-blue-300 shrink-0 transition-transform group-hover:translate-x-1.5 group-hover:text-blue-500" />
                </Link>
              )}

              {/* 4. Browse Categories */}
              <div className="space-y-5">
                {/* Premium Branding Detail Header */}
                <div className="flex items-center gap-3 px-1 animate-in fade-in slide-in-from-bottom-4" style={{ animationFillMode: 'both', animationDelay: '400ms' }}>
                  <div className="grid place-items-center size-7 rounded-[8px] bg-[#075BFF]/10 text-[#075BFF]">
                    <Store className="size-4" />
                  </div>
                  <div className="h-5 w-1.5 rounded-full bg-[#075BFF] shadow-[0_0_8px_rgba(7,91,255,0.6)]" />
                  <h3 className="text-[14px] font-black uppercase tracking-widest text-[#0B2455]">
                    Browse Categories
                  </h3>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-[#DCEBFF] to-transparent ml-2" />
                  <Sparkles className="size-5 text-[#075BFF] opacity-80" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {NAV_CATEGORIES.filter(item => item.label !== 'Home').map((item, i) => {
                    return (
                      <Link
                        key={item.label}
                        to={item.to}
                        search={item.search as never}
                        onClick={() => setMobileMenuOpen(false)}
                        className="group col-span-1 w-full flex flex-col items-start gap-4 h-[105px] rounded-[20px] bg-white border border-[#EAF2FF] p-4 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-[3px] active:scale-[0.98] active:translate-y-0 hover:border-[#DCEBFF] hover:shadow-[0_8px_20px_-6px_rgba(7,91,255,0.12)] shadow-sm animate-in fade-in slide-in-from-bottom-4 zoom-in-[0.98]"
                        style={{ animationFillMode: 'both', animationDelay: `${450 + (i * 40)}ms` }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#F4F8FF] text-[#075BFF] shadow-[0_4px_12px_rgba(7,91,255,0.05)] transition-all duration-300 group-hover:scale-[1.05] group-hover:bg-[#EAF2FF] group-hover:shadow-[0_6px_16px_rgba(7,91,255,0.15)]">
                            {item.icon}
                          </span>
                          <ChevronRight className="size-5 text-[#0B2455]/20 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#075BFF]" />
                        </div>
                        <span className="text-[13px] font-bold text-[#0B2455] leading-tight">
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Sign Out */}
              {user && (
                <div className="pt-6 pb-2 animate-in fade-in slide-in-from-bottom-4" style={{ animationFillMode: 'both', animationDelay: `${450 + (NAV_CATEGORIES.length * 40)}ms` }}>
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-4 text-[14px] font-bold text-red-600 transition-all duration-300 hover:bg-red-100 hover:scale-[1.02] active:scale-[0.97] cursor-pointer shadow-sm"
                  >
                    <LogOut className="size-5" /> Sign Out
                  </button>
                </div>
              )}
              
              {/* Extra spacing at the bottom to ensure the fixed call button doesn't cover content */}
              <div className="h-10" />
            </div>

            {/* 7. Call Store Footer (Sticky, Premium Floating Pill) */}
            <div className="shrink-0 bg-transparent p-6 pb-10 pt-0 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out z-10 pointer-events-none" style={{ animationFillMode: 'both', animationDelay: '300ms' }}>
              <div className="pointer-events-auto">
                <a
                  href={`tel:${STORE.phoneRaw}`}
                  className="animate-breathing-glow group relative overflow-hidden flex h-[58px] w-full items-center justify-center gap-3 rounded-[30px] bg-[#075BFF] font-bold text-[16px] text-white transition-all duration-300 hover:-translate-y-[2px] hover:brightness-110 active:translate-y-0 active:scale-[0.97] shadow-[0_12px_24px_-8px_rgba(7,91,255,0.6)] border border-white/10"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:animate-shimmer" />
                  <Phone className="size-[22px] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-3 drop-shadow-md z-10" /> 
                  <span className="relative z-10 drop-shadow-md tracking-wide">Call {STORE.phone}</span>
                  <Sparkles className="absolute top-2 right-4 size-3 text-white/40" />
                </a>
              </div>
            </div>
          </div>
        </div>
        </>
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
