// connection-care service worker.
// Minimal handler for push events. Click forwards to /today.
// Phase 1 ships this even though the server-side push sender is not yet
// wired — registering the worker is what enables "add to home screen"
// and gives us a place to receive push when Phase 2 turns it on.

self.addEventListener("push", (event) => {
  let payload = { title: "오늘의 한 가지", body: "잠깐 들여다볼까요?" };
  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch {
      payload.body = event.data.text();
    }
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: "/today" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "/today";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.endsWith(target) && "focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(target);
        }
        return undefined;
      }),
  );
});
