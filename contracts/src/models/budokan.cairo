// SPDX-License-Identifier: BUSL-1.1

use starknet::ContractAddress;

#[derive(Drop, Serde)]
pub struct Tournament {
    #[key]
    pub id: u64,
    pub created_at: u64,
    pub created_by: ContractAddress,
    pub creator_token_id: u64,
    pub metadata: Metadata,
    pub schedule: Schedule,
    pub game_config: GameConfig,
    pub entry_fee: Option<EntryFee>,
    pub entry_requirement: Option<EntryRequirement>,
}

#[derive(Drop, Serde, Introspect)]
pub struct Metadata {
    pub name: felt252,
    pub description: ByteArray,
}

#[derive(Copy, Drop, Serde, Introspect)]
pub struct GameConfig {
    pub address: ContractAddress,
    pub settings_id: u32,
    pub prize_spots: u8,
}

#[derive(Copy, Drop, Serde, PartialEq, Introspect)]
pub struct EntryFee {
    pub token_address: ContractAddress,
    pub amount: u128,
    pub distribution: Span<u8>,
    pub tournament_creator_share: Option<u8>,
    pub game_creator_share: Option<u8>,
}

#[derive(Copy, Drop, Serde, PartialEq, Introspect)]
pub struct EntryRequirement {
    pub entry_limit: u8,
    pub entry_requirement_type: EntryRequirementType,
}

#[derive(Copy, Drop, Serde, PartialEq, Introspect)]
pub enum EntryRequirementType {
    token: ContractAddress,
    tournament: TournamentType,
    allowlist: Span<ContractAddress>,
}

#[dojo::model]
#[derive(Drop, Serde)]
pub struct QualificationEntries {
    #[key]
    pub tournament_id: u64,
    #[key]
    pub qualification_proof: QualificationProof,
    pub entry_count: u8,
}

#[derive(Copy, Drop, Serde, PartialEq, Introspect)]
pub enum TournamentType {
    winners: Span<u64>,
    participants: Span<u64>,
}

#[derive(Copy, Drop, Serde, Introspect)]
pub struct ERC20Data {
    pub amount: u128,
}

#[derive(Copy, Drop, Serde, Introspect)]
pub struct ERC721Data {
    pub id: u128,
}

#[derive(Copy, Drop, Serde, PartialEq, Introspect)]
pub enum TokenType {
    erc20,
    erc721,
}

#[derive(Copy, Drop, Serde, Introspect)]
pub struct TokenData {
    pub token_address: ContractAddress,
    pub token_type: TokenType,
}

#[derive(Copy, Drop, Serde, Introspect)]
pub enum TokenTypeData {
    erc20: ERC20Data,
    erc721: ERC721Data,
}

#[dojo::model]
#[derive(Copy, Drop, Serde, IntrospectPacked)]
pub struct Registration {
    #[key]
    pub game_address: ContractAddress,
    #[key]
    pub game_token_id: u64,
    pub tournament_id: u64,
    pub entry_number: u32,
    pub has_submitted: bool,
}

#[dojo::model]
#[derive(Drop, Serde)]
pub struct Leaderboard {
    #[key]
    pub tournament_id: u64,
    pub token_ids: Array<u64>,
}

#[dojo::model]
#[derive(Copy, Drop, Serde, IntrospectPacked)]
pub struct PlatformMetrics {
    #[key]
    pub key: felt252,
    pub total_tournaments: u64,
}

#[dojo::model]
#[derive(Copy, Drop, Serde, IntrospectPacked)]
pub struct TournamentTokenMetrics {
    #[key]
    pub key: felt252,
    pub total_supply: u64,
}

#[dojo::model]
#[derive(Copy, Drop, Serde, IntrospectPacked)]
pub struct PrizeMetrics {
    #[key]
    pub key: felt252,
    pub total_prizes: u64,
}

#[dojo::model]
#[derive(Copy, Drop, Serde, IntrospectPacked)]
pub struct EntryCount {
    #[key]
    pub tournament_id: u64,
    pub count: u32,
}

#[derive(Copy, Drop, Serde)]
pub struct Prize {
    #[key]
    pub id: u64,
    pub tournament_id: u64,
    pub payout_position: u8,
    pub token_address: ContractAddress,
    pub token_type: TokenTypeData,
    pub sponsor_address: ContractAddress,
}

#[derive(Drop, Serde)]
pub struct Token {
    #[key]
    pub address: ContractAddress,
    pub name: ByteArray,
    pub symbol: ByteArray,
    pub token_type: TokenType,
    pub is_registered: bool,
}

#[dojo::model]
#[derive(Copy, Drop, Serde, IntrospectPacked)]
pub struct PrizeClaim {
    #[key]
    pub tournament_id: u64,
    #[key]
    pub prize_type: PrizeType,
    pub claimed: bool,
}

#[derive(Copy, Drop, Serde, PartialEq, Introspect)]
pub enum Role {
    TournamentCreator,
    GameCreator,
    Position: u8,
}

#[derive(Copy, Drop, Serde, PartialEq, Introspect)]
pub enum PrizeType {
    EntryFees: Role,
    Sponsored: u64,
}

#[derive(Copy, Drop, Serde, PartialEq, Introspect)]
pub enum QualificationProof {
    // For qualifying via previous tournament
    Tournament: TournamentQualification,
    // For qualifying via NFT ownership
    NFT: NFTQualification,
    Address: ContractAddress,
}

#[derive(Copy, Drop, Serde, PartialEq, Introspect)]
pub struct TournamentQualification {
    pub tournament_id: u64,
    pub token_id: u64,
    pub position: u8,
}

#[derive(Copy, Drop, Serde, PartialEq, Introspect)]
pub struct NFTQualification {
    pub token_id: u256,
}

#[derive(Copy, Drop, Serde, PartialEq, Introspect)]
pub struct Schedule {
    pub registration: Option<Period>,
    pub game: Period,
    pub submission_duration: u64,
}

#[derive(Copy, Drop, Serde, PartialEq, Introspect)]
pub struct Period {
    pub start: u64,
    pub end: u64,
}

#[derive(Copy, Drop, Serde, PartialEq, Introspect)]
pub enum Phase {
    Scheduled,
    Registration,
    Staging,
    Live,
    Submission,
    Finalized,
}
