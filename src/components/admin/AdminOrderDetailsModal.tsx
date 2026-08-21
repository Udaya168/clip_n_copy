import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { OrderRecord, OrderItemRecord, fetchOrderItems, updateOrderStatus } from "@/lib/orders-store";
import { inr } from "@/lib/shop-store";
import { byId } from "@/lib/data";
import {
  Package,
  Truck,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  AlertCircle,
  ShoppingBag,
  ArrowLeft,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type OrderStatusType = "Processing" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";

interface AdminOrderDetailsModalProps {
  order: OrderRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated?: (orderId: string, newStatus: OrderStatusType) => void;
}

export function AdminOrderDetailsModal({
  order,
  isOpen,
  onClose,
  onStatusUpdated,
}: AdminOrderDetailsModalProps) {
  const [items, setItems] = useState<OrderItemRecord[]>([]);
  const [loadingItems, setLoadingItems] = useState<boolean>(true);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<OrderStatusType>("Processing");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  useEffect(() => {
    if (order) {
      setCurrentStatus(order.status as OrderStatusType);
      loadItems(order.id);
    }
  }, [order]);

  const loadItems = async (orderId: string) => {
    setLoadingItems(true);
    setItemsError(null);
    try {
      const data = await fetchOrderItems(orderId);
      setItems(data);
    } catch (err: any) {
      console.error("[AdminOrderDetailsModal] Error fetching items:", err);
      setItemsError("Failed to load order items.");
    } finally {
      setLoadingItems(false);
    }
  };

  const handleStatusChange = async (newStatus: OrderStatusType) => {
    if (!order || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      await updateOrderStatus(order.id, newStatus);
      setCurrentStatus(newStatus);
      toast.success(`Order ${order.orderNumber} updated to ${newStatus}`);
      if (onStatusUpdated) {
        onStatusUpdated(order.id, newStatus);
      }
    } catch (err) {
      toast.error("Failed to update order status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (!order) return null;

  // Price calculations
  const itemsSubtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const itemsMrp = items.reduce((acc, item) => {
    const itemMrp = item.mrp || (byId(item.product_id || "")?.mrp) || item.price;
    return acc + itemMrp * item.quantity;
  }, 0);
  const discount = Math.max(0, itemsMrp - itemsSubtotal);
  const shipping = order.totalAmount > itemsSubtotal ? order.totalAmount - itemsSubtotal : 0;
  const finalTotal = order.totalAmount || itemsSubtotal + shipping;

  const isPaid = order.paymentMethod !== "Cash on Delivery" && order.status !== "Cancelled";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-full rounded-3xl p-0 overflow-hidden border border-border bg-background shadow-2xl max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-4 shrink-0 pr-14">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="size-8 rounded-full border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer sm:hidden"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="font-display text-xl font-black text-foreground font-mono">
                  Order #{order.orderNumber}
                </DialogTitle>
                <StatusBadge status={currentStatus} />
              </div>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Placed on <span className="font-semibold text-foreground">{order.date}</span>
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Section 1: Order Information */}
          <div className="rounded-2xl border border-border bg-secondary/20 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <Calendar className="size-3.5 text-primary" /> Order Information
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground text-[11px]">Date &amp; Time</p>
                <p className="font-bold text-foreground mt-0.5">{order.date}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[11px]">Fulfillment</p>
                <span className="inline-flex items-center gap-1 font-bold text-foreground mt-0.5">
                  {order.fulfillmentType === "Delivery" ? (
                    <Truck className="size-3 text-primary" />
                  ) : (
                    <Package className="size-3 text-primary" />
                  )}
                  {order.fulfillmentType}
                </span>
              </div>
              <div>
                <p className="text-muted-foreground text-[11px]">Payment Method</p>
                <p className="font-bold text-foreground mt-0.5">{order.paymentMethod || "UPI"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[11px]">Payment Status</p>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase mt-0.5",
                    isPaid
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-amber-500/10 text-amber-600"
                  )}
                >
                  {isPaid ? "Paid" : "Pending"}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Customer Details & Delivery Address Snapshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Customer Details */}
            <div className="rounded-2xl border border-border p-4 bg-card">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <User className="size-3.5 text-primary" /> Customer Details
              </h3>
              <div className="space-y-1.5 text-xs">
                <p className="font-bold text-foreground text-sm">{order.customerName}</p>
                {order.customerEmail && (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="size-3.5 shrink-0 text-primary/70" /> {order.customerEmail}
                  </p>
                )}
                {order.customerPhone && (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="size-3.5 shrink-0 text-primary/70" /> {order.customerPhone}
                  </p>
                )}
              </div>
            </div>

            {/* Delivery Address Snapshot */}
            <div className="rounded-2xl border border-border p-4 bg-card">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <MapPin className="size-3.5 text-primary" /> Delivery Address
              </h3>
              <div className="text-xs space-y-1 text-foreground/90">
                <p className="font-bold text-foreground">{order.customerName}</p>
                <p className="text-muted-foreground font-medium">{order.customerPhone}</p>
                <p className="mt-1 leading-relaxed text-muted-foreground">
                  {order.address || "No address details specified"}
                </p>
              </div>
            </div>

          </div>

          {/* Section 3: Ordered Products List */}
          <div className="rounded-2xl border border-border p-4 bg-card">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <ShoppingBag className="size-3.5 text-primary" /> Order Items ({items.length || order.itemsCount})
            </h3>

            {loadingItems ? (
              <div className="flex items-center justify-center py-8 text-xs text-muted-foreground gap-2">
                <Loader2 className="size-4 animate-spin text-primary" /> Loading order items...
              </div>
            ) : itemsError ? (
              <div className="flex flex-col items-center justify-center py-6 text-center text-xs text-muted-foreground">
                <AlertCircle className="size-6 text-destructive mb-2" />
                <p>{itemsError}</p>
                <button
                  type="button"
                  onClick={() => loadItems(order.id)}
                  className="mt-2 text-xs font-bold text-primary underline cursor-pointer"
                >
                  Retry loading
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                No item details recorded for this order.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {items.map((item) => {
                  const catalogProd = item.product_id ? byId(item.product_id) : null;
                  const itemImg = item.image_url || catalogProd?.image || "/products/reynolds-trimax.webp";
                  const itemSubtotal = item.price * item.quantity;

                  return (
                    <li key={item.id} className="py-3 flex items-center gap-3 text-xs">
                      <img
                        src={itemImg}
                        alt={item.product_name}
                        className="size-12 rounded-xl object-cover border border-border shrink-0 bg-secondary"
                        onError={(e) => {
                          (e.target as HTMLElement).setAttribute("src", "/products/reynolds-trimax.webp");
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground truncate">{item.product_name}</p>
                        {item.variant && (
                          <p className="text-[11px] font-semibold text-primary">
                            Variant: {item.variant}
                          </p>
                        )}
                        <p className="text-muted-foreground mt-0.5">
                          {inr(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        {item.mrp && item.mrp > item.price && (
                          <span className="block text-[10px] text-muted-foreground line-through">
                            {inr(item.mrp * item.quantity)}
                          </span>
                        )}
                        <span className="font-bold text-foreground text-sm">
                          {inr(itemSubtotal)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Section 4: Price Breakdown */}
          <div className="rounded-2xl border border-border p-4 bg-secondary/30 text-xs space-y-2">
            <h3 className="font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <DollarSign className="size-3.5 text-primary" /> Price Summary
            </h3>
            {itemsMrp > 0 && itemsMrp > itemsSubtotal && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total MRP</span>
                <span className="line-through">{inr(itemsMrp)}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount</span>
                <span>-{inr(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{inr(itemsSubtotal || order.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping / Delivery</span>
              <span>{shipping === 0 ? "FREE" : inr(shipping)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-sm font-black">
              <span>Final Total</span>
              <span className="text-primary">{inr(finalTotal)}</span>
            </div>
          </div>

          {/* Section 5: Order Status & Update Controls */}
          <div className="rounded-2xl border border-border p-4 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-foreground">Order Status</p>
              <p className="text-[11px] text-muted-foreground">Change current status for customer tracking.</p>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge status={currentStatus} />
              
              <select
                value={currentStatus}
                disabled={isUpdatingStatus}
                onChange={(e) => handleStatusChange(e.target.value as OrderStatusType)}
                className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer disabled:opacity-50"
              >
                <option value="Processing">Processing</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

        </div>

      </DialogContent>
    </Dialog>
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
