import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { PostHogProvider, usePostHog } from "./posthog";
import type { ReactNode } from "react";

// Mock import.meta.env
vi.stubEnv("VITE_POSTHOG_KEY", "");

describe("PostHogProvider", () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <PostHogProvider>{children}</PostHogProvider>
  );

  it("returns no-op capture and identify when key is absent", () => {
    const { result } = renderHook(() => usePostHog(), { wrapper });

    // Should not throw
    expect(() =>
      result.current.capture("test_event", { foo: "bar" }),
    ).not.toThrow();
    expect(() =>
      result.current.identify("user-123", { name: "test" }),
    ).not.toThrow();
  });

  it("safeCapture does not throw when underlying capture throws", () => {
    const { result } = renderHook(() => usePostHog(), { wrapper });

    // Even if the context is somehow corrupted, capture should never throw
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      result.current.capture("test", undefined);
      result.current.capture("test", { nested: { deep: true } });
      result.current.capture("", {});
    }).not.toThrow();

    consoleSpy.mockRestore();
  });
});
