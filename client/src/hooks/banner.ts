import { useCallback, useEffect, useMemo, useState } from "react";
import {
  loadConfig,
  getAvailableConfigs,
  type ControllerConfig,
} from "@cartridge/presets";
import { useBundles } from "@/context/bundles";
import { useAccount, useNetwork } from "@starknet-react/core";
import type ControllerConnector from "@cartridge/connector/controller";
import { getSetupAddress } from "@/config";
import { usePreserveSearchNavigate } from "@/lib/router";
import { useControllers } from "@/context/controllers";

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
  // { preset: "loot-survivor", name: "loot-survivor", position: 64 },
  // { preset: "dope-wars", name: "dope-wars", position: 16 },
  // {
  //   preset: "jokers-of-neon",
  //   name: "jokers-of-neon",
  //   origin: "https://play.jokersofneon.com/",
  // },
  // {
  //   preset: "eternum",
  //   name: "eternum",
  //   position: 16,
  //   origin: "https://blitz.realms.world/",
  // },
  // { preset: "glitch-bomb", name: "glitch-bomb", position: 0 },
  // { preset: "savage-summit", name: "savage-summit", position: 0 },
];

export const useBanners = () => {
  const { account, connector } = useAccount();
  const { chain } = useNetwork();
  const { issuances } = useBundles();
  const [results, setResults] = useState<BannerConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = usePreserveSearchNavigate();
  const { find } = useControllers();

  const username = useMemo(() => {
    if (!account?.address) return undefined;
    const controller = find(account.address);
    return controller?.username;
  }, [account?.address, find]);

  const referralLink = useMemo(() => {
    if (!username) return "";
    return `${window.location.origin}/?ref=${encodeURIComponent(username)}`;
  }, [username]);

  const handleShare = useCallback(async () => {
    if (!username || !chain) return;
    const onPurchaseComplete = () => {
      navigate("/game");
    };

    const socialClaimOptions = {
      shareMessage: `My application was accepted!\nHave you checked yours?\n🔢 @numsgg\n${referralLink}`,
    };

    const controller = connector as ControllerConnector;
    const registry = getSetupAddress(chain.id);
    await controller.controller.openBundle(0, registry, {
      onPurchaseComplete,
      socialClaimOptions,
    });
  }, [navigate, chain.id, username, referralLink]);

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
          if (b.name === "social" && !issuance) entry.onClick = handleShare;
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
