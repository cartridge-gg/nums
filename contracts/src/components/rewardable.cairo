#[starknet::component]
pub mod RewardableComponent {
    // Imports

    use dojo::world::WorldStorage;
    use crate::constants::{TEN_POW_36, WORLD_RESOURCE};
    use crate::models::position::{PositionAssert, PositionTrait};
    use crate::models::vault::{VaultAssert, VaultTrait};
    use crate::{StoreImpl, StoreTrait};

    // Constants

    pub const MULTIPLIER: u256 = 100000;
    pub const STARTERPACK_COUNT: u8 = 10;
    pub const REFERRAL_PERCENTAGE: u8 = 5;

    // Storage

    #[storage]
    pub struct Storage {}

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {}

    #[generate_trait]
    pub impl InternalImpl<
        TContractState, +HasComponent<TContractState>,
    > of InternalTrait<TContractState> {
        fn initialize(
            ref self: ComponentState<TContractState>, world: WorldStorage, open: bool, fee: u16,
        ) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);
            // [Effect] Create vault
            let vault = VaultTrait::new(world_resource: WORLD_RESOURCE, open: open, fee: fee);
            store.set_vault(@vault);
        }

        fn assert_not_locked(
            ref self: ComponentState<TContractState>, world: WorldStorage, user: felt252,
        ) {
            // [Setup] Store
            let store = StoreImpl::new(world);
            // [Check] Position is not locked
            let position = store.position(user);
            position.assert_not_locked();
        }

        fn assert_is_open(ref self: ComponentState<TContractState>, world: WorldStorage) {
            // [Setup] Store
            let store = StoreImpl::new(world);
            // [Check] Vault is open
            let vault = store.vault();
            vault.assert_is_open();
        }

        fn assert_is_closed(ref self: ComponentState<TContractState>, world: WorldStorage) {
            // [Setup] Store
            let store = StoreImpl::new(world);
            // [Check] Vault is closed
            let vault = store.vault();
            vault.assert_is_closed();
        }

        fn exit_fee(self: @ComponentState<TContractState>, world: WorldStorage) -> u16 {
            // [Setup] Store
            let store = StoreImpl::new(world);
            // [Return] Exit fee
            store.vault().fee
        }

        fn claimable(
            self: @ComponentState<TContractState>, world: WorldStorage, user: felt252, shares: u256,
        ) -> u256 {
            // [Setup] Store
            let store = StoreImpl::new(world);
            // [Return] Claimable rewards
            let position = store.position(user);
            position.claimable(shares, store.vault().total_reward) / TEN_POW_36.into()
        }

        fn time_lock(
            self: @ComponentState<TContractState>, world: WorldStorage, user: felt252,
        ) -> u64 {
            // [Setup] Store
            let store = StoreImpl::new(world);
            // [Return] Lockup time
            store.position(user).time_lock
        }

        fn stake(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            user: felt252,
            shares: u256,
        ) {
            // [Setup] Store
            let store = StoreImpl::new(world);
            // [Effect] Update lock time
            let mut position = store.position(user);
            position.lock(user);
            // [Effect] Update position
            position.update(shares, store.vault().total_reward);
            store.set_position(@position);
        }

        fn unstake(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            user: felt252,
            shares: u256,
        ) {
            // [Setup] Store
            let store = StoreImpl::new(world);
            // [Check] Position is not locked
            let mut position = store.position(user);
            position.assert_not_locked();
            // [Effect] Update position
            position.update(shares, store.vault().total_reward);
            store.set_position(@position);
        }

        fn lock(ref self: ComponentState<TContractState>, world: WorldStorage, user: felt252) {
            // [Setup] Store
            let store = StoreImpl::new(world);
            // [Effect] Lock vault
            let mut position = store.position(user);
            position.lock(user);
            store.set_position(@position);
        }

        fn pay(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            amount: u256,
            total_shares: u256,
        ) {
            // [Check] Amount is not zero
            if amount == 0 {
                return;
            }
            // [Setup] Store
            let store = StoreImpl::new(world);
            // [Check] Shares are not zero
            assert(total_shares != 0, 'Rewardable: vault is empty');
            // [Effect] Update total rewards
            let mut vault = store.vault();
            let reward = amount * TEN_POW_36.into() / total_shares;
            vault.add(reward);
            store.set_vault(@vault);
        }

        fn claim(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            user: felt252,
            shares: u256,
        ) -> u256 {
            // [Setup] Store
            let store = StoreImpl::new(world);
            // [Effect] Compute claimable amount
            let mut position = store.position(user);
            let total_reward = store.vault().total_reward;
            let amount = position.claimable(shares, total_reward) / TEN_POW_36.into();
            // [Effect] Claim rewards
            position.claim(total_reward);
            store.set_position(@position);
            // [Return] Claimable amount
            amount
        }

        fn set_fee(ref self: ComponentState<TContractState>, world: WorldStorage, fee: u16) {
            // [Setup] Store
            let store = StoreImpl::new(world);
            // [Effect] Set fee
            let mut vault = store.vault();
            vault.set_fee(fee);
            store.set_vault(@vault);
        }

        fn open(ref self: ComponentState<TContractState>, world: WorldStorage) {
            // [Setup] Store
            let store = StoreImpl::new(world);
            // [Effect] Open vault
            let mut vault = store.vault();
            vault.open();
            store.set_vault(@vault);
        }

        fn close(ref self: ComponentState<TContractState>, world: WorldStorage) {
            // [Setup] Store
            let store = StoreImpl::new(world);
            // [Effect] Close vault
            let mut vault = store.vault();
            vault.close();
            store.set_vault(@vault);
        }
    }
}
