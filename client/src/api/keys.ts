import { Achievement } from "./torii/achievement";
import { Activities } from "./torii/activities";
import { BundleApi } from "./torii/bundle";
import { Config } from "./torii/config";
import { Event } from "./torii/event";
import { Game } from "./torii/game";
import { Leaderboard } from "./torii/leaderboard";
import { Merkledrop } from "./torii/merkledrop";
import { Owner } from "./torii/owner";
import { Quest } from "./torii/quest";
import { Referral } from "./torii/referral";
import { Vault } from "./torii/vault";

export const queryKeys = {
  games: Game.keys,
  bundles: BundleApi.keys,

  tokens: {
    contracts: (contractAddresses: string[], contractType: string) =>
      ["tokenContracts", contractAddresses, contractType] as const,
    balances: (contractAddresses: string[], accountAddresses: string[]) =>
      ["tokenBalances", contractAddresses, accountAddresses] as const,
  },

  vault: Vault.keys,

  owner: Owner.keys,
  leaderboard: Leaderboard.keys,
  activities: Activities.keys,
  referrals: Referral.keys,

  controllers: () => ["controllers"] as const,

  prices: (tokenAddresses: string, quoteAddress: string) =>
    ["tokenUsdPrices", tokenAddresses, quoteAddress] as const,

  config: Config.keys.all,
  starterpacks: Config.keys.starterpacks,
  events: Event.keys,

  achievements: Achievement.keys,

  quests: Quest.keys,

  merkledrops: Merkledrop.keys,
} as const;
