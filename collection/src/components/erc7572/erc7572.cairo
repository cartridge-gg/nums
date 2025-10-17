#[starknet::component]
pub mod ERC7572Component {
    use collection::components::erc7572::interface::{IERC7572Metadata, IERC7572_ID};
    use collection::types::contract_metadata::{ContractMetadata, ContractMetadataTrait};
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::introspection::src5::SRC5Component::InternalImpl as SRC5InternalImpl;
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};

    #[storage]
    pub struct Storage {
        ERC7572_contract_uri: ByteArray,
    }

    #[event]
    #[derive(Drop, PartialEq, starknet::Event)]
    pub enum Event {
        ContractURIUpdated: ContractURIUpdated,
    }

    #[derive(Drop, PartialEq, starknet::Event)]
    pub struct ContractURIUpdated {}

    #[embeddable_as(ERC7572Impl)]
    impl ERC7572<
        TContractState,
        +HasComponent<TContractState>,
        +Drop<TContractState>,
        impl SRC5: SRC5Component::HasComponent<TContractState>,
    > of IERC7572Metadata<ComponentState<TContractState>> {
        fn contract_uri(self: @ComponentState<TContractState>) -> ByteArray {
            self.get_contract_uri()
        }
    }

    #[generate_trait]
    pub impl InternalImpl<
        TContractState,
        +HasComponent<TContractState>,
        +Drop<TContractState>,
        impl SRC5: SRC5Component::HasComponent<TContractState>,
    > of InternalTrait<TContractState> {
        fn initializer(ref self: ComponentState<TContractState>) {
            // [Effect] Initialize SRC5
            let mut src5 = get_dep_component_mut!(ref self, SRC5);
            src5.register_interface(IERC7572_ID);
        }

        fn get_contract_uri(self: @ComponentState<TContractState>) -> ByteArray {
            self.ERC7572_contract_uri.read()
        }

        fn set_contract_metadata(
            ref self: ComponentState<TContractState>, metadata: ContractMetadata,
        ) {
            // [Effect] Set the contract metadata
            self.set_contract_uri(metadata.jsonify());
        }

        fn set_contract_uri(ref self: ComponentState<TContractState>, uri: ByteArray) {
            // [Effect] Set the contract URI
            self.ERC7572_contract_uri.write(uri.clone());
            // [Event] Contract URI updated event
            self.emit(ContractURIUpdated {});
        }
    }
}
