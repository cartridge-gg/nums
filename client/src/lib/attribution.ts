type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type AttributionFields = Record<string, string>;

export interface AttributionSnapshot {
  fields: AttributionFields;
  landing_url: string;
  landing_path: string;
  referrer: string;
  captured_at: string;
}

interface StoredAttribution {
  first: AttributionSnapshot;
  latest: AttributionSnapshot;
  expires_at: number;
}

export interface AttributionProperties {
  eventProperties: Record<string, string>;
  setProperties: Record<string, string>;
  setOnceProperties: Record<string, string>;
}

const STORAGE_KEY = "nums:attribution:v1";
const DEFAULT_TTL_MS = 90 * 24 * 60 * 60 * 1000;

const TRACKED_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "ttclid",
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "msclkid",
  "li_fat_id",
] as const;

const snapshotProperties = (
  snapshot: AttributionSnapshot,
): Record<string, string> => ({
  ...snapshot.fields,
  landing_url: snapshot.landing_url,
  landing_path: snapshot.landing_path,
  referrer: snapshot.referrer,
  attribution_captured_at: snapshot.captured_at,
});

const initialProperties = (
  snapshot: AttributionSnapshot,
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(snapshotProperties(snapshot)).map(([key, value]) => [
      `$initial_${key}`,
      value,
    ]),
  );

const readStoredAttribution = (
  storage: StorageLike,
  now: number,
): StoredAttribution | null => {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredAttribution;
    if (!parsed.first || !parsed.latest || parsed.expires_at <= now) {
      storage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch (_error) {
    storage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const parseAttributionFields = (search: string): AttributionFields => {
  const params = new URLSearchParams(search);
  const fields: AttributionFields = {};

  for (const key of TRACKED_PARAMS) {
    const value = params.get(key);
    if (value) fields[key] = value;
  }

  return fields;
};

export const buildAttributionSnapshot = (
  location: Location,
  referrer: string,
  now: number,
): AttributionSnapshot | null => {
  const fields = parseAttributionFields(location.search);
  if (fields.fbclid) {
    fields.fbc = `fb.1.${now}.${fields.fbclid}`;
  }
  if (Object.keys(fields).length === 0) return null;

  return {
    fields,
    landing_url: location.href,
    landing_path: `${location.pathname}${location.search}${location.hash}`,
    referrer,
    captured_at: new Date(now).toISOString(),
  };
};

export const resolveAttribution = ({
  location,
  referrer,
  storage,
  now = Date.now(),
  ttlMs = DEFAULT_TTL_MS,
}: {
  location: Location;
  referrer: string;
  storage: StorageLike;
  now?: number;
  ttlMs?: number;
}): AttributionProperties | null => {
  const stored = readStoredAttribution(storage, now);
  const landingSnapshot = buildAttributionSnapshot(location, referrer, now);

  const attribution =
    landingSnapshot !== null
      ? {
          first: stored?.first ?? landingSnapshot,
          latest: landingSnapshot,
          expires_at: now + ttlMs,
        }
      : stored;

  if (!attribution) return null;

  if (landingSnapshot !== null) {
    storage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  }

  const latest = snapshotProperties(attribution.latest);
  const initial = initialProperties(attribution.first);

  return {
    eventProperties: {
      ...latest,
      ...initial,
    },
    setProperties: latest,
    setOnceProperties: initial,
  };
};
