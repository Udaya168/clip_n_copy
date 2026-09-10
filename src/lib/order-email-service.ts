import { supabase } from "./supabase";

export interface OrderEmailTriggerParams {
  orderId: string;
  orderNumber: string;
}

const EMAIL_SENT_KEY_PREFIX = "cnc-email-sent-";

/**
 * Triggers automatic order confirmation email via Supabase Edge Function
 * Guaranteed duplicate protection, server-side Auth verification, and graceful fallback.
 */
export async function triggerOrderConfirmationEmail(
  orderId: string,
  orderNumber: string
): Promise<{ success: boolean; duplicate?: boolean; error?: string }> {
  if (!orderId) {
    return { success: false, error: "Missing order ID" };
  }

  // 1. Client-side duplicate check (per browser session)
  const storageKey = `${EMAIL_SENT_KEY_PREFIX}${orderId}`;
  if (typeof window !== "undefined" && window.localStorage.getItem(storageKey) === "true") {
    console.log(`[Order Email] Email already sent for order ${orderNumber} (local duplicate check).`);
    return { success: true, duplicate: true };
  }

  try {
    // 2. Fetch current session token to ensure explicit Authorization header
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    // 3. Invoke Supabase Edge Function `send-order-email`
    const { data, error } = await supabase.functions.invoke("send-order-email", {
      body: { orderId, orderNumber },
      headers,
    });

    if (error) {
      console.warn("[Order Email Notice] Edge function response:", error.message);
      // Mark as processed locally to avoid infinite retry loops on client
      if (typeof window !== "undefined") {
        window.localStorage.setItem(storageKey, "true");
      }
      return { success: false, error: error.message };
    }

    // 3. Mark as successfully triggered in localStorage
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, "true");
    }

    console.log(`[Order Email] Confirmation email triggered successfully for #${orderNumber}:`, data);
    return { success: true, duplicate: data?.duplicate ?? false };
  } catch (err: any) {
    console.warn("[Order Email Notice] Exception triggering email:", err);
    // Mark as processed locally so order flow is never blocked or broken
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, "true");
    }
    return { success: false, error: err?.message || "Failed to invoke email trigger" };
  }
}

/**
 * Triggers order ACCEPTANCE email via Supabase Edge Function
 */
export async function triggerOrderAcceptanceEmail(
  orderId: string,
  orderNumber: string
): Promise<{ success: boolean; duplicate?: boolean; error?: string }> {
  if (!orderId) {
    return { success: false, error: "Missing order ID" };
  }

  const storageKey = `${EMAIL_SENT_KEY_PREFIX}accepted-${orderId}`;
  if (typeof window !== "undefined" && window.localStorage.getItem(storageKey) === "true") {
    console.log(`[Order Email] Acceptance email already sent for order ${orderNumber}.`);
    return { success: true, duplicate: true };
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const { data, error } = await supabase.functions.invoke("send-order-email", {
      body: { orderId, orderNumber, action: "accepted" },
      headers,
    });

    if (error) {
      console.warn("[Order Acceptance Email Notice] Edge function error:", error.message);
      return { success: false, error: error.message };
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, "true");
    }

    console.log(`[Order Email] Acceptance email triggered for #${orderNumber}:`, data);
    return { success: true, duplicate: data?.duplicate ?? false };
  } catch (err: any) {
    console.warn("[Order Acceptance Email Notice] Exception:", err);
    return { success: false, error: err?.message || "Failed to invoke acceptance email trigger" };
  }
}

/**
 * Triggers order REJECTION email via Supabase Edge Function
 */
export async function triggerOrderRejectionEmail(
  orderId: string,
  orderNumber: string,
  rejectionReason: string
): Promise<{ success: boolean; duplicate?: boolean; error?: string }> {
  if (!orderId) {
    return { success: false, error: "Missing order ID" };
  }

  const storageKey = `${EMAIL_SENT_KEY_PREFIX}rejected-${orderId}`;
  if (typeof window !== "undefined" && window.localStorage.getItem(storageKey) === "true") {
    console.log(`[Order Email] Rejection email already sent for order ${orderNumber}.`);
    return { success: true, duplicate: true };
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const { data, error } = await supabase.functions.invoke("send-order-email", {
      body: { orderId, orderNumber, action: "rejected", rejectionReason },
      headers,
    });

    if (error) {
      console.warn("[Order Rejection Email Notice] Edge function error:", error.message);
      return { success: false, error: error.message };
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, "true");
    }

    console.log(`[Order Email] Rejection email triggered for #${orderNumber}:`, data);
    return { success: true, duplicate: data?.duplicate ?? false };
  } catch (err: any) {
    console.warn("[Order Rejection Email Notice] Exception:", err);
    return { success: false, error: err?.message || "Failed to invoke rejection email trigger" };
  }
}
