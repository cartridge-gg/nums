#[starknet::component]
pub mod ERC4906Component {
    use collection::components::erc4906::interface::IERC4906_ID;
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::introspection::src5::SRC5Component::InternalImpl as SRC5InternalImpl;

    #[storage]
    pub struct Storage {}

    #[event]
    #[derive(Drop, PartialEq, starknet::Event)]
    pub enum Event {
        MetadataUpdate: MetadataUpdate,
        BatchMetadataUpdate: BatchMetadataUpdate,
    }

    #[derive(Drop, PartialEq, starknet::Event)]
    pub struct MetadataUpdate {
        #[key]
        pub token_id: u256,
    }

    #[derive(Drop, PartialEq, starknet::Event)]
    pub struct BatchMetadataUpdate {
        #[key]
        pub from_token_id: u256,
        #[key]
        pub to_token_id: u256,
    }

    #[generate_trait]
    pub impl InternalImpl<
        TContractState,
        +HasComponent<TContractState>,
        +Drop<TContractState>,
        impl SRC5: SRC5Component::HasComponent<TContractState>,
    > of InternalTrait<TContractState> {
        fn initializer(ref self: ComponentState<TContractState>) {
            let mut src5 = get_dep_component_mut!(ref self, SRC5);
            src5.register_interface(IERC4906_ID);
        }

        fn update_metadata(ref self: ComponentState<TContractState>, token_id: u256) {
            self.emit(MetadataUpdate { token_id });
        }

        fn update_batch_metadata(
            ref self: ComponentState<TContractState>, from_token_id: u256, to_token_id: u256,
        ) {
            self.emit(BatchMetadataUpdate { from_token_id, to_token_id });
        }
    }
}
