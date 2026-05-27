import { describe, expect, it } from "vitest";
import { parseAttributionFields, resolveAttribution } from "@/lib/attribution";

const createStorage = () => {
  const values = new Map<string, string>();

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
};

const createLocation = (url: string): Location =>
  new URL(url) as unknown as Location;

describe("attribution", () => {
  it("parses TikTok, Google, Meta, LinkedIn, Microsoft, and UTM params", () => {
    expect(
      parseAttributionFields(
        "?ttclid=tt&utm_source=tiktok&utm_medium=paid&utm_campaign=launch&utm_content=ad&utm_term=nums&gclid=g&gbraid=gb&wbraid=wb&fbclid=fb&msclkid=ms&li_fat_id=li&ignored=1",
      ),
    ).toEqual({
      ttclid: "tt",
      utm_source: "tiktok",
      utm_medium: "paid",
      utm_campaign: "launch",
      utm_content: "ad",
      utm_term: "nums",
      gclid: "g",
      gbraid: "gb",
      wbraid: "wb",
      fbclid: "fb",
      msclkid: "ms",
      li_fat_id: "li",
    });
  });

  it("stores first-touch and latest-touch attribution", () => {
    const storage = createStorage();
    const first = resolveAttribution({
      location: createLocation(
        "https://nums.gg/?ttclid=first&utm_source=tiktok&utm_campaign=alpha",
      ),
      referrer: "https://www.tiktok.com/",
      storage,
      now: Date.UTC(2026, 4, 1),
    });

    const latest = resolveAttribution({
      location: createLocation(
        "https://nums.gg/game?ttclid=latest&utm_source=tiktok&utm_campaign=beta",
      ),
      referrer: "",
      storage,
      now: Date.UTC(2026, 4, 2),
    });

    expect(first?.eventProperties.ttclid).toBe("first");
    expect(first?.setOnceProperties.$initial_ttclid).toBe("first");
    expect(latest?.eventProperties.ttclid).toBe("latest");
    expect(latest?.setProperties.utm_campaign).toBe("beta");
    expect(latest?.setOnceProperties.$initial_ttclid).toBe("first");
    expect(latest?.setOnceProperties.$initial_utm_campaign).toBe("alpha");
  });

  it("derives Meta fbc from fbclid using the landing timestamp", () => {
    const attribution = resolveAttribution({
      location: createLocation("https://nums.gg/?fbclid=meta-click"),
      referrer: "https://www.facebook.com/",
      storage: createStorage(),
      now: Date.UTC(2026, 4, 1),
    });

    expect(attribution?.eventProperties.fbclid).toBe("meta-click");
    expect(attribution?.eventProperties.fbc).toBe(
      `fb.1.${Date.UTC(2026, 4, 1)}.meta-click`,
    );
    expect(attribution?.setOnceProperties.$initial_fbc).toBe(
      `fb.1.${Date.UTC(2026, 4, 1)}.meta-click`,
    );
  });

  it("reuses unexpired stored attribution when the URL has no ad params", () => {
    const storage = createStorage();
    resolveAttribution({
      location: createLocation("https://nums.gg/?ttclid=first"),
      referrer: "",
      storage,
      now: Date.UTC(2026, 4, 1),
    });

    const attribution = resolveAttribution({
      location: createLocation("https://nums.gg/game"),
      referrer: "",
      storage,
      now: Date.UTC(2026, 4, 2),
    });

    expect(attribution?.eventProperties.ttclid).toBe("first");
    expect(attribution?.setOnceProperties.$initial_ttclid).toBe("first");
  });

  it("drops expired stored attribution", () => {
    const storage = createStorage();
    resolveAttribution({
      location: createLocation("https://nums.gg/?ttclid=first"),
      referrer: "",
      storage,
      now: Date.UTC(2026, 4, 1),
      ttlMs: 1000,
    });

    const attribution = resolveAttribution({
      location: createLocation("https://nums.gg/game"),
      referrer: "",
      storage,
      now: Date.UTC(2026, 4, 1) + 1001,
      ttlMs: 1000,
    });

    expect(attribution).toBeNull();
  });
});
