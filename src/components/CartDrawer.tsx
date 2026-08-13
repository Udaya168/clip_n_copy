import { Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { inr, useShop } from "@/lib/shop-store";
import { useAuth, isEmailConfirmed } from "@/lib/auth-store";
import { toast } from "sonner";

export function CartDrawer() {
  const { cartOpen, setCartOpen, lines, setQty, removeFromCart, subtotal, savings, total } =
    useShop();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!cartOpen) return null;

  const handleCheckoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setCartOpen(false);
    // Requirement 6: Check auth & email confirmation status
    if (!user || !isEmailConfirmed(user)) {
      toast.error("Please confirm your email and sign in to continue with checkout.");
      navigate({ to: "/login", search: { redirect: "/checkout" } });
    } else {
      navigate({ to: "/checkout" });
    }
  };

  return (
    <div className="fixed inset-0 z-70">
      <div
        className="absolute inset-0 bg-ink/50 animate-in fade-in duration-200"
        onClick={() => setCartOpen(false)}
      />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-[26rem] flex-col bg-background shadow-lift animate-in slide-in-from-right duration-300">
        <header className="flex items-center justify-between border-b border-border p-4">
          <h2 className="flex items-center gap-2 font-display text-lg font-extrabold">
            <ShoppingBag className="size-5 text-primary" /> Your Cart
            <span className="text-sm font-medium text-muted-foreground">({lines.length})</span>
          </h2>
          <button onClick={() => setCartOpen(false)} aria-label="Close cart">
            <X className="size-5" />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-primary-soft text-primary">
              <ShoppingBag className="size-7" />
            </span>
            <p className="font-display font-bold">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">
              Add notebooks, pens or books and they will show up here.
            </p>
            <Link
              to="/shop"
              onClick={() => setCartOpen(false)}
              className="mt-2 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {lines.map(({ product, qty }) => (
                <div key={product.id} className="flex gap-3 rounded-2xl border border-border p-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="size-20 shrink-0 rounded-xl border border-border object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/product/$id"
                      params={{ id: product.id }}
                      onClick={() => setCartOpen(false)}
                      className="line-clamp-2 text-sm font-semibold hover:text-primary"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{product.brand}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 rounded-full border border-border">
                        <button
                          onClick={() => setQty(product.id, qty - 1)}
                          className="grid size-8 place-items-center rounded-full hover:bg-secondary"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold">{qty}</span>
                        <button
                          onClick={() => setQty(product.id, qty + 1)}
                          disabled={qty >= product.stock}
                          className="grid size-8 place-items-center rounded-full hover:bg-secondary disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <span className="font-display text-sm font-bold">
                        {inr(product.price * qty)}
                      </span>
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="Remove item"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <footer className="space-y-3 border-t border-border p-4">
              <div className="space-y-1.5 text-sm">
                <Row label="Subtotal" value={inr(subtotal)} />
                <Row label="Discount" value={`− ${inr(savings)}`} tone="success" />
                <div className="flex items-center justify-between border-t border-border pt-2 font-display text-base font-extrabold">
                  <span>Total</span>
                  <span>{inr(total)}</span>
                </div>
              </div>
              <button
                onClick={handleCheckoutClick}
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground shadow-glow transition-transform active:scale-98 cursor-pointer"
              >
                Proceed to Checkout
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "success" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={tone === "success" ? "font-semibold text-success" : "font-semibold"}>
        {value}
      </span>
    </div>
  );
}
