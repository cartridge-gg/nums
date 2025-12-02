import type { SchemaType as ISchemaType } from "@dojoengine/sdk";

import { CairoCustomEnum, CairoOption, CairoOptionVariant, BigNumberish } from 'starknet';

// Type definition for `achievement::models::index::AchievementAdvancement` struct
export interface AchievementAdvancement {
	player_id: BigNumberish;
	achievement_id: BigNumberish;
	task_id: BigNumberish;
	count: BigNumberish;
	timestamp: BigNumberish;
}

// Type definition for `achievement::models::index::AchievementAssociation` struct
export interface AchievementAssociation {
	task_id: BigNumberish;
	achievements: Array<BigNumberish>;
}

// Type definition for `achievement::models::index::AchievementCompletion` struct
export interface AchievementCompletion {
	player_id: BigNumberish;
	achievement_id: BigNumberish;
	timestamp: BigNumberish;
	unclaimed: boolean;
}

// Type definition for `achievement::models::index::AchievementDefinition` struct
export interface AchievementDefinition {
	id: BigNumberish;
	rewarder: string;
	start: BigNumberish;
	end: BigNumberish;
	tasks: Array<Task>;
}

// Type definition for `achievement::types::task::Task` struct
export interface Task {
	id: BigNumberish;
	total: BigNumberish;
	description: string;
}

// Type definition for `nums::models::index::Claim` struct
export interface Claim {
	player: BigNumberish;
	starterpack_id: BigNumberish;
	claimed: boolean;
}

// Type definition for `nums::models::index::Config` struct
export interface Config {
	world_resource: BigNumberish;
	nums: string;
	vrf: string;
	starterpack: string;
	owner: string;
	entry_price: BigNumberish;
	target_supply: BigNumberish;
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
	selected_powers: BigNumberish;
	available_powers: BigNumberish;
	score: BigNumberish;
	reward: BigNumberish;
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
	reissuable: boolean;
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
	usage: BigNumberish;
}

// Type definition for `nums::models::index::Usage` struct
export interface Usage {
	world_resource: BigNumberish;
	last_update: BigNumberish;
	board: BigNumberish;
}

// Type definition for `quest::models::index::QuestAdvancement` struct
export interface QuestAdvancement {
	player_id: BigNumberish;
	quest_id: BigNumberish;
	task_id: BigNumberish;
	interval_id: BigNumberish;
	count: BigNumberish;
	timestamp: BigNumberish;
}

// Type definition for `quest::models::index::QuestAssociation` struct
export interface QuestAssociation {
	task_id: BigNumberish;
	quests: Array<BigNumberish>;
}

// Type definition for `quest::models::index::QuestCompletion` struct
export interface QuestCompletion {
	player_id: BigNumberish;
	quest_id: BigNumberish;
	interval_id: BigNumberish;
	timestamp: BigNumberish;
	unclaimed: boolean;
	lock_count: BigNumberish;
}

// Type definition for `quest::models::index::QuestCondition` struct
export interface QuestCondition {
	quest_id: BigNumberish;
	quests: Array<BigNumberish>;
}

// Type definition for `quest::models::index::QuestDefinition` struct
export interface QuestDefinition {
	id: BigNumberish;
	rewarder: string;
	start: BigNumberish;
	end: BigNumberish;
	duration: BigNumberish;
	interval: BigNumberish;
	tasks: Array<Task>;
	conditions: Array<BigNumberish>;
}

// Type definition for `quest::types::task::Task` struct
export interface Task {
	id: BigNumberish;
	total: BigNumberish;
	description: string;
}

// Type definition for `achievement::events::index::AchievementClaimed` struct
export interface AchievementClaimed {
	player_id: BigNumberish;
	achievement_id: BigNumberish;
	time: BigNumberish;
}

// Type definition for `achievement::events::index::AchievementCompleted` struct
export interface AchievementCompleted {
	player_id: BigNumberish;
	achievement_id: BigNumberish;
	time: BigNumberish;
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

// Type definition for `leaderboard::events::index::LeaderboardScore` struct
export interface LeaderboardScore {
	leaderboard_id: BigNumberish;
	game_id: BigNumberish;
	player: BigNumberish;
	score: BigNumberish;
	timestamp: BigNumberish;
}

// Type definition for `nums::events::index::GameReward` struct
export interface GameReward {
	game_id: BigNumberish;
	reward: BigNumberish;
}

// Type definition for `quest::events::index::QuestClaimed` struct
export interface QuestClaimed {
	player_id: BigNumberish;
	quest_id: BigNumberish;
	interval_id: BigNumberish;
	time: BigNumberish;
}

// Type definition for `quest::events::index::QuestCompleted` struct
export interface QuestCompleted {
	player_id: BigNumberish;
	quest_id: BigNumberish;
	interval_id: BigNumberish;
	time: BigNumberish;
}

// Type definition for `quest::events::index::QuestCreation` struct
export interface QuestCreation {
	id: BigNumberish;
	definition: QuestDefinition;
	metadata: string;
}

// Type definition for `quest::events::index::QuestProgression` struct
export interface QuestProgression {
	player_id: BigNumberish;
	task_id: BigNumberish;
	count: BigNumberish;
	time: BigNumberish;
}

// Type definition for `quest::events::index::QuestUnlocked` struct
export interface QuestUnlocked {
	player_id: BigNumberish;
	quest_id: BigNumberish;
	interval_id: BigNumberish;
	time: BigNumberish;
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

export interface SchemaType extends ISchemaType {
	nums: {
		AchievementAdvancement: AchievementAdvancement,
		AchievementAssociation: AchievementAssociation,
		AchievementCompletion: AchievementCompletion,
		AchievementDefinition: AchievementDefinition,
		Task: Task,
		Claim: Claim,
		Config: Config,
		Game: Game,
		Leaderboard: Leaderboard,
		Merkledrop: Merkledrop,
		Prize: Prize,
		Reward: Reward,
		Setting: Setting,
		Starterpack: Starterpack,
		Tournament: Tournament,
		Usage: Usage,
		QuestAdvancement: QuestAdvancement,
		QuestAssociation: QuestAssociation,
		QuestCompletion: QuestCompletion,
		QuestCondition: QuestCondition,
		QuestDefinition: QuestDefinition,
		AchievementClaimed: AchievementClaimed,
		AchievementCompleted: AchievementCompleted,
		TrophyCreation: TrophyCreation,
		TrophyProgression: TrophyProgression,
		LeaderboardScore: LeaderboardScore,
		GameReward: GameReward,
		QuestClaimed: QuestClaimed,
		QuestCompleted: QuestCompleted,
		QuestCreation: QuestCreation,
		QuestProgression: QuestProgression,
		QuestUnlocked: QuestUnlocked,
		GameContext: GameContext,
		GameContextDetails: GameContextDetails,
		GameSetting: GameSetting,
		GameSettingDetails: GameSettingDetails,
		GameDetail: GameDetail,
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
		AchievementAdvancement: {
			player_id: 0,
			achievement_id: 0,
			task_id: 0,
			count: 0,
			timestamp: 0,
		},
		AchievementAssociation: {
			task_id: 0,
			achievements: [0],
		},
		AchievementCompletion: {
			player_id: 0,
			achievement_id: 0,
			timestamp: 0,
			unclaimed: false,
		},
		AchievementDefinition: {
			id: 0,
			rewarder: "",
			start: 0,
			end: 0,
			tasks: [{ id: 0, total: 0, description: "", }],
		},
		Task: {
			id: 0,
			total: 0,
		description: "",
		},
		Claim: {
			player: 0,
			starterpack_id: 0,
			claimed: false,
		},
		Config: {
			world_resource: 0,
			nums: "",
			vrf: "",
			starterpack: "",
			owner: "",
			entry_price: 0,
		target_supply: 0,
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
			selected_powers: 0,
			available_powers: 0,
			score: 0,
			reward: 0,
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
			reissuable: false,
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
			usage: 0,
		},
		Usage: {
			world_resource: 0,
			last_update: 0,
			board: 0,
		},
		QuestAdvancement: {
			player_id: 0,
			quest_id: 0,
			task_id: 0,
			interval_id: 0,
			count: 0,
			timestamp: 0,
		},
		QuestAssociation: {
			task_id: 0,
			quests: [0],
		},
		QuestCompletion: {
			player_id: 0,
			quest_id: 0,
			interval_id: 0,
			timestamp: 0,
			unclaimed: false,
			lock_count: 0,
		},
		QuestCondition: {
			quest_id: 0,
			quests: [0],
		},
		QuestDefinition: {
			id: 0,
			rewarder: "",
			start: 0,
			end: 0,
			duration: 0,
			interval: 0,
			tasks: [{ id: 0, total: 0, description: "", }],
			conditions: [0],
		},
		AchievementClaimed: {
			player_id: 0,
			achievement_id: 0,
			time: 0,
		},
		AchievementCompleted: {
			player_id: 0,
			achievement_id: 0,
			time: 0,
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
		LeaderboardScore: {
			leaderboard_id: 0,
			game_id: 0,
			player: 0,
			score: 0,
			timestamp: 0,
		},
		GameReward: {
			game_id: 0,
			reward: 0,
		},
		QuestClaimed: {
			player_id: 0,
			quest_id: 0,
			interval_id: 0,
			time: 0,
		},
		QuestCompleted: {
			player_id: 0,
			quest_id: 0,
			interval_id: 0,
			time: 0,
		},
		QuestCreation: {
			id: 0,
		definition: { id: 0, rewarder: "", start: 0, end: 0, duration: 0, interval: 0, tasks: [{ id: 0, total: 0, description: "", }], conditions: [0], },
		metadata: "",
		},
		QuestProgression: {
			player_id: 0,
			task_id: 0,
			count: 0,
			time: 0,
		},
		QuestUnlocked: {
			player_id: 0,
			quest_id: 0,
			interval_id: 0,
			time: 0,
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
	AchievementAdvancement = 'achievement-AchievementAdvancement',
	AchievementAssociation = 'achievement-AchievementAssociation',
	AchievementCompletion = 'achievement-AchievementCompletion',
	AchievementDefinition = 'achievement-AchievementDefinition',
	Claim = 'nums-Claim',
	Config = 'nums-Config',
	Game = 'nums-Game',
	Leaderboard = 'nums-Leaderboard',
	Merkledrop = 'nums-Merkledrop',
	Prize = 'nums-Prize',
	Reward = 'nums-Reward',
	Setting = 'nums-Setting',
	Starterpack = 'nums-Starterpack',
	Tournament = 'nums-Tournament',
	Usage = 'nums-Usage',
	QuestAdvancement = 'quest-QuestAdvancement',
	QuestAssociation = 'quest-QuestAssociation',
	QuestCompletion = 'quest-QuestCompletion',
	QuestCondition = 'quest-QuestCondition',
	QuestDefinition = 'quest-QuestDefinition',
	AchievementClaimed = 'achievement-AchievementClaimed',
	AchievementCompleted = 'achievement-AchievementCompleted',
	TrophyCreation = 'achievement-TrophyCreation',
	TrophyProgression = 'achievement-TrophyProgression',
	LeaderboardScore = 'leaderboard-LeaderboardScore',
	GameReward = 'nums-GameReward',
	QuestClaimed = 'quest-QuestClaimed',
	QuestCompleted = 'quest-QuestCompleted',
	QuestCreation = 'quest-QuestCreation',
	QuestProgression = 'quest-QuestProgression',
	QuestUnlocked = 'quest-QuestUnlocked',
	GameContext = 'game_components_metagame-GameContext',
	GameContextDetails = 'game_components_metagame-GameContextDetails',
	GameSetting = 'game_components_minigame-GameSetting',
	GameSettingDetails = 'game_components_minigame-GameSettingDetails',
	GameDetail = 'game_components_minigame-GameDetail',
	Source = 'nums-Source',
	RoleAdminChanged = 'openzeppelin_access-RoleAdminChanged',
	RoleGranted = 'openzeppelin_access-RoleGranted',
	RoleGrantedWithDelay = 'openzeppelin_access-RoleGrantedWithDelay',
	RoleRevoked = 'openzeppelin_access-RoleRevoked',
	Approval = 'openzeppelin_token-Approval',
	Transfer = 'openzeppelin_token-Transfer',
}