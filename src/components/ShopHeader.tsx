import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, User, UserCheck, Shield, LogOut, ArrowLeft } from "lucide-react";
import { useShop } from "@/lib/shop-store";
import { useAuth } from "@/lib/auth-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAppBack } from "@/lib/useAppBack";

export function ShopHeader() {
  const { cartCount, wishlist, setCartOpen } = useShop();
  const { user, profile, role, signOut } = useAuth();
  const goBack = useAppBack();
  
  const fullName = profile?.full_name || (user?.user_metadata?.["full_name"] as string) || "User";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="section-shell flex h-16 items-center gap-3 md:h-20 md:gap-6 justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={(e) => { e.preventDefault(); goBack("/shop"); }}
            className="flex items-center gap-2 text-slate-500 hover:text-[#0647E8] transition-colors text-sm font-medium mr-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <Link to="/" className="flex min-w-0 shrink-0 items-center gap-2.5">
            <img src="/logo.webp" alt="Clip N Copy" className="h-11 w-auto object-contain sm:h-13 md:h-14" />
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {user ? (
            <DropdownMenu>
              <div className="flex items-center gap-1.5">
                <DropdownMenuTrigger asChild>
                  <button
                    className="grid size-10 place-items-center rounded-full border border-primary bg-primary/10 text-primary transition-all duration-300 hover:bg-primary/20 hover:scale-105 active:scale-95 focus:outline-none cursor-pointer"
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
                    <UserCheck className="mr-2 size-4" /> My Account
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
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-destructive focus:bg-destructive/10 font-medium">
                  <LogOut className="mr-2 size-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link to="/login" className="hidden sm:flex rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary">
                Login
              </Link>
              <Link to="/login" className="sm:hidden grid size-10 place-items-center rounded-full border border-border transition-all duration-300 hover:bg-secondary hover:scale-105 active:scale-95 cursor-pointer">
                <User className="size-5" />
              </Link>
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
