import { X, ShoppingBag, Truck, MapPin, CreditCard, Calendar, Tag } from "lucide-react";
import { OrderStatusTimeline, OrderStatus } from "./OrderStatusTimeline";
import { inr } from "@/lib/shop-store";
import { Button } from "@/components/ui/button";

export interface OrderItemDetail {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  image_url?: string;
}

export interface UserOrder {
  id: string;
  order_number: string;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  updated_at?: string | undefined;
  address?: string | undefined;
  delivery_method?: string | undefined;
  payment_method?: string | undefined;
  order_items?: OrderItemDetail[] | undefined;
}

interface OrderDetailModalProps {
  order: UserOrder | null;
  onClose: () => void;
}

export function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  if (!order) return null;

  const items = order.order_items || [];
  const itemsCount = items.reduce((s, i) => s + (i.quantity || 1), 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative z-[101] flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl border border-border bg-background shadow-2xl overflow-hidden rise-in">
        
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-background px-6 py-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
              Order Details
            </span>
            <h3 className="font-display text-xl font-black tracking-tight">
              Order #{order.order_number}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="grid size-9 place-items-center rounded-full border border-border hover:bg-secondary transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Order Status Timeline */}
          <OrderStatusTimeline status={order.status} createdAt={order.created_at} updatedAt={order.updated_at} />

          {/* Purchased Items List */}
          <div>
            <h4 className="font-display text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-3">
              Items Ordered ({itemsCount})
            </h4>

            {items.length === 0 ? (
              <div className="rounded-2xl border border-border bg-secondary/30 p-4 text-xs text-muted-foreground text-center">
                Order details confirmed.
              </div>
            ) : (
              <ul className="divide-y divide-border rounded-2xl border border-border bg-background overflow-hidden">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3.5 p-3.5 text-xs">
                    <img
                      src={item.image_url || "/logo.webp"}
                      alt={item.product_name}
                      className="size-12 shrink-0 rounded-xl object-cover border border-border/60 bg-secondary/40"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground text-sm truncate">{item.product_name}</p>
                      <p className="text-muted-foreground text-xs">Qty: {item.quantity} × {inr(Number(item.price))}</p>
                    </div>
                    <p className="font-bold text-foreground text-sm shrink-0">
                      {inr(Number(item.price) * (item.quantity || 1))}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Delivery & Payment Info */}
          <div className="grid gap-3 sm:grid-cols-2 text-xs">
            <div className="rounded-2xl border border-border bg-secondary/30 p-4 space-y-1.5">
              <span className="flex items-center gap-1.5 font-bold text-foreground">
                <Truck className="size-4 text-primary" /> Delivery Details
              </span>
              <p className="text-muted-foreground">{order.delivery_method || "Standard Delivery"}</p>
              <p className="text-foreground font-medium">{order.address || "ITPL Main Road, Kundalahalli, Bengaluru"}</p>
            </div>

            <div className="rounded-2xl border border-border bg-secondary/30 p-4 space-y-1.5">
              <span className="flex items-center gap-1.5 font-bold text-foreground">
                <CreditCard className="size-4 text-primary" /> Payment &amp; Total
              </span>
              <p className="text-muted-foreground">Payment Method: {order.payment_method || "UPI"}</p>
              <p className="text-sm font-black text-primary">Total Paid: {inr(Number(order.total_amount))}</p>
            </div>
          </div>

          {/* Date info */}
          <div className="flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <Calendar className="size-4 text-primary" /> Placed on:{" "}
              <strong className="text-foreground font-semibold">
                {new Date(order.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </strong>
            </span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="shrink-0 border-t border-border bg-background p-4 text-right">
          <Button onClick={onClose} className="rounded-full px-6 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
            Close Order View
          </Button>
        </div>

      </div>
    </div>
  );
}
