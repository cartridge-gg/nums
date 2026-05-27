import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  NotificationEvents,
  notificationDeeplink,
  notificationDeeplinkToPath,
  notificationKind,
} from "./notification-events";

const navigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

describe("NotificationEvents", () => {
  const origin = "https://mobile.nums.gg";

  beforeEach(() => {
    navigate.mockReset();
  });

  it("uses path deeplinks directly", () => {
    expect(notificationDeeplinkToPath("/game/0x123?turn=4", origin)).toBe(
      "/game/0x123?turn=4",
    );
  });

  it("uses same-origin web URLs as internal paths", () => {
    expect(
      notificationDeeplinkToPath("https://mobile.nums.gg/game/7", origin),
    ).toBe("/game/7");
  });

  it("converts nums app scheme URLs to internal paths", () => {
    expect(
      notificationDeeplinkToPath("nums://game/0xabc?tab=score", origin),
    ).toBe("/game/0xabc?tab=score");
    expect(notificationDeeplinkToPath("nums:///practice", origin)).toBe(
      "/practice",
    );
  });

  it("rejects external URLs", () => {
    expect(
      notificationDeeplinkToPath("https://example.com/game/0x123", origin),
    ).toBeUndefined();
    expect(
      notificationDeeplinkToPath("//example.com/game/0x123", origin),
    ).toBeUndefined();
  });

  it("reads deeplink aliases and kind metadata from payloads", () => {
    expect(notificationDeeplink({ deepLink: "/game/7" }, origin)).toBe(
      "/game/7",
    );
    expect(notificationDeeplink({ url: "/practice" }, origin)).toBe(
      "/practice",
    );
    expect(notificationKind({ kind: " game-ready " })).toBe("game-ready");
  });

  it("handles notification click events", async () => {
    render(<NotificationEvents />);

    window.dispatchEvent(
      new CustomEvent("push-notification-click", {
        detail: { deeplink: "/game/new", kind: "deeplink" },
      }),
    );

    await waitFor(() => expect(navigate).toHaveBeenCalledWith("/game/new"));
  });
});
