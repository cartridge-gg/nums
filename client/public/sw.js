const APP_PREFIX = "nums";
const VERSION = new URL(self.location.href).searchParams.get("v") || "dev";
const DOCUMENT_CACHE = `${APP_PREFIX}-document-${VERSION}`;
const STATIC_CACHE = `${APP_PREFIX}-static-${VERSION}`;
const CACHE_PREFIX = `${APP_PREFIX}-`;
const APP_SHELL_PATH = "/";
const STATIC_PATH_PREFIXES = ["/assets/", "/fontawesome/"];
const STATIC_EXTENSIONS = [
  ".js",
  ".css",
  ".ico",
  ".png",
  ".jpg",
  ".jpeg",
  ".svg",
  ".gif",
  ".webp",
  ".avif",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".json",
];

const isHttpRequest = (url) => url.protocol === "http:" || url.protocol === "https:";
const isSameOrigin = (url) => url.origin === self.location.origin;
const isStaticAsset = (url) => {
  return (
    STATIC_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix)) ||
    STATIC_EXTENSIONS.some((extension) => url.pathname.endsWith(extension))
  );
};

const shouldBypass = (request, url) => {
  if (request.method !== "GET") return true;
  if (!isHttpRequest(url)) return true;
  if (!isSameOrigin(url)) return true;
  if (url.pathname === "/sw.js") return true;
  if (url.pathname.startsWith("/api/")) return true;
  if (url.pathname.startsWith("/_vercel/")) return true;
  return false;
};

const putIfOk = async (cacheName, request, response) => {
  if (!response || !response.ok) return response;
  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
  return response;
};

const cacheFirst = async (request) => {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);

  const networkFetch = fetch(request)
    .then((response) => putIfOk(STATIC_CACHE, request, response))
    .catch(() => undefined);

  if (cached) {
    return cached;
  }

  const response = await networkFetch;
  if (response) {
    return response;
  }

  return Response.error();
};

const networkFirstDocument = async (request) => {
  const cache = await caches.open(DOCUMENT_CACHE);

  try {
    const response = await fetch(request);
    await putIfOk(DOCUMENT_CACHE, request, response);
    if (request.url !== self.location.origin + APP_SHELL_PATH) {
      await putIfOk(
        DOCUMENT_CACHE,
        new Request(APP_SHELL_PATH, { method: "GET" }),
        response,
      );
    }
    return response;
  } catch {
    const cached = (await cache.match(request)) || (await cache.match(APP_SHELL_PATH));
    return cached || Response.error();
  }
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(DOCUMENT_CACHE)
      .then((cache) => cache.add(new Request(APP_SHELL_PATH, { cache: "reload" })))
      .catch(() => undefined),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheKeys = await caches.keys();
      await Promise.all(
        cacheKeys
          .filter(
            (cacheKey) =>
              cacheKey.startsWith(CACHE_PREFIX) &&
              cacheKey !== DOCUMENT_CACHE &&
              cacheKey !== STATIC_CACHE,
          )
          .map((cacheKey) => caches.delete(cacheKey)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (shouldBypass(request, url)) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstDocument(request));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
  }
});
