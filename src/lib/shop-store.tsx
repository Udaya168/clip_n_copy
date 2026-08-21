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
import { PRODUCTS, setProductsCache, subscribeProducts, byId, type Product } from "./data";
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
  addToCart: (id: string, qty?: number, variant?: string, openCart?: boolean) => void;
  setQty: (id: string, qty: number, variant?: string) => void;
  removeFromCart: (id: string, variant?: string) => void;
  clearCart: () => void;
  toggleWishlist: (id: string) => void;
  inWishlist: (id: string) => boolean;
  validateAndProcessCheckout: () => Promise<boolean>;
  cartCount: number;
  lines: { product: Product; qty: number; variant?: string }[];
  totalMrp: number;
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
  const [cart, setCart] = useState<CartLine[]>(() => read<CartLine[]>(CART_KEY, []));
  const [wishlist, setWishlist] = useState<string[]>(() => read<string[]>(WISH_KEY, []));
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsVersion, setProductsVersion] = useState(0);

  useEffect(() => {
    fetchSupabaseProducts().catch(() => {});
    return subscribeProducts(() => setProductsVersion((v) => v + 1));
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }
  }, [cart]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(WISH_KEY, JSON.stringify(wishlist));
    }
  }, [wishlist]);

  const addToCart = useCallback((id: string, qty = 1, variant?: string, openCart = true) => {
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
          if (openCart) setCartOpen(true);
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
      if (openCart) setCartOpen(true);
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

    // 1. Fetch raw products from Supabase database
    let rawDbProducts: SupabaseProduct[] = [];
    let fetchErrorMsg: string | null = null;
    try {
      const { data, error } = await supabase.from("products").select("*");
      if (error) {
        fetchErrorMsg = error.message;
      } else if (data) {
        rawDbProducts = data as SupabaseProduct[];
      }
    } catch (err: any) {
      fetchErrorMsg = err?.message || String(err);
    }

    const dbMappedProducts = rawDbProducts.map(mapSupabaseProduct);

    // 2. Validate inventory and status for each cart item
    for (const item of cart) {
      const cartProductId = item.id;

      // Find product in database or fallback catalog
      let matchedProduct = dbMappedProducts.find(
        (p) => String(p.id) === String(cartProductId) || String(p.id).toLowerCase() === String(cartProductId).toLowerCase()
      );

      let databaseLookupId = matchedProduct ? matchedProduct.id : null;

      if (!matchedProduct) {
        // Resolve local/old cart product data to database product or in-memory catalog
        const memoryProduct = byId(cartProductId);
        if (memoryProduct) {
          matchedProduct = dbMappedProducts.find(
            (p) =>
              String(p.id).toLowerCase() === String(memoryProduct.id).toLowerCase() ||
              p.name.toLowerCase() === memoryProduct.name.toLowerCase()
          );
          if (matchedProduct) {
            databaseLookupId = matchedProduct.id;
          } else {
            matchedProduct = memoryProduct;
            databaseLookupId = memoryProduct.id;
          }
        }
      }

      if (!matchedProduct && dbMappedProducts.length > 0) {
        matchedProduct = dbMappedProducts.find((p) => {
          const pName = p.name.toLowerCase();
          const cleanId = String(cartProductId).toLowerCase();
          return pName.includes(cleanId) || cleanId.includes(pName);
        });
        if (matchedProduct) {
          databaseLookupId = matchedProduct.id;
        }
      }

      // Check fields for availability
      let exactReason = "";
      if (!matchedProduct) {
        exactReason = fetchErrorMsg
          ? `DATABASE_QUERY_ERROR: ${fetchErrorMsg}`
          : "PRODUCT_NOT_FOUND_IN_DATABASE_OR_CATALOG";
      } else {
        const rawRow = rawDbProducts.find((r) => String(r.id) === String(matchedProduct.id));
        const statusField = (rawRow as any)?.status || (rawRow as any)?.availability;
        const isActiveField = (rawRow as any)?.is_active;

        if (isActiveField === false || statusField === "inactive" || statusField === "unavailable") {
          exactReason = `PRODUCT_INACTIVE_OR_UNAVAILABLE (status: ${statusField}, is_active: ${isActiveField})`;
        } else {
          const availableStock = typeof matchedProduct.stock === "number" ? matchedProduct.stock : 50;
          if (availableStock <= 0) {
            exactReason = `OUT_OF_STOCK (stock: ${availableStock})`;
          } else if (item.qty > availableStock) {
            exactReason = `INSUFFICIENT_STOCK (available: ${availableStock}, requested: ${item.qty})`;
          }
        }
      }

      // Log detailed error info if validation failed
      if (exactReason) {
        console.error("[Checkout Validation Error]", {
          "cart product ID": cartProductId,
          "database lookup ID": databaseLookupId || "NONE",
          "returned product": matchedProduct ? { id: matchedProduct.id, name: matchedProduct.name, stock: matchedProduct.stock } : null,
          "exact reason": exactReason,
        });

        if (exactReason.startsWith("PRODUCT_NOT_FOUND")) {
          toast.error("This product is no longer available.", {
            description: "Please remove it from your cart to proceed.",
          });
        } else if (exactReason.startsWith("PRODUCT_INACTIVE")) {
          toast.error("This product is currently inactive.", {
            description: matchedProduct?.name,
          });
        } else {
          toast.error("Some items are no longer available in the requested quantity.", {
            description: matchedProduct
              ? `${matchedProduct.name} (${exactReason.includes("OUT_OF_STOCK") ? "Out of stock" : `available: ${matchedProduct.stock}`})`
              : "Item unavailable",
          });
        }
        await fetchSupabaseProducts().catch(() => {});
        return false;
      }

      console.log("[Checkout Validation Success]", {
        "cart product ID": cartProductId,
        "database lookup ID": databaseLookupId,
        "returned product": matchedProduct ? { id: matchedProduct.id, name: matchedProduct.name, stock: matchedProduct.stock } : null,
        "exact reason": "VALID",
      });
    }

    // 3. Stock update in database
    for (const item of cart) {
      const memoryProd = byId(item.id);
      const dbProduct = dbMappedProducts.find(
        (p) =>
          String(p.id) === String(item.id) ||
          (memoryProd && (String(p.id) === String(memoryProd.id) || p.name.toLowerCase() === memoryProd.name.toLowerCase()))
      );

      if (dbProduct && dbProduct.id) {
        const currentStock = typeof dbProduct.stock === "number" ? dbProduct.stock : 50;
        const newStock = Math.max(0, currentStock - item.qty);

        try {
          const { error: updateErr } = await supabase
            .from("products")
            .update({ stock: newStock })
            .eq("id", dbProduct.id);

          if (updateErr) {
            console.warn("[Checkout Log] Database stock update notice:", {
              "cart product ID": item.id,
              "database lookup ID": dbProduct.id,
              "returned product": dbProduct.name,
              "exact reason": updateErr.message,
            });
          }
        } catch (err: any) {
          console.warn("[Checkout Log] Database stock update exception:", err);
        }
      }
    }

    await fetchSupabaseProducts().catch(() => {});
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
  }, [cart, productsVersion]);

  const value = useMemo<ShopState>(() => {
    const totalMrp = lines.reduce((s, l) => s + (l.product.mrp || l.product.price) * l.qty, 0);
    const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
    const savings = Math.max(0, totalMrp - subtotal);
    const total = subtotal;
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
      totalMrp,
      subtotal,
      savings,
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
