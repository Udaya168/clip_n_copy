import { createFileRoute, Link } from "@tanstack/react-router";
import { ShopLayout } from "@/components/ShopLayout";
import { useAuth } from "@/lib/auth-store";
import { useShop } from "@/lib/shop-store";
import { MyOrdersList } from "@/components/orders/MyOrdersList";
import { EditProfileModal } from "@/components/account/EditProfileModal";
import { SavedAddressesModal } from "@/components/account/SavedAddressesModal";
import {
  UserAddress,
  fetchUserAddresses,
  formatAddressString,
} from "@/lib/address-store";
import {
  User,
  MapPin,
  Heart,
  Package,
  LogOut,
  Edit,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/account")({
  component: AccountPage,
});

function AccountPage() {
  const { user, profile, signOut } = useAuth();
  const shopContext = useShop();
  // Ensure wishlist is safely accessed even if local storage returned null/undefined
  const wishlist = shopContext?.wishlist || [];

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState<UserAddress | null>(null);

  const [orderStats, setOrderStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
  });

  const fetchAddressData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data } = await fetchUserAddresses(user.id);
      if (data && data.length > 0) {
        const def = data.find((a) => a.is_default) || data[0];
        setDefaultAddress(def || null);
      } else {
        setDefaultAddress(null);
      }
    } catch (err) {
      console.error("Failed to fetch address data:", err);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    
    let isMounted = true;
    
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("status")
          .eq("user_id", user.id);

        if (!error && data && Array.isArray(data)) {
          const stats = {
            total: data.length,
            active: data.filter((o) => ["processing", "confirmed", "shipped"].includes(o.status?.toLowerCase())).length,
            completed: data.filter((o) => o.status?.toLowerCase() === "delivered").length,
          };
          if (isMounted) {
            setOrderStats(stats);
          }
        }
      } catch (err) {
        console.error("Failed to fetch order stats:", err);
      }
    };
    
    fetchStats();
    fetchAddressData();
    
    return () => {
      isMounted = false;
    };
  }, [user?.id, fetchAddressData]);

  // Handle unauthenticated state with existing website design
  if (!user) {
    return (
      <ShopLayout>
        <div className="section-shell flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="size-10" />
          </div>
          <h2 className="mt-6 font-display text-2xl font-black">Not Logged In</h2>
          <p className="mt-2 text-muted-foreground">Please sign in to view your account details.</p>
          <Link
            to="/login"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90"
          >
            Go to Login
          </Link>
        </div>
      </ShopLayout>
    );
  }

  // Graceful fallbacks for missing data to prevent runtime crashes
  const userMetadata = user.user_metadata || {};
  const userFullName =
    (profile?.first_name || profile?.last_name)
      ? `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()
      : profile?.full_name || userMetadata['full_name'] || userMetadata['name'] || "Clip N Copy User";
  const userInitial = userFullName.charAt(0) || user.email?.charAt(0) || "U";
  
  const userPhone = profile?.phone || userMetadata['phone'] || "Add phone number";
  const safeEmail = user.email || "No email available";

  return (
    <ShopLayout>
      <div className="section-shell py-10">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-black text-foreground sm:text-4xl">
            My Account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your profile, orders, and account preferences.
          </p>
        </div>

        {/* 2-Column Desktop / 1-Column Mobile Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          
          {/* Left Column (Profile & Navigation) */}
          <div className="flex flex-col gap-6 lg:col-span-4 lg:sticky lg:top-24">
            
            {/* Profile Summary Card */}
            <div className="rounded-3xl border border-border bg-background p-6 shadow-soft">
              <div className="flex items-center gap-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-primary font-display text-2xl font-bold text-primary-foreground flex items-center justify-center border border-border shadow-sm">
                  {userInitial.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-display text-lg font-black text-foreground">
                    {userFullName}
                  </h2>
                  <p className="truncate text-sm text-muted-foreground">{safeEmail}</p>
                </div>
              </div>

              <div className="mt-6 space-y-3 border-t border-border/50 pt-5">
                <div className="flex items-center gap-3 text-sm text-foreground">
                  <Mail className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{safeEmail}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground">
                  <Phone className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{userPhone}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary/20 cursor-pointer"
              >
                <Edit className="size-4" /> Edit Profile
              </button>
            </div>

            {/* Quick Actions / Navigation */}
            <div className="rounded-3xl border border-border bg-background shadow-soft overflow-hidden">
              <nav className="flex flex-col divide-y divide-border/50">
                <Link
                  to="/wishlist"
                  className="flex items-center justify-between p-4 text-sm font-semibold transition-colors hover:bg-muted/50"
                >
                  <span className="flex items-center gap-3">
                    <Heart className="size-4 text-muted-foreground" /> Wishlist
                  </span>
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-[10px] text-primary">
                    {wishlist.length}
                  </span>
                </Link>
                <button
                  onClick={signOut}
                  className="flex items-center gap-3 p-4 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/5 text-left w-full cursor-pointer"
                >
                  <LogOut className="size-4" /> Log out
                </button>
              </nav>
            </div>

          </div>

          {/* Right Column (Content) */}
          <div className="flex flex-col gap-8 lg:col-span-8">
            
            {/* Overview Stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border border-border bg-background p-4 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="size-4" />
                  <span className="text-xs font-semibold">Total Orders</span>
                </div>
                <p className="mt-2 font-display text-2xl font-black">{orderStats.total}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center gap-2 text-primary">
                  <Clock className="size-4" />
                  <span className="text-xs font-semibold">Active</span>
                </div>
                <p className="mt-2 font-display text-2xl font-black">{orderStats.active}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="size-4" />
                  <span className="text-xs font-semibold">Completed</span>
                </div>
                <p className="mt-2 font-display text-2xl font-black">{orderStats.completed}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center gap-2 text-rose-500">
                  <Heart className="size-4" />
                  <span className="text-xs font-semibold">Wishlist</span>
                </div>
                <p className="mt-2 font-display text-2xl font-black">{wishlist.length}</p>
              </div>
            </div>

            {/* My Orders Section */}
            <div>
              <MyOrdersList />
            </div>

            {/* Saved Address Section */}
            <div>
              <h3 className="mb-4 font-display text-lg font-black">Saved Address</h3>
              <div
                onClick={() => setIsAddressModalOpen(true)}
                className="rounded-3xl border border-border bg-background p-6 shadow-soft hover:shadow-md hover:border-primary/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <MapPin className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">Default Delivery Address</p>
                      {defaultAddress && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/15 text-primary">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground max-w-md leading-relaxed">
                      {defaultAddress
                        ? `${defaultAddress.full_name} (${defaultAddress.phone}) — ${formatAddressString(defaultAddress)}`
                        : "Add your delivery address"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAddressModalOpen(true);
                  }}
                  className="shrink-0 rounded-full border border-border bg-background px-5 py-2.5 text-xs font-bold text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors cursor-pointer"
                >
                  Manage Addresses
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Saved Addresses Management Modal */}
      {user && (
        <SavedAddressesModal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          userId={user.id}
          onAddressesChange={fetchAddressData}
        />
      )}
    </ShopLayout>
  );
}
