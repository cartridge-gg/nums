#[starknet::interface]
pub trait ITeam<TContractState> {
    fn withdraw(ref self: TContractState);
}

pub fn NAME() -> ByteArray {
    "Team"
}

const WITHDRAWER_ROLE: felt252 = selector!("WITHDRAWER_ROLE");

#[dojo::contract]
mod Team {
    use ekubo::interfaces::erc20::IERC20DispatcherTrait;
    use openzeppelin::access::accesscontrol::{AccessControlComponent, DEFAULT_ADMIN_ROLE};
    use openzeppelin::introspection::src5::SRC5Component;
    use starknet::{get_caller_address, get_contract_address};
    use crate::constants::NAMESPACE;
    use crate::store::StoreTrait;
    use super::WITHDRAWER_ROLE;

    component!(path: AccessControlComponent, storage: accesscontrol, event: AccessControlEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);

    #[abi(embed_v0)]
    impl AccessControlImpl =
        AccessControlComponent::AccessControlImpl<ContractState>;
    impl AccessControlInternalImpl = AccessControlComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        accesscontrol: AccessControlComponent::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        AccessControlEvent: AccessControlComponent::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
    }


    fn dojo_init(ref self: ContractState) {
        // [Effect] Initialize Access Control
        let deployer_account = starknet::get_tx_info().unbox().account_contract_address;
        self.accesscontrol._grant_role(DEFAULT_ADMIN_ROLE, deployer_account);
        self.accesscontrol._grant_role(WITHDRAWER_ROLE, deployer_account);
    }

    #[abi(embed_v0)]
    impl TeamImpl of super::ITeam<ContractState> {
        fn withdraw(ref self: ContractState) {
            // [Check] Only withdrawer can withdraw
            self.accesscontrol.assert_only_role(WITHDRAWER_ROLE);
            // [Effect] Withdraw tokens from the caller
            let world = self.world(@NAMESPACE());
            let store = StoreTrait::new(world);
            let quote = store.quote_disp();
            let this = get_contract_address();
            let balance = quote.balanceOf(this);
            let recipient = get_caller_address();
            quote.transfer(recipient, balance);
        }
    }
}
