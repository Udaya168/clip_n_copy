import React, { useEffect, useState } from "react";
import { AdminOrderNotification } from "@/lib/admin-notification-context";
import { fetchOrderItems, OrderItemRecord } from "@/lib/orders-store";
import { supabase } from "@/lib/supabase";
import { inr } from "@/lib/shop-store";
import { resolveProductImageUrl, getCategoryFallbackImage } from "@/lib/supabase-products";
import {
  BellRing,
  X,
  CheckCircle2,
  XCircle,
  VolumeX,
  Loader2,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  CreditCard,
  Truck,
  PackageCheck,
  Receipt,
} from "lucide-react";

interface NewOrderAlertModalProps {
  notification: AdminOrderNotification | null;
  activeAlarm: boolean;
  isAccepting: boolean;
  onAcceptOrder: () => void;
  onRejectOrder: () => void;
  onStopAlarm: () => void;
  onDismiss: () => void;
}

export function NewOrderAlertModal({
  notification,
  activeAlarm,
  isAccepting,
  onAcceptOrder,
  onRejectOrder,
  onStopAlarm,
  onDismiss,
}: NewOrderAlertModalProps) {
  const [items, setItems] = useState<OrderItemRecord[]>([]);
  const [loadingItems, setLoadingItems] = useState<boolean>(true);
  const [dbOrderDetails, setDbOrderDetails] = useState<any | null>(null);
  const [dbProductsMap, setDbProductsMap] = useState<Record<string, any>>({});

  // 1. Strict Background Scroll Lock Effect
  useEffect(() => {
    if (!notification) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const preventWheel = (e: TouchEvent | WheelEvent) => {
      const target = e.target as HTMLElement | null;
      const scrollArea = document.getElementById("new-order-modal-scroll-area");
      if (scrollArea && target && !scrollArea.contains(target)) {
        e.preventDefault();
      }
    };

    window.addEventListener("wheel", preventWheel, { passive: false });
    window.addEventListener("touchmove", preventWheel, { passive: false });

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      window.removeEventListener("wheel", preventWheel);
      window.removeEventListener("touchmove", preventWheel);
    };
  }, [notification]);

  // 2. Fetch order details, order items & resolve product images
  useEffect(() => {
    if (!notification) {
      setItems([]);
      setDbOrderDetails(null);
      return;
    }

    let isMounted = true;
    setLoadingItems(true);

    async function loadData() {
      try {
        // Fetch products catalog for matching accurate images
        const { data: catProducts } = await supabase
          .from("products")
          .select("id, name, image_url, category");

        const pMap: Record<string, any> = {};
        if (catProducts && Array.isArray(catProducts)) {
          catProducts.forEach((p) => {
            if (p.id) pMap[p.id] = p;
            if (p.name) pMap[p.name.toLowerCase().trim()] = p;
          });
        }
        if (isMounted) setDbProductsMap(pMap);

        // Fetch Order Items
        const fetchedItems = await fetchOrderItems(notification!.orderId);
        if (isMounted) {
          setItems(fetchedItems);
        }

        // Fetch extra order details from Supabase orders table
        const { data: orderData } = await supabase
          .from("orders")
          .select("*")
          .eq("id", notification!.orderId)
          .single();

        if (isMounted && orderData) {
          setDbOrderDetails(orderData);
        }
      } catch (err) {
        console.warn("[NewOrderAlertModal] Error loading details:", err);
      } finally {
        if (isMounted) {
          setLoadingItems(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [notification?.orderId]);

  if (!notification) return null;

  const customerName = dbOrderDetails?.customer_name || dbOrderDetails?.customerName || notification.customerName;
  const customerPhone = dbOrderDetails?.customer_phone || dbOrderDetails?.customerPhone || notification.customerPhone;
  const customerEmail = dbOrderDetails?.customer_email || dbOrderDetails?.customerEmail || notification.customerEmail;
  const address = dbOrderDetails?.address || dbOrderDetails?.shipping_address || notification.address;
  const paymentMethod = dbOrderDetails?.payment_method || dbOrderDetails?.paymentMethod || notification.paymentMethod || "UPI / Online";
  const fulfillmentType = dbOrderDetails?.fulfillment_type || dbOrderDetails?.fulfillmentType || notification.fulfillmentType || "Delivery";
  const deliveryMethod = dbOrderDetails?.delivery_method || dbOrderDetails?.deliveryMethod || notification.deliveryMethod;

  // Helper to get unit MRP for an item
  const getItemUnitMrp = (item: OrderItemRecord): number => {
    if (item.mrp && Number(item.mrp) > Number(item.price)) {
      return Number(item.mrp);
    }
    const matchedProduct = item.product_id
      ? dbProductsMap[item.product_id]
      : dbProductsMap[(item.product_name || "").toLowerCase().trim()];
    if (matchedProduct) {
      const pMrp = Number(matchedProduct.original_price || matchedProduct.mrp || 0);
      if (pMrp > Number(item.price)) return pMrp;
    }
    return Number(item.price);
  };

  // Calculate dynamic Cost Breakdown values matching Checkout Order Summary
  const itemsSubtotal = items.reduce(
    (sum, item) => sum + (Number(item.price) * Number(item.quantity) || 0),
    0
  );

  const rawMrpSum = items.reduce((sum, item) => {
    const unitMrp = getItemUnitMrp(item);
    return sum + unitMrp * Number(item.quantity || 1);
  }, 0);

  const storedDiscount = Number(dbOrderDetails?.discount ?? dbOrderDetails?.coupon_discount ?? 0);
  const mrpSavings = rawMrpSum > itemsSubtotal ? rawMrpSum - itemsSubtotal : 0;
  const productDiscountVal = mrpSavings > 0 ? mrpSavings : storedDiscount;

  const subtotalVal = Number(dbOrderDetails?.subtotal) || itemsSubtotal || Number(notification.totalAmount);
  const totalMrpVal = rawMrpSum > subtotalVal ? rawMrpSum : subtotalVal + productDiscountVal;
  const grandTotalVal = Number(dbOrderDetails?.total_amount || dbOrderDetails?.totalAmount || notification.totalAmount || 0);
  const gstVal = Number(dbOrderDetails?.tax || dbOrderDetails?.gst || 0);

  let shippingVal = Number(dbOrderDetails?.shipping ?? dbOrderDetails?.shipping_fee ?? dbOrderDetails?.p_shipping ?? 0);
  if (shippingVal === 0 && grandTotalVal > 0 && subtotalVal > 0 && grandTotalVal > subtotalVal) {
    shippingVal = grandTotalVal - subtotalVal;
  }

  // Helper to resolve real product image URL for an item
  const getItemImageUrl = (item: OrderItemRecord): string => {
    if (item.image_url && item.image_url.trim().length > 0) {
      return resolveProductImageUrl({ image_url: item.image_url, category: item.product_name });
    }

    if (item.product_id && dbProductsMap[item.product_id]) {
      const match = dbProductsMap[item.product_id];
      if (match.image_url) {
        return resolveProductImageUrl({ image_url: match.image_url, category: match.category || item.product_name });
      }
    }

    const nameKey = (item.product_name || "").toLowerCase().trim();
    if (dbProductsMap[nameKey]) {
      const match = dbProductsMap[nameKey];
      if (match.image_url) {
        return resolveProductImageUrl({ image_url: match.image_url, category: match.category || item.product_name });
      }
    }

    return resolveProductImageUrl({ category: item.product_name });
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-hidden animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-card border border-primary/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto animate-in zoom-in-95 duration-200">
        
        {/* FIXED HEADER BAR */}
        <div className="bg-gradient-to-r from-primary via-primary/95 to-primary/85 text-primary-foreground p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-white/20 text-white shrink-0 shadow-inner animate-bounce">
              <BellRing className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base sm:text-lg font-black uppercase tracking-wider text-white">
                  🔔 NEW ORDER RECEIVED!
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-400 text-emerald-950 font-extrabold text-[10px] tracking-wide uppercase">
                  JUST NOW
                </span>
              </div>
              <p className="text-xs text-primary-foreground/90 font-bold mt-0.5">
                Order #{notification.orderNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeAlarm && (
              <button
                type="button"
                onClick={onStopAlarm}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all cursor-pointer border border-white/20"
                title="Silence alarm sound"
              >
                <VolumeX className="size-3.5" /> Stop Sound
              </button>
            )}

            <button
              type="button"
              onClick={onDismiss}
              className="p-2 rounded-xl text-primary-foreground/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close notification"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE BODY CONTENT */}
        <div
          id="new-order-modal-scroll-area"
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 divide-y divide-border/60"
        >
          {/* 1. ORDER METADATA BADGES */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary/10 text-primary font-extrabold text-xs border border-primary/20">
              <Truck className="size-3.5" /> {fulfillmentType} {deliveryMethod ? `(${deliveryMethod})` : ""}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-secondary text-secondary-foreground font-extrabold text-xs border border-border">
              <CreditCard className="size-3.5" /> {paymentMethod}
            </span>
          </div>

          {/* 2. CUSTOMER INFORMATION */}
          <div className="pt-4 space-y-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <PackageCheck className="size-4 text-primary" /> Customer Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-secondary/40 rounded-2xl p-4 border border-border/80">
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold">Customer Name</p>
                <p className="text-sm font-bold text-foreground">{customerName}</p>
              </div>

              {customerPhone && (
                <div>
                  <p className="text-[11px] text-muted-foreground font-semibold">Phone Number</p>
                  <a
                    href={`tel:${customerPhone}`}
                    className="text-sm font-bold text-primary hover:underline flex items-center gap-1.5"
                  >
                    <Phone className="size-3.5" /> {customerPhone}
                  </a>
                </div>
              )}

              {customerEmail && (
                <div>
                  <p className="text-[11px] text-muted-foreground font-semibold">Email Address</p>
                  <a
                    href={`mailto:${customerEmail}`}
                    className="text-sm font-semibold text-foreground hover:underline flex items-center gap-1.5"
                  >
                    <Mail className="size-3.5" /> {customerEmail}
                  </a>
                </div>
              )}

              {address && (
                <div className="sm:col-span-2">
                  <p className="text-[11px] text-muted-foreground font-semibold">Delivery Address</p>
                  <p className="text-xs font-semibold text-foreground flex items-start gap-1.5 mt-0.5">
                    <MapPin className="size-3.5 text-primary shrink-0 mt-0.5" /> {address}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 3. ORDERED PRODUCTS */}
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ShoppingBag className="size-4 text-primary" /> Ordered Products ({notification.itemsCount})
              </h3>
              {loadingItems && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground animate-pulse">
                  <Loader2 className="size-3 animate-spin text-primary" /> Fetching items...
                </span>
              )}
            </div>

            {loadingItems ? (
              <div className="p-4 text-center rounded-2xl bg-secondary/30 border border-dashed border-border text-xs text-muted-foreground">
                Loading product items...
              </div>
            ) : items.length > 0 ? (
              <div className="rounded-2xl border border-border overflow-hidden divide-y divide-border bg-background">
                {items.map((item, idx) => {
                  const imgUrl = getItemImageUrl(item);
                  return (
                    <div key={item.id || idx} className="p-3.5 flex items-center justify-between gap-3 hover:bg-secondary/20 transition-colors">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={imgUrl}
                          alt={item.product_name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getCategoryFallbackImage(item.product_name);
                          }}
                          className="size-14 sm:size-16 rounded-xl object-cover border border-border bg-secondary shrink-0 shadow-sm"
                        />
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-foreground truncate">{item.product_name}</p>
                          {item.variant && (
                            <span className="inline-block px-2 py-0.5 rounded-md bg-secondary text-[11px] font-semibold text-muted-foreground mt-0.5">
                              Variant: {item.variant}
                            </span>
                          )}
                          <p className="text-xs text-muted-foreground font-semibold mt-1">
                            Price: <span className="text-foreground font-bold">{inr(item.price)}</span> &times; Qty: <span className="font-black text-foreground">{item.quantity}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {getItemUnitMrp(item) * item.quantity > item.price * item.quantity && (
                          <span className="block text-[11px] text-muted-foreground line-through font-normal">
                            {inr(getItemUnitMrp(item) * item.quantity)}
                          </span>
                        )}
                        <p className="text-sm font-black text-foreground">
                          {inr(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-secondary/40 border border-border flex items-center justify-between text-xs font-semibold">
                <span>Items Count: {notification.itemsCount} item(s)</span>
                <span className="font-bold text-primary">{inr(notification.totalAmount)}</span>
              </div>
            )}
          </div>

          {/* 4. COST BREAKDOWN */}
          <div className="pt-4 space-y-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Receipt className="size-4 text-primary" /> Cost Breakdown
            </h3>

            <div className="rounded-2xl border border-border/80 bg-secondary/30 p-4 space-y-2 text-xs font-semibold">
              {totalMrpVal > subtotalVal && (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Total MRP</span>
                  <span>{inr(totalMrpVal)}</span>
                </div>
              )}

              {productDiscountVal > 0 && (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>Discount</span>
                  <span>-{inr(productDiscountVal)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-bold text-foreground">{inr(subtotalVal)}</span>
              </div>

              <div className="flex items-center justify-between text-muted-foreground">
                <span>Delivery / Shipping</span>
                <span className="font-bold text-foreground">
                  {shippingVal === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase">FREE</span>
                  ) : (
                    inr(shippingVal)
                  )}
                </span>
              </div>

              {gstVal > 0 && (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>GST / Tax</span>
                  <span>{inr(gstVal)}</span>
                </div>
              )}

              <div className="pt-2.5 mt-1 border-t border-border flex items-center justify-between text-sm font-black text-foreground">
                <span className="uppercase tracking-wider text-primary font-extrabold text-xs">TOTAL ORDER</span>
                <span className="font-display text-xl font-black text-primary">{inr(grandTotalVal)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* STICKY FOOTER ACTION BUTTONS */}
        <div className="p-4 sm:p-5 bg-secondary/50 border-t border-border flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <button
            type="button"
            disabled={isAccepting}
            onClick={onAcceptOrder}
            className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAccepting ? (
              <>
                <Loader2 className="size-5 animate-spin" /> Accepting...
              </>
            ) : (
              <>
                <CheckCircle2 className="size-5" /> ACCEPT ORDER
              </>
            )}
          </button>

          <button
            type="button"
            disabled={isAccepting}
            onClick={onRejectOrder}
            className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XCircle className="size-5" /> REJECT ORDER
          </button>
        </div>

      </div>
    </div>
  );
}

