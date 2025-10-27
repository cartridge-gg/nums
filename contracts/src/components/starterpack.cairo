#[starknet::component]
pub mod StarterpackComponent {
    // Imports

    use dojo::world::WorldStorage;
    use crate::constants::{DESCRIPTION, IMAGE, NAME, TEN_POW_18};
    use crate::interfaces::starterpack::{IStarterpackDispatcherTrait, StarterPackMetadata};
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
            let referral_percentage = 0;
            let price = (config.entry_price * TEN_POW_18).into();
            let payment_token = store.nums_disp().contract_address;
            let starterpack_id = store
                .starterpack_disp()
                .register(
                    implementation: starknet::get_contract_address(),
                    referral_percentage: referral_percentage,
                    reissuable: false,
                    price: price,
                    payment_token: payment_token,
                    metadata: StarterPackMetadata {
                        name: NAME(), description: DESCRIPTION(), image_uri: IMAGE(),
                    },
                );
            // [Effect] Create starterpack
            let starterpack = StarterpackTrait::new(
                starterpack_id, referral_percentage, price, payment_token,
            );
            store.set_starterpack(@starterpack);
        }

        fn register(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            starterpack_id: u32,
            referral_percentage: u8,
            price: u256,
        ) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Check] Caller is allowed
            let config = store.config();
            let caller = starknet::get_caller_address();
            config.assert_is_owner(caller);

            // [Check] Starterpack does not exist
            let starterpack = store.starterpack(starterpack_id);
            starterpack.assert_not_exist();

            // [Effect] Create starterpack
            let payment_token = store.nums_disp().contract_address;
            let starterpack = StarterpackTrait::new(
                starterpack_id, referral_percentage, price, payment_token,
            );
            store.set_starterpack(@starterpack);
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
