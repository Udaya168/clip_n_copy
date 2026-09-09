import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-store";
import { Link } from "react-router-dom";
import { LogOut, Shield, User as UserIcon, Home, Search, Bell, BellRing, Volume2, VolumeX, Check, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminNotifications } from "@/lib/admin-notification-context";
import { inr } from "@/lib/shop-store";

interface AdminHeaderProps {
  title: string;
  onSelectOrder?: (orderId: string) => void;
}

export function AdminHeader({ title, onSelectOrder }: AdminHeaderProps) {
  const { user, profile, signOut } = useAuth();
  const adminName = profile?.full_name || (user?.user_metadata?.["full_name"] as string) || "Admin";

  const {
    notifications,
    unreadCount,
    permissionStatus,
    pushSubscribed,
    enablePushNotifications,
    acknowledgeNotification,
    markAllAsRead,
    clearNotifications,
    activeAlarm,
    stopAlarm,
    testSound,
  } = useAdminNotifications();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [enablingPush, setEnablingPush] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEnablePush = async () => {
    setEnablingPush(true);
    try {
      await enablePushNotifications();
    } finally {
      setEnablingPush(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-xl md:px-8">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-lg font-black tracking-tight text-foreground sm:text-xl">
          {title}
        </h1>
      </div>

      <div className="flex items-center justify-end gap-3 flex-1 ml-4">
        <div className="hidden md:flex relative max-w-sm w-full mr-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Search products, orders..." 
            className="pl-9 bg-secondary/30 border-border rounded-full h-9 text-xs"
          />
        </div>

        {/* Enable Browser & Web Push Notifications Button */}
        {(!pushSubscribed || permissionStatus === "default") && (
          <button
            type="button"
            onClick={handleEnablePush}
            disabled={enablingPush}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-all cursor-pointer shrink-0 disabled:opacity-50"
            title="Enable background Web Push notifications for new order alerts when browser tab is closed"
          >
            <BellRing className="size-3.5 text-amber-600 animate-pulse" />
            <span>{enablingPush ? "Enabling..." : "Enable Push Notifications"}</span>
          </button>
        )}

        {/* Test Sound & Unlock Audio Button */}
        <button
          type="button"
          onClick={testSound}
          className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground text-xs font-medium hover:bg-secondary transition-all cursor-pointer shrink-0"
          title="Test order alarm sound and unlock audio autoplay"
        >
          <Volume2 className="size-3.5 text-primary" />
          <span>Test Sound</span>
        </button>

        {/* Stop Alarm Button if currently ringing */}
        {activeAlarm && (
          <button
            type="button"
            onClick={stopAlarm}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold shadow-md hover:bg-destructive/90 transition-all cursor-pointer animate-bounce shrink-0"
            title="Click to stop order alarm sound"
          >
            <VolumeX className="size-3.5" />
            <span>Mute Alarm</span>
          </button>
        )}

        {/* Real-time Order Notifications Dropdown Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="relative grid size-9 place-items-center rounded-full border border-border bg-background text-foreground hover:bg-secondary transition-colors cursor-pointer shrink-0"
            title="New Order Notifications"
          >
            {activeAlarm ? (
              <Bell className="size-4 text-amber-500 animate-wiggle" />
            ) : unreadCount > 0 ? (
              <Bell className="size-4 text-primary" />
            ) : (
              <Bell className="size-4 text-muted-foreground" />
            )}

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 grid min-w-5 h-5 place-items-center rounded-full bg-destructive px-1 text-[10px] font-black text-destructive-foreground ring-2 ring-background animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-background p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="size-4 text-primary" />
                  <h3 className="font-display text-sm font-bold">New Order Alerts</h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-extrabold text-primary">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] font-bold text-primary hover:underline px-2 py-1"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setDropdownOpen(false)}
                    className="text-muted-foreground hover:text-foreground p-1"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  <Bell className="mx-auto size-8 text-muted-foreground/40 mb-2" />
                  <p className="font-bold text-foreground">No new order notifications</p>
                  <p className="mt-0.5">Real-time alerts will appear here when customers place orders.</p>
                </div>
              ) : (
                <div className="mt-3 max-h-80 overflow-y-auto space-y-2 pr-1">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`rounded-xl border p-3 transition-all ${
                        !n.read
                          ? "border-primary/30 bg-primary/5 ring-1 ring-primary/20"
                          : "border-border bg-card hover:bg-secondary/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-display text-xs font-bold text-foreground flex items-center gap-1.5">
                            Order #{n.orderNumber}
                            {!n.read && (
                              <span className="size-2 rounded-full bg-primary inline-block" />
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {n.customerName} {n.customerPhone ? `(${n.customerPhone})` : ""}
                          </p>
                          <p className="text-xs font-extrabold text-foreground mt-1">
                            {inr(n.totalAmount)} · {n.itemsCount} {n.itemsCount === 1 ? "item" : "items"}
                          </p>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      <div className="mt-2.5 flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                        {!n.acknowledged && (
                          <button
                            type="button"
                            onClick={() => acknowledgeNotification(n.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            <Check className="size-3" /> Acknowledge
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            acknowledgeNotification(n.id);
                            setDropdownOpen(false);
                            if (onSelectOrder) {
                              onSelectOrder(n.orderId);
                            }
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer"
                        >
                          View Order
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {notifications.length > 0 && (
                <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-[11px]">
                  <button
                    onClick={clearNotifications}
                    className="text-muted-foreground hover:text-destructive font-semibold"
                  >
                    Clear All
                  </button>
                  <span className="text-muted-foreground text-[10px]">
                    Real-time Supabase Stream Active
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <Link
          to="/"
          className="hidden rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:inline-flex items-center gap-1.5 shrink-0"
        >
          <Home className="size-3.5" /> View Storefront
        </Link>

        <div className="flex items-center gap-2 rounded-full border border-border bg-background px-1.5 py-1.5 hover:bg-secondary/50 transition-colors shrink-0">
          <div className="grid size-7 place-items-center rounded-full bg-primary/10 text-primary">
            <UserIcon className="size-4" />
          </div>
          <div className="hidden sm:block text-left min-w-0 pr-2">
            <p className="truncate text-xs font-bold text-foreground max-w-24">{adminName}</p>
            <p className="flex items-center gap-1 text-[9px] font-extrabold text-primary uppercase">
              <Shield className="size-2" /> Admin
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => signOut()}
          className="size-9 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer shrink-0"
          title="Logout"
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  );
}
