import { supabase } from "./supabase";

// Standard VAPID Public Key for development / browser push initialization
// Can be customized via import.meta.env["VITE_VAPID_PUBLIC_KEY"]
export const DEFAULT_VAPID_PUBLIC_KEY =
  (import.meta.env as Record<string, string | undefined>)["VITE_VAPID_PUBLIC_KEY"] ||
  "BEl62iUYgUivxIkv69yViEuiBIa-m9GYv5v-g6H-u7v6x9-0x6v0v6v0v6v0v6v0v6v0v6v0v6v0v6v0v6v0v6";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null;
  try {
    const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    await navigator.serviceWorker.ready;
    return registration;
  } catch (err) {
    console.warn("[Push] Service Worker registration failed:", err);
    return null;
  }
}

export async function subscribeAdminPush(userId: string): Promise<{ success: boolean; error?: string }> {
  if (!isPushSupported()) {
    return { success: false, error: "Push notifications are not supported in this browser." };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { success: false, error: "Notification permission was denied by the user." };
    }

    const registration = await registerServiceWorker();
    if (!registration) {
      return { success: false, error: "Could not register service worker." };
    }

    // Check if existing subscription exists
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(DEFAULT_VAPID_PUBLIC_KEY);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as unknown as BufferSource,
      });
    }

    if (!subscription) {
      return { success: false, error: "Push subscription creation failed." };
    }

    const subJson = subscription.toJSON();

    // Store push subscription in Supabase table `push_subscriptions`
    const { error: dbError } = await supabase.from("push_subscriptions").upsert(
      {
        admin_user_id: userId,
        endpoint: subscription.endpoint,
        subscription: subJson,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" }
    );

    if (dbError) {
      console.warn("[Push] Failed to save subscription in Supabase:", dbError.message);
    }

    return { success: true };
  } catch (err: any) {
    console.error("[Push] Error during subscription:", err);
    return { success: false, error: err?.message || "Failed to enable push notifications." };
  }
}

export async function checkExistingPushSubscription(): Promise<boolean> {
  if (!isPushSupported()) return false;
  try {
    const registration = await navigator.serviceWorker.getRegistration("/sw.js");
    if (!registration) return false;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch (err) {
    return false;
  }
}
