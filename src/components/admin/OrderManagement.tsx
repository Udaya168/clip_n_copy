import { useState } from "react";
import { inr } from "@/lib/shop-store";
import { ShoppingBag, Search, Filter, Clock, CheckCircle2, Truck, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  date: string;
  itemsCount: number;
  totalAmount: number;
  status: "Processing" | "Shipped" | "Delivered";
  fulfillmentType: "Delivery" | "Pickup";
}

const SAMPLE_ORDERS: OrderItem[] = [
  {
    id: "ord-1",
    orderNumber: "CNC-2026-00125",
    customerName: "Rahul Kumar",
    customerPhone: "+91 99860 55335",
    date: "2026-08-13",
    itemsCount: 4,
    totalAmount: 649,
    status: "Processing",
    fulfillmentType: "Delivery",
  },
  {
    id: "ord-2",
    orderNumber: "CNC-2026-00124",
    customerName: "Saswatee Swain",
    customerPhone: "+91 98450 11223",
    date: "2026-08-12",
    itemsCount: 2,
    totalAmount: 320,
    status: "Shipped",
    fulfillmentType: "Delivery",
  },
  {
    id: "ord-3",
    orderNumber: "CNC-2026-00123",
    customerName: "Ananya Sharma",
    customerPhone: "+91 97411 88990",
    date: "2026-08-11",
    itemsCount: 6,
    totalAmount: 1150,
    status: "Delivered",
    fulfillmentType: "Pickup",
  },
];

export function OrderManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredOrders = SAMPLE_ORDERS.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase());
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
            View customer orders, delivery tracking, and order fulfillment status.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
          <Clock className="size-3.5" /> Ready for Live Order DB Integration
        </span>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders by ID or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 rounded-2xl pl-10 text-xs border-border bg-background"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Filter className="size-3.5 text-muted-foreground" />
          <Button
            size="sm"
            variant={filterStatus === "all" ? "default" : "outline"}
            onClick={() => setFilterStatus("all")}
            className="rounded-full text-xs font-bold cursor-pointer"
          >
            All Orders
          </Button>
          <Button
            size="sm"
            variant={filterStatus === "processing" ? "default" : "outline"}
            onClick={() => setFilterStatus("processing")}
            className="rounded-full text-xs font-bold cursor-pointer"
          >
            Processing
          </Button>
          <Button
            size="sm"
            variant={filterStatus === "delivered" ? "default" : "outline"}
            onClick={() => setFilterStatus("delivered")}
            className="rounded-full text-xs font-bold cursor-pointer"
          >
            Delivered
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-3xl border border-border bg-background shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/70 text-muted-foreground uppercase tracking-wider font-bold border-b border-border">
              <tr>
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-secondary/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-foreground">{o.orderNumber}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-foreground">{o.customerName}</p>
                    <p className="text-[10px] text-muted-foreground">{o.customerPhone}</p>
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground font-medium">{o.date}</td>
                  <td className="py-3.5 px-4 font-semibold">{o.itemsCount} items</td>
                  <td className="py-3.5 px-4 font-bold text-foreground">{inr(o.totalAmount)}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-semibold text-muted-foreground">
                      {o.fulfillmentType === "Delivery" ? (
                        <Truck className="size-3.5 text-primary" />
                      ) : (
                        <Package className="size-3.5 text-primary" />
                      )}
                      {o.fulfillmentType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {o.status === "Delivered" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3" /> Delivered
                      </span>
                    )}
                    {o.status === "Shipped" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                        <Truck className="size-3" /> Shipped
                      </span>
                    )}
                    {o.status === "Processing" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        <Clock className="size-3" /> Processing
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
