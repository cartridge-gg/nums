import { useEffect, useState } from "react";
import {
  loadConfig,
  getAvailableConfigs,
  type ControllerConfig,
} from "@cartridge/presets";
import { useActions } from "./actions";
import { useBundles } from "@/context/bundles";
import { useAccount } from "@starknet-react/core";

export interface GameBanner {
  preset: string;
  name: string;
  bundle?: number;
  position?: number;
  origin?: string;
  onClick?: () => void;
}

export interface BannerConfig {
  preset: string;
  name: string;
  disabled?: boolean;
  hidden?: boolean;
  config?: ControllerConfig;
  position?: number;
  origin?: string;
  onClick?: () => void;
}

const BANNERS: GameBanner[] = [
  { preset: "nums", name: "social", bundle: 0 },
  { preset: "nums", name: "tutorial" },
  { preset: "loot-survivor", name: "loot-survivor", position: 64 },
  { preset: "dope-wars", name: "dope-wars", position: 16 },
  {
    preset: "jokers-of-neon",
    name: "jokers-of-neon",
    origin: "https://play.jokersofneon.com/",
  },
  {
    preset: "eternum",
    name: "eternum",
    position: 16,
    origin: "https://blitz.realms.world/",
  },
  { preset: "glitch-bomb", name: "glitch-bomb", position: 0 },
  { preset: "savage-summit", name: "savage-summit", position: 0 },
];

export const useBanners = () => {
  const {
    bundle: { social },
  } = useActions();
  const { account } = useAccount();
  const { issuances } = useBundles();
  const [results, setResults] = useState<BannerConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const available = await getAvailableConfigs();
        const presets = [...new Set(BANNERS.map((b) => b.preset))];
        const configs = new Map<string, ControllerConfig>();
        await Promise.all(
          presets
            .filter((p) => available.includes(p))
            .map(async (p) => {
              const config = await loadConfig(p);
              if (config) configs.set(p, config);
            }),
        );
        const entries = BANNERS.map((b) => {
          const entry: BannerConfig = { preset: b.preset, name: b.name };
          const config = configs.get(b.preset);
          const issuance = issuances.find((i) => i.bundle_id === b.bundle);
          if (config) entry.config = config;
          if (b.position !== undefined) entry.position = b.position;
          if (b.origin) entry.origin = b.origin;
          if (b.name === "social" && !issuance) entry.onClick = () => social(0);
          if (b.name === "social" && (!account || !!issuance))
            entry.disabled = true;
          if (b.name === "social" && !!issuance) entry.hidden = true;
          if (b.onClick) entry.onClick = b.onClick;
          return entry;
        });
        setResults(entries);
      } catch (error) {
        console.error("Failed to load game banner configs:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [issuances, account]);

  return { banners: results, loading };
};
