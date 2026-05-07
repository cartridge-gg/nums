type MetaPixelCommand = "init" | "track" | "trackCustom" | "consent";

type MetaPixelQueue = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  loaded: boolean;
  version: string;
  push: MetaPixelQueue;
};

declare global {
  interface Window {
    fbq?: MetaPixelQueue;
    _fbq?: MetaPixelQueue;
    __numsMetaPixelId?: string;
  }
}

const META_SCRIPT_SRC = "https://connect.facebook.net/en_US/fbevents.js";
export const NUMS_META_PIXEL_ID = "1470539818141286";

const createQueue = (): MetaPixelQueue => {
  const fbq = ((...args: unknown[]) => {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
      return;
    }
    fbq.queue.push(args);
  }) as MetaPixelQueue;

  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.push = fbq;
  return fbq;
};

export const loadMetaPixel = (pixelId: string): void => {
  if (typeof window === "undefined" || !pixelId) return;
  if (window.__numsMetaPixelId === pixelId) {
    window.fbq?.("track", "PageView");
    return;
  }

  const fbq = (window.fbq = window.fbq || createQueue());
  window._fbq = window._fbq || fbq;

  if (!document.querySelector(`script[src="${META_SCRIPT_SRC}"]`)) {
    const script = document.createElement("script");
    script.async = true;
    script.src = META_SCRIPT_SRC;

    const firstScript = document.getElementsByTagName("script")[0];
    firstScript.parentNode?.insertBefore(script, firstScript);
  }

  fbq("init" satisfies MetaPixelCommand, pixelId);
  fbq("track" satisfies MetaPixelCommand, "PageView");
  window.__numsMetaPixelId = pixelId;
};
