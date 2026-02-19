#[starknet::component]
pub mod StarterpackComponent {
    // Imports

    use dojo::world::WorldStorage;
    use crate::interfaces::registry::IStarterpackRegistryDispatcherTrait;
    use crate::models::config;
    use crate::models::config::ConfigAssert;
    use crate::models::starterpack::{StarterpackAssert, StarterpackTrait};
    use crate::{StoreImpl, StoreTrait};

    // Constants

    pub const MULTIPLIER: u256 = 100000;
    pub const STARTERPACK_COUNT: u8 = 10;

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
        fn initialize(ref self: ComponentState<TContractState>, world: WorldStorage) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);
            let config = store.config();
            // [Effect] Register and store all starterpacks
            let starterpack_disp = store.starterpack_disp();
            let nums_address = store.nums_disp().contract_address;
            let payment_token = store.quote_disp().contract_address;
            let reissuable = true;
            let referral_percentage = 0;
            let base_price = config.entry_price.into();
            for index in 0..STARTERPACK_COUNT {
                // [Interaction] Register starterpack
                let multiplier: u8 = index + 1;
                let stake: u256 = multiplier.into();
                let price = stake
                    * base_price
                    * (MULTIPLIER - stake * MULTIPLIER / 100)
                    / MULTIPLIER;
                let starterpack_id = starterpack_disp
                    .register(
                        implementation: starknet::get_contract_address(),
                        referral_percentage: 0,
                        reissuable: reissuable,
                        price: price,
                        payment_token: payment_token,
                        payment_receiver: None,
                        metadata: StarterpackTrait::metadata(nums_address, multiplier),
                    );
                // [Effect] Create starterpack
                let pack = StarterpackTrait::new(
                    id: starterpack_id,
                    reissuable: reissuable,
                    referral_percentage: referral_percentage,
                    price: price,
                    payment_token: payment_token,
                    multiplier: multiplier,
                );
                store.set_starterpack(@pack);
            };
        }

        fn update(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            starterpack_id: u32,
            reissuable: bool,
            payment_token: starknet::ContractAddress,
            referral_percentage: u8,
            price: u256,
        ) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Check] Caller is allowed
            let config = store.config();
            let caller = starknet::get_caller_address();
            config.assert_is_owner(caller);

            // [Check] Starterpack does exist
            let mut starterpack = store.starterpack(starterpack_id);
            starterpack.assert_does_exist();

            // [Effect] Update starterpack
            starterpack.update(reissuable, referral_percentage, price, payment_token);
            store.set_starterpack(@starterpack);

            // [Interaction] Update starterpack
            store
                .starterpack_disp()
                .update(
                    starterpack_id: starterpack_id,
                    implementation: starknet::get_contract_address(),
                    referral_percentage: referral_percentage,
                    reissuable: reissuable,
                    price: price,
                    payment_token: payment_token,
                    payment_receiver: None,
                );
        }

        fn update_metadata(
            ref self: ComponentState<TContractState>, world: WorldStorage, starterpack_id: u32,
        ) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Check] Caller is allowed
            store.config().assert_is_owner(starknet::get_caller_address());

            // [Check] Starterpack does exist
            let pack = store.starterpack(starterpack_id);
            pack.assert_does_exist();

            // [Interaction] Update metadata
            let nums_address = store.nums_disp().contract_address;
            let starterpack_disp = store.starterpack_disp();
            starterpack_disp
                .update_metadata(
                    starterpack_id, StarterpackTrait::metadata(nums_address, pack.multiplier),
                );
        }

        fn remove(
            ref self: ComponentState<TContractState>, world: WorldStorage, starterpack_id: u32,
        ) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Check] Caller is allowed
            self.assert_is_allowed(world);

            // [Check] Starterpack does exist
            let mut starterpack = store.starterpack(starterpack_id);
            starterpack.assert_does_exist();

            // [Effect] Remove starterpack
            starterpack.remove();
            store.set_starterpack(@starterpack);
        }

        fn assert_is_allowed(self: @ComponentState<TContractState>, world: WorldStorage) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Check] Caller is starkerpack
            let config = store.config();
            let caller = starknet::get_caller_address();
            config.assert_is_starterpack(caller);
        }

        fn assert_is_valid(
            self: @ComponentState<TContractState>, world: WorldStorage, starterpack_id: u32,
        ) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Check] Starterpack does exist
            let starterpack = store.starterpack(starterpack_id);
            starterpack.assert_does_exist();
        }
    }
}
