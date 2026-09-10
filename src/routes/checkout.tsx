import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Smartphone,
  Store,
  Truck,
  Zap,
  Loader2,
  QrCode,
  AlertCircle,
} from "lucide-react";
import { inr, useShop } from "@/lib/shop-store";
import { useAuth, isEmailConfirmed } from "@/lib/auth-store";
import { saveOrderViaRpc, saveOrder, OrderRecord } from "@/lib/orders-store";
import { triggerOrderConfirmationEmail } from "@/lib/order-email-service";
import { UserAddress, fetchUserAddresses, addUserAddress } from "@/lib/address-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ShopLayout } from "@/components/ShopLayout";
import { useAppBack } from "@/lib/useAppBack";



const DELIVERY = [
  { id: "standard", label: "Standard Delivery", note: "2–3 days · Standard delivery", icon: Truck },
  { id: "express", label: "Express Delivery", note: "Same day before 7 PM · ₹150", icon: Zap },
  { id: "pickup", label: "Store Pickup", note: "Ready in 30 min at Kundalahalli", icon: Store },
];

const PAYMENTS = [
  { id: "qr", label: "QR Payment", note: "Scan & Pay via UPI", icon: QrCode },
  { id: "upi", label: "UPI", note: "Pay via UPI App or Intent", icon: Smartphone },
  { id: "cod", label: "Cash on Delivery", note: "Pay when it arrives", icon: Banknote },
];

import { useStoreStatus, fetchStoreSettings, evaluateStoreStatus } from "@/lib/store-status";
import { StoreStatusBadge } from "@/components/StoreStatusBadge";

export default function CheckoutPage() {
  const { isOnline } = useStoreStatus();
  const {
    lines,
    totalMrp,
    subtotal,
    savings,
    total,
    clearCart,
    validateAndProcessCheckout,
  } = useShop();
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const newAddressRef = useRef<HTMLDivElement>(null);

  const [delivery, setDelivery] = useState("standard");
  const [payment, setPayment] = useState("qr");
  const [placed, setPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);



  // Saved addresses state
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState<boolean>(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const userFullName = profile?.full_name || (user?.user_metadata?.["full_name"] as string) || "";
  const userPhone = profile?.phone || (user?.user_metadata?.["phone"] as string) || "";

  // New address form state
  const [nameInput, setNameInput] = useState(userFullName);
  const [phoneInput, setPhoneInput] = useState(userPhone);
  const [addressInput, setAddressInput] = useState("");
  const [cityInput, setCityInput] = useState("Bengaluru");
  const [stateInput, setStateInput] = useState("Karnataka");
  const [pincodeInput, setPincodeInput] = useState("560037");
  const [saveNewAddress, setSaveNewAddress] = useState(false);

  const [createdOrder, setCreatedOrder] = useState<OrderRecord | null>(null);

  useEffect(() => {
    if (userFullName && !nameInput) {
      setNameInput(userFullName);
    }
    if (userPhone && !phoneInput) {
      setPhoneInput(userPhone);
    }
  }, [userFullName, userPhone, nameInput, phoneInput]);

  const loadSavedAddresses = useCallback(async () => {
    if (!user?.id) return;
    setIsLoadingAddresses(true);
    try {
      const { data } = await fetchUserAddresses(user.id);
      const list = data || [];
      setSavedAddresses(list);
      if (list.length > 0) {
        const defaultAddr = list.find((a) => a.is_default) || list[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        }
      } else {
        setSelectedAddressId(null);
      }
    } catch (err) {
      console.error("[Checkout] Error loading saved addresses:", err);
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadSavedAddresses();
    }
  }, [user?.id, loadSavedAddresses]);

  useEffect(() => {
    if (!loading) {
      if (!user || !isEmailConfirmed(user)) {
        toast.error("Please confirm your email and sign in to continue with checkout.");
        navigate("/login?redirect=/checkout");
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <ShopLayout>
        <div className="section-shell flex min-h-[60vh] items-center justify-center py-16">
          <div className="flex items-center gap-3 text-sm font-semibold text-muted-foreground">
            <Loader2 className="size-5 animate-spin text-primary" /> Loading checkout...
          </div>
        </div>
      </ShopLayout>
    );
  }

  if (!user) {
    return null;
  }

  const shipping =
    delivery === "express" ? 150 : delivery === "standard" ? (subtotal >= 400 ? 0 : 79) : 0;
  const finalAmount = total + shipping;

  if (placed && createdOrder) {
    return (
      <ShopLayout>
        <div className="section-shell flex min-h-[60vh] items-center justify-center py-16">
          <div className="surface-card max-w-lg p-8 sm:p-10 text-center rise-in border border-border/80 shadow-2xl">
            <CheckCircle2 className="mx-auto size-16 text-success" />
            <h1 className="mt-5 font-display text-2xl font-black sm:text-3xl">
              Order Placed Successfully 🎉
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Thank you for shopping with Clip N Copy.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-secondary p-4 text-center">
                <p className="text-xs text-muted-foreground">Order ID</p>
                <p className="font-display font-bold text-primary">{createdOrder.orderNumber}</p>
              </div>
              <div className="rounded-2xl bg-secondary p-4 text-center">
                <p className="text-xs text-muted-foreground">Total Amount</p>
                <p className="font-display font-bold">{inr(createdOrder.totalAmount)}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-primary/5 border border-primary/20 p-4 text-xs text-muted-foreground text-left space-y-1.5">
              <p><span className="font-bold text-foreground">Customer:</span> {createdOrder.customerName} ({createdOrder.customerPhone || "N/A"})</p>
              <p><span className="font-bold text-foreground">Delivery:</span> {createdOrder.deliveryMethod} — {createdOrder.address}</p>
              <p><span className="font-bold text-foreground">Payment Method:</span> {createdOrder.paymentMethod}</p>
            </div>

            <Link
              to="/shop"
              className="mt-7 inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 font-semibold text-primary-foreground shadow-glow hover:bg-primary/90 transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </ShopLayout>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const freshSettings = await fetchStoreSettings();
    const { isOnline: freshIsOnline } = evaluateStoreStatus(freshSettings);
    if (!freshIsOnline) {
      toast.error("Store is currently closed. Orders will be available when the store opens.");
      setIsSubmitting(false);
      return;
    }

    let finalCustomerName = nameInput || userFullName || "Customer";
    let finalCustomerPhone = phoneInput || "+91 99860 55335";
    let finalAddress = "";
    let finalCity = cityInput.trim() || "Bengaluru";
    let finalState = stateInput.trim() || "Karnataka";
    let finalPincode = pincodeInput.trim() || "560037";

    const selectedAddrObj = savedAddresses.find((a) => a.id === selectedAddressId);

    if (selectedAddrObj && selectedAddressId !== "new") {
      finalCustomerName = selectedAddrObj.full_name;
      finalCustomerPhone = selectedAddrObj.phone;
      finalCity = selectedAddrObj.city || "Bengaluru";
      finalState = selectedAddrObj.state || "Karnataka";
      finalPincode = selectedAddrObj.pincode || "560037";
      finalAddress = [
        selectedAddrObj.address_line1,
        selectedAddrObj.address_line2,
        selectedAddrObj.landmark ? `Near ${selectedAddrObj.landmark}` : null,
        `${finalCity}, ${finalState} - ${finalPincode}`,
      ]
        .filter(Boolean)
        .join(", ");
    } else {
      if (!addressInput.trim()) {
        toast.error("Please enter your delivery address.");
        setIsSubmitting(false);
        return;
      }
      finalAddress = `${addressInput.trim()}, ${finalCity}, ${finalState} - ${finalPincode}`;

      if (saveNewAddress && user?.id) {
        try {
          await addUserAddress(user.id, {
            full_name: nameInput.trim() || userFullName || "Customer",
            phone: phoneInput.trim() || "+91 99860 55335",
            address_line1: addressInput.trim(),
            address_line2: `${finalCity}, ${finalState}`,
            city: finalCity,
            state: finalState,
            pincode: finalPincode,
            country: "India",
            address_type: "Home",
            is_default: savedAddresses.length === 0,
          });
        } catch (err) {
          console.error("Failed to save new address:", err);
        }
      }
    }

    const ok = await validateAndProcessCheckout();
    if (ok) {
      const orderNum = "CNC-2026-" + Math.floor(10000 + Math.random() * 90000);
      const orderItemsInput = lines.map((l) => {
        const { product, qty } = l;
        return {
          product_id: product.id,
          product_name: product.name,
          quantity: qty,
          price: product.price,
          image_url: product.image,
          ...(l.variant ? { variant: l.variant } : {}),
        };
      });

      const selectedPaymentMethod = payment === "qr" ? "QR Payment" : payment === "upi" ? "UPI" : "COD";

      const saved = await saveOrderViaRpc(
        {
          p_city: finalCity,
          p_coupon_code: "",
          p_coupon_discount: 0,
          p_customer_email: user.email || "",
          p_customer_name: finalCustomerName,
          p_discount: savings,
          p_items: orderItemsInput,
          p_phone: finalCustomerPhone,
          p_pincode: finalPincode,
          p_shipping: shipping,
          p_shipping_address: finalAddress,
          p_state: finalState,
          p_subtotal: subtotal,
          p_total: finalAmount,
          p_payment_method: selectedPaymentMethod,
        },
        {
          orderNumber: orderNum,
          fulfillmentType: delivery === "pickup" ? "Pickup" : "Delivery",
          deliveryMethod: DELIVERY.find((d) => d.id === delivery)?.label || "Standard Delivery",
          user_id: user.id,
        }
      );

      setCreatedOrder(saved);
      setPlaced(true);
      clearCart();

      // Trigger automatic order confirmation email
      triggerOrderConfirmationEmail(saved.id, saved.orderNumber);

      window.dispatchEvent(new Event("cnc-order-placed"));
      toast.success(`Order ${saved.orderNumber} placed successfully!`);
    }
    setIsSubmitting(false);
  };

  return (
    <ShopLayout>
      <div className="section-shell pt-6 pb-10">
        <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Checkout</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as <span className="font-semibold text-foreground">{userFullName || user.email}</span>.
        </p>

        <form
          className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]"
          onSubmit={handlePlaceOrder}
        >
          <div className="space-y-6">
            <section className="surface-card p-6">
              <h2 className="font-display text-lg font-bold uppercase tracking-wider text-foreground">
                SAVED ADDRESSES
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Select a saved delivery address
              </p>

              {isLoadingAddresses ? (
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground py-4">
                  <Loader2 className="size-4 animate-spin text-primary" /> Loading saved addresses...
                </div>
              ) : savedAddresses.length > 0 ? (
                <div className="mt-4 grid gap-3">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    const addressType = addr.address_type || "Home";
                    const formattedCompact = [
                      addr.address_line1,
                      addr.address_line2,
                      addr.landmark ? `Near ${addr.landmark}` : null,
                      `${addr.city}, ${addr.state} - ${addr.pincode}`,
                    ]
                      .filter(Boolean)
                      .join(", ");

                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={cn(
                          "relative flex items-start gap-3.5 rounded-2xl border p-4 transition-all cursor-pointer select-none",
                          isSelected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border bg-background hover:bg-secondary"
                        )}
                      >
                        <input
                          type="radio"
                          name="selected_delivery_address"
                          checked={isSelected}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1 size-4 text-primary accent-primary shrink-0 cursor-pointer"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-display text-xs font-bold uppercase tracking-wider text-foreground">
                                {addressType}
                              </span>
                              {addr.is_default && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-wider">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-sm font-bold text-foreground">
                            {addr.full_name} <span className="text-muted-foreground font-normal">·</span> {addr.phone}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {formattedCompact}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-border bg-secondary/30 p-5 text-center">
                  <p className="text-xs text-muted-foreground font-medium">No saved addresses yet.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAddressId("new");
                      newAddressRef.current?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-soft cursor-pointer"
                  >
                    + Add New Address
                  </button>
                </div>
              )}

              {/* Divider */}
              {savedAddresses.length > 0 && (
                <div className="relative my-6 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative bg-card px-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    OR ADD A NEW ADDRESS
                  </div>
                </div>
              )}

              {/* Add New Address Form Container */}
              <div
                ref={newAddressRef}
                className={cn(
                  "rounded-2xl border transition-all duration-300 overflow-hidden",
                  selectedAddressId === "new" || savedAddresses.length === 0
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 p-4 space-y-4"
                    : "border-border bg-background hover:bg-secondary p-4 cursor-pointer"
                )}
                onClick={() => {
                  if (savedAddresses.length > 0 && selectedAddressId !== "new") {
                    setSelectedAddressId("new");
                  }
                }}
              >
                {savedAddresses.length > 0 && (
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      id="use_new_address_radio"
                      name="selected_delivery_address"
                      checked={selectedAddressId === "new"}
                      onChange={() => setSelectedAddressId("new")}
                      className="size-4 text-primary accent-primary cursor-pointer shrink-0"
                    />
                    <label
                      htmlFor="use_new_address_radio"
                      className="text-xs font-bold text-foreground cursor-pointer flex-1 select-none"
                    >
                      Use a new address
                    </label>
                  </div>
                )}

                {/* Form Inputs (Visible ONLY when Use a new address is selected or no saved addresses) */}
                {(selectedAddressId === "new" || savedAddresses.length === 0) && (
                  <div className="space-y-4 pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="FULL NAME">
                        <input
                          required={selectedAddressId === "new" || savedAddresses.length === 0}
                          className="input-base"
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          placeholder="Your Full Name"
                        />
                      </Field>
                      <Field label="PHONE">
                        <input
                          required={selectedAddressId === "new" || savedAddresses.length === 0}
                          type="tel"
                          className="input-base"
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value)}
                          placeholder="99860 55335"
                        />
                      </Field>
                      <div className="sm:col-span-2">
                        <Field label="ADDRESS / Flat / Street / Landmark">
                          <input
                            required={selectedAddressId === "new" || savedAddresses.length === 0}
                            className="input-base"
                            value={addressInput}
                            onChange={(e) => setAddressInput(e.target.value)}
                            placeholder="Flat / Street / Landmark"
                          />
                        </Field>
                      </div>
                      <Field label="CITY">
                        <input
                          required={selectedAddressId === "new" || savedAddresses.length === 0}
                          className="input-base"
                          value={cityInput}
                          onChange={(e) => setCityInput(e.target.value)}
                          placeholder="Bengaluru"
                        />
                      </Field>
                      <Field label="STATE">
                        <input
                          required={selectedAddressId === "new" || savedAddresses.length === 0}
                          className="input-base"
                          value={stateInput}
                          onChange={(e) => setStateInput(e.target.value)}
                          placeholder="Karnataka"
                        />
                      </Field>
                      <Field label="PINCODE">
                        <input
                          required={selectedAddressId === "new" || savedAddresses.length === 0}
                          className="input-base"
                          value={pincodeInput}
                          onChange={(e) => setPincodeInput(e.target.value)}
                          placeholder="560037"
                        />
                      </Field>
                    </div>

                    {user && (
                      <div className="pt-1">
                        <label className="flex items-center gap-2.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={saveNewAddress}
                            onChange={(e) => setSaveNewAddress(e.target.checked)}
                            className="size-4 rounded border-input text-primary accent-primary cursor-pointer"
                          />
                          <span className="text-xs font-semibold text-foreground">
                            Save this address to my saved addresses
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            <section className="surface-card p-6">
              <h2 className="font-display text-lg font-bold">Delivery Method</h2>
              <div className="mt-4 grid gap-3">
                {DELIVERY.map((d) => (
                  <Option
                    key={d.id}
                    active={delivery === d.id}
                    onClick={() => setDelivery(d.id)}
                    icon={<d.icon className="size-5" />}
                    label={d.label}
                    note={d.note}
                  />
                ))}
              </div>
            </section>

            <section className="surface-card p-6">
              <h2 className="font-display text-lg font-bold">Payment Method</h2>
              <p className="text-xs text-muted-foreground mt-0.5 mb-4">
                Choose your preferred payment method
              </p>
              
              <div className="grid gap-3 sm:grid-cols-3">
                {PAYMENTS.map((p) => (
                  <Option
                    key={p.id}
                    active={payment === p.id}
                    onClick={() => setPayment(p.id)}
                    icon={<p.icon className="size-5" />}
                    label={p.label}
                    note={p.note}
                  />
                ))}
              </div>


            </section>
          </div>

          <aside className="space-y-6">
            <div className="surface-card p-6 sticky top-24">
              <h2 className="font-display text-lg font-bold">Order Summary</h2>

              <ul className="mt-4 divide-y divide-border">
                {lines.map(({ product, qty, variant }) => (
                  <li key={`${product.id}-${variant || ''}`} className="flex gap-3 py-3 text-xs">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="size-12 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{product.name}</p>
                      {variant && <p className="text-primary font-semibold">Colour: {variant}</p>}
                      <p className="text-muted-foreground mt-0.5">Qty {qty}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {product.mrp > product.price && (
                        <span className="block text-[11px] text-muted-foreground line-through font-normal">
                          {inr(product.mrp * qty)}
                        </span>
                      )}
                      <span className="font-bold">{inr(product.price * qty)}</span>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-4 space-y-2 border-t border-border pt-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total MRP</span>
                  <span>{inr(totalMrp)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-success font-semibold">
                    <span>Product Discount</span>
                    <span>-{inr(savings)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{inr(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? "FREE" : inr(shipping)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-sm font-black">
                  <span>Total</span>
                  <span className="text-primary">{inr(finalAmount)}</span>
                </div>
              </div>

              {!isOnline && (
                <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive flex items-start gap-2.5">
                  <AlertCircle className="size-4 shrink-0 mt-0.5 text-destructive" />
                  <div>
                    <p className="font-bold">Store is currently closed</p>
                    <p className="opacity-90 mt-0.5">Orders will be available when the store opens.</p>
                  </div>
                </div>
              )}              <button
                type="submit"
                disabled={isSubmitting || lines.length === 0 || !isOnline}
                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary font-bold text-primary-foreground shadow-glow hover:bg-primary/90 transition-all cursor-pointer text-sm px-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Processing Order...
                  </>
                ) : !isOnline ? (
                  "Store is Closed"
                ) : (
                  `Place Order (${inr(finalAmount)})`
                )}
              </button>
            </div>
          </aside>
        </form>
      </div>
    </ShopLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-xs font-bold text-muted-foreground">
      <span className="mb-1 block uppercase tracking-wider">{label}</span>
      {children}
    </label>
  );
}

function Option({
  active,
  onClick,
  icon,
  label,
  note,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  note: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3.5 rounded-2xl border p-4 text-left transition-all cursor-pointer",
        active
          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
          : "border-border bg-background hover:bg-secondary"
      )}
    >
      <div className={cn("grid size-10 place-items-center rounded-xl", active ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground")}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold">{label}</p>
        <p className="text-xs text-muted-foreground">{note}</p>
      </div>
    </button>
  );
}
