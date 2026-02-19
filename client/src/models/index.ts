export { Config } from "./config";
export { Game } from "./game";
export { Starterpack } from "./starterpack";
export { Purchased } from "./purchased";
export { Claimed } from "./claimed";
export { Started } from "./started";
export {
  AchievementDefinition,
  AchievementCompletion,
  AchievementAdvancement,
  AchievementAssociation,
  AchievementCreation,
  AchievementProgression,
  AchievementCompleted,
  AchievementClaimed,
  type RawDefinition as RawAchievementDefinition,
  type RawCompletion as RawAchievementCompletion,
  type RawAdvancement as RawAchievementAdvancement,
  type RawCreation as RawAchievementCreation,
  type RawCompleted as RawAchievementCompleted,
  type RawClaimed as RawAchievementClaimed,
} from "./achievement";
export {
  QuestDefinition,
  QuestCompletion,
  QuestAdvancement,
  QuestAssociation,
  QuestCondition,
  QuestCreation,
  QuestProgression,
  QuestUnlocked,
  QuestCompleted,
  QuestClaimed,
  type RawDefinition as RawQuestDefinition,
  type RawCompletion as RawQuestCompletion,
  type RawAdvancement as RawQuestAdvancement,
  type RawCreation as RawQuestCreation,
  type RawUnlocked as RawQuestUnlocked,
  type RawCompleted as RawQuestCompleted,
  type RawClaimed as RawQuestClaimed,
} from "./quest";

export interface RawConfig {
  world_resource: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  nums: {
    type: "primitive";
    type_name: "ContractAddress";
    value: string;
    key: boolean;
  };
  vrf: {
    type: "primitive";
    type_name: "ContractAddress";
    value: string;
    key: boolean;
  };
  starterpack: {
    type: "primitive";
    type_name: "ContractAddress";
    value: string;
    key: boolean;
  };
  owner: {
    type: "primitive";
    type_name: "ContractAddress";
    value: string;
    key: boolean;
  };
  entry_price: {
    type: "primitive";
    type_name: "u128";
    value: string;
    key: boolean;
  };
  target_supply: {
    type: "primitive";
    type_name: "u256";
    value: string;
    key: boolean;
  };
  count: {
    type: "primitive";
    type_name: "u32";
    value: string;
    key: boolean;
  };
  slot_count: {
    type: "primitive";
    type_name: "u8";
    value: string;
    key: boolean;
  };
  slot_min: {
    type: "primitive";
    type_name: "u16";
    value: string;
    key: boolean;
  };
  slot_max: {
    type: "primitive";
    type_name: "u16";
    value: string;
    key: boolean;
  };
}

export interface RawStarterpack {
  id: {
    type: "primitive";
    type_name: "u32";
    value: string;
    key: boolean;
  };
  reissuable: {
    type: "primitive";
    type_name: "bool";
    value: boolean;
    key: boolean;
  };
  referral_percentage: {
    type: "primitive";
    type_name: "u8";
    value: string;
    key: boolean;
  };
  price: {
    type: "primitive";
    type_name: "u256";
    value: string;
    key: boolean;
  };
  payment_token: {
    type: "primitive";
    type_name: "contract_address";
    value: string;
    key: boolean;
  };
  multiplier: {
    type: "primitive";
    type_name: "u8";
    value: string;
    key: boolean;
  };
}

export interface RawGame {
  id: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  claimed: {
    type: "primitive";
    type_name: "bool";
    value: boolean;
    key: boolean;
  };
  multiplier: {
    type: "primitive";
    type_name: "u8";
    value: string;
    key: boolean;
  };
  level: {
    type: "primitive";
    type_name: "u8";
    value: string;
    key: boolean;
  };
  slot_count: {
    type: "primitive";
    type_name: "u8";
    value: string;
    key: boolean;
  };
  slot_min: {
    type: "primitive";
    type_name: "u16";
    value: string;
    key: boolean;
  };
  slot_max: {
    type: "primitive";
    type_name: "u16";
    value: string;
    key: boolean;
  };
  number: {
    type: "primitive";
    type_name: "u16";
    value: string;
    key: boolean;
  };
  next_number: {
    type: "primitive";
    type_name: "u16";
    value: string;
    key: boolean;
  };
  selectable_powers: {
    type: "primitive";
    type_name: "u8";
    value: string;
    key: boolean;
  };
  selected_powers: {
    type: "primitive";
    type_name: "u16";
    value: string;
    key: boolean;
  };
  enabled_powers: {
    type: "primitive";
    type_name: "u16";
    value: string;
    key: boolean;
  };
  disabled_traps: {
    type: "primitive";
    type_name: "u32";
    value: string;
    key: boolean;
  };
  reward: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  over: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  expiration: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  traps: {
    type: "primitive";
    type_name: "u128";
    value: string;
    key: boolean;
  };
  slots: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  supply: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
}

export interface RawPurchased {
  player_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  starterpack_id: {
    type: "primitive";
    type_name: "u32";
    value: string;
    key: boolean;
  };
  quantity: {
    type: "primitive";
    type_name: "u32";
    value: string;
    key: boolean;
  };
  multiplier: {
    type: "primitive";
    type_name: "u8";
    value: string;
    key: boolean;
  };
  time: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
}

export interface RawStarted {
  player_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  game_id: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  multiplier: {
    type: "primitive";
    type_name: "u8";
    value: string;
    key: boolean;
  };
  time: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
}

export interface RawClaimed {
  player_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  game_id: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  reward: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  time: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
}

export interface RawStarterpackIssued {
  recipient: {
    type: "primitive";
    type_name: "ContractAddress";
    value: string;
    key: boolean;
  };
  starterpack_id: {
    type: "primitive";
    type_name: "u32";
    value: string;
    key: boolean;
  };
  payment_token: {
    type: "primitive";
    type_name: "ContractAddress";
    value: string;
    key: boolean;
  };
  amount: {
    type: "primitive";
    type_name: "u256";
    value: string;
    key: boolean;
  };
  quantity: {
    type: "primitive";
    type_name: "u32";
    value: string;
    key: boolean;
  };
  time: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
}
