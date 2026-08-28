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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative z-[101] flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl sm:rounded-[2rem] border border-border/40 bg-background shadow-[0_16px_64px_-12px_rgba(0,0,0,0.15)] overflow-hidden rise-in">
        
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between px-6 sm:px-8 pt-6 sm:pt-8 pb-5">
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">
              Order Details
            </h4>
            <h3 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Order #{order.order_number}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="grid size-9 place-items-center rounded-full bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="size-4.5" />
          </button>
        </div>

        <div className="px-6 sm:px-8">
          <div className="h-px w-full bg-border/40" />
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 sm:py-8 space-y-8 sm:space-y-10">
          
          {/* Order Status Timeline */}
          <OrderStatusTimeline status={order.status} createdAt={order.created_at} updatedAt={order.updated_at} />

          {/* Purchased Items List */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Items Ordered
              </h4>
              <span className="text-xs font-medium text-muted-foreground">{itemsCount} {itemsCount === 1 ? 'item' : 'items'}</span>
            </div>

            {items.length === 0 ? (
              <div className="rounded-xl border border-border/40 bg-secondary/20 p-4 text-sm text-muted-foreground text-center">
                Order details confirmed.
              </div>
            ) : (
              <ul className="divide-y divide-border/40">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <img
                      src={item.image_url || "/logo.webp"}
                      alt={item.product_name}
                      className="size-14 sm:size-16 shrink-0 rounded-xl object-cover border border-border/40 bg-secondary/20"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="font-medium text-foreground text-sm sm:text-base truncate">{item.product_name}</p>
                      <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-foreground text-sm sm:text-base shrink-0">
                      {inr(Number(item.price) * (item.quantity || 1))}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="h-px w-full bg-border/40" />

          {/* Delivery & Payment Info */}
          <section className="grid gap-8 sm:grid-cols-2">
            <div className="flex flex-col gap-3.5">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Truck className="size-3.5" /> Delivery Details
              </span>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">{order.delivery_method || "Standard Delivery"}</p>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{order.address || "ITPL Main Road, Kundalahalli, Bengaluru"}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3.5">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <CreditCard className="size-3.5" /> Payment Summary
              </span>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium text-foreground">{order.payment_method || "UPI"}</span>
                </div>
                <div className="flex justify-between pt-3 mt-1.5 border-t border-border/40">
                  <span className="font-medium text-foreground">Total Paid</span>
                  <span className="font-bold text-base text-primary">{inr(Number(order.total_amount))}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Date info */}
          <section className="flex items-center gap-2.5 text-sm text-muted-foreground pt-2">
            <Calendar className="size-4" /> 
            <span>Placed on {new Date(order.created_at).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}</span>
          </section>

        </div>

        {/* Modal Footer */}
        <div className="shrink-0 border-t border-border/40 bg-background/80 backdrop-blur-md px-6 sm:px-8 py-4 sm:py-5 text-right z-10">
          <Button onClick={onClose} className="rounded-full px-8 font-medium bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer w-full sm:w-auto">
            Close
          </Button>
        </div>

      </div>
    </div>
  );
}
