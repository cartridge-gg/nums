type TikTokMethod =
  | "page"
  | "track"
  | "identify"
  | "instances"
  | "debug"
  | "on"
  | "off"
  | "once"
  | "ready"
  | "alias"
  | "group"
  | "enableCookie"
  | "disableCookie"
  | "holdConsent"
  | "revokeConsent"
  | "grantConsent";

type TikTokQueue = unknown[] & {
  _i?: Record<string, unknown>;
  _o?: Record<string, unknown>;
  _t?: Record<string, number>;
  _u?: string;
  methods?: TikTokMethod[];
  setAndDefer?: (queue: TikTokQueue, method: TikTokMethod) => void;
  load?: (pixelId: string, options?: Record<string, unknown>) => void;
  page?: () => void;
};

declare global {
  interface Window {
    ttq?: TikTokQueue;
    __numsTikTokPixelId?: string;
  }
}

const TIKTOK_SCRIPT_BASE = "https://analytics.tiktok.com/i18n/pixel/events.js";

export const loadTikTokPixel = (pixelId: string): void => {
  if (typeof window === "undefined" || !pixelId) return;
  if (window.__numsTikTokPixelId === pixelId) {
    window.ttq?.page?.();
    return;
  }

  const ttq = (window.ttq = window.ttq || ([] as unknown as TikTokQueue));
  ttq.methods = [
    "page",
    "track",
    "identify",
    "instances",
    "debug",
    "on",
    "off",
    "once",
    "ready",
    "alias",
    "group",
    "enableCookie",
    "disableCookie",
    "holdConsent",
    "revokeConsent",
    "grantConsent",
  ];
  ttq.setAndDefer = (queue, method) => {
    const deferredQueue = queue as TikTokQueue &
      Record<TikTokMethod, (...args: unknown[]) => void>;
    deferredQueue[method] = (...args: unknown[]) => {
      queue.push([method, ...args]);
    };
  };

  for (const method of ttq.methods) {
    ttq.setAndDefer(ttq, method);
  }

  ttq.load = (id, options) => {
    ttq._i = ttq._i || {};
    ttq._i[id] = [];
    ttq._t = ttq._t || {};
    ttq._t[id] = Date.now();
    ttq._o = ttq._o || {};
    ttq._o[id] = options || {};
    ttq._u = TIKTOK_SCRIPT_BASE;

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = `${TIKTOK_SCRIPT_BASE}?sdkid=${id}&lib=ttq`;

    const firstScript = document.getElementsByTagName("script")[0];
    firstScript.parentNode?.insertBefore(script, firstScript);
  };

  ttq.load(pixelId);
  ttq.page?.();
  window.__numsTikTokPixelId = pixelId;
};
