import type { Bundle, Starterpack } from "@/models";

type StarterpackLike = Pick<Starterpack, "id" | "price" | "multiplier">;
type BundleLike = Pick<Bundle, "id" | "price">;

const STARTERPACK_NAME = "NUMS Starterpack";

const toUsdValue = (
  numsAmount: number,
  numsPriceUsd: number,
): number | null => {
  if (!Number.isFinite(numsAmount) || !Number.isFinite(numsPriceUsd))
    return null;
  return Number((numsAmount * numsPriceUsd).toFixed(2));
};

export const createAnalyticsEventId = (prefix: string): string => {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  return `${prefix}:${Date.now()}:${random}`;
};

export const starterpackEventProperties = ({
  eventId,
  starterpack,
  numsPriceUsd,
}: {
  eventId: string;
  starterpack: StarterpackLike;
  numsPriceUsd: number;
}) => {
  const starterpackPriceNums = Number(starterpack.price) / 10 ** 6;
  const value = toUsdValue(starterpackPriceNums, numsPriceUsd);

  return {
    event_id: eventId,
    sku: `nums-starterpack-${starterpack.id}`,
    name: STARTERPACK_NAME,
    brand: "NUMS",
    category: "starterpack",
    content_type: "product",
    quantity: 1,
    currency: "USD",
    starterpack_id: starterpack.id,
    starterpack_price_nums: starterpackPriceNums,
    nums_price_usd: numsPriceUsd,
    multiplier: starterpack.multiplier,
    ...(value !== null ? { value, price: value } : {}),
  };
};

export const bundleStarterpackEventProperties = ({
  eventId,
  bundle,
  numsPriceUsd,
}: {
  eventId: string;
  bundle: BundleLike;
  numsPriceUsd: number;
}) => {
  const starterpackPriceNums = Number(bundle.price) / 10 ** 6;
  const value = toUsdValue(starterpackPriceNums, numsPriceUsd);

  return {
    event_id: eventId,
    sku: `nums-starterpack-${bundle.id}`,
    name: STARTERPACK_NAME,
    brand: "NUMS",
    category: "starterpack",
    content_type: "product",
    quantity: 1,
    currency: "USD",
    starterpack_id: bundle.id,
    starterpack_price_nums: starterpackPriceNums,
    nums_price_usd: numsPriceUsd,
    ...(value !== null ? { value, price: value } : {}),
  };
};
