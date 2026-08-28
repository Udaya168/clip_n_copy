import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-store";
import { inr } from "@/lib/shop-store";
import { getStoredOrders } from "@/lib/orders-store";
import { OrderDetailModal, UserOrder } from "./OrderDetailModal";
import { OrderStatus } from "./OrderStatusTimeline";
import { ShoppingBag, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export function MyOrdersList() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<UserOrder | null>(null);
  const [activeFilter, setActiveFilter] = useState<"All" | OrderStatus>("All");

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      let dbOrders: UserOrder[] = [];

      // 1. Query user orders from Supabase DB (restricted by user_id)
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        dbOrders = data.map((d: any) => ({
          id: d.id,
          order_number: d.order_number || d.orderNumber || "CNC-" + d.id,
          total_amount: Number(d.total_amount || d.totalAmount || 0),
          status: (d.status?.toLowerCase() as OrderStatus) || "processing",
          created_at: d.created_at || new Date().toISOString(),
          updated_at: d.updated_at,
          address: d.address,
          delivery_method: d.delivery_method || d.deliveryMethod,
          payment_method: d.payment_method || d.paymentMethod,
          order_items: (d.order_items || d.orderItems || []).map((i: any) => ({
            id: i.id,
            product_name: i.product_name || i.productName || "Stationery Item",
            quantity: i.quantity || 1,
            price: Number(i.price || 0),
            image_url: i.image_url || i.imageUrl,
          })),
        }));
      }

      // 2. Fallback to locally stored orders if DB returns empty (e.g. pending SQL setup)
      if (dbOrders.length === 0) {
        const local = getStoredOrders();
        const userLocal = local.filter((o) => !o.user_id || o.user_id === user.id);
        dbOrders = userLocal.map((o) => ({
          id: o.id,
          order_number: o.orderNumber,
          total_amount: Number(o.totalAmount || 0),
          status: (o.status?.toLowerCase() as OrderStatus) || "processing",
          created_at: o.date ? new Date(o.date).toISOString() : new Date().toISOString(),
          address: o.address,
          delivery_method: o.deliveryMethod,
          payment_method: o.paymentMethod,
          order_items: [
            {
              id: o.id + "-item",
              product_name: `Clip N Copy Order (${o.itemsCount || 1} items)`,
              quantity: o.itemsCount || 1,
              price: Number(o.totalAmount || 0),
            },
          ],
        }));
      }

      setOrders(dbOrders);
    } catch (err: any) {
      console.error("[MyOrders] Exception fetching orders:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();

    if (!user) return;

    // Listen for local order creation and window focus/refresh events
    const handleRefresh = () => {
      fetchOrders();
    };
    window.addEventListener("cnc-order-placed", handleRefresh);
    window.addEventListener("focus", handleRefresh);
    document.addEventListener("visibilitychange", handleRefresh);

    // Supabase Realtime Subscription to user's orders
    const channel = supabase
      .channel(`user-orders-realtime-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          toast.info("Order status updated!");
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener("cnc-order-placed", handleRefresh);
      window.removeEventListener("focus", handleRefresh);
      document.removeEventListener("visibilitychange", handleRefresh);
      supabase.removeChannel(channel);
    };
  }, [user, fetchOrders]);

  if (loading) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center py-12">
        <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-primary" /> Loading your orders...
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-border/40 bg-background p-10 text-center shadow-sm">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
          <ShoppingBag className="size-6" />
        </div>
        <h3 className="mt-5 font-display text-xl font-bold text-foreground">No orders yet</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto mb-6">
          Your orders will appear here once you make a purchase.
        </p>
        <Link 
          to="/"
          className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  const filterCounts = {
    All: orders.length,
    processing: orders.filter((o) => o.status === "processing").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  const filteredOrders = activeFilter === "All" ? orders : orders.filter((o) => o.status === activeFilter);

  const filterOptions: { label: string; value: "All" | OrderStatus; count: number }[] = [
    { label: "All", value: "All", count: filterCounts.All },
    { label: "Processing", value: "processing", count: filterCounts.processing },
    { label: "Confirmed", value: "confirmed", count: filterCounts.confirmed },
    { label: "Shipped", value: "shipped", count: filterCounts.shipped },
    { label: "Delivered", value: "delivered", count: filterCounts.delivered },
    { label: "Cancelled", value: "cancelled", count: filterCounts.cancelled },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="font-display text-2xl font-bold tracking-tight text-foreground">My Orders</h3>
          <p className="text-sm font-medium text-muted-foreground mt-0.5">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</p>
        </div>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/30 px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
        >
          <RefreshCw className="size-3.5" /> Refresh Status
        </button>
      </div>

      <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
          {filterOptions.map((filter) => {
            if (filter.count === 0 && filter.value !== "All") return null;
            const isActive = activeFilter === filter.value;
            return (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer shrink-0 border ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border/60 hover:bg-secondary hover:text-foreground"
                }`}
              >
                {filter.label}
                <span className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                  {filter.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-border/40 bg-background p-10 text-center shadow-sm">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
            <ShoppingBag className="size-6" />
          </div>
          <h3 className="mt-5 font-display text-xl font-bold text-foreground">No orders found</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto mb-2">
            Try another order status.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-5">
          {filteredOrders.map((order) => {
            const items = order.order_items || [];
            const firstItem = items[0] || { product_name: "Stationery Items", quantity: 1, image_url: "/logo.webp" };
            const remainingCount = items.length > 1 ? items.length - 1 : 0;
            const formattedDate = new Date(order.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={order.id}
                className="rounded-2xl border border-border/40 bg-background shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className="font-display font-bold text-foreground text-sm sm:text-base">
                      Order #{order.order_number}
                    </span>
                    <UserStatusBadge status={order.status} />
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-4">
                    Placed: {formattedDate}
                  </p>

                  <div className="flex items-center gap-3.5">
                    <img 
                      src={firstItem.image_url || "/logo.webp"} 
                      alt={firstItem.product_name}
                      className="size-14 shrink-0 rounded-lg object-cover border border-border/40 bg-secondary/20"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="text-sm font-medium text-foreground truncate">{firstItem.product_name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Qty: {firstItem.quantity} {remainingCount > 0 && <span className="font-medium text-foreground ml-1">+ {remainingCount} more {remainingCount === 1 ? 'item' : 'items'}</span>}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-border/40" />

                <div className="flex items-center justify-between p-4 sm:p-5">
                  <div className="flex flex-col">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold mb-0.5">Total Amount</span>
                    <span className="font-display text-base font-bold text-foreground">
                      {inr(Number(order.total_amount))}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="inline-flex items-center justify-center rounded-full border border-border/60 bg-secondary/30 px-5 py-2 text-xs font-semibold text-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
                  >
                    View Order
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}

function UserStatusBadge({ status }: { status: OrderStatus }) {
  if (status === "processing") {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-600 border border-amber-500/20">
        Processing
      </span>
    );
  }
  if (status === "confirmed") {
    return (
      <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-bold text-blue-600 border border-blue-500/20">
        Confirmed
      </span>
    );
  }
  if (status === "shipped") {
    return (
      <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-bold text-blue-600 border border-blue-500/20">
        Shipped
      </span>
    );
  }
  if (status === "delivered") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600 border border-emerald-500/20">
        Delivered
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-bold text-destructive border border-destructive/20">
      Cancelled
    </span>
  );
}
