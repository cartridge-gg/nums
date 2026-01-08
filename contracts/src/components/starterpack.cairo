#[starknet::component]
pub mod StarterpackComponent {
    // Imports

    use dojo::world::WorldStorage;
    use crate::interfaces::starterpack::IStarterpackDispatcherTrait;
    use crate::models::config;
    use crate::models::config::ConfigAssert;
    use crate::models::starterpack::{StarterpackAssert, StarterpackTrait};
    use crate::{StoreImpl, StoreTrait};

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
            // [Interaction] Register starterpack
            let starterpack_disp = store.starterpack_disp();
            let nums_address = store.nums_disp().contract_address;
            let payment_token = store.quote_disp().contract_address;
            let reissuable = true;
            let referral_percentage = 0;
            let price = config.entry_price.into();
            let default_id = starterpack_disp
                .register(
                    implementation: starknet::get_contract_address(),
                    referral_percentage: 0,
                    reissuable: reissuable,
                    price: price,
                    payment_token: payment_token,
                    metadata: StarterpackTrait::metadata(nums_address),
                );
            // [Effect] Create default starterpack
            let default = StarterpackTrait::new(
                default_id, reissuable, referral_percentage, price, payment_token,
            );
            store.set_starterpack(@default);
            // [Interaction] Register free starterpack
            let reissuable = false;
            let referral_percentage = 0;
            let price = 0;
            let free_id = starterpack_disp
                .register(
                    implementation: starknet::get_contract_address(),
                    referral_percentage: referral_percentage,
                    reissuable: reissuable,
                    price: price,
                    payment_token: payment_token,
                    metadata: StarterpackTrait::metadata(nums_address),
                );
            // [Effect] Create free starterpack
            let free = StarterpackTrait::new(
                free_id, reissuable, referral_percentage, price, payment_token,
            );
            store.set_starterpack(@free);
        }

        fn register(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            payment_token: starknet::ContractAddress,
            reissuable: bool,
            referral_percentage: u8,
            price: u256,
        ) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Check] Caller is allowed
            let config = store.config();
            let caller = starknet::get_caller_address();
            config.assert_is_owner(caller);

            // [Interaction] Register starterpack
            let nums_address = store.nums_disp().contract_address;
            let starterpack_id = store
                .starterpack_disp()
                .register(
                    implementation: starknet::get_contract_address(),
                    referral_percentage: referral_percentage,
                    reissuable: reissuable,
                    price: price,
                    payment_token: payment_token,
                    metadata: StarterpackTrait::metadata(nums_address),
                );

            // [Effect] Create starterpack
            let starterpack = StarterpackTrait::new(
                starterpack_id, reissuable, referral_percentage, price, payment_token,
            );
            store.set_starterpack(@starterpack);
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
            store.starterpack(starterpack_id).assert_does_exist();

            // [Interaction] Update metadata
            let nums_address = store.nums_disp().contract_address;
            let starterpack_disp = store.starterpack_disp();
            starterpack_disp
                .update_metadata(starterpack_id, StarterpackTrait::metadata(nums_address));
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
