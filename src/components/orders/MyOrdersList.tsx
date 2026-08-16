import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-store";
import { inr } from "@/lib/shop-store";
import { getStoredOrders } from "@/lib/orders-store";
import { OrderDetailModal, UserOrder } from "./OrderDetailModal";
import { OrderStatus } from "./OrderStatusTimeline";
import { ShoppingBag, Loader2, Clock, CheckCircle2, Truck, Check, XCircle, Eye, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function MyOrdersList() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<UserOrder | null>(null);

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
      <div className="rounded-3xl border border-border bg-background p-8 text-center shadow-soft">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShoppingBag className="size-7" />
        </div>
        <h3 className="mt-4 font-display text-xl font-black">No Orders Placed Yet</h3>
        <p className="mt-1.5 text-xs text-muted-foreground max-w-sm mx-auto">
          When you place orders at Clip N Copy, your real-time tracking and fulfillment history will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-display text-lg font-black">My Orders ({orders.length})</h3>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
        >
          <RefreshCw className="size-3.5" /> Refresh Status
        </button>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => {
          const items = order.order_items || [];
          const firstItem = items[0]?.product_name || "Stationery Items";
          const remainingCount = items.length > 1 ? items.length - 1 : 0;
          const previewText = remainingCount > 0 ? `${firstItem} + ${remainingCount} more` : firstItem;
          const formattedDate = new Date(order.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          return (
            <div
              key={order.id}
              className="card-lift rounded-3xl border border-border bg-background p-5 shadow-soft hover:border-primary/30 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-foreground text-base">
                      Order #{order.order_number}
                    </span>
                    <UserStatusBadge status={order.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Placed: <span className="font-semibold text-foreground">{formattedDate}</span>
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-muted-foreground block">Total Amount</span>
                  <span className="font-display text-lg font-black text-primary">
                    {inr(Number(order.total_amount))}
                  </span>
                </div>
              </div>

              <div className="mt-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-foreground truncate">{previewText}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {items.reduce((s, i) => s + (i.quantity || 1), 0)} items in package
                  </p>
                </div>

                <button
                  onClick={() => setSelectedOrder(order)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-extrabold text-primary hover:bg-primary hover:text-primary-foreground transition-all shrink-0 cursor-pointer"
                >
                  <Eye className="size-3.5" /> View Order
                </button>
              </div>
            </div>
          );
        })}
      </div>

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
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-600">
        <Clock className="size-3" /> Processing
      </span>
    );
  }
  if (status === "confirmed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-[10px] font-extrabold text-indigo-600">
        <CheckCircle2 className="size-3" /> Confirmed
      </span>
    );
  }
  if (status === "shipped") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-600">
        <Truck className="size-3" /> Shipped
      </span>
    );
  }
  if (status === "delivered") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-600">
        <Check className="size-3" /> Delivered
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2.5 py-0.5 text-[10px] font-extrabold text-destructive">
      <XCircle className="size-3" /> Cancelled
    </span>
  );
}
