import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Banknote, CheckCircle2, CreditCard, Smartphone, Store, Truck, Zap, Loader2 } from "lucide-react";
import { inr, useShop } from "@/lib/shop-store";
import { useAuth, isEmailConfirmed } from "@/lib/auth-store";
import { saveOrder, OrderRecord } from "@/lib/orders-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Clip N Copy" },
      {
        name: "description",
        content:
          "Review your order, pick delivery or store pickup and place your Clip N Copy order. Demo checkout — no real payment is taken.",
      },
      { property: "og:title", content: "Checkout — Clip N Copy" },
      {
        property: "og:description",
        content: "Delivery, pickup and payment options at Clip N Copy.",
      },
    ],
  }),
  component: Checkout,
});

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

function Checkout() {
  const { lines, totalMrp, subtotal, savings, total, clearCart, validateAndProcessCheckout } = useShop();
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  const [delivery, setDelivery] = useState("standard");
  const [payment, setPayment] = useState("upi");
  const [placed, setPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userFullName = profile?.full_name || (user?.user_metadata?.["full_name"] as string) || "";
  const [nameInput, setNameInput] = useState(userFullName);
  const [phoneInput, setPhoneInput] = useState("");
  const [addressInput, setAddressInput] = useState("");
  const [createdOrder, setCreatedOrder] = useState<OrderRecord | null>(null);

  useEffect(() => {
    if (userFullName && !nameInput) {
      setNameInput(userFullName);
    }
  }, [userFullName, nameInput]);

  useEffect(() => {
    if (!loading && (!user || !isEmailConfirmed(user))) {
      toast.error("Please confirm your email and sign in to continue with checkout.");
      navigate({ to: "/login", search: { redirect: "/checkout" } });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="section-shell flex min-h-[60vh] items-center justify-center py-16">
        <div className="flex items-center gap-3 text-sm font-semibold text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-primary" /> Loading checkout...
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const shipping =
    delivery === "express" ? 150 : delivery === "standard" ? (subtotal >= 79 ? 0 : 79) : 0;

  if (placed && createdOrder) {
    return (
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
    );
  }

  return (
    <div className="section-shell py-10">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to Home
        </Link>
      </div>
      <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Checkout</h1>
      <p className="text-sm text-muted-foreground">
        Signed in as <span className="font-semibold text-foreground">{userFullName || user.email}</span>.
      </p>

      <form
        className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]"
        onSubmit={async (e) => {
          e.preventDefault();
          if (isSubmitting) return;
          setIsSubmitting(true);

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
                customerName: nameInput || userFullName || "Customer",
                customerPhone: phoneInput || "+91 99860 55335",
                customerEmail: user.email || "",
                date: new Date().toISOString().split("T")[0] || "2026-08-13",
                itemsCount: lines.reduce((s, l) => s + l.qty, 0),
                totalAmount: total + shipping,
                status: "Processing",
                fulfillmentType: delivery === "pickup" ? "Pickup" : "Delivery",
                address: addressInput || "ITPL Main Road, Kundalahalli, Bengaluru",
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
        }}
      >
        <div className="space-y-6">
          <section className="surface-card p-6">
            <h2 className="font-display text-lg font-bold">Delivery Address</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Full name">
                <input
                  required
                  className="input-base"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Your Full Name"
                />
              </Field>
              <Field label="Phone">
                <input
                  required
                  type="tel"
                  className="input-base"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="99860 55335"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Address">
                  <input
                    required
                    className="input-base"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    placeholder="Flat / street / landmark"
                  />
                </Field>
              </div>
              <Field label="City">
                <input required className="input-base" defaultValue="Bengaluru" />
              </Field>
              <Field label="State">
                <input required className="input-base" defaultValue="Karnataka" />
              </Field>
              <Field label="Pincode">
                <input required className="input-base" defaultValue="560037" />
              </Field>
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
