// Clip N Copy - Admin New Order Web Push Service Worker

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming Web Push notifications
self.addEventListener("push", (event) => {
  let data = {
    title: "🔔 New Order Received",
    body: "A new order has just been placed!",
    orderId: "",
    orderNumber: "",
    totalAmount: 0,
    url: "/admin/orders",
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = {
        ...data,
        ...payload,
      };
      if (payload.orderNumber || payload.orderId) {
        const num = payload.orderNumber || payload.orderId;
        const amt = payload.totalAmount ? ` — ₹${payload.totalAmount}` : "";
        data.title = `🔔 New Order Received #${num}`;
        data.body = `Customer: ${payload.customerName || "Store Customer"}${amt}`;
        data.url = payload.orderId ? `/admin/orders?orderId=${payload.orderId}` : "/admin/orders";
      }
    } catch (e) {
      data.body = event.data.text() || data.body;
    }
  }

  const options = {
    body: data.body,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: data.orderId ? `order-${data.orderId}` : "new-order",
    renotify: true,
    data: {
      url: data.url,
      orderId: data.orderId,
    },
    vibrate: [200, 100, 200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle notification click -> Focus or open Admin Portal
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/admin/orders";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client && client.url.includes("/admin")) {
            if ("navigate" in client) {
              client.navigate(targetUrl);
            }
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
