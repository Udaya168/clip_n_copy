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

export interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount?: number | undefined;
  max_discount_amount?: number | undefined;
  is_active?: boolean | undefined;
  expires_at?: string | undefined;
  description?: string | undefined;
}

const DEFAULT_COUPONS: Coupon[] = [
  {
    id: "cpn-1",
    code: "CLIP10",
    discount_type: "percentage",
    discount_value: 10,
    is_active: true,
    description: "10% OFF on all items",
  },
  {
    id: "cpn-2",
    code: "WELCOME100",
    discount_type: "fixed",
    discount_value: 100,
    min_order_amount: 499,
    is_active: true,
    description: "₹100 OFF on orders above ₹499",
  },
  {
    id: "cpn-3",
    code: "SAVE20",
    discount_type: "percentage",
    discount_value: 20,
    min_order_amount: 999,
    is_active: true,
    description: "20% OFF on orders above ₹999",
  },
];

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
  appliedCoupon: Coupon | null;
  couponDiscount: number;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  availableCoupons: Coupon[];
};

const ShopContext = createContext<ShopState | null>(null);

const CART_KEY = "cnc-cart-v1";
const WISH_KEY = "cnc-wishlist-v1";
const COUPON_KEY = "cnc-applied-coupon-v1";

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
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => read<Coupon | null>(COUPON_KEY, null));
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>(DEFAULT_COUPONS);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsVersion, setProductsVersion] = useState(0);

  useEffect(() => {
    fetchSupabaseProducts().catch(() => {});
    fetchCouponsFromDb();
    return subscribeProducts(() => setProductsVersion((v) => v + 1));
  }, []);

  const fetchCouponsFromDb = async () => {
    try {
      const { data, error } = await supabase.from("coupons").select("*");
      if (!error && data && data.length > 0) {
        const mapped: Coupon[] = data.map((d: any) => ({
          id: d.id || `cpn-${d.code}`,
          code: String(d.code).toUpperCase(),
          discount_type: d.discount_type || (d.discount_percent ? "percentage" : "fixed"),
          discount_value: Number(d.discount_value || d.discount_percent || d.discount_amount || 0),
          min_order_amount: d.min_order_amount ? Number(d.min_order_amount) : undefined,
          max_discount_amount: d.max_discount_amount ? Number(d.max_discount_amount) : undefined,
          is_active: d.is_active ?? true,
          expires_at: d.expires_at,
          description: d.description || `${d.code} discount coupon`,
        }));
        setAvailableCoupons(mapped);
      }
    } catch (err) {
      // Use DEFAULT_COUPONS
    }
  };

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (appliedCoupon) {
        window.localStorage.setItem(COUPON_KEY, JSON.stringify(appliedCoupon));
      } else {
        window.localStorage.removeItem(COUPON_KEY);
      }
    }
  }, [appliedCoupon]);

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

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    toast("Coupon removed");
  }, []);

  const applyCoupon = useCallback(
    async (rawCode: string): Promise<{ success: boolean; message: string }> => {
      const code = rawCode.trim().toUpperCase();
      if (!code) {
        toast.error("Please enter a coupon code.");
        return { success: false, message: "Please enter a coupon code." };
      }

      let foundCoupon: Coupon | undefined = availableCoupons.find(
        (c) => c.code.toUpperCase() === code
      );

      if (!foundCoupon) {
        try {
          const { data, error } = await supabase
            .from("coupons")
            .select("*")
            .ilike("code", code)
            .maybeSingle();

          if (!error && data) {
            foundCoupon = {
              id: data.id || `cpn-${data.code}`,
              code: String(data.code).toUpperCase(),
              discount_type: data.discount_type || (data.discount_percent ? "percentage" : "fixed"),
              discount_value: Number(data.discount_value || data.discount_percent || data.discount_amount || 0),
              min_order_amount: data.min_order_amount ? Number(data.min_order_amount) : undefined,
              max_discount_amount: data.max_discount_amount ? Number(data.max_discount_amount) : undefined,
              is_active: data.is_active ?? true,
              expires_at: data.expires_at,
              description: data.description,
            };
          }
        } catch (err) {
          console.warn("Error fetching coupon:", err);
        }
      }

      if (!foundCoupon) {
        toast.error(`Invalid coupon code "${code}".`);
        return { success: false, message: `Invalid coupon code "${code}".` };
      }

      if (foundCoupon.is_active === false) {
        toast.error("This coupon is currently inactive.");
        return { success: false, message: "This coupon is currently inactive." };
      }

      if (foundCoupon.expires_at && new Date(foundCoupon.expires_at) < new Date()) {
        toast.error("This coupon has expired.");
        return { success: false, message: "This coupon has expired." };
      }

      const currentSubtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);

      if (foundCoupon.min_order_amount && currentSubtotal < foundCoupon.min_order_amount) {
        const msg = `Minimum order amount of ₹${foundCoupon.min_order_amount} required for coupon ${foundCoupon.code}.`;
        toast.error(msg);
        return { success: false, message: msg };
      }

      setAppliedCoupon(foundCoupon);
      toast.success(`Coupon "${foundCoupon.code}" applied successfully!`);
      return { success: true, message: `Coupon "${foundCoupon.code}" applied successfully!` };
    },
    [availableCoupons, lines]
  );

  const value = useMemo<ShopState>(() => {
    const totalMrp = lines.reduce((s, l) => s + (l.product.mrp || l.product.price) * l.qty, 0);
    const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
    const savings = Math.max(0, totalMrp - subtotal);

    let couponDiscount = 0;
    if (appliedCoupon) {
      if (!appliedCoupon.min_order_amount || subtotal >= appliedCoupon.min_order_amount) {
        if (appliedCoupon.discount_type === "percentage") {
          couponDiscount = (subtotal * appliedCoupon.discount_value) / 100;
          if (appliedCoupon.max_discount_amount) {
            couponDiscount = Math.min(couponDiscount, appliedCoupon.max_discount_amount);
          }
        } else {
          couponDiscount = appliedCoupon.discount_value;
        }
        couponDiscount = Math.min(couponDiscount, subtotal);
      }
    }

    const total = Math.max(0, subtotal - couponDiscount);

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
      appliedCoupon,
      couponDiscount,
      applyCoupon,
      removeCoupon,
      availableCoupons,
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
    lines,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    availableCoupons,
  ]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
