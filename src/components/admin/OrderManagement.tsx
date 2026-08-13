import { useEffect, useState } from "react";
import { fetchAllOrders, updateOrderStatus, OrderRecord } from "@/lib/orders-store";
import { inr } from "@/lib/shop-store";
import { ShoppingBag, Search, Filter, Clock, CheckCircle2, Truck, Package, RefreshCw, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type OrderStatusType = "Processing" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";

export function OrderManagement() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const loadOrders = async () => {
    setLoading(true);
    const data = await fetchAllOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();

    const handleFocusRefresh = () => {
      loadOrders();
    };
    window.addEventListener("focus", handleFocusRefresh);
    document.addEventListener("visibilitychange", handleFocusRefresh);

    return () => {
      window.removeEventListener("focus", handleFocusRefresh);
      document.removeEventListener("visibilitychange", handleFocusRefresh);
    };
  }, []);

  const handleStatusChange = async (orderId: string, status: OrderStatusType) => {
    await updateOrderStatus(orderId, status);
    toast.success(`Order ${orderId} updated to ${status}`);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customerPhone && o.customerPhone.includes(searchQuery));
    if (!matchesSearch) return false;
    if (filterStatus !== "all" && o.status.toLowerCase() !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-border bg-background p-6 shadow-soft">
        <div>
          <h2 className="font-display text-2xl font-black tracking-tight">Order Management</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Live view of consumer orders placed across website &amp; store pickup.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={loadOrders}
            disabled={loading}
            variant="outline"
            size="sm"
            className="rounded-full text-xs font-bold gap-2 cursor-pointer"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Orders
          </Button>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
            <CheckCircle2 className="size-3.5" /> {orders.length} Live Orders
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders by ID, name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 rounded-2xl pl-10 text-xs border-border bg-background"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          <Filter className="size-3.5 text-muted-foreground shrink-0" />
          {["all", "processing", "confirmed", "shipped", "delivered", "cancelled"].map((st) => (
            <Button
              key={st}
              size="sm"
              variant={filterStatus === st ? "default" : "outline"}
              onClick={() => setFilterStatus(st)}
              className="rounded-full text-xs capitalize cursor-pointer shrink-0"
            >
              {st}
            </Button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-3xl border border-border bg-background overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/60 text-muted-foreground font-bold uppercase tracking-wider border-b border-border">
              <tr>
                <th className="px-5 py-3.5">Order ID</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Fulfillment</th>
                <th className="px-5 py-3.5">Total</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                    <ShoppingBag className="mx-auto size-8 opacity-40 mb-2" />
                    No orders found matching your search.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-4 font-bold text-foreground font-mono">
                      {o.orderNumber}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-foreground">{o.customerName}</p>
                      <p className="text-[11px] text-muted-foreground">{o.customerPhone || o.customerEmail}</p>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{o.date}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-foreground">
                        {o.fulfillmentType === "Delivery" ? (
                          <Truck className="size-3 text-primary" />
                        ) : (
                          <Package className="size-3 text-primary" />
                        )}
                        {o.fulfillmentType}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-primary">
                      {inr(o.totalAmount)}
                      <span className="block text-[10px] text-muted-foreground font-normal">
                        {o.itemsCount} {o.itemsCount === 1 ? "item" : "items"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatusType)}
                        className="rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatusType }) {
  if (status === "Processing") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-600">
        <Clock className="size-3" /> Processing
      </span>
    );
  }
  if (status === "Confirmed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-1 text-[11px] font-bold text-indigo-600">
        <CheckCircle2 className="size-3" /> Confirmed
      </span>
    );
  }
  if (status === "Shipped") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-bold text-blue-600">
        <Truck className="size-3" /> Shipped
      </span>
    );
  }
  if (status === "Delivered") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
        <CheckCircle2 className="size-3" /> Delivered
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-bold text-destructive">
      <XCircle className="size-3" /> Cancelled
    </span>
  );
}
