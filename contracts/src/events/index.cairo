#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct Purchased {
    #[key]
    pub player_id: felt252,
    pub starterpack_id: u32,
    pub quantity: u32,
    pub multiplier: u128,
    pub time: u64,
    pub price: u256,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct Started {
    #[key]
    pub player_id: felt252,
    #[key]
    pub game_id: u64,
    pub multiplier: u128,
    pub time: u64,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct Claimed {
    #[key]
    pub player_id: felt252,
    #[key]
    pub game_id: u64,
    pub reward: u128,
    pub time: u64,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct VaultPaid {
    #[key]
    pub player_id: felt252,
    pub amount: u256,
    pub time: u64,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct VaultClaimed {
    #[key]
    pub user: felt252,
    pub amount: u256,
    pub time: u64,
}

/// Emitted by Setup.issue (bridge mode) when a purchase is paid for on
/// mainnet and a game-mint Piltover message has been queued for the appchain.
#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct PurchaseInitiated {
    #[key]
    pub purchase_id: u64,
    pub recipient: starknet::ContractAddress,
    pub bundle_id: u32,
    pub quantity: u32,
    pub time: u64,
}

/// Emitted by Setup.apply_game_claim_batch when a claim message from the
/// appchain has been consumed: EMA updated, NUMS minted to player,
/// PendingPurchase marked Materialized.
#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct GameClaimApplied {
    #[key]
    pub purchase_id: u64,
    pub player: starknet::ContractAddress,
    pub level: u32,
    pub weight: u16,
    pub reward_amount: u128,
    pub time: u64,
}
