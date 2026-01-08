use starknet::ContractAddress;

const MINTER_ROLE: felt252 = selector!("MINTER_ROLE");

#[starknet::interface]
pub trait INumsToken<TContractState> {
    fn initialize_access_control(
        ref self: TContractState, game_contract: ContractAddress, claim_contract: ContractAddress,
    );
    fn reward(ref self: TContractState, recipient: ContractAddress, amount: u64) -> bool;
    fn renounce_ownership(ref self: TContractState);
    fn owner(ref self: TContractState) -> ContractAddress;
    fn burn(ref self: TContractState, amount: u256);
}

#[starknet::contract]
mod NumsToken {
    use openzeppelin::access::accesscontrol::{AccessControlComponent, DEFAULT_ADMIN_ROLE};
    use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::token::erc20::{
        DefaultConfig as ERC20DefaultConfig, ERC20Component, ERC20HooksEmptyImpl,
    };
    use openzeppelin::upgrades::UpgradeableComponent;
    use openzeppelin::upgrades::interface::IUpgradeable;
    use starknet::{ClassHash, ContractAddress, get_caller_address};
    use super::MINTER_ROLE;

    const TEN_POW_18: u256 = 1000000000000000000;

    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);
    component!(path: ERC20Component, storage: erc20, event: ERC20Event);
    component!(path: AccessControlComponent, storage: accesscontrol, event: AccessControlEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);

    #[abi(embed_v0)]
    impl ERC20MixinImpl = ERC20Component::ERC20MixinImpl<ContractState>;
    #[abi(embed_v0)]
    impl AccessControlMixinImpl =
        AccessControlComponent::AccessControlMixinImpl<ContractState>;

    impl ERC20InternalImpl = ERC20Component::InternalImpl<ContractState>;
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;
    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;
    impl AccessControlInternalImpl = AccessControlComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc20: ERC20Component::Storage,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
        // rewards_caller: ContractAddress, // legacy: removed storage
        //
        #[substorage(v0)]
        accesscontrol: AccessControlComponent::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC20Event: ERC20Component::Event,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        #[flat]
        UpgradeableEvent: UpgradeableComponent::Event,
        #[flat]
        AccessControlEvent: AccessControlComponent::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState, owner: ContractAddress, rewards_caller: ContractAddress,
    ) {
        let name = "Nums";
        let symbol = "NUMS";

        self.erc20.initializer(name, symbol);
        self.ownable.initializer(owner);
    }


    #[abi(embed_v0)]
    impl NumsTokenImpl of super::INumsToken<ContractState> {
        fn initialize_access_control(
            ref self: ContractState,
            game_contract: ContractAddress,
            claim_contract: ContractAddress,
        ) {
            let caller = get_caller_address();
            self.ownable.assert_only_owner();

            self.accesscontrol.initializer();

            self.accesscontrol._grant_role(DEFAULT_ADMIN_ROLE, caller);
            self.accesscontrol._grant_role(MINTER_ROLE, game_contract);
            self.accesscontrol._grant_role(MINTER_ROLE, claim_contract);
        }

        fn reward(ref self: ContractState, recipient: ContractAddress, amount: u64) -> bool {
            self.accesscontrol.assert_only_role(MINTER_ROLE);

            self.erc20.mint(recipient, amount.into() * TEN_POW_18);
            true
        }

        fn renounce_ownership(ref self: ContractState) {
            self.ownable.renounce_ownership();
        }

        fn owner(ref self: ContractState) -> ContractAddress {
            self.ownable.owner()
        }

        fn burn(ref self: ContractState, amount: u256) {
            self.erc20.burn(get_caller_address(), amount);
        }
    }

    #[abi(embed_v0)]
    impl UpgradeableImpl of IUpgradeable<ContractState> {
        fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
            self.ownable.assert_only_owner();
            self.upgradeable.upgrade(new_class_hash);
        }
    }
}
