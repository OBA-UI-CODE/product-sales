/*
  JOHTA's service worker. It exists for one job: showing the sales
  reminders (see src/app/api/cron/reminders) when they arrive, and opening
  JOHTA when one is tapped.

  Deliberately NO fetch handler and no caching. Serving pages from a cache
  is how a stale version of an app gets stuck on people's phones after an
  update; JOHTA always loads fresh from the network, as it did before this
  file existed.
*/

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "JOHTA", {
      body: data.body || "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      /* One notification per kind: a new evening summary replaces
         yesterday's instead of piling up. */
      tag: data.tag || "johta",
      renotify: true,
      data: { url: data.url || "/dashboard" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/dashboard", self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      /* Reuse an open JOHTA window rather than opening another. */
      for (const w of windows) {
        if (w.url.startsWith(self.location.origin) && "focus" in w) {
          return w.navigate(url).then((c) => (c || w).focus());
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
