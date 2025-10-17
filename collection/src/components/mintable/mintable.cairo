#[starknet::component]
pub mod MintableComponent {
    use core::num::traits::Zero;
    use collection::components::mintable::interface;
    use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::access::ownable::OwnableComponent::InternalImpl as OwnableInternalImpl;
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};
    use starknet::{ContractAddress, get_caller_address};

    #[storage]
    pub struct Storage {
        pub Mintable_minter: ContractAddress,
    }

    pub mod Errors {
        pub const NOT_MINTER: felt252 = 'Caller is not the minter';
        pub const ZERO_ADDRESS_MINTER: felt252 = 'New minter is the zero address';
    }

    #[embeddable_as(MintableImpl)]
    impl Mintable<
        TContractState,
        +HasComponent<TContractState>,
        +Drop<TContractState>,
        impl Ownable: OwnableComponent::HasComponent<TContractState>,
    > of interface::IMintable<ComponentState<TContractState>> {
        /// Returns the address of the current minter.
        fn minter(self: @ComponentState<TContractState>) -> ContractAddress {
            self.Mintable_minter.read()
        }

        /// Transfers ownership of the contract to a new address.
        ///
        /// Requirements:
        ///
        /// - `new_minter` is not the zero address.
        /// - The caller is the contract owner.
        fn transfer_minter(ref self: ComponentState<TContractState>, new_minter: ContractAddress) {
            self.assert_only_owner();
            assert(!new_minter.is_zero(), Errors::ZERO_ADDRESS_MINTER);
            self._transfer_minter(new_minter);
        }

        /// Leaves the contract without an minter. It will not be possible to call
        /// `assert_only_minter` functions anymore. Can only be called by the current owner.
        ///
        /// Requirements:
        ///
        /// - The caller is the contract owner.
        fn renounce_minter(ref self: ComponentState<TContractState>) {
            self.assert_only_owner();
            self._transfer_minter(Zero::zero());
        }
    }

    #[generate_trait]
    pub impl InternalImpl<
        TContractState,
        +HasComponent<TContractState>,
        impl Ownable: OwnableComponent::HasComponent<TContractState>,
    > of InternalTrait<TContractState> {
        /// Sets the contract's initial minter.
        ///
        /// Requirements:
        ///
        /// - `minter` is not the zero address.
        ///
        /// This function should be called at construction time.
        fn initializer(ref self: ComponentState<TContractState>, minter: ContractAddress) {
            assert(!minter.is_zero(), Errors::ZERO_ADDRESS_MINTER);
            self._transfer_minter(minter);
        }

        /// Panics if called by any account other than the owner. Use this
        /// to restrict access to certain functions to the owner.
        fn assert_only_owner(self: @ComponentState<TContractState>) {
            let ownable = get_dep_component!(self, Ownable);
            ownable.assert_only_owner();
        }

        /// Panics if called by any account other than the minter. Use this
        /// to restrict access to certain functions to the minter.
        fn assert_only_minter(self: @ComponentState<TContractState>) {
            let minter = self.Mintable_minter.read();
            let caller = get_caller_address();
            assert(caller == minter, Errors::NOT_MINTER);
        }

        /// Transfers ownership of the contract to a new address and resets
        /// the pending minter to the zero address.
        ///
        /// Internal function without access restriction.
        fn _transfer_minter(ref self: ComponentState<TContractState>, new_minter: ContractAddress) {
            self.Mintable_minter.write(new_minter);
        }
    }
}
