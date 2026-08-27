import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import { ArrowLeft, Banknote, CheckCircle2, CreditCard, Smartphone, Store, Truck, Zap, Loader2 } from "lucide-react";
import { inr, useShop } from "@/lib/shop-store";
import { useAuth, isEmailConfirmed } from "@/lib/auth-store";
import { saveOrder, OrderRecord } from "@/lib/orders-store";
import { UserAddress, fetchUserAddresses, addUserAddress } from "@/lib/address-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ShopLayout } from "@/components/ShopLayout";
import { useAppBack } from "@/lib/useAppBack";


const DELIVERY = [
  { id: "standard", label: "Standard Delivery", note: "2–3 days · Free above ₹79", icon: Truck },
  { id: "express", label: "Express Delivery", note: "Same day before 7 PM · ₹150", icon: Zap },
  { id: "pickup", label: "Store Pickup", note: "Ready in 30 min at Kundalahalli", icon: Store },
];

const PAYMENTS = [
  { id: "upi", label: "UPI", note: "GPay, PhonePe, Paytm", icon: Smartphone },
  { id: "card", label: "Card", note: "Credit / debit card", icon: CreditCard },
  { id: "cod", label: "Cash on Delivery", note: "Pay when it arrives", icon: Banknote },
];

export default function CheckoutPage() {
  const { lines, totalMrp, subtotal, savings, total, clearCart, validateAndProcessCheckout } = useShop();
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const goBack = useAppBack();
  const newAddressRef = useRef<HTMLDivElement>(null);

  const [delivery, setDelivery] = useState("standard");
  const [payment, setPayment] = useState("upi");
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
    if (!loading && (!user || !isEmailConfirmed(user))) {
      toast.error("Please confirm your email and sign in to continue with checkout.");
      navigate({ to: "/login", search: { redirect: "/checkout" } });
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
    delivery === "express" ? 150 : delivery === "standard" ? (subtotal >= 79 ? 0 : 79) : 0;

  if (placed && createdOrder) {
    return (
      <ShopLayout>
        <div className="section-shell flex min-h-[60vh] items-center justify-center py-16">
          <div className="surface-card max-w-lg p-10 text-center rise-in">
            <CheckCircle2 className="mx-auto size-16 text-success" />
            <h1 className="mt-5 font-display text-2xl font-black sm:text-3xl">
              Order Placed Successfully 🎉
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Thank you for shopping with Clip N Copy.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-secondary p-4">
                <p className="text-xs text-muted-foreground">Order ID</p>
                <p className="font-display font-bold text-primary">{createdOrder.orderNumber}</p>
              </div>
              <div className="rounded-2xl bg-secondary p-4">
                <p className="text-xs text-muted-foreground">Total Amount</p>
                <p className="font-display font-bold">{inr(createdOrder.totalAmount)}</p>
              </div>
            </div>
            <div className="mt-3 rounded-2xl bg-primary/5 border border-primary/20 p-3 text-xs text-muted-foreground text-left">
              <p><span className="font-bold text-foreground">Customer:</span> {createdOrder.customerName} ({createdOrder.customerPhone || "N/A"})</p>
              <p><span className="font-bold text-foreground">Delivery:</span> {createdOrder.deliveryMethod} — {createdOrder.address}</p>
            </div>
            <Link
              to="/shop"
              className="mt-7 inline-flex h-12 items-center rounded-full bg-primary px-7 font-semibold text-primary-foreground shadow-glow"
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

    let finalCustomerName = nameInput || userFullName || "Customer";
    let finalCustomerPhone = phoneInput || "+91 99860 55335";
    let finalAddress = "";

    const selectedAddrObj = savedAddresses.find((a) => a.id === selectedAddressId);

    if (selectedAddrObj && selectedAddressId !== "new") {
      finalCustomerName = selectedAddrObj.full_name;
      finalCustomerPhone = selectedAddrObj.phone;
      finalAddress = [
        selectedAddrObj.address_line1,
        selectedAddrObj.address_line2,
        selectedAddrObj.landmark ? `Near ${selectedAddrObj.landmark}` : null,
        `${selectedAddrObj.city}, ${selectedAddrObj.state} - ${selectedAddrObj.pincode}`,
      ]
        .filter(Boolean)
        .join(", ");
    } else {
      if (!addressInput.trim()) {
        toast.error("Please enter your delivery address.");
        setIsSubmitting(false);
        return;
      }
      finalAddress = `${addressInput.trim()}, ${cityInput.trim()}, ${stateInput.trim()} - ${pincodeInput.trim()}`;

      if (saveNewAddress && user?.id) {
        try {
          await addUserAddress(user.id, {
            full_name: nameInput.trim() || userFullName || "Customer",
            phone: phoneInput.trim() || "+91 99860 55335",
            address_line1: addressInput.trim(),
            address_line2: `${cityInput.trim()}, ${stateInput.trim()}`,
            city: cityInput.trim(),
            state: stateInput.trim(),
            pincode: pincodeInput.trim(),
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

      const saved = await saveOrder(
        {
          orderNumber: orderNum,
          customerName: finalCustomerName,
          customerPhone: finalCustomerPhone,
          customerEmail: user.email || "",
          date: new Date().toISOString().split("T")[0] || "2026-08-13",
          itemsCount: lines.reduce((s, l) => s + l.qty, 0),
          totalAmount: total + shipping,
          status: "Processing",
          fulfillmentType: delivery === "pickup" ? "Pickup" : "Delivery",
          address: finalAddress || "ITPL Main Road, Kundalahalli, Bengaluru",
          deliveryMethod: DELIVERY.find((d) => d.id === delivery)?.label || "Standard Delivery",
          paymentMethod: PAYMENTS.find((p) => p.id === payment)?.label || "UPI",
          user_id: user.id,
        },
        orderItemsInput
      );

      setCreatedOrder(saved);
      setPlaced(true);
      clearCart();
      window.dispatchEvent(new Event("cnc-order-placed"));
      toast.success(`Order ${saved.orderNumber} placed successfully!`);
    }
    setIsSubmitting(false);
  };

  return (
    <ShopLayout>
      <div className="section-shell py-10">
        <div className="mb-6">
          <button
            onClick={() => goBack("/")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            Back to Home
          </button>
        </div>
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
              <div className="relative my-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative bg-card px-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  OR ADD A NEW ADDRESS
                </div>
              </div>

              {/* Add New Address Form */}
              <div ref={newAddressRef} className="space-y-4">
                {savedAddresses.length > 0 && (
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="use_new_address_radio"
                      name="selected_delivery_address"
                      checked={selectedAddressId === "new" || selectedAddressId === null}
                      onChange={() => setSelectedAddressId("new")}
                      className="size-4 text-primary accent-primary cursor-pointer"
                    />
                    <label htmlFor="use_new_address_radio" className="text-xs font-bold text-foreground cursor-pointer">
                      Use a new address
                    </label>
                  </div>
                )}

                <div
                  className={cn(
                    "grid gap-3 sm:grid-cols-2 pt-1 transition-opacity",
                    selectedAddressId && selectedAddressId !== "new" && savedAddresses.length > 0
                      ? "opacity-60"
                      : "opacity-100"
                  )}
                  onClick={() => {
                    if (savedAddresses.length > 0 && selectedAddressId !== "new") {
                      setSelectedAddressId("new");
                    }
                  }}
                >
                  <Field label="FULL NAME">
                    <input
                      required={selectedAddressId === "new" || !selectedAddressId}
                      className="input-base"
                      value={nameInput}
                      onChange={(e) => {
                        setNameInput(e.target.value);
                        if (selectedAddressId !== "new" && savedAddresses.length > 0) {
                          setSelectedAddressId("new");
                        }
                      }}
                      placeholder="Your Full Name"
                    />
                  </Field>
                  <Field label="PHONE">
                    <input
                      required={selectedAddressId === "new" || !selectedAddressId}
                      type="tel"
                      className="input-base"
                      value={phoneInput}
                      onChange={(e) => {
                        setPhoneInput(e.target.value);
                        if (selectedAddressId !== "new" && savedAddresses.length > 0) {
                          setSelectedAddressId("new");
                        }
                      }}
                      placeholder="99860 55335"
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="ADDRESS / Flat / Street / Landmark">
                      <input
                        required={selectedAddressId === "new" || !selectedAddressId}
                        className="input-base"
                        value={addressInput}
                        onChange={(e) => {
                          setAddressInput(e.target.value);
                          if (selectedAddressId !== "new" && savedAddresses.length > 0) {
                            setSelectedAddressId("new");
                          }
                        }}
                        placeholder="Flat / Street / Landmark"
                      />
                    </Field>
                  </div>
                  <Field label="CITY">
                    <input
                      required={selectedAddressId === "new" || !selectedAddressId}
                      className="input-base"
                      value={cityInput}
                      onChange={(e) => {
                        setCityInput(e.target.value);
                        if (selectedAddressId !== "new" && savedAddresses.length > 0) {
                          setSelectedAddressId("new");
                        }
                      }}
                      placeholder="Bengaluru"
                    />
                  </Field>
                  <Field label="STATE">
                    <input
                      required={selectedAddressId === "new" || !selectedAddressId}
                      className="input-base"
                      value={stateInput}
                      onChange={(e) => {
                        setStateInput(e.target.value);
                        if (selectedAddressId !== "new" && savedAddresses.length > 0) {
                          setSelectedAddressId("new");
                        }
                      }}
                      placeholder="Karnataka"
                    />
                  </Field>
                  <Field label="PINCODE">
                    <input
                      required={selectedAddressId === "new" || !selectedAddressId}
                      className="input-base"
                      value={pincodeInput}
                      onChange={(e) => {
                        setPincodeInput(e.target.value);
                        if (selectedAddressId !== "new" && savedAddresses.length > 0) {
                          setSelectedAddressId("new");
                        }
                      }}
                      placeholder="560037"
                    />
                  </Field>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={saveNewAddress}
                      onChange={(e) => {
                        setSaveNewAddress(e.target.checked);
                        if (selectedAddressId !== "new" && savedAddresses.length > 0) {
                          setSelectedAddressId("new");
                        }
                      }}
                      className="size-4 rounded border-input text-primary accent-primary cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-foreground">
                      Save this address to my saved addresses
                    </span>
                  </label>
                </div>
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
              <h2 className="font-display text-lg font-bold">Payment</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
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
                    <span>Discount</span>
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
                  <span className="text-primary">{inr(total + shipping)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || lines.length === 0}
                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary font-bold text-primary-foreground shadow-glow hover:bg-primary/90 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Processing Order...
                  </>
                ) : (
                  `Place Order (${inr(total + shipping)})`
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
