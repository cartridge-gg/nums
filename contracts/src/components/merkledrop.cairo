#[starknet::component]
pub mod MerkledropComponent {
    // Imports

    use dojo::world::WorldStorage;
    use crate::models::config;
    use crate::models::config::ConfigAssert;
    use crate::models::merkledrop::{MerkledropAssert, MerkledropTrait};
    use crate::{StoreImpl, StoreTrait};

    // Constants

    pub const MERKLEDROP_ID: felt252 = 'MERKLEDROP';

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
        fn initialize(ref self: ComponentState<TContractState>, world: WorldStorage, end: u64) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);
            // [Effect] Create merkledrop
            let merkledrop = MerkledropTrait::new(MERKLEDROP_ID, end);
            store.set_merkledrop(@merkledrop);
        }

        fn disable(ref self: ComponentState<TContractState>, world: WorldStorage) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Check] Caller is forwarder
            self.assert_is_allowed(world);

            // [Effect] Disable merkledrop
            let mut merkledrop = store.merkledrop(MERKLEDROP_ID);
            merkledrop.disable();
            store.set_merkledrop(@merkledrop);
        }

        fn assert_is_allowed(self: @ComponentState<TContractState>, world: WorldStorage) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Check] Caller is forwarder
            let config = store.config();
            let caller = starknet::get_caller_address();
            config.assert_is_forwarder(caller);
        }

        fn assert_is_valid(self: @ComponentState<TContractState>, world: WorldStorage) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Check] Merkledrop does exist and not over
            let merkledrop = store.merkledrop(MERKLEDROP_ID);
            merkledrop.assert_does_exist();
            merkledrop.assert_not_over();
        }
    }
}
