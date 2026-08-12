import { createFileRoute, Link } from "@tanstack/react-router";
import { Banknote, CheckCircle2, CreditCard, Smartphone, Store, Truck, Zap } from "lucide-react";
import { useState } from "react";
import { inr, useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";

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
      { property: "og:description", content: "Delivery, pickup and payment options at Clip N Copy." },
    ],
  }),
  component: Checkout,
});

const DELIVERY = [
  { id: "standard", label: "Standard Delivery", note: "2–3 days · Free above ₹499", icon: Truck },
  { id: "express", label: "Express Delivery", note: "Same day before 7 PM · ₹49", icon: Zap },
  { id: "pickup", label: "Store Pickup", note: "Ready in 30 min at Kundalahalli", icon: Store },
];

const PAYMENTS = [
  { id: "upi", label: "UPI", note: "GPay, PhonePe, Paytm", icon: Smartphone },
  { id: "card", label: "Card", note: "Credit / debit card", icon: CreditCard },
  { id: "cod", label: "Cash on Delivery", note: "Pay when it arrives", icon: Banknote },
];

function Checkout() {
  const { lines, subtotal, savings, total, clearCart } = useShop();
  const [delivery, setDelivery] = useState("standard");
  const [payment, setPayment] = useState("upi");
  const [placed, setPlaced] = useState(false);

  const shipping = delivery === "express" ? 49 : 0;

  if (placed) {
    return (
      <div className="section-shell flex min-h-[60vh] items-center justify-center py-16">
        <div className="surface-card max-w-lg p-10 text-center rise-in">
          <CheckCircle2 className="mx-auto size-16 text-success" />
          <h1 className="mt-5 font-display text-2xl font-black sm:text-3xl">
            Order Placed Successfully 🎉
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Thank you for shopping with Clip N Copy. A confirmation would normally reach you on
            WhatsApp — this is a demo storefront.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-secondary p-4">
              <p className="text-xs text-muted-foreground">Order ID</p>
              <p className="font-display font-bold">CNC-2026-00125</p>
            </div>
            <div className="rounded-2xl bg-secondary p-4">
              <p className="text-xs text-muted-foreground">Estimated Delivery</p>
              <p className="font-display font-bold">2–3 Days</p>
            </div>
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
      <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Checkout</h1>
      <p className="text-sm text-muted-foreground">
        Demo checkout — no payment is processed and no data leaves your browser.
      </p>

      <form
        className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]"
        onSubmit={(e) => {
          e.preventDefault();
          setPlaced(true);
          clearCart();
        }}
      >
        <div className="space-y-6">
          <section className="surface-card p-6">
            <h2 className="font-display text-lg font-bold">Delivery Address</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Full name">
                <input required className="input-base" placeholder="Saswatee Swain" />
              </Field>
              <Field label="Phone">
                <input required type="tel" className="input-base" placeholder="99860 55335" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Address">
                  <input required className="input-base" placeholder="Flat / street / landmark" />
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

        <aside className="lg:sticky lg:top-40 lg:self-start">
          <div className="surface-card p-6">
            <h2 className="font-display text-lg font-bold">Order Summary</h2>
            <ul className="mt-4 space-y-3">
              {lines.map(({ product, qty }) => (
                <li key={product.id} className="flex items-center gap-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="size-12 shrink-0 rounded-lg border border-border object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{product.name}</span>
                    <span className="text-xs text-muted-foreground">Qty {qty}</span>
                  </span>
                  <span className="text-sm font-semibold">{inr(product.price * qty)}</span>
                </li>
              ))}
              {lines.length === 0 && (
                <li className="text-sm text-muted-foreground">
                  Your cart is empty — you can still preview the flow.
                </li>
              )}
            </ul>
            <div className="mt-5 space-y-1.5 border-t border-border pt-4 text-sm">
              <Row label="Subtotal" value={inr(subtotal)} />
              <Row label="Discount" value={`− ${inr(savings)}`} tone />
              <Row label="Shipping" value={shipping ? inr(shipping) : "Free"} />
              <div className="flex justify-between border-t border-border pt-2 font-display text-base font-extrabold">
                <span>Total</span>
                <span>{inr(total + shipping)}</span>
              </div>
            </div>
            <button
              type="submit"
              className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground shadow-glow transition-transform active:scale-98"
            >
              Place Order
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
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
        "flex items-center gap-3 rounded-2xl border p-4 text-left transition-all",
        active
          ? "border-primary bg-primary-soft/60 shadow-soft"
          : "border-border hover:border-primary/50",
      )}
    >
      <span className={cn("shrink-0", active ? "text-primary" : "text-muted-foreground")}>
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold">{label}</span>
        <span className="block text-xs text-muted-foreground">{note}</span>
      </span>
    </button>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={tone ? "font-semibold text-success" : "font-semibold"}>{value}</span>
    </div>
  );
}
