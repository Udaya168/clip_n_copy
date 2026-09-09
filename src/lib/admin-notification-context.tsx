import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "./supabase";
import { useAuth } from "./auth-store";
import { orderAlarm } from "./audio-alarm";
import { inr } from "./shop-store";
import { toast } from "sonner";
import {
  subscribeAdminPush,
  checkExistingPushSubscription,
} from "./push-subscription-service";

export interface AdminOrderNotification {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  totalAmount: number;
  itemsCount: number;
  createdAt: string;
  acknowledged: boolean;
  read: boolean;
}

interface AdminNotificationContextType {
  notifications: AdminOrderNotification[];
  unreadCount: number;
  permissionStatus: NotificationPermission;
  pushSubscribed: boolean;
  requestNotificationPermission: () => Promise<void>;
  enablePushNotifications: () => Promise<{ success: boolean; error?: string }>;
  acknowledgeNotification: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  activeAlarm: boolean;
  stopAlarm: () => void;
  testSound: () => void;
  latestNotification: AdminOrderNotification | null;
}

const AdminNotificationContext = createContext<AdminNotificationContextType | undefined>(undefined);

export function AdminNotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  const [notifications, setNotifications] = useState<AdminOrderNotification[]>([]);
  const [activeAlarm, setActiveAlarm] = useState<boolean>(false);
  const [pushSubscribed, setPushSubscribed] = useState<boolean>(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "default";
  });

  const sessionStartTime = useRef<number>(Date.now());
  const notifiedOrderIds = useRef<Set<string>>(new Set());
  const broadcastChannel = useRef<BroadcastChannel | null>(null);
  const soundTimerRef = useRef<any>(null);

  // Check push subscription on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      checkExistingPushSubscription().then((res) => setPushSubscribed(res));
    }
  }, []);

  // Multi-tab BroadcastChannel initialization
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
      return;
    }
    const bc = new BroadcastChannel("cnc_order_alerts");
    broadcastChannel.current = bc;

    bc.onmessage = (event) => {
      if (event.data?.type === "MUTE_ALARM") {
        orderAlarm.stop();
        if (soundTimerRef.current) clearTimeout(soundTimerRef.current);
        setActiveAlarm(false);
      } else if (event.data?.type === "NEW_ORDER_ALERT" && event.data?.orderId) {
        notifiedOrderIds.current.add(event.data.orderId);
      }
    };

    return () => {
      bc.close();
    };
  }, []);

  // Stop alarm helper
  const stopAlarm = useCallback(() => {
    orderAlarm.stop();
    if (soundTimerRef.current) {
      clearTimeout(soundTimerRef.current);
      soundTimerRef.current = null;
    }
    setActiveAlarm(false);
    if (broadcastChannel.current) {
      broadcastChannel.current.postMessage({ type: "MUTE_ALARM" });
    }
  }, []);

  // Test sound helper (plays for max 2.5s and unlocks AudioContext)
  const testSound = useCallback(() => {
    orderAlarm.unlock();
    setActiveAlarm(true);
    orderAlarm.start(2500, () => {
      setActiveAlarm(false);
    });
  }, []);

  // Enable push notifications
  const enablePushNotifications = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "User is not logged in." };
    orderAlarm.unlock();
    const result = await subscribeAdminPush(user.id);
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermissionStatus(Notification.permission);
    }
    if (result.success) {
      setPushSubscribed(true);
    }
    return result;
  }, [user]);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async (): Promise<void> => {
    if (!user) return;
    await enablePushNotifications();
  }, [user, enablePushNotifications]);

  // Handle incoming new order payload
  const handleNewOrderReceived = useCallback(
    (orderPayload: any) => {
      const orderId = String(orderPayload.id || orderPayload.order_number || Date.now());
      const orderNumber = String(orderPayload.order_number || orderPayload.orderNumber || orderId);

      // 1. Deduplication check - ONLY process genuinely NEW orders once
      if (notifiedOrderIds.current.has(orderId)) {
        return;
      }
      notifiedOrderIds.current.add(orderId);

      // Notify other tabs to record this order ID
      if (broadcastChannel.current) {
        broadcastChannel.current.postMessage({ type: "NEW_ORDER_ALERT", orderId });
      }

      // 2. Ignore orders created before this session started (10s buffer)
      if (orderPayload.created_at) {
        const orderTime = new Date(orderPayload.created_at).getTime();
        if (!isNaN(orderTime) && orderTime < sessionStartTime.current - 10000) {
          return;
        }
      }

      const totalAmount = Number(orderPayload.total_amount || orderPayload.totalAmount || 0);
      const itemsCount = Number(orderPayload.items_count || orderPayload.itemsCount || 1);
      const customerName = String(orderPayload.customer_name || orderPayload.customerName || "Customer");
      const customerPhone = orderPayload.customer_phone || orderPayload.customerPhone;

      const newNotif: AdminOrderNotification = {
        id: `notif-${orderId}-${Date.now()}`,
        orderId: orderId,
        orderNumber: orderNumber,
        customerName: customerName,
        customerPhone: customerPhone,
        totalAmount: totalAmount,
        itemsCount: itemsCount,
        createdAt: orderPayload.created_at || new Date().toISOString(),
        acknowledged: false,
        read: false,
      };

      // Add to notifications list
      setNotifications((prev) => [newNotif, ...prev.filter((n) => n.orderId !== orderId)]);

      // 3. Start 10-SECOND AUDIO ALARM SOUND
      orderAlarm.unlock();
      setActiveAlarm(true);

      // Clear any previous sound timer
      if (soundTimerRef.current) {
        clearTimeout(soundTimerRef.current);
      }

      // Start alarm sound for maximum 10 seconds
      orderAlarm.start(10000, () => {
        setActiveAlarm(false);
      });

      // Backup 10-second timer to ensure activeAlarm state resets
      soundTimerRef.current = setTimeout(() => {
        orderAlarm.stop();
        setActiveAlarm(false);
      }, 10000);

      // 4. Trigger In-App Toast Popup with full order details
      toast.custom(
        (_t) => (
          <div className="w-full max-w-sm rounded-2xl border border-primary/40 bg-card p-4 shadow-xl ring-1 ring-primary/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-display text-xs font-black uppercase text-primary tracking-wider">
                🔔 New Order Received!
              </span>
              <span className="text-[10px] font-bold text-muted-foreground">Just Now</span>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Order #{orderNumber}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {customerName} {customerPhone ? `(${customerPhone})` : ""}
              </p>
              <p className="text-xs font-extrabold text-foreground mt-1">
                {inr(totalAmount)} · {itemsCount} {itemsCount === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
        ),
        { duration: 12000 }
      );

      // 5. Trigger Native Browser Notification if permission granted
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        try {
          const nativeNotif = new Notification("🔔 New Order Received!", {
            body: `Order #${orderNumber} from ${customerName} — ${inr(totalAmount)} (${itemsCount} items)`,
            icon: "/favicon.ico",
            tag: `order-${orderId}`,
          });

          nativeNotif.onclick = () => {
            window.focus();
            stopAlarm();
          };
        } catch (err) {
          console.warn("[AdminNotif] Native Notification error:", err);
        }
      }
    },
    [stopAlarm]
  );

  // Supabase Realtime channel subscription for `orders` INSERT events
  useEffect(() => {
    if (!user || !isAdmin) return;

    let channel: any = null;
    sessionStartTime.current = Date.now();

    try {
      channel = supabase
        .channel("admin-realtime-orders-subscription")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "orders",
          },
          (payload: any) => {
            if (payload && payload.new) {
              handleNewOrderReceived(payload.new);
            }
          }
        )
        .subscribe((status: string) => {
          if (status === "SUBSCRIBED") {
            console.log("[AdminRealtime] Subscribed to new orders channel");
          }
        });
    } catch (err) {
      console.warn("[AdminRealtime] Realtime subscription exception:", err);
    }

    // LocalStorage event listener fallback for orders placed in same browser session
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cnc_orders_v1" && e.newValue) {
        try {
          const list = JSON.parse(e.newValue);
          if (Array.isArray(list) && list.length > 0) {
            const latest = list[0];
            if (latest) {
              handleNewOrderReceived({
                id: latest.id,
                order_number: latest.orderNumber,
                customer_name: latest.customerName,
                customer_phone: latest.customerPhone,
                total_amount: latest.totalAmount,
                items_count: latest.itemsCount,
                created_at: new Date().toISOString(),
              });
            }
          }
        } catch (err) {
          // ignore
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      if (channel) {
        supabase.removeChannel(channel).catch(() => {});
      }
      if (soundTimerRef.current) {
        clearTimeout(soundTimerRef.current);
      }
      orderAlarm.stop();
    };
  }, [user, isAdmin, handleNewOrderReceived]);

  const acknowledgeNotification = useCallback(
    (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id || n.orderId === id ? { ...n, acknowledged: true, read: true } : n))
      );
      // If no unacknowledged notifications remain, stop alarm
      setTimeout(() => {
        setNotifications((current) => {
          const hasUnacknowledged = current.some((n) => !n.acknowledged);
          if (!hasUnacknowledged) {
            stopAlarm();
          }
          return current;
        });
      }, 0);
    },
    [stopAlarm]
  );

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true, acknowledged: true })));
    stopAlarm();
  }, [stopAlarm]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    stopAlarm();
  }, [stopAlarm]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const latestNotification = notifications[0] ?? null;

  return (
    <AdminNotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        permissionStatus,
        pushSubscribed,
        requestNotificationPermission,
        enablePushNotifications,
        acknowledgeNotification,
        markAllAsRead,
        clearNotifications,
        activeAlarm,
        stopAlarm,
        testSound,
        latestNotification,
      }}
    >
      {children}
    </AdminNotificationContext.Provider>
  );
}

export function useAdminNotifications() {
  const ctx = useContext(AdminNotificationContext);
  if (!ctx) {
    throw new Error("useAdminNotifications must be used inside AdminNotificationProvider");
  }
  return ctx;
}
