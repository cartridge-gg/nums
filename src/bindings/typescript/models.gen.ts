import type { SchemaType as ISchemaType } from "@dojoengine/sdk";

import { CairoCustomEnum, BigNumberish } from 'starknet';

// Type definition for `nums::models::config::Config` struct
export interface Config {
	world_resource: BigNumberish;
	nums_address: string;
	vrf_address: string;
	burn_pct: BigNumberish;
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
	jackpot_id: BigNumberish;
	expires_at: BigNumberish;
	game_over: boolean;
}

// Type definition for `nums::models::game_config::GameConfig` struct
export interface GameConfig {
	max_slots: BigNumberish;
	max_number: BigNumberish;
	min_number: BigNumberish;
	entry_cost: BigNumberish;
	game_duration: BigNumberish;
}

// Type definition for `nums::models::identifier::Identifier` struct
export interface Identifier {
	typ: BigNumberish;
	id: BigNumberish;
}

// Type definition for `nums::models::jackpot::Jackpot` struct
export interface Jackpot {
	id: BigNumberish;
	factory_id: BigNumberish;
	nums_balance: BigNumberish;
	token: option;
	mode: JackpotModeEnum;
	created_at: BigNumberish;
	end_at: BigNumberish;
	best_score: BigNumberish;
	total_winners: BigNumberish;
	last_winner_index: BigNumberish;
	extension_count: BigNumberish;
	rescued: boolean;
}

// Type definition for `nums::models::jackpot::JackpotFactory` struct
export interface JackpotFactory {
	id: BigNumberish;
	name: string;
	creator: string;
	game_config: GameConfig;
	rewards: Array<BigNumberish>;
	token: option;
	mode: JackpotModeEnum;
	timing_mode: TimingModeEnum;
	initial_duration: BigNumberish;
	extension_duration: BigNumberish;
	min_slots: BigNumberish;
	max_winners: BigNumberish;
	current_jackpot_id: option;
	remaining_count: option;
}

// Type definition for `nums::models::jackpot::JackpotWinner` struct
export interface JackpotWinner {
	jackpot_id: BigNumberish;
	index: BigNumberish;
	player: string;
	game_id: BigNumberish;
	claimed: boolean;
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

// Type definition for `nums::token::Token` struct
export interface Token {
	address: string;
	ty: TokenTypeEnum;
}

// Type definition for `nums::token::TokenTypeERC1155` struct
export interface TokenTypeERC1155 {
	ids: Array<BigNumberish>;
	amounts: Array<BigNumberish>;
}

// Type definition for `nums::token::TokenTypeERC20` struct
export interface TokenTypeERC20 {
	amount: BigNumberish;
}

// Type definition for `nums::token::TokenTypeERC721` struct
export interface TokenTypeERC721 {
	ids: Array<BigNumberish>;
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

// Type definition for `nums::systems::game_actions::game_actions::GameCreated` struct
export interface GameCreated {
	player: string;
	jackpot_id: BigNumberish;
	game_id: BigNumberish;
}

// Type definition for `nums::systems::game_actions::game_actions::NewWinner` struct
export interface NewWinner {
	player: string;
	jackpot_id: BigNumberish;
	game_id: BigNumberish;
	score: BigNumberish;
	is_equal: boolean;
	has_ended: boolean;
	extension_time: BigNumberish;
	replaced_winner: option;
}

// Type definition for `nums::models::jackpot::JackpotMode` enum
export const jackpotMode = [
	'KingOfTheHill',
	'ConditionalVictory',
] as const;
export type JackpotMode = { [key in typeof jackpotMode[number]]: string };
export type JackpotModeEnum = CairoCustomEnum;

// Type definition for `nums::models::jackpot::TimingMode` enum
export const timingMode = [
	'TimeLimited',
	'Perpetual',
] as const;
export type TimingMode = { [key in typeof timingMode[number]]: string };
export type TimingModeEnum = CairoCustomEnum;

// Type definition for `nums::token::TokenType` enum
export const tokenType = [
	'ERC20',
	'ERC721',
	'ERC1155',
] as const;
export type TokenType = { 
	ERC20: TokenTypeERC20,
	ERC721: TokenTypeERC721,
	ERC1155: TokenTypeERC1155,
};
export type TokenTypeEnum = CairoCustomEnum;

export interface SchemaType extends ISchemaType {
	nums: {
		Config: Config,
		Game: Game,
		GameConfig: GameConfig,
		Identifier: Identifier,
		Jackpot: Jackpot,
		JackpotFactory: JackpotFactory,
		JackpotWinner: JackpotWinner,
		Metadata: Metadata,
		Slot: Slot,
		Token: Token,
		TokenTypeERC1155: TokenTypeERC1155,
		TokenTypeERC20: TokenTypeERC20,
		TokenTypeERC721: TokenTypeERC721,
		TrophyCreation: TrophyCreation,
		TrophyProgression: TrophyProgression,
		Task: Task,
		GameCreated: GameCreated,
		NewWinner: NewWinner,
	},
}
export const schema: SchemaType = {
	nums: {
		Config: {
			world_resource: 0,
			nums_address: "",
			vrf_address: "",
			burn_pct: 0,
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
			jackpot_id: 0,
			expires_at: 0,
			game_over: false,
		},
		GameConfig: {
			max_slots: 0,
			max_number: 0,
			min_number: 0,
			entry_cost: 0,
			game_duration: 0,
		},
		Identifier: {
			typ: 0,
			id: 0,
		},
		Jackpot: {
			id: 0,
			factory_id: 0,
		nums_balance: 0,
			token: option,
		mode: new CairoCustomEnum({ 
					KingOfTheHill: "",
				ConditionalVictory: undefined, }),
			created_at: 0,
			end_at: 0,
			best_score: 0,
			total_winners: 0,
			last_winner_index: 0,
			extension_count: 0,
			rescued: false,
		},
		JackpotFactory: {
			id: 0,
		name: "",
			creator: "",
		game_config: { max_slots: 0, max_number: 0, min_number: 0, entry_cost: 0, game_duration: 0, },
			rewards: [0],
			token: option,
		mode: new CairoCustomEnum({ 
					KingOfTheHill: "",
				ConditionalVictory: undefined, }),
		timing_mode: new CairoCustomEnum({ 
					TimeLimited: "",
				Perpetual: undefined, }),
			initial_duration: 0,
			extension_duration: 0,
			min_slots: 0,
			max_winners: 0,
			current_jackpot_id: option,
			remaining_count: option,
		},
		JackpotWinner: {
			jackpot_id: 0,
			index: 0,
			player: "",
			game_id: 0,
			claimed: false,
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
		Token: {
			address: "",
		ty: new CairoCustomEnum({ 
				ERC20: { amount: 0, },
				ERC721: undefined,
				ERC1155: undefined, }),
		},
		TokenTypeERC1155: {
			ids: [0],
			amounts: [0],
		},
		TokenTypeERC20: {
		amount: 0,
		},
		TokenTypeERC721: {
			ids: [0],
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
		GameCreated: {
			player: "",
			jackpot_id: 0,
			game_id: 0,
		},
		NewWinner: {
			player: "",
			jackpot_id: 0,
			game_id: 0,
			score: 0,
			is_equal: false,
			has_ended: false,
			extension_time: 0,
			replaced_winner: option,
		},
	},
};
export enum ModelsMapping {
	Config = 'nums-Config',
	Game = 'nums-Game',
	GameConfig = 'nums-GameConfig',
	Identifier = 'nums-Identifier',
	Jackpot = 'nums-Jackpot',
	JackpotFactory = 'nums-JackpotFactory',
	JackpotMode = 'nums-JackpotMode',
	JackpotWinner = 'nums-JackpotWinner',
	TimingMode = 'nums-TimingMode',
	Metadata = 'nums-Metadata',
	Slot = 'nums-Slot',
	Token = 'nums-Token',
	TokenType = 'nums-TokenType',
	TokenTypeERC1155 = 'nums-TokenTypeERC1155',
	TokenTypeERC20 = 'nums-TokenTypeERC20',
	TokenTypeERC721 = 'nums-TokenTypeERC721',
	TrophyCreation = 'achievement-TrophyCreation',
	TrophyProgression = 'achievement-TrophyProgression',
	Task = 'achievement-Task',
	GameCreated = 'nums-GameCreated',
	NewWinner = 'nums-NewWinner',
}