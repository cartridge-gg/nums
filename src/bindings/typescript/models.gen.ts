import type { SchemaType as ISchemaType } from "@dojoengine/sdk";

import { CairoCustomEnum, CairoOption, CairoOptionVariant, BigNumberish } from 'starknet';

// Type definition for `nums::models::claims::Claims` struct
export interface Claims {
	player: string;
	claim_id: BigNumberish;
	ty: ClaimsTypeEnum;
}

// Type definition for `nums::models::claims::JackpotClaim` struct
export interface JackpotClaim {
	id: BigNumberish;
}

// Type definition for `nums::models::claims::TokenClaim` struct
export interface TokenClaim {
	amount: BigNumberish;
}

// Type definition for `nums::models::config::Config` struct
export interface Config {
	world_resource: BigNumberish;
	game: CairoOption<GameConfig>;
	reward: CairoOption<SlotReward>;
	nums_address: string;
	vrf_address: string;
}

// Type definition for `nums::models::config::GameConfig` struct
export interface GameConfig {
	max_slots: BigNumberish;
	max_number: BigNumberish;
	min_number: BigNumberish;
	entry_cost: BigNumberish;
}

// Type definition for `nums::models::config::RewardLevel` struct
export interface RewardLevel {
	level: BigNumberish;
	amount: BigNumberish;
}

// Type definition for `nums::models::config::SlotReward` struct
export interface SlotReward {
	token: string;
	levels: Array<RewardLevel>;
}

// Type definition for `nums::models::game::Game` struct
export interface Game {
	game_id: BigNumberish;
	player: string;
	max_slots: BigNumberish;
	max_number: BigNumberish;
	min_number: BigNumberish;
	remaining_slots: BigNumberish;
	next_number: BigNumberish;
	reward: BigNumberish;
	jackpot_id: CairoOption<BigNumberish>;
}

// Type definition for `nums::models::jackpot::ConditionalVictory` struct
export interface ConditionalVictory {
	slots_required: BigNumberish;
}

// Type definition for `nums::models::jackpot::Jackpot` struct
export interface Jackpot {
	id: BigNumberish;
	title: BigNumberish;
	creator: string;
	mode: JackpotModeEnum;
	expiration: BigNumberish;
	token: CairoOption<Token>;
	winner: CairoOption<string>;
	claimed: boolean;
	verified: boolean;
}

// Type definition for `nums::models::jackpot::KingOfTheHill` struct
export interface KingOfTheHill {
	extension_time: BigNumberish;
	remaining_slots: BigNumberish;
	king: string;
}

// Type definition for `nums::models::metadata::Metadata` struct
export interface Metadata {
	jackpot_id: BigNumberish;
	description: string;
	sponsor_url: string;
}

// Type definition for `nums::models::slot::Slot` struct
export interface Slot {
	game_id: BigNumberish;
	player: string;
	index: BigNumberish;
	number: BigNumberish;
}

// Type definition for `nums::models::totals::GlobalTotals` struct
export interface GlobalTotals {
	world_resource: BigNumberish;
	games_played: BigNumberish;
}

// Type definition for `nums::models::totals::Totals` struct
export interface Totals {
	player: string;
	rewards_earned: BigNumberish;
	rewards_claimed: BigNumberish;
	games_played: BigNumberish;
	slots_filled: BigNumberish;
}

// Type definition for `nums::token::Token` struct
export interface Token {
	id: CairoOption<BigNumberish>;
	address: string;
	ty: TokenTypeEnum;
	total: BigNumberish;
}

// Type definition for `achievement::events::index::TrophyCreation` struct
export interface TrophyCreation {
	id: BigNumberish;
	hidden: boolean;
	index: BigNumberish;
	points: BigNumberish;
	start: BigNumberish;
	end: BigNumberish;
	group: BigNumberish;
	icon: BigNumberish;
	title: BigNumberish;
	description: string;
	tasks: Array<Task>;
	data: string;
}

// Type definition for `achievement::events::index::TrophyProgression` struct
export interface TrophyProgression {
	player_id: BigNumberish;
	task_id: BigNumberish;
	count: BigNumberish;
	time: BigNumberish;
}

// Type definition for `achievement::types::index::Task` struct
export interface Task {
	id: BigNumberish;
	total: BigNumberish;
	description: string;
}

// Type definition for `nums::systems::claim_actions::claim_actions::JackpotClaimed` struct
export interface JackpotClaimed {
	game_id: BigNumberish;
	jackpot_id: BigNumberish;
	player: string;
}

// Type definition for `nums::systems::claim_actions::claim_actions::RewardClaimed` struct
export interface RewardClaimed {
	claim_id: BigNumberish;
	player: string;
	amount: BigNumberish;
}

// Type definition for `nums::systems::game_actions::game_actions::GameCreated` struct
export interface GameCreated {
	player: string;
	game_id: BigNumberish;
}

// Type definition for `nums::systems::game_actions::game_actions::Inserted` struct
export interface Inserted {
	game_id: BigNumberish;
	player: string;
	index: BigNumberish;
	number: BigNumberish;
	next_number: BigNumberish;
	remaining_slots: BigNumberish;
	game_rewards: BigNumberish;
}

// Type definition for `nums::systems::game_actions::game_actions::KingCrowned` struct
export interface KingCrowned {
	game_id: BigNumberish;
	jackpot_id: BigNumberish;
	player: string;
}

// Type definition for `nums::systems::jackpot_actions::jackpot_actions::JackpotCreated` struct
export interface JackpotCreated {
	jackpot_id: BigNumberish;
	token: CairoOption<Token>;
}

// Type definition for `nums::models::claims::ClaimsType` enum
export const claimsType = [
	'TOKEN',
	'JACKPOT',
] as const;
export type ClaimsType = { 
	TOKEN: TokenClaim,
	JACKPOT: JackpotClaim,
};
export type ClaimsTypeEnum = CairoCustomEnum;

// Type definition for `nums::models::jackpot::JackpotMode` enum
export const jackpotMode = [
	'KING_OF_THE_HILL',
	'CONDITIONAL_VICTORY',
] as const;
export type JackpotMode = { 
	KING_OF_THE_HILL: KingOfTheHill,
	CONDITIONAL_VICTORY: ConditionalVictory,
};
export type JackpotModeEnum = CairoCustomEnum;

// Type definition for `nums::token::TokenType` enum
export const tokenType = [
	'ERC20',
	'ERC721',
	'ERC1155',
] as const;
export type TokenType = { [key in typeof tokenType[number]]: string };
export type TokenTypeEnum = CairoCustomEnum;

export interface SchemaType extends ISchemaType {
	nums: {
		Claims: Claims,
		JackpotClaim: JackpotClaim,
		TokenClaim: TokenClaim,
		Config: Config,
		GameConfig: GameConfig,
		RewardLevel: RewardLevel,
		SlotReward: SlotReward,
		Game: Game,
		ConditionalVictory: ConditionalVictory,
		Jackpot: Jackpot,
		KingOfTheHill: KingOfTheHill,
		Metadata: Metadata,
		Slot: Slot,
		GlobalTotals: GlobalTotals,
		Totals: Totals,
		Token: Token,
		TrophyCreation: TrophyCreation,
		TrophyProgression: TrophyProgression,
		Task: Task,
		JackpotClaimed: JackpotClaimed,
		RewardClaimed: RewardClaimed,
		GameCreated: GameCreated,
		Inserted: Inserted,
		KingCrowned: KingCrowned,
		JackpotCreated: JackpotCreated,
	},
}
export const schema: SchemaType = {
	nums: {
		Claims: {
			player: "",
			claim_id: 0,
		ty: new CairoCustomEnum({ 
				TOKEN: { amount: 0, },
				JACKPOT: undefined, }),
		},
		JackpotClaim: {
			id: 0,
		},
		TokenClaim: {
			amount: 0,
		},
		Config: {
			world_resource: 0,
		game: new CairoOption(CairoOptionVariant.None),
		reward: new CairoOption(CairoOptionVariant.None),
			nums_address: "",
			vrf_address: "",
		},
		GameConfig: {
			max_slots: 0,
			max_number: 0,
			min_number: 0,
			entry_cost: 0,
		},
		RewardLevel: {
			level: 0,
			amount: 0,
		},
		SlotReward: {
			token: "",
			levels: [{ level: 0, amount: 0, }],
		},
		Game: {
			game_id: 0,
			player: "",
			max_slots: 0,
			max_number: 0,
			min_number: 0,
			remaining_slots: 0,
			next_number: 0,
			reward: 0,
		jackpot_id: new CairoOption(CairoOptionVariant.None),
		},
		ConditionalVictory: {
			slots_required: 0,
		},
		Jackpot: {
			id: 0,
			title: 0,
			creator: "",
		mode: new CairoCustomEnum({ 
				KING_OF_THE_HILL: { extension_time: 0, remaining_slots: 0, king: "", },
				CONDITIONAL_VICTORY: undefined, }),
			expiration: 0,
		token: new CairoOption(CairoOptionVariant.None),
		winner: new CairoOption(CairoOptionVariant.None),
			claimed: false,
			verified: false,
		},
		KingOfTheHill: {
			extension_time: 0,
			remaining_slots: 0,
			king: "",
		},
		Metadata: {
			jackpot_id: 0,
		description: "",
		sponsor_url: "",
		},
		Slot: {
			game_id: 0,
			player: "",
			index: 0,
			number: 0,
		},
		GlobalTotals: {
			world_resource: 0,
			games_played: 0,
		},
		Totals: {
			player: "",
			rewards_earned: 0,
			rewards_claimed: 0,
			games_played: 0,
			slots_filled: 0,
		},
		Token: {
		id: new CairoOption(CairoOptionVariant.None),
			address: "",
		ty: new CairoCustomEnum({ 
					ERC20: "",
				ERC721: undefined,
				ERC1155: undefined, }),
		total: 0,
		},
		TrophyCreation: {
			id: 0,
			hidden: false,
			index: 0,
			points: 0,
			start: 0,
			end: 0,
			group: 0,
			icon: 0,
			title: 0,
		description: "",
			tasks: [{ id: 0, total: 0, description: "", }],
		data: "",
		},
		TrophyProgression: {
			player_id: 0,
			task_id: 0,
			count: 0,
			time: 0,
		},
		Task: {
			id: 0,
			total: 0,
		description: "",
		},
		JackpotClaimed: {
			game_id: 0,
			jackpot_id: 0,
			player: "",
		},
		RewardClaimed: {
			claim_id: 0,
			player: "",
			amount: 0,
		},
		GameCreated: {
			player: "",
			game_id: 0,
		},
		Inserted: {
			game_id: 0,
			player: "",
			index: 0,
			number: 0,
			next_number: 0,
			remaining_slots: 0,
			game_rewards: 0,
		},
		KingCrowned: {
			game_id: 0,
			jackpot_id: 0,
			player: "",
		},
		JackpotCreated: {
			jackpot_id: 0,
		token: new CairoOption(CairoOptionVariant.None),
		},
	},
};
export enum ModelsMapping {
	Claims = 'nums-Claims',
	ClaimsType = 'nums-ClaimsType',
	JackpotClaim = 'nums-JackpotClaim',
	TokenClaim = 'nums-TokenClaim',
	Config = 'nums-Config',
	GameConfig = 'nums-GameConfig',
	RewardLevel = 'nums-RewardLevel',
	SlotReward = 'nums-SlotReward',
	Game = 'nums-Game',
	ConditionalVictory = 'nums-ConditionalVictory',
	Jackpot = 'nums-Jackpot',
	JackpotMode = 'nums-JackpotMode',
	KingOfTheHill = 'nums-KingOfTheHill',
	Metadata = 'nums-Metadata',
	Slot = 'nums-Slot',
	GlobalTotals = 'nums-GlobalTotals',
	Totals = 'nums-Totals',
	Token = 'nums-Token',
	TokenType = 'nums-TokenType',
	TrophyCreation = 'achievement-TrophyCreation',
	TrophyProgression = 'achievement-TrophyProgression',
	Task = 'achievement-Task',
	JackpotClaimed = 'nums-JackpotClaimed',
	RewardClaimed = 'nums-RewardClaimed',
	GameCreated = 'nums-GameCreated',
	Inserted = 'nums-Inserted',
	KingCrowned = 'nums-KingCrowned',
	JackpotCreated = 'nums-JackpotCreated',
}