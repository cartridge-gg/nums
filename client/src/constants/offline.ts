import { Config, Starterpack } from "@/models";
import { DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MAX, DEFAULT_SLOT_MIN } from "@/constants";

export const OFFLINE_NUMS_PRICE = 0.001;
export const OFFLINE_NUMS_PRICE_MICRO = 1000n;
export const OFFLINE_CURRENT_SUPPLY = 12008156869796926328406417n;

export const OFFLINE_CONFIG = new Config(
  "",
  "",
  "",
  "",
  "",
  10000000000000000000000000n,
  70,
  30,
  DEFAULT_SLOT_COUNT,
  DEFAULT_SLOT_MIN,
  DEFAULT_SLOT_MAX,
  111,
  1322000,
  0n,
  0n,
  0n,
  "",
  2_000_000n,
  0n,
);

export const OFFLINE_STARTERPACKS = [
  new Starterpack(0, true, 0, 2_000_000n, "0x0", 1),
];
