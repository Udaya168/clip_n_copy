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
    // 2. Invoke Supabase Edge Function `send-order-email`
    // The Supabase JS client automatically passes the current logged-in user's Auth Bearer token in headers.
    const { data, error } = await supabase.functions.invoke("send-order-email", {
      body: { orderId, orderNumber },
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
