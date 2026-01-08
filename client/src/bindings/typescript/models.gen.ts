import type { SchemaType as ISchemaType } from "@dojoengine/sdk";

import { CairoCustomEnum, BigNumberish } from 'starknet';

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
	slot_count: BigNumberish;
	slot_min: BigNumberish;
	slot_max: BigNumberish;
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
	selected_powers: BigNumberish;
	available_powers: BigNumberish;
	score: BigNumberish;
	reward: BigNumberish;
	slots: BigNumberish;
	usage: BigNumberish;
	supply: BigNumberish;
}

// Type definition for `nums::models::index::Starterpack` struct
export interface Starterpack {
	id: BigNumberish;
	reissuable: boolean;
	referral_percentage: BigNumberish;
	price: BigNumberish;
	payment_token: string;
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

// Type definition for `nums::events::index::Reward` struct
export interface Reward {
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

// Type definition for `collection::components::erc4906::erc4906::ERC4906Component::BatchMetadataUpdate` struct
export interface BatchMetadataUpdate {
	from_token_id: BigNumberish;
	to_token_id: BigNumberish;
}

// Type definition for `collection::components::erc4906::erc4906::ERC4906Component::MetadataUpdate` struct
export interface MetadataUpdate {
	token_id: BigNumberish;
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

// Type definition for `openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferStarted` struct
export interface OwnershipTransferStarted {
	previous_owner: string;
	new_owner: string;
}

// Type definition for `openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferred` struct
export interface OwnershipTransferred {
	previous_owner: string;
	new_owner: string;
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

// Type definition for `openzeppelin_token::erc721::erc721::ERC721Component::Approval` struct
export interface Approval {
	owner: string;
	approved: string;
	token_id: BigNumberish;
}

// Type definition for `openzeppelin_token::erc721::erc721::ERC721Component::ApprovalForAll` struct
export interface ApprovalForAll {
	owner: string;
	operator: string;
	approved: boolean;
}

// Type definition for `openzeppelin_token::erc721::erc721::ERC721Component::Transfer` struct
export interface Transfer {
	from: string;
	to: string;
	token_id: BigNumberish;
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
		Starterpack: Starterpack,
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
		Reward: Reward,
		QuestClaimed: QuestClaimed,
		QuestCompleted: QuestCompleted,
		QuestCreation: QuestCreation,
		QuestProgression: QuestProgression,
		QuestUnlocked: QuestUnlocked,
		BatchMetadataUpdate: BatchMetadataUpdate,
		MetadataUpdate: MetadataUpdate,
		RoleAdminChanged: RoleAdminChanged,
		RoleGranted: RoleGranted,
		RoleGrantedWithDelay: RoleGrantedWithDelay,
		RoleRevoked: RoleRevoked,
		OwnershipTransferStarted: OwnershipTransferStarted,
		OwnershipTransferred: OwnershipTransferred,
		Approval: Approval,
		Transfer: Transfer,
		ApprovalForAll: ApprovalForAll,
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
			slot_count: 0,
			slot_min: 0,
			slot_max: 0,
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
			selected_powers: 0,
			available_powers: 0,
			score: 0,
			reward: 0,
			slots: 0,
			usage: 0,
			supply: 0,
		},
		Starterpack: {
			id: 0,
			reissuable: false,
			referral_percentage: 0,
		price: 0,
			payment_token: "",
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
		Reward: {
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
		BatchMetadataUpdate: {
		from_token_id: 0,
		to_token_id: 0,
		},
		MetadataUpdate: {
		token_id: 0,
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
		OwnershipTransferStarted: {
			previous_owner: "",
			new_owner: "",
		},
		OwnershipTransferred: {
			previous_owner: "",
			new_owner: "",
		},
		ApprovalForAll: {
			owner: "",
			operator: "",
			approved: false,
		},
		Approval: {
			owner: "",
			approved: "",
			token_id: 0,
			spender: "",
			value: 0,
		},
		Transfer: {
			from: "",
			to: "",
			token_id: 0,
			value: 0,
		},
	},
};
export enum ModelsMapping {
	AchievementAdvancement = 'achievement-AchievementAdvancement',
	AchievementAssociation = 'achievement-AchievementAssociation',
	AchievementCompletion = 'achievement-AchievementCompletion',
	AchievementDefinition = 'achievement-AchievementDefinition',
	Task = 'achievement-Task',
	Claim = 'nums-Claim',
	Config = 'nums-Config',
	Game = 'nums-Game',
	Starterpack = 'nums-Starterpack',
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
	Reward = 'nums-Reward',
	QuestClaimed = 'quest-QuestClaimed',
	QuestCompleted = 'quest-QuestCompleted',
	QuestCreation = 'quest-QuestCreation',
	QuestProgression = 'quest-QuestProgression',
	QuestUnlocked = 'quest-QuestUnlocked',
	BatchMetadataUpdate = 'collection-BatchMetadataUpdate',
	MetadataUpdate = 'collection-MetadataUpdate',
	ContractURIUpdated = 'collection-ContractURIUpdated',
	Source = 'nums-Source',
	RoleAdminChanged = 'openzeppelin_access-RoleAdminChanged',
	RoleGranted = 'openzeppelin_access-RoleGranted',
	RoleGrantedWithDelay = 'openzeppelin_access-RoleGrantedWithDelay',
	RoleRevoked = 'openzeppelin_access-RoleRevoked',
	OwnershipTransferStarted = 'openzeppelin_access-OwnershipTransferStarted',
	OwnershipTransferred = 'openzeppelin_access-OwnershipTransferred',
	Approval = 'openzeppelin_token-Approval',
	Transfer = 'openzeppelin_token-Transfer',
	ApprovalForAll = 'openzeppelin_token-ApprovalForAll',
}