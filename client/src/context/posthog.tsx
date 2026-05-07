import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import PostHog from "posthog-js-lite";
import { resolveAttribution } from "@/lib/attribution";
import { loadMetaPixel } from "@/lib/meta-pixel";
import { loadTikTokPixel, NUMS_TIKTOK_PIXEL_ID } from "@/lib/tiktok-pixel";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

interface PostHogContextType {
  capture: (event: string, properties?: Record<string, JsonValue>) => void;
  identify: (
    distinctId: string,
    properties?: Record<string, JsonValue>,
  ) => void;
}

const noop = () => {};
const noopContext: PostHogContextType = { capture: noop, identify: noop };

const PostHogContext = createContext<PostHogContextType>(noopContext);

export const usePostHog = () => useContext(PostHogContext);

interface PostHogProviderProps {
  children: ReactNode;
}

export const PostHogProvider = ({ children }: PostHogProviderProps) => {
  const clientRef = useRef<PostHog | null>(null);
  const attributionRef = useRef<ReturnType<typeof resolveAttribution>>(null);

  useEffect(() => {
    const isLocalhost =
      typeof window !== "undefined" &&
      window.location.hostname.includes("localhost");
    const pixelId =
      import.meta.env.VITE_TIKTOK_PIXEL_ID || NUMS_TIKTOK_PIXEL_ID;
    if (!isLocalhost && pixelId) {
      loadTikTokPixel(pixelId);
    }
    const metaPixelId = import.meta.env.VITE_META_PIXEL_ID;
    if (!isLocalhost && metaPixelId) {
      loadMetaPixel(metaPixelId);
    }

    const key = import.meta.env.VITE_POSTHOG_KEY;
    if (!key || isLocalhost) {
      return;
    }

    const host = import.meta.env.VITE_POSTHOG_HOST || "/ingest";
    const client = new PostHog(key, {
      host,
      persistence: "localStorage",
      captureHistoryEvents: true,
    });
    clientRef.current = client;

    try {
      attributionRef.current = resolveAttribution({
        location: window.location,
        referrer: window.document.referrer,
        storage: window.localStorage,
      });
      if (attributionRef.current) {
        client.register(attributionRef.current.eventProperties);
      }
    } catch (e) {
      console.error("[posthog] attribution setup failed", e);
    }

    return () => {
      clientRef.current = null;
    };
  }, []);

  const value = useMemo<PostHogContextType>(
    () => ({
      capture: (event: string, properties?: Record<string, JsonValue>) => {
        try {
          clientRef.current?.capture(event, properties);
        } catch (e) {
          console.error("[posthog] capture failed", e);
        }
      },
      identify: (
        distinctId: string,
        properties?: Record<string, JsonValue>,
      ) => {
        try {
          const attribution = attributionRef.current;
          const existingSet = properties?.$set as
            | Record<string, JsonValue>
            | undefined;
          const plainSet = Object.fromEntries(
            Object.entries(properties ?? {}).filter(
              ([key]) => !key.startsWith("$"),
            ),
          ) as Record<string, JsonValue>;
          clientRef.current?.identify(
            distinctId,
            attribution
              ? {
                  ...properties,
                  $set: {
                    ...(existingSet ?? plainSet),
                    ...attribution.setProperties,
                  },
                  $set_once: {
                    ...((properties?.$set_once as Record<string, JsonValue>) ??
                      {}),
                    ...attribution.setOnceProperties,
                  },
                }
              : properties,
          );
        } catch (e) {
          console.error("[posthog] identify failed", e);
        }
      },
    }),
    [],
  );

  return (
    <PostHogContext.Provider value={value}>{children}</PostHogContext.Provider>
  );
};
