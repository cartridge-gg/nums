// Anti-cache service worker
// Sole purpose: clear all existing caches and ensure every request hits the network.
// This is NOT a PWA service worker — it caches nothing.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
