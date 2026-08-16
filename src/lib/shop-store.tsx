import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { PRODUCTS, setProductsCache, byId, type Product } from "./data";
import { supabase } from "./supabase";
import {
  fetchSupabaseProducts,
  mapSupabaseProduct,
  type SupabaseProduct,
} from "./supabase-products";

type CartLine = { id: string; qty: number; variant?: string };

type ShopState = {
  cart: CartLine[];
  wishlist: string[];
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean) => void;
  addToCart: (id: string, qty?: number, variant?: string) => void;
  setQty: (id: string, qty: number, variant?: string) => void;
  removeFromCart: (id: string, variant?: string) => void;
  clearCart: () => void;
  toggleWishlist: (id: string) => void;
  inWishlist: (id: string) => boolean;
  validateAndProcessCheckout: () => Promise<boolean>;
  cartCount: number;
  lines: { product: Product; qty: number; variant?: string }[];
  subtotal: number;
  savings: number;
  total: number;
};

const ShopContext = createContext<ShopState | null>(null);

const CART_KEY = "cnc-cart-v1";
const WISH_KEY = "cnc-wishlist-v1";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(read<CartLine[]>(CART_KEY, []));
    setWishlist(read<string[]>(WISH_KEY, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(WISH_KEY, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const addToCart = useCallback((id: string, qty = 1, variant?: string) => {
    const product = byId(id);
    const availableStock = product ? product.stock : 0;

    if (availableStock <= 0) {
      toast.error("Out of Stock", {
        description: `${product?.name || "Item"} is currently out of stock.`,
      });
      return;
    }

    setCart((prev) => {
      const existing = prev.find((l) => l.id === id && l.variant === variant);
      const existingQty = existing ? existing.qty : 0;
      const targetQty = existingQty + qty;

      if (targetQty > availableStock) {
        if (existingQty === 0) {
          toast.error(`Only ${availableStock} items available.`, { description: product?.name });
          setCartOpen(true);
          return [...prev, { id, qty: availableStock, ...(variant ? { variant } : {}) }];
        } else {
          toast.error(`Maximum available quantity is ${availableStock}.`, {
            description: product?.name,
          });
          return prev.map((l) =>
            l.id === id && l.variant === variant ? { ...l, qty: availableStock } : l,
          );
        }
      }

      toast.success("Added to cart", {
        id: "add-to-cart-toast",
        duration: 2000,
        description: `${qty} × ${product?.name}${variant ? ` (${variant})` : ''}`,
      });
      setCartOpen(true);
      if (existing) {
        return prev.map((l) =>
          l.id === id && l.variant === variant ? { ...l, qty: l.qty + qty } : l,
        );
      }
      return [...prev, { id, qty, ...(variant ? { variant } : {}) }];
    });
  }, []);

  const setQty = useCallback((id: string, qty: number, variant?: string) => {
    const product = byId(id);
    const availableStock = product ? product.stock : 0;

    if (qty > availableStock) {
      toast.error(`Cannot add more. Only ${availableStock} in stock.`, {
        description: product?.name,
      });
      setCart((prev) =>
        prev.map((l) => (l.id === id && l.variant === variant ? { ...l, qty: availableStock } : l)),
      );
      return;
    }

    setCart((prev) =>
      qty <= 0
        ? prev.filter((l) => !(l.id === id && l.variant === variant))
        : prev.map((l) => (l.id === id && l.variant === variant ? { ...l, qty } : l)),
    );
  }, []);

  const removeFromCart = useCallback((id: string, variant?: string) => {
    setCart((prev) => prev.filter((l) => !(l.id === id && l.variant === variant)));
    toast("Removed from cart");
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((id: string) => {
    const product = byId(id);
    setWishlist((prev) => {
      if (prev.includes(id)) {
        toast("Removed from wishlist");
        return prev.filter((w) => w !== id);
      }
      toast.success("Saved to wishlist", { description: product?.name });
      return [...prev, id];
    });
  }, []);

  const validateAndProcessCheckout = useCallback(async (): Promise<boolean> => {
    if (cart.length === 0) return false;

    // 1. Read current stock from Supabase
    const { data: currentProducts, error: fetchErr } = await supabase.from("products").select("*");

    if (fetchErr || !currentProducts) {
      console.error("Supabase stock fetch error:", fetchErr);
      toast.error("Unable to verify stock from Supabase. Please try again.");
      return false;
    }

    const currentMapped = (currentProducts as SupabaseProduct[]).map(mapSupabaseProduct);

    // 2. Validate stock before proceeding
    for (const item of cart) {
      const dbProduct = currentMapped.find((p) => p.id === item.id);
      const latestStock = dbProduct ? dbProduct.stock : 0;

      if (!dbProduct || item.qty > latestStock || latestStock <= 0) {
        toast.error("Some items are no longer available in the requested quantity.", {
          description: dbProduct
            ? `${dbProduct.name} (available: ${latestStock})`
            : "Item unavailable",
        });
        await fetchSupabaseProducts();
        return false;
      }
    }

    // 3. Update products.stock in Supabase
    for (const item of cart) {
      const dbProduct = currentMapped.find((p) => p.id === item.id);
      if (!dbProduct) continue;

      const currentStock = dbProduct.stock;
      const purchasedQuantity = item.qty;
      const newStock = Math.max(0, currentStock - purchasedQuantity);

      const { data: updatedRows, error: updateError } = await supabase
        .from("products")
        .update({ stock: newStock })
        .eq("id", item.id)
        .select();

      if (updateError) {
        console.error(`Supabase stock update failed for product ${item.id}:`, updateError);
        toast.error("Failed to update product stock in Supabase.", {
          description: updateError.message,
        });
        return false;
      }

      if (!updatedRows || updatedRows.length === 0) {
        const rlsErr = `Supabase UPDATE on table 'products' returned 0 modified rows for ID '${item.id}'. Please enable an UPDATE policy for 'anon' role in your Supabase Dashboard.`;
        console.error("Supabase stock update error:", rlsErr);
        toast.error("Failed to update product stock in Supabase.", {
          description: "Row Level Security (RLS) UPDATE policy is missing on 'products' table.",
        });
        return false;
      }
    }

    // 4. After update succeeds, re-fetch products from Supabase and update UI
    await fetchSupabaseProducts();
    return true;
  }, [cart]);

  const lines = useMemo(() => {
    return cart
      .map((l) => ({
        product: byId(l.id)!,
        qty: l.qty,
        ...(l.variant ? { variant: l.variant } : {}),
      }))
      .filter((l) => l.product);
  }, [cart]);

  const value = useMemo<ShopState>(() => {
    const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
    const total = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
    return {
      cart,
      wishlist,
      cartOpen,
      setCartOpen,
      mobileMenuOpen,
      setMobileMenuOpen,
      addToCart,
      setQty,
      removeFromCart,
      clearCart,
      toggleWishlist,
      inWishlist: (id: string) => wishlist.includes(id),
      validateAndProcessCheckout,
      cartCount: cart.reduce((s, l) => s + l.qty, 0),
      lines,
      subtotal,
      savings: 0,
      total,
    };
  }, [
    cart,
    wishlist,
    cartOpen,
    mobileMenuOpen,
    addToCart,
    setQty,
    removeFromCart,
    clearCart,
    toggleWishlist,
    validateAndProcessCheckout,
  ]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
