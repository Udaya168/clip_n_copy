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
    address: "ITPL Main Road, Kundalahalli, Bengaluru",
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
    address: "Brookefield, Bengaluru",
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
    address: "Kundalahalli Store Pickup",
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
