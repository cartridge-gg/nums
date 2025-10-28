import type { SchemaType as ISchemaType } from "@dojoengine/sdk";

import { CairoCustomEnum, CairoOption, CairoOptionVariant, BigNumberish } from 'starknet';

// Type definition for `nums::models::index::Config` struct
export interface Config {
	world_resource: BigNumberish;
	nums: string;
	vrf: string;
	starterpack: string;
	forwarder: string;
	owner: string;
	entry_price: BigNumberish;
	count: BigNumberish;
}

// Type definition for `nums::models::index::Game` struct
export interface Game {
	id: BigNumberish;
	over: boolean;
	claimed: boolean;
	level: BigNumberish;
	slot_count: BigNumberish;
	slot_min: BigNumberish;
	slot_max: BigNumberish;
	number: BigNumberish;
	next_number: BigNumberish;
	tournament_id: BigNumberish;
	powers: BigNumberish;
	reward: BigNumberish;
	score: BigNumberish;
	slots: BigNumberish;
}

// Type definition for `nums::models::index::Leaderboard` struct
export interface Leaderboard {
	tournament_id: BigNumberish;
	capacity: BigNumberish;
	requirement: BigNumberish;
	games: Array<BigNumberish>;
}

// Type definition for `nums::models::index::Merkledrop` struct
export interface Merkledrop {
	id: BigNumberish;
	active: boolean;
	end: BigNumberish;
}

// Type definition for `nums::models::index::Prize` struct
export interface Prize {
	tournament_id: BigNumberish;
	address: BigNumberish;
	amount: BigNumberish;
}

// Type definition for `nums::models::index::Reward` struct
export interface Reward {
	tournament_id: BigNumberish;
	address: BigNumberish;
	game_id: BigNumberish;
	claimed: boolean;
}

// Type definition for `nums::models::index::Setting` struct
export interface Setting {
	id: BigNumberish;
	slot_count: BigNumberish;
	slot_min: BigNumberish;
	slot_max: BigNumberish;
	powers: BigNumberish;
	name: string;
	description: string;
	created_by: string;
	created_at: BigNumberish;
}

// Type definition for `nums::models::index::Starterpack` struct
export interface Starterpack {
	id: BigNumberish;
	referral_percentage: BigNumberish;
	price: BigNumberish;
	payment_token: string;
}

// Type definition for `nums::models::index::Tournament` struct
export interface Tournament {
	id: BigNumberish;
	powers: BigNumberish;
	entry_count: BigNumberish;
	start_time: BigNumberish;
	end_time: BigNumberish;
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

// Type definition for `game_components_metagame::extensions::context::structs::GameContext` struct
export interface GameContext {
	name: string;
	value: string;
}

// Type definition for `game_components_metagame::extensions::context::structs::GameContextDetails` struct
export interface GameContextDetails {
	name: string;
	description: string;
	id: CairoOption<BigNumberish>;
	context: Array<GameContext>;
}

// Type definition for `game_components_minigame::extensions::settings::structs::GameSetting` struct
export interface GameSetting {
	name: string;
	value: string;
}

// Type definition for `game_components_minigame::extensions::settings::structs::GameSettingDetails` struct
export interface GameSettingDetails {
	name: string;
	description: string;
	settings: Array<GameSetting>;
}

// Type definition for `game_components_minigame::structs::GameDetail` struct
export interface GameDetail {
	name: string;
	value: string;
}

// Type definition for `nums::interfaces::starterpack::StarterPackMetadata` struct
export interface StarterPackMetadata {
	name: string;
	description: string;
	image_uri: string;
}

// Type definition for `openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::RoleAdminChanged` struct
export interface RoleAdminChanged {
	role: BigNumberish;
	previous_admin_role: BigNumberish;
	new_admin_role: BigNumberish;
}

// Type definition for `openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::RoleGranted` struct
export interface RoleGranted {
	role: BigNumberish;
	account: string;
	sender: string;
}

// Type definition for `openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::RoleGrantedWithDelay` struct
export interface RoleGrantedWithDelay {
	role: BigNumberish;
	account: string;
	sender: string;
	delay: BigNumberish;
}

// Type definition for `openzeppelin_access::accesscontrol::accesscontrol::AccessControlComponent::RoleRevoked` struct
export interface RoleRevoked {
	role: BigNumberish;
	account: string;
	sender: string;
}

// Type definition for `openzeppelin_token::erc20::erc20::ERC20Component::Approval` struct
export interface Approval {
	owner: string;
	spender: string;
	value: BigNumberish;
}

// Type definition for `openzeppelin_token::erc20::erc20::ERC20Component::Transfer` struct
export interface Transfer {
	from: string;
	to: string;
	value: BigNumberish;
}

// Type definition for `nums::interfaces::vrf::Source` enum
export const source = [
	'Nonce',
	'Salt',
] as const;
export type Source = { [key in typeof source[number]]: string };
export type SourceEnum = CairoCustomEnum;

// Type definition for `openzeppelin_access::accesscontrol::interface::RoleStatus` enum
export const roleStatus = [
	'NotGranted',
	'Delayed',
	'Effective',
] as const;
export type RoleStatus = { [key in typeof roleStatus[number]]: string };
export type RoleStatusEnum = CairoCustomEnum;

export interface SchemaType extends ISchemaType {
	nums: {
		Config: Config,
		Game: Game,
		Leaderboard: Leaderboard,
		Merkledrop: Merkledrop,
		Prize: Prize,
		Reward: Reward,
		Setting: Setting,
		Starterpack: Starterpack,
		Tournament: Tournament,
		TrophyCreation: TrophyCreation,
		TrophyProgression: TrophyProgression,
		Task: Task,
		GameContext: GameContext,
		GameContextDetails: GameContextDetails,
		GameSetting: GameSetting,
		GameSettingDetails: GameSettingDetails,
		GameDetail: GameDetail,
		StarterPackMetadata: StarterPackMetadata,
		RoleAdminChanged: RoleAdminChanged,
		RoleGranted: RoleGranted,
		RoleGrantedWithDelay: RoleGrantedWithDelay,
		RoleRevoked: RoleRevoked,
		Approval: Approval,
		Transfer: Transfer,
	},
}
export const schema: SchemaType = {
	nums: {
		Config: {
			world_resource: 0,
			nums: "",
			vrf: "",
			starterpack: "",
			forwarder: "",
			owner: "",
			entry_price: 0,
			count: 0,
		},
		Game: {
			id: 0,
			over: false,
			claimed: false,
			level: 0,
			slot_count: 0,
			slot_min: 0,
			slot_max: 0,
			number: 0,
			next_number: 0,
			tournament_id: 0,
			powers: 0,
			reward: 0,
			score: 0,
			slots: 0,
		},
		Leaderboard: {
			tournament_id: 0,
			capacity: 0,
			requirement: 0,
			games: [0],
		},
		Merkledrop: {
			id: 0,
			active: false,
			end: 0,
		},
		Prize: {
			tournament_id: 0,
			address: 0,
			amount: 0,
		},
		Reward: {
			tournament_id: 0,
			address: 0,
			game_id: 0,
			claimed: false,
		},
		Setting: {
			id: 0,
			slot_count: 0,
			slot_min: 0,
			slot_max: 0,
			powers: 0,
		name: "",
		description: "",
			created_by: "",
			created_at: 0,
		},
		Starterpack: {
			id: 0,
			referral_percentage: 0,
		price: 0,
			payment_token: "",
		},
		Tournament: {
			id: 0,
			powers: 0,
			entry_count: 0,
			start_time: 0,
			end_time: 0,
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
		GameContext: {
		name: "",
		value: "",
		},
		GameContextDetails: {
		name: "",
		description: "",
			id: new CairoOption(CairoOptionVariant.None),
			context: [{ name: "", value: "", }],
		},
		GameSetting: {
		name: "",
		value: "",
		},
		GameSettingDetails: {
		name: "",
		description: "",
			settings: [{ name: "", value: "", }],
		},
		GameDetail: {
		name: "",
		value: "",
		},
		StarterPackMetadata: {
		name: "",
		description: "",
		image_uri: "",
		},
		RoleAdminChanged: {
			role: 0,
			previous_admin_role: 0,
			new_admin_role: 0,
		},
		RoleGranted: {
			role: 0,
			account: "",
			sender: "",
		},
		RoleGrantedWithDelay: {
			role: 0,
			account: "",
			sender: "",
			delay: 0,
		},
		RoleRevoked: {
			role: 0,
			account: "",
			sender: "",
		},
		Approval: {
			owner: "",
			spender: "",
		value: 0,
		},
		Transfer: {
			from: "",
			to: "",
		value: 0,
		},
	},
};
export enum ModelsMapping {
	Config = 'nums-Config',
	Game = 'nums-Game',
	Leaderboard = 'nums-Leaderboard',
	Merkledrop = 'nums-Merkledrop',
	Prize = 'nums-Prize',
	Reward = 'nums-Reward',
	Setting = 'nums-Setting',
	Starterpack = 'nums-Starterpack',
	Tournament = 'nums-Tournament',
	TrophyCreation = 'achievement-TrophyCreation',
	TrophyProgression = 'achievement-TrophyProgression',
	Task = 'achievement-Task',
	GameContext = 'game_components_metagame-GameContext',
	GameContextDetails = 'game_components_metagame-GameContextDetails',
	GameSetting = 'game_components_minigame-GameSetting',
	GameSettingDetails = 'game_components_minigame-GameSettingDetails',
	GameDetail = 'game_components_minigame-GameDetail',
	StarterPackMetadata = 'nums-StarterPackMetadata',
	Source = 'nums-Source',
	RoleAdminChanged = 'openzeppelin_access-RoleAdminChanged',
	RoleGranted = 'openzeppelin_access-RoleGranted',
	RoleGrantedWithDelay = 'openzeppelin_access-RoleGrantedWithDelay',
	RoleRevoked = 'openzeppelin_access-RoleRevoked',
	RoleStatus = 'openzeppelin_access-RoleStatus',
	Approval = 'openzeppelin_token-Approval',
	Transfer = 'openzeppelin_token-Transfer',
}