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

  // Handle incoming new normal product order payload
  const handleNewOrderReceived = useCallback(
    (orderPayload: any) => {
      const orderId = String(orderPayload.id || orderPayload.order_number || Date.now());
      const orderNumber = String(orderPayload.order_number || orderPayload.orderNumber || orderId);

      if (notifiedOrderIds.current.has(orderId)) {
        return;
      }
      notifiedOrderIds.current.add(orderId);

      if (broadcastChannel.current) {
        broadcastChannel.current.postMessage({ type: "NEW_ORDER_ALERT", orderId });
      }

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
      const customerEmail = orderPayload.customer_email || orderPayload.customerEmail;
      const address = orderPayload.address || orderPayload.shipping_address;
      const paymentMethod = orderPayload.payment_method || orderPayload.paymentMethod;
      const fulfillmentType = orderPayload.fulfillment_type || orderPayload.fulfillmentType;
      const deliveryMethod = orderPayload.delivery_method || orderPayload.deliveryMethod;

      const newNotif: AdminOrderNotification = {
        id: `notif-${orderId}-${Date.now()}`,
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

      setNotifications((prev) => [newNotif, ...prev.filter((n) => n.orderId !== orderId)]);

      orderAlarm.unlock();
      setActiveAlarm(true);

      if (soundTimerRef.current) {
        clearTimeout(soundTimerRef.current);
        soundTimerRef.current = null;
      }

      orderAlarm.start(0, () => {
        setActiveAlarm(false);
      });

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

  // Handle incoming printing request payload
  const handleNewPrintRequestReceived = useCallback(
    (payload: any) => {
      const requestId = String(payload.id || Date.now());

      if (notifiedOrderIds.current.has(requestId)) {
        return;
      }
      notifiedOrderIds.current.add(requestId);

      if (broadcastChannel.current) {
        broadcastChannel.current.postMessage({ type: "NEW_ORDER_ALERT", orderId: requestId });
      }

      if (payload.created_at) {
        const orderTime = new Date(payload.created_at).getTime();
        if (!isNaN(orderTime) && orderTime < sessionStartTime.current - 10000) {
          return;
        }
      }

      const notif = mapPrintRequestToNotif(payload);
      setNotifications((prev) => [notif, ...prev.filter((n) => n.orderId !== requestId)]);

      orderAlarm.unlock();
      setActiveAlarm(true);

      if (soundTimerRef.current) {
        clearTimeout(soundTimerRef.current);
        soundTimerRef.current = null;
      }

      orderAlarm.start(0, () => {
        setActiveAlarm(false);
      });

      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        try {
          const nativeNotif = new Notification("🔔 New Printing Order!", {
            body: `Printing Order from ${notif.customerName} — ${notif.paper || "Standard"}`,
            icon: "/favicon.ico",
            tag: `print-${requestId}`,
          });

          nativeNotif.onclick = () => {
            window.focus();
            stopAlarm();
          };
        } catch (err) {
          console.warn("[AdminNotif] Native Printing Notification error:", err);
        }
      }
    },
    [stopAlarm]
  );

  // Handle incoming customization printing request payload
  const handleNewCustomizationRequestReceived = useCallback(
    (payload: any) => {
      const requestId = String(payload.id || Date.now());

      if (notifiedOrderIds.current.has(requestId)) {
        return;
      }
      notifiedOrderIds.current.add(requestId);

      if (broadcastChannel.current) {
        broadcastChannel.current.postMessage({ type: "NEW_ORDER_ALERT", orderId: requestId });
      }

      if (payload.created_at) {
        const orderTime = new Date(payload.created_at).getTime();
        if (!isNaN(orderTime) && orderTime < sessionStartTime.current - 10000) {
          return;
        }
      }

      const notif = mapCustomizationRequestToNotif(payload);
      setNotifications((prev) => [notif, ...prev.filter((n) => n.orderId !== requestId)]);

      orderAlarm.unlock();
      setActiveAlarm(true);

      if (soundTimerRef.current) {
        clearTimeout(soundTimerRef.current);
        soundTimerRef.current = null;
      }

      orderAlarm.start(0, () => {
        setActiveAlarm(false);
      });

      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        try {
          const nativeNotif = new Notification("🔔 New Customization Request!", {
            body: `Customization (${notif.customizationType}) from ${notif.customerName} — Qty: ${notif.quantity}`,
            icon: "/favicon.ico",
            tag: `custom-${requestId}`,
          });

          nativeNotif.onclick = () => {
            window.focus();
            stopAlarm();
          };
        } catch (err) {
          console.warn("[AdminNotif] Native Customization Notification error:", err);
        }
      }
    },
    [stopAlarm]
  );

  // Initial fetch for pending orders and requests for persistence
  useEffect(() => {
    if (!user || !isAdmin) return;

    let isMounted = true;
    const loadPendingRecords = async () => {
      try {
        const [ordersRes, printRes, customRes] = await Promise.all([
          supabase.from("orders").select("*").eq("status", "pending").order("created_at", { ascending: false }).limit(10),
          supabase.from("print_requests").select("*").eq("status", "pending").order("created_at", { ascending: false }).limit(10),
          supabase.from("customization_requests").select("*").eq("status", "pending").order("created_at", { ascending: false }).limit(10),
        ]);

        if (!isMounted) return;

        const loadedNotifs: AdminOrderNotification[] = [];

        if (ordersRes.data) {
          ordersRes.data.forEach((orderPayload: any) => {
            const orderId = String(orderPayload.id);
            notifiedOrderIds.current.add(orderId);
            loadedNotifs.push({
              id: `notif-${orderId}-${Date.now()}`,
              orderId: orderId,
              orderNumber: String(orderPayload.order_number || orderId),
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
            notifiedOrderIds.current.add(reqId);
            loadedNotifs.push(mapPrintRequestToNotif(payload));
          });
        }

        if (customRes.data) {
          customRes.data.forEach((payload: any) => {
            const reqId = String(payload.id);
            notifiedOrderIds.current.add(reqId);
            loadedNotifs.push(mapCustomizationRequestToNotif(payload));
          });
        }

        if (loadedNotifs.length > 0 && isMounted) {
          setNotifications((prev) => {
            const existingIds = new Set(prev.map((n) => n.orderId));
            const newNotifs = loadedNotifs.filter((n) => !existingIds.has(n.orderId));
            if (newNotifs.length > 0) {
              orderAlarm.unlock();
              setActiveAlarm(true);
              orderAlarm.start(0, () => setActiveAlarm(false));
              return [...newNotifs, ...prev];
            }
            return prev;
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

  // Supabase Realtime channel subscription for `orders`, `print_requests`, & `customization_requests`
  useEffect(() => {
    if (!user || !isAdmin) return;

    let channel: any = null;
    sessionStartTime.current = Date.now();

    try {
      channel = supabase
        .channel("admin-realtime-all-requests-subscription")
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
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "print_requests",
          },
          (payload: any) => {
            if (payload && payload.new) {
              handleNewPrintRequestReceived(payload.new);
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "customization_requests",
          },
          (payload: any) => {
            if (payload && payload.new) {
              handleNewCustomizationRequestReceived(payload.new);
            }
          }
        )
        .subscribe((status: string) => {
          if (status === "SUBSCRIBED") {
            console.log("[AdminRealtime] Subscribed to orders, print_requests, & customization_requests");
          }
        });
    } catch (err) {
      console.warn("[AdminRealtime] Realtime subscription exception:", err);
    }

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
  }, [user, isAdmin, handleNewOrderReceived, handleNewPrintRequestReceived, handleNewCustomizationRequestReceived]);

  const acknowledgeNotification = useCallback(
    (id: string) => {
      setNotifications((prev) => {
        const updated = prev.map((n) => (n.id === id || n.orderId === id ? { ...n, acknowledged: true, read: true } : n));
        const pending = updated.filter((n) => !n.acknowledged);
        if (pending.length === 0) {
          stopAlarm();
        }
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
