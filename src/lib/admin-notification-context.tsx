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
  customerEmail?: string;
  address?: string;
  paymentMethod?: string;
  fulfillmentType?: string;
  deliveryMethod?: string;
  totalAmount: number;
  itemsCount: number;
  createdAt: string;
  acknowledged: boolean;
  read: boolean;
  requestCategory?: "product" | "printing" | "customization";
  printType?: string;
  bwPages?: string;
  colorPages?: string;
  paper?: string;
  finishing?: string;
  customizationType?: string;
  customizationTitle?: string;
  quantity?: number;
  fileName?: string;
  fileUrl?: string;
  filePath?: string;
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

function mapPrintRequestToNotif(payload: any): AdminOrderNotification {
  const reqId = String(payload.id);
  const printTypeStr = String(payload.print_type || "");

  if (printTypeStr.startsWith("Customization:") || printTypeStr.includes("Customization")) {
    const custType = printTypeStr.replace(/^Customization:\s*/i, "").trim() || payload.customization_type || "Brochure";
    return {
      id: `notif-custom-${reqId}`,
      orderId: reqId,
      orderNumber: `CUSTOM-${reqId.slice(0, 8).toUpperCase()}`,
      customerName: String(payload.customer_name || "Customer"),
      customerPhone: payload.customer_phone,
      customerEmail: payload.customer_email,
      totalAmount: 0,
      itemsCount: Number(payload.copies || payload.quantity || 1),
      createdAt: payload.created_at || new Date().toISOString(),
      acknowledged: false,
      read: false,
      requestCategory: "customization",
      customizationType: custType,
      customizationTitle: payload.paper || payload.title || "Customization Request",
      quantity: Number(payload.copies || payload.quantity || 1),
      fileName: payload.file_name,
      fileUrl: payload.file_url,
      filePath: payload.file_path,
    };
  }

  return {
    id: `notif-print-${reqId}`,
    orderId: reqId,
    orderNumber: `PRINT-${reqId.slice(0, 8).toUpperCase()}`,
    customerName: String(payload.customer_name || "Customer"),
    customerPhone: payload.customer_phone,
    customerEmail: payload.customer_email,
    totalAmount: Number(payload.total_amount || 0),
    itemsCount: Number(payload.copies || 1),
    createdAt: payload.created_at || new Date().toISOString(),
    acknowledged: false,
    read: false,
    requestCategory: "printing",
    printType: payload.print_type || "B&W",
    paper: payload.paper || "A4",
    finishing: payload.finishing || "None",
    fileName: payload.file_name,
    fileUrl: payload.file_url,
    filePath: payload.file_path,
  };
}

function mapCustomizationRequestToNotif(payload: any): AdminOrderNotification {
  const reqId = String(payload.id);
  return {
    id: `notif-custom-${reqId}`,
    orderId: reqId,
    orderNumber: `CUSTOM-${reqId.slice(0, 8).toUpperCase()}`,
    customerName: String(payload.customer_name || "Customer"),
    customerPhone: payload.customer_phone,
    customerEmail: payload.customer_email,
    totalAmount: 0,
    itemsCount: Number(payload.quantity || 1),
    createdAt: payload.created_at || new Date().toISOString(),
    acknowledged: false,
    read: false,
    requestCategory: "customization",
    customizationType: payload.customization_type || "Brochure",
    customizationTitle: payload.title || "Custom Request",
    quantity: Number(payload.quantity || 1),
    fileName: payload.file_name,
    fileUrl: payload.file_url,
    filePath: payload.file_path,
  };
}

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

  // Test sound helper
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

  const realtimeChannelRef = useRef<any>(null);
  const reconnectTimerRef = useRef<any>(null);

  const soundPlayedIds = useRef<Set<string>>(new Set());

  // Safe audio alert player helper
  const playAdminAlertSound = useCallback((id: string) => {
    console.log(`[ALARM] New notification sound requested: ${id}`);

    if (soundPlayedIds.current.has(id)) {
      console.log(`[ALARM] Duplicate sound ignored: ${id}`);
      return;
    }
    soundPlayedIds.current.add(id);

    try {
      orderAlarm.playAlertSound(id);
    } catch (error) {
      console.warn(`[ALARM] Playback blocked: ${id}`, error);
    }
  }, []);

  // Handle incoming new normal product order payload from Realtime INSERT
  const handleNewOrderReceived = useCallback(
    (orderPayload: any) => {
      const orderId = String(orderPayload.id || orderPayload.order_number || Date.now());
      const orderNumber = String(orderPayload.order_number || orderPayload.orderNumber || orderId);

      console.log(`[ALARM] realtime event received: ${orderId}`);
      console.log(`[REALTIME] New order received: ${orderId}`);

      if (notifiedOrderIds.current.has(orderId)) {
        console.log(`[REALTIME] Duplicate ignored: ${orderId}`);
        return;
      }
      notifiedOrderIds.current.add(orderId);

      if (broadcastChannel.current) {
        broadcastChannel.current.postMessage({ type: "NEW_ORDER_ALERT", orderId });
      }

      const totalAmount = Number(orderPayload.total_amount || orderPayload.totalAmount || 0);
      const itemsCount = Number(orderPayload.items_count || orderPayload.itemsCount || 1);
      const customerName = String(orderPayload.customer_name || orderPayload.customerName || "Customer");
      const customerPhone = orderPayload.customer_phone || orderPayload.customerPhone;
      const customerEmail = orderPayload.customer_email || orderPayload.customerEmail;
      const address = orderPayload.address || orderPayload.shipping_address;
      const paymentMethod = orderPayload.payment_method || orderPayload.paymentMethod;
      const fulfillmentType = orderPayload.fulfillment_type || orderPayload.fulfillmentType;
      const deliveryMethod = orderPayload.delivery_method || orderPayload.deliveryMethod;

      const newNotif: AdminOrderNotification = {
        id: `notif-${orderId}`,
        orderId: orderId,
        orderNumber: orderNumber,
        customerName: customerName,
        customerPhone: customerPhone,
        customerEmail: customerEmail,
        address: address,
        paymentMethod: paymentMethod,
        fulfillmentType: fulfillmentType,
        deliveryMethod: deliveryMethod,
        totalAmount: totalAmount,
        itemsCount: itemsCount,
        createdAt: orderPayload.created_at || new Date().toISOString(),
        acknowledged: false,
        read: false,
        requestCategory: "product",
      };

      console.log(`[REALTIME] Notification created: ${orderId}`);
      setNotifications((prev) => [newNotif, ...prev.filter((n) => n.orderId !== orderId)]);

      playAdminAlertSound(orderId);

      if (typeof window !== "undefined" && "Notification" in window) {
        console.log(`[ALARM] Notification permission: ${Notification.permission}`);
        if (Notification.permission === "granted" && document.visibilityState === "hidden") {
          try {
            const nativeNotif = new Notification("🔔 New Order Received!", {
              body: `Order #${orderNumber} from ${customerName} — ${inr(totalAmount)} (${itemsCount} items)`,
              icon: "/favicon.ico",
              tag: `order-${orderId}`,
            });
            console.log(`[ALARM] Browser notification shown: ${orderId}`);

            nativeNotif.onclick = () => {
              window.focus();
              stopAlarm();
            };
          } catch (err) {
            console.warn("[AdminNotif] Native Notification error:", err);
          }
        }
      }
    },
    [playAdminAlertSound, stopAlarm]
  );

  // Handle incoming printing request payload from Realtime INSERT
  const handleNewPrintRequestReceived = useCallback(
    (payload: any) => {
      const requestId = String(payload.id || Date.now());

      console.log(`[ALARM] realtime event received: ${requestId}`);
      console.log(`[REALTIME] New printing request received: ${requestId}`);

      if (notifiedOrderIds.current.has(requestId)) {
        console.log(`[REALTIME] Duplicate ignored: ${requestId}`);
        return;
      }
      notifiedOrderIds.current.add(requestId);

      if (broadcastChannel.current) {
        broadcastChannel.current.postMessage({ type: "NEW_ORDER_ALERT", orderId: requestId });
      }

      const notif = mapPrintRequestToNotif(payload);
      console.log(`[REALTIME] Notification created: ${requestId}`);
      setNotifications((prev) => [notif, ...prev.filter((n) => n.orderId !== requestId)]);

      playAdminAlertSound(requestId);

      if (typeof window !== "undefined" && "Notification" in window) {
        console.log(`[ALARM] Notification permission: ${Notification.permission}`);
        if (Notification.permission === "granted" && document.visibilityState === "hidden") {
          try {
            const nativeNotif = new Notification("🔔 New Printing Order!", {
              body: `Printing Order from ${notif.customerName} — ${notif.paper || "Standard"}`,
              icon: "/favicon.ico",
              tag: `print-${requestId}`,
            });
            console.log(`[ALARM] Browser notification shown: ${requestId}`);

            nativeNotif.onclick = () => {
              window.focus();
              stopAlarm();
            };
          } catch (err) {
            console.warn("[AdminNotif] Native Printing Notification error:", err);
          }
        }
      }
    },
    [playAdminAlertSound, stopAlarm]
  );

  // Handle incoming customization printing request payload from Realtime INSERT
  const handleNewCustomizationRequestReceived = useCallback(
    (payload: any) => {
      const requestId = String(payload.id || Date.now());

      console.log(`[ALARM] realtime event received: ${requestId}`);
      console.log(`[REALTIME] New customization request received: ${requestId}`);

      if (notifiedOrderIds.current.has(requestId)) {
        console.log(`[REALTIME] Duplicate ignored: ${requestId}`);
        return;
      }
      notifiedOrderIds.current.add(requestId);

      if (broadcastChannel.current) {
        broadcastChannel.current.postMessage({ type: "NEW_ORDER_ALERT", orderId: requestId });
      }

      const notif = mapCustomizationRequestToNotif(payload);
      console.log(`[REALTIME] Notification created: ${requestId}`);
      setNotifications((prev) => [notif, ...prev.filter((n) => n.orderId !== requestId)]);

      playAdminAlertSound(requestId);

      if (typeof window !== "undefined" && "Notification" in window) {
        console.log(`[ALARM] Notification permission: ${Notification.permission}`);
        if (Notification.permission === "granted" && document.visibilityState === "hidden") {
          try {
            const nativeNotif = new Notification("🔔 New Customization Request!", {
              body: `Customization (${notif.customizationType}) from ${notif.customerName} — Qty: ${notif.quantity}`,
              icon: "/favicon.ico",
              tag: `custom-${requestId}`,
            });
            console.log(`[ALARM] Browser notification shown: ${requestId}`);

            nativeNotif.onclick = () => {
              window.focus();
              stopAlarm();
            };
          } catch (err) {
            console.warn("[AdminNotif] Native Customization Notification error:", err);
          }
        }
      }
    },
    [playAdminAlertSound, stopAlarm]
  );

  // Refs for handlers to ensure stable closure inside Realtime listener without tearing down subscription
  const handlersRef = useRef({
    handleNewOrderReceived,
    handleNewPrintRequestReceived,
    handleNewCustomizationRequestReceived,
  });

  useEffect(() => {
    handlersRef.current = {
      handleNewOrderReceived,
      handleNewPrintRequestReceived,
      handleNewCustomizationRequestReceived,
    };
  }, [handleNewOrderReceived, handleNewPrintRequestReceived, handleNewCustomizationRequestReceived]);

  // Initial fetch for unhandled pending records on Admin Portal load/refresh
  useEffect(() => {
    if (!user || !isAdmin) return;

    let isMounted = true;
    const loadPendingRecords = async () => {
      try {
        const [ordersRes, printRes] = await Promise.all([
          supabase.from("orders").select("*").in("status", ["pending", "processing"]).order("created_at", { ascending: false }).limit(20),
          supabase.from("print_requests").select("*").eq("status", "pending").order("created_at", { ascending: false }).limit(20),
        ]);

        if (!isMounted) return;

        const loadedNotifs: AdminOrderNotification[] = [];

        if (ordersRes.data) {
          ordersRes.data.forEach((orderPayload: any) => {
            const orderId = String(orderPayload.id);
            const statusLower = String(orderPayload.status || "").toLowerCase();
            if (statusLower === "accepted" || statusLower === "confirmed" || statusLower === "shipped" || statusLower === "delivered" || statusLower === "rejected" || statusLower === "cancelled") {
              console.log(`[ADMIN NOTIFICATION] Already processed - ignored: ${orderId}`);
              return;
            }

            loadedNotifs.push({
              id: `notif-${orderId}`,
              orderId: orderId,
              orderNumber: String(orderPayload.order_number || orderPayload.orderNumber || orderId),
              customerName: String(orderPayload.customer_name || "Customer"),
              customerPhone: orderPayload.customer_phone,
              customerEmail: orderPayload.customer_email,
              address: orderPayload.address || orderPayload.shipping_address,
              paymentMethod: orderPayload.payment_method,
              fulfillmentType: orderPayload.fulfillment_type,
              deliveryMethod: orderPayload.delivery_method,
              totalAmount: Number(orderPayload.total_amount || 0),
              itemsCount: Number(orderPayload.items_count || 1),
              createdAt: orderPayload.created_at || new Date().toISOString(),
              acknowledged: false,
              read: false,
              requestCategory: "product",
            });
          });
        }

        if (printRes.data) {
          printRes.data.forEach((payload: any) => {
            const reqId = String(payload.id);
            const statusLower = String(payload.status || "").toLowerCase();
            if (statusLower === "accepted" || statusLower === "confirmed" || statusLower === "rejected" || statusLower === "dismissed") {
              console.log(`[ADMIN NOTIFICATION] Already processed - ignored: ${reqId}`);
              return;
            }
            loadedNotifs.push(mapPrintRequestToNotif(payload));
          });
        }

        if (loadedNotifs.length > 0 && isMounted) {
          console.log(`[ADMIN NOTIFICATION] Loaded ${loadedNotifs.length} unhandled pending records on refresh`);
          setNotifications((prev) => {
            const existingIds = new Set(prev.map((n) => n.orderId));
            const newNotifs = loadedNotifs.filter((n) => !existingIds.has(n.orderId));
            return [...newNotifs, ...prev];
          });
        }
      } catch (e) {
        console.warn("[AdminNotif] Error fetching pending records", e);
      }
    };

    loadPendingRecords();
    return () => {
      isMounted = false;
    };
  }, [user, isAdmin]);

  // Two independent stable Supabase Realtime channel subscriptions created ONCE on mount
  useEffect(() => {
    const userId = user?.id;
    if (!userId || !isAdmin) return;

    let isMounted = true;
    let ordersRetryCount = 0;
    let printRetryCount = 0;
    let ordersReconnectTimer: any = null;
    let printReconnectTimer: any = null;

    const ordersChannelRef = { current: null as any };
    const printChannelRef = { current: null as any };

    const setupOrdersChannel = () => {
      if (ordersChannelRef.current) {
        try {
          supabase.removeChannel(ordersChannelRef.current);
        } catch (_) {}
        ordersChannelRef.current = null;
      }

      try {
        console.log("[REALTIME ORDERS] Connecting...");

        const channel = supabase
          .channel("admin-orders-realtime")
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "orders",
            },
            (payload: any) => {
              if (payload && payload.new) {
                console.log(`[REALTIME ORDERS] INSERT received: ${payload.new.id}`);
                handlersRef.current.handleNewOrderReceived(payload.new);
              }
            }
          )
          .subscribe((status: string, err?: any) => {
            if (!isMounted) return;

            if (status === "SUBSCRIBED") {
              console.log("[REALTIME ORDERS] SUBSCRIBED");
              ordersRetryCount = 0;
            } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
              if (err) {
                console.warn("[REALTIME ORDERS] Channel error details:", err);
              }
              const delays = [1000, 2000, 5000, 10000];
              const backoffMs = delays[Math.min(ordersRetryCount, delays.length - 1)] ?? 10000;
              ordersRetryCount++;

              if (!ordersReconnectTimer && isMounted) {
                console.log(`[REALTIME ORDERS] Scheduling reconnect in ${backoffMs}ms`);
                ordersReconnectTimer = setTimeout(() => {
                  ordersReconnectTimer = null;
                  if (isMounted) {
                    setupOrdersChannel();
                  }
                }, backoffMs);
              }
            }
          });

        ordersChannelRef.current = channel;
      } catch (err) {
        console.warn("[REALTIME ORDERS] Subscription exception:", err);
      }
    };

    const setupPrintChannel = () => {
      if (printChannelRef.current) {
        try {
          supabase.removeChannel(printChannelRef.current);
        } catch (_) {}
        printChannelRef.current = null;
      }

      try {
        console.log("[REALTIME PRINT] Connecting...");

        const channel = supabase
          .channel("admin-print-realtime")
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "print_requests",
            },
            (payload: any) => {
              if (payload && payload.new) {
                console.log(`[REALTIME PRINT] INSERT received: ${payload.new.id}`);
                handlersRef.current.handleNewPrintRequestReceived(payload.new);
              }
            }
          )
          .subscribe((status: string, err?: any) => {
            if (!isMounted) return;

            if (status === "SUBSCRIBED") {
              console.log("[REALTIME PRINT] SUBSCRIBED");
              printRetryCount = 0;
            } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
              if (err) {
                console.warn("[REALTIME PRINT] Channel error details:", err);
              }
              const delays = [1000, 2000, 5000, 10000];
              const backoffMs = delays[Math.min(printRetryCount, delays.length - 1)] ?? 10000;
              printRetryCount++;

              if (!printReconnectTimer && isMounted) {
                console.log(`[REALTIME PRINT] Scheduling reconnect in ${backoffMs}ms`);
                printReconnectTimer = setTimeout(() => {
                  printReconnectTimer = null;
                  if (isMounted) {
                    setupPrintChannel();
                  }
                }, backoffMs);
              }
            }
          });

        printChannelRef.current = channel;
      } catch (err) {
        console.warn("[REALTIME PRINT] Subscription exception:", err);
      }
    };

    setupOrdersChannel();
    setupPrintChannel();

    const handleStorageChange = (e: StorageEvent) => {
      if ((e.key === "cnc-orders-v1" || e.key === "cnc_orders_v1") && e.newValue) {
        try {
          const list = JSON.parse(e.newValue);
          if (Array.isArray(list) && list.length > 0) {
            const latest = list[0];
            if (latest && latest.id) {
              handlersRef.current.handleNewOrderReceived({
                id: latest.id,
                order_number: latest.orderNumber,
                customer_name: latest.customerName,
                customer_phone: latest.customerPhone,
                customer_email: latest.customerEmail,
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
      isMounted = false;
      window.removeEventListener("storage", handleStorageChange);
      if (ordersReconnectTimer) {
        clearTimeout(ordersReconnectTimer);
        ordersReconnectTimer = null;
      }
      if (printReconnectTimer) {
        clearTimeout(printReconnectTimer);
        printReconnectTimer = null;
      }
      if (ordersChannelRef.current) {
        console.log("[REALTIME ORDERS] Cleaning up channel on unmount");
        supabase.removeChannel(ordersChannelRef.current).catch(() => {});
        ordersChannelRef.current = null;
      }
      if (printChannelRef.current) {
        console.log("[REALTIME PRINT] Cleaning up channel on unmount");
        supabase.removeChannel(printChannelRef.current).catch(() => {});
        printChannelRef.current = null;
      }
      if (soundTimerRef.current) {
        clearTimeout(soundTimerRef.current);
      }
      orderAlarm.stop();
    };
  }, [user?.id, isAdmin]);

  const acknowledgeNotification = useCallback(
    (id: string) => {
      stopAlarm();
      setNotifications((prev) => {
        const updated = prev.map((n) => (n.id === id || n.orderId === id ? { ...n, acknowledged: true, read: true } : n));
        return updated;
      });
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
