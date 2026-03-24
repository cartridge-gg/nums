import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import PostHog from "posthog-js-lite";

interface PostHogContextType {
  capture: (event: string, properties?: Record<string, unknown>) => void;
  identify: (distinctId: string, properties?: Record<string, unknown>) => void;
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

  useEffect(() => {
    const key = import.meta.env.VITE_POSTHOG_KEY;
    if (
      !key ||
      (typeof window !== "undefined" &&
        window.location.hostname.includes("localhost"))
    ) {
      return;
    }

    const host = import.meta.env.VITE_POSTHOG_HOST || "/ingest";
    clientRef.current = new PostHog(key, {
      host,
      persistence: "localStorage",
    });

    return () => {
      clientRef.current = null;
    };
  }, []);

  const value = useMemo<PostHogContextType>(
    () => ({
      capture: (event: string, properties?: Record<string, unknown>) => {
        try {
          clientRef.current?.capture(event, properties);
        } catch (e) {
          console.error("[posthog] capture failed", e);
        }
      },
      identify: (distinctId: string, properties?: Record<string, unknown>) => {
        try {
          clientRef.current?.identify(distinctId, properties);
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
