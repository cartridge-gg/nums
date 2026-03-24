import { useEffect, useState } from "react";
import {
  loadConfig,
  getAvailableConfigs,
  type ControllerConfig,
} from "@cartridge/presets";
import { useActions } from "./actions";

export interface GameBanner {
  preset: string;
  name: string;
  position?: number;
  origin?: string;
  onClick?: () => void;
}

export interface BannerConfig {
  preset: string;
  name: string;
  config?: ControllerConfig;
  position?: number;
  origin?: string;
  onClick?: () => void;
}

export const useBanners = (banners: GameBanner[]) => {
  const {
    bundle: { social },
  } = useActions();
  const [results, setResults] = useState<BannerConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const available = await getAvailableConfigs();
        const presets = [...new Set(banners.map((b) => b.preset))];
        const configs = new Map<string, ControllerConfig>();
        await Promise.all(
          presets
            .filter((p) => available.includes(p))
            .map(async (p) => {
              const config = await loadConfig(p);
              if (config) configs.set(p, config);
            }),
        );
        const entries = banners.map((b) => {
          const entry: BannerConfig = { preset: b.preset, name: b.name };
          const config = configs.get(b.preset);
          if (config) entry.config = config;
          if (b.position !== undefined) entry.position = b.position;
          if (b.origin) entry.origin = b.origin;
          if (b.name === "social") entry.onClick = () => social(0);
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
  }, [banners]);

  return { banners: results, loading };
};
