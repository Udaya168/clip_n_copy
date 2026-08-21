import { supabase } from "@/lib/supabase";

export interface OrderRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: string;
  itemsCount: number;
  totalAmount: number;
  status: "Processing" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
  fulfillmentType: "Delivery" | "Pickup";
  address?: string;
  deliveryMethod?: string;
  paymentMethod?: string;
  user_id?: string;
}

export interface OrderItemInput {
  product_id?: string;
  product_name: string;
  quantity: number;
  price: number;
  image_url?: string;
  variant?: string;
}

export interface OrderItemRecord {
  id: string;
  order_id: string;
  product_id?: string | null | undefined;
  product_name: string;
  quantity: number;
  price: number;
  mrp?: number | null | undefined;
  image_url?: string | null | undefined;
  variant?: string | null | undefined;
}

const ORDERS_KEY = "cnc-orders-v1";
const TODAY = new Date().toISOString().split("T")[0] || "2026-08-13";

const INITIAL_ORDERS: OrderRecord[] = [
  {
    id: "ord-1",
    orderNumber: "CNC-2026-00125",
    customerName: "Rahul Kumar",
    customerPhone: "+91 99860 55335",
    customerEmail: "rahul@example.com",
    date: TODAY,
    itemsCount: 4,
    totalAmount: 649,
    status: "Processing",
    fulfillmentType: "Delivery",
    address: "Flat 4B, Sunshine Apartments, ITPL Main Road, Kundalahalli, Bengaluru, Karnataka - 560037",
    deliveryMethod: "Standard Delivery",
    paymentMethod: "UPI",
  },
  {
    id: "ord-2",
    orderNumber: "CNC-2026-00124",
    customerName: "Saswatee Swain",
    customerPhone: "+91 98450 11223",
    customerEmail: "saswatee@example.com",
    date: "2026-08-12",
    itemsCount: 2,
    totalAmount: 320,
    status: "Shipped",
    fulfillmentType: "Delivery",
    address: "Block C-302, Green Glen Layout, Brookefield, Bengaluru, Karnataka - 560037",
    deliveryMethod: "Express Delivery",
    paymentMethod: "Card",
  },
  {
    id: "ord-3",
    orderNumber: "CNC-2026-00123",
    customerName: "Ananya Sharma",
    customerPhone: "+91 97411 88990",
    customerEmail: "ananya@example.com",
    date: "2026-08-11",
    itemsCount: 6,
    totalAmount: 1150,
    status: "Delivered",
    fulfillmentType: "Pickup",
    address: "Kundalahalli Store Pickup, Shop No. 171, ITPL Main Rd, Bengaluru",
    deliveryMethod: "Store Pickup",
    paymentMethod: "Cash on Delivery",
  },
];

// Helper to read orders from localStorage
export function getStoredOrders(): OrderRecord[] {
  if (typeof window === "undefined") return INITIAL_ORDERS;
  try {
    const raw = window.localStorage.getItem(ORDERS_KEY);
    if (!raw) {
      window.localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn("Failed to parse orders from localStorage:", err);
    return INITIAL_ORDERS;
  }
}

// Fetch order items for a specific order ID
export async function fetchOrderItems(orderId: string): Promise<OrderItemRecord[]> {
  if (!orderId) return [];

  // 1. Try reading from Supabase order_items table first
  try {
    const { data, error } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);

    if (!error && data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        order_id: d.order_id,
        product_id: d.product_id || null,
        product_name: d.product_name || d.name || "Item",
        quantity: Number(d.quantity) || 1,
        price: Number(d.price) || 0,
        mrp: d.mrp ? Number(d.mrp) : null,
        image_url: d.image_url || null,
        variant: d.variant || null,
      }));
    }
  } catch (err) {
    console.warn("Supabase fetchOrderItems warning:", err);
  }

  // 2. Try reading from LocalStorage
  if (typeof window !== "undefined") {
    try {
      const localRaw = window.localStorage.getItem(`cnc-order-items-${orderId}`);
      if (localRaw) {
        const parsed = JSON.parse(localRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any, idx: number) => ({
            id: item.id || `local-item-${orderId}-${idx}`,
            order_id: orderId,
            product_id: item.product_id || null,
            product_name: item.product_name || item.name || "Item",
            quantity: Number(item.quantity || item.qty) || 1,
            price: Number(item.price) || 0,
            mrp: item.mrp ? Number(item.mrp) : null,
            image_url: item.image_url || item.image || null,
            variant: item.variant || null,
          }));
        }
      }
    } catch (e) {
      console.warn("Failed parsing local order items:", e);
    }
  }

  // 3. Fallback mock items for initial demo orders (ord-1, ord-2, ord-3)
  if (orderId === "ord-1") {
    return [
      {
        id: "item-ord-1-0",
        order_id: "ord-1",
        product_id: "reynolds-trimax",
        product_name: "Reynolds Trimax Gel Pen (Pack of 5)",
        quantity: 3,
        price: 49,
        mrp: 60,
        image_url: "/products/reynolds-trimax.webp",
        variant: "Blue",
      },
      {
        id: "item-ord-1-1",
        order_id: "ord-1",
        product_id: "classmate-notebook",
        product_name: "Classmate Long Notebook 172 Pages",
        quantity: 1,
        price: 69,
        mrp: 90,
        image_url: "/products/classmate-notebook.webp",
      },
    ];
  }
  if (orderId === "ord-2") {
    return [
      {
        id: "item-ord-2-0",
        order_id: "ord-2",
        product_id: "casio-fx991",
        product_name: "Casio FX-991EX Scientific Calculator",
        quantity: 1,
        price: 320,
        mrp: 350,
        image_url: "/products/casio-calculator.webp",
      },
    ];
  }
  if (orderId === "ord-3") {
    return [
      {
        id: "item-ord-3-0",
        order_id: "ord-3",
        product_id: "geometry-box",
        product_name: "Camlin Geometry Box Deluxe",
        quantity: 4,
        price: 119,
        mrp: 150,
        image_url: "/products/geometry-box.webp",
      },
      {
        id: "item-ord-3-1",
        order_id: "ord-3",
        product_id: "a4-printer-paper",
        product_name: "A4 Printer Paper 75 GSM (500 Sheets)",
        quantity: 2,
        price: 337,
        mrp: 420,
        image_url: "/products/printer-paper.webp",
      },
    ];
  }

  return [];
}

// Save order to both Supabase (if table exists) and localStorage
export async function saveOrder(
  order: Omit<OrderRecord, "id">,
  items?: OrderItemInput[]
): Promise<OrderRecord> {
  const generatedId = "ord-" + Date.now();
  const newOrder: OrderRecord = {
    ...order,
    id: generatedId,
  };

  // 1. Persist in LocalStorage
  const existing = getStoredOrders();
  const updated = [newOrder, ...existing];
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
    if (items && items.length > 0) {
      window.localStorage.setItem(`cnc-order-items-${newOrder.id}`, JSON.stringify(items));
    }
  }

  // 2. Try inserting into Supabase orders table if available
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const authenticatedUserId = session?.user?.id || newOrder.user_id;

    const { data, error } = await supabase
      .from("orders")
      .insert({
        id: newOrder.id,
        order_number: newOrder.orderNumber,
        customer_name: newOrder.customerName,
        customer_phone: newOrder.customerPhone,
        customer_email: newOrder.customerEmail,
        items_count: newOrder.itemsCount,
        total_amount: newOrder.totalAmount,
        status: newOrder.status.toLowerCase(),
        fulfillment_type: newOrder.fulfillmentType,
        address: newOrder.address,
        delivery_method: newOrder.deliveryMethod,
        payment_method: newOrder.paymentMethod,
        user_id: authenticatedUserId,
      })
      .select()
      .maybeSingle();

    if (error) {
      // Supabase orders table fallback
    } else if (data && items && items.length > 0) {
      // Insert related order_items
      const itemRows = items.map((item, idx) => ({
        id: `item-${newOrder.id}-${idx}`,
        order_id: newOrder.id,
        product_id: item.product_id || null,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        image_url: item.image_url || null,
      }));

      await supabase.from("order_items").insert(itemRows);
    }
  } catch (err) {
    // Fallback to local store
  }

  return newOrder;
}

// Fetch all orders for Admin Portal
export async function fetchAllOrders(): Promise<OrderRecord[]> {
  const localOrders = getStoredOrders();
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      const dbOrders: OrderRecord[] = data.map((d: any) => ({
        id: d.id,
        orderNumber: d.order_number || d.orderNumber || "CNC-" + d.id,
        customerName: d.customer_name || d.customerName || "Customer",
        customerPhone: d.customer_phone || d.customerPhone || "",
        customerEmail: d.customer_email || d.customerEmail || "",
        date: d.created_at ? (new Date(d.created_at).toISOString().split("T")[0] || TODAY) : TODAY,
        itemsCount: d.items_count || d.itemsCount || 1,
        totalAmount: d.total_amount || d.totalAmount || 0,
        status: (d.status
          ? d.status.charAt(0).toUpperCase() + d.status.slice(1)
          : "Processing") as any,
        fulfillmentType: d.fulfillment_type || d.fulfillmentType || "Delivery",
        address: d.address || "",
        deliveryMethod: d.delivery_method || d.deliveryMethod || "",
        paymentMethod: d.payment_method || d.paymentMethod || "",
        user_id: d.user_id,
      }));
      return dbOrders;
    }
  } catch (err) {
    // Fallback to local orders
  }

  return localOrders;
}

// Update Order Status (Admin)
export async function updateOrderStatus(
  orderId: string,
  newStatus: "Processing" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled"
): Promise<void> {
  const existing = getStoredOrders();
  const updated = existing.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  }

  try {
    await supabase
      .from("orders")
      .update({
        status: newStatus.toLowerCase(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);
  } catch (err) {
    // Supabase update skipped/fallback
  }
}
