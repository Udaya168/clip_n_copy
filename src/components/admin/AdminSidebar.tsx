import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Boxes,
  Package,
  ShoppingBag,
  Settings,
  LogOut,
  X,
  Menu,
  Shield,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

export type AdminTab = "dashboard" | "inventory" | "products" | "orders" | "settings";

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
}

export function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  const { signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="size-4" /> },
    { id: "inventory", label: "Inventory", icon: <Boxes className="size-4" /> },
    { id: "products", label: "Products", icon: <Package className="size-4" /> },
    { id: "orders", label: "Orders", icon: <ShoppingBag className="size-4" /> },
    { id: "settings", label: "Settings", icon: <Settings className="size-4" /> },
  ];

  return (
    <>
      {/* Mobile top trigger bar */}
      <div className="flex items-center justify-between border-b border-border bg-background p-3 lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-bold"
        >
          <Menu className="size-4" /> Admin Menu
        </button>
        <span className="inline-flex items-center gap-1 text-xs font-extrabold text-primary">
          <Shield className="size-3.5" /> Clip N Copy Admin
        </span>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-background p-4 lg:flex min-h-[calc(100vh-4rem)]">
        <div className="mb-6 px-3 py-2">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.webp" alt="Clip N Copy" className="h-10 w-auto object-contain" />
          </Link>
          <p className="mt-2 text-[10px] font-extrabold tracking-wider text-primary uppercase">
            Admin Portal
          </p>
        </div>

        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-xs font-bold transition-all cursor-pointer",
                activeTab === item.id
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-2 border-t border-border pt-4">
          <Link
            to="/"
            className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Storefront
          </Link>
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-destructive hover:bg-destructive/10 cursor-pointer"
          >
            <LogOut className="size-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-background shadow-lift p-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="font-display text-sm font-extrabold">Admin Menu</span>
              <button onClick={() => setMobileOpen(false)}>
                <X className="size-5" />
              </button>
            </div>
            <nav className="mt-4 flex-1 space-y-1.5">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-bold transition-colors cursor-pointer",
                    activeTab === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="border-t border-border pt-3">
              <button
                onClick={() => signOut()}
                className="flex w-full items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
              >
                <LogOut className="size-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
