use starknet::ContractAddress;

#[starknet::interface]
pub trait IPauser<TContractState> {
    fn pause(ref self: TContractState);
    fn unpause(ref self: TContractState);
}

#[starknet::interface]
pub trait IKeeper<TContractState> {
    fn open(ref self: TContractState);
    fn close(ref self: TContractState);
}

#[starknet::interface]
pub trait IVault<TContractState> {
    fn time_lock_of(self: @TContractState, account: ContractAddress) -> u64;
    fn staked_of(self: @TContractState, account: ContractAddress) -> u256;
    fn claimable_of(self: @TContractState, account: ContractAddress) -> u256;
    fn pay(ref self: TContractState, player_id: felt252, amount: u256);
    fn claim(ref self: TContractState);
    fn reset(ref self: TContractState);
}

pub fn NAME() -> ByteArray {
    "Vault"
}

const DEPOSITOR_ROLE: felt252 = selector!("DEPOSITOR_ROLE");
const PROVIDER_ROLE: felt252 = selector!("PROVIDER_ROLE");
const PAUSER_ROLE: felt252 = selector!("PAUSER_ROLE");

#[dojo::contract]
pub mod Vault {
    use dojo::world::WorldStorageTrait;
    use openzeppelin::access::accesscontrol::{AccessControlComponent, DEFAULT_ADMIN_ROLE};
    use openzeppelin::interfaces::token::erc20::{IERC20Dispatcher, IERC20DispatcherTrait};
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::security::pausable::PausableComponent;
    use openzeppelin::token::erc20::extensions::erc4626::ERC4626Component::{Fee, FeeConfigTrait};
    use openzeppelin::token::erc20::extensions::erc4626::{
        DefaultConfig, ERC4626Component, ERC4626DefaultNoLimits, ERC4626SelfAssetsManagement,
    };
    use openzeppelin::token::erc20::{DefaultConfig as ERC20DefaultConfig, ERC20Component};
    use openzeppelin::utils::math;
    use openzeppelin::utils::math::Rounding;
    use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess};
    use starknet::{ContractAddress, get_caller_address, get_contract_address};
    use crate::components::rewardable::RewardableComponent;
    use crate::constants::NAMESPACE;
    use crate::store::StoreTrait;
    use crate::systems::play::NAME as PLAY;
    use crate::systems::token::{ITokenDispatcher, ITokenDispatcherTrait, NAME as TOKEN};
    use super::{DEPOSITOR_ROLE, IKeeper, IPauser, IVault, PAUSER_ROLE, PROVIDER_ROLE};

    const BASIS_POINT_SCALE: u256 = 10_000;
    const EXIT_FEE: u256 = 500; // 5%

    component!(path: AccessControlComponent, storage: accesscontrol, event: AccessControlEvent);
    component!(path: PausableComponent, storage: pausable, event: PausableEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: ERC4626Component, storage: erc4626, event: ERC4626Event);
    component!(path: ERC20Component, storage: erc20, event: ERC20Event);
    component!(path: RewardableComponent, storage: rewardable, event: RewardableEvent);

    // AccessControl
    #[abi(embed_v0)]
    impl AccessControlImpl =
        AccessControlComponent::AccessControlImpl<ContractState>;
    impl AccessControlInternalImpl = AccessControlComponent::InternalImpl<ContractState>;
    // Pausable
    #[abi(embed_v0)]
    impl PausableImpl = PausableComponent::PausableImpl<ContractState>;
    impl PausableInternalImpl = PausableComponent::InternalImpl<ContractState>;
    // SRC5
    #[abi(embed_v0)]
    impl SRC5Impl = SRC5Component::SRC5Impl<ContractState>;
    impl SRC5InternalImpl = SRC5Component::InternalImpl<ContractState>;
    // ERC4626
    #[abi(embed_v0)]
    impl ERC4626ComponentImpl = ERC4626Component::ERC4626Impl<ContractState>;
    #[abi(embed_v0)]
    impl ERC4626MetadataImpl = ERC4626Component::ERC4626MetadataImpl<ContractState>;
    impl ERC4626InternalImpl = ERC4626Component::InternalImpl<ContractState>;
    // ERC20
    #[abi(embed_v0)]
    impl ERC20Impl = ERC20Component::ERC20Impl<ContractState>;
    #[abi(embed_v0)]
    impl ERC20CamelOnlyImpl = ERC20Component::ERC20CamelOnlyImpl<ContractState>;
    impl ERC20InternalImpl = ERC20Component::InternalImpl<ContractState>;
    // Rewardable
    impl RewardableInternalImpl = RewardableComponent::InternalImpl<ContractState>;

    #[storage]
    pub struct Storage {
        #[substorage(v0)]
        accesscontrol: AccessControlComponent::Storage,
        #[substorage(v0)]
        pausable: PausableComponent::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        #[substorage(v0)]
        erc4626: ERC4626Component::Storage,
        #[substorage(v0)]
        erc20: ERC20Component::Storage,
        #[substorage(v0)]
        rewardable: RewardableComponent::Storage,
        // Custom storage
        staked: Map<ContractAddress, u256>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        AccessControlEvent: AccessControlComponent::Event,
        #[flat]
        PausableEvent: PausableComponent::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
        #[flat]
        ERC4626Event: ERC4626Component::Event,
        #[flat]
        ERC20Event: ERC20Component::Event,
        #[flat]
        RewardableEvent: RewardableComponent::Event,
    }

    fn dojo_init(ref self: ContractState, open: bool) {
        // [Effect] Initialize ERC20
        self.erc20.initializer("vNums", "vNUMS");
        // [Effect] Initialize ERC4626
        self.erc4626.initializer(asset_address: self.asset_address());
        // [Effect] Initialize Rewardable
        let world = self.world(@NAMESPACE());
        self.rewardable.initialize(world, open);
        // [Effect] Initialize Access Control
        let deployer_account = starknet::get_tx_info().unbox().account_contract_address;
        self.accesscontrol.initializer();
        self.accesscontrol._grant_role(DEFAULT_ADMIN_ROLE, deployer_account);
        self.accesscontrol._grant_role(DEPOSITOR_ROLE, deployer_account);
        self.accesscontrol._grant_role(PAUSER_ROLE, deployer_account);
        let play_address = world.dns_address(@PLAY()).expect('Play contract not found!');
        self.accesscontrol._grant_role(PROVIDER_ROLE, play_address);
    }

    /// Hooks
    impl ERC4626HooksImpl of ERC4626Component::ERC4626HooksTrait<ContractState> {
        fn before_deposit(
            ref self: ERC4626Component::ComponentState<ContractState>,
            caller: ContractAddress,
            receiver: ContractAddress,
            assets: u256,
            shares: u256,
            fee: Option<Fee>,
        ) {
            // [Check] Contract is not paused
            let mut contract_state = self.get_contract_mut();
            contract_state.pausable.assert_not_paused();
            // [Check] Vault is open or caller is allowed to deposit
            let world = contract_state.world(@NAMESPACE());
            if !contract_state.rewardable.is_open(world) {
                contract_state.accesscontrol.assert_only_role(DEPOSITOR_ROLE);
            }
            // [Effect] Update user position
            let balance = contract_state.erc20.balance_of(receiver);
            contract_state.rewardable.stake(world, receiver.into(), balance);
        }

        fn after_deposit(
            ref self: ERC4626Component::ComponentState<ContractState>,
            caller: ContractAddress,
            receiver: ContractAddress,
            assets: u256,
            shares: u256,
            fee: Option<Fee>,
        ) {
            // [Effect] Update user staked amount
            let mut contract_state = self.get_contract_mut();
            let staked = contract_state.staked.read(receiver);
            contract_state.staked.write(receiver, staked + assets);
        }

        fn before_withdraw(
            ref self: ERC4626Component::ComponentState<ContractState>,
            caller: ContractAddress,
            receiver: ContractAddress,
            owner: ContractAddress,
            assets: u256,
            shares: u256,
            fee: Option<Fee>,
        ) {
            // [Check] Contract is not paused
            let mut contract_state = self.get_contract_mut();
            contract_state.pausable.assert_not_paused();
            // [Check] Update user position
            let world = contract_state.world(@NAMESPACE());
            let balance = contract_state.erc20.balance_of(owner);
            contract_state.rewardable.unstake(world, owner.into(), balance);
            // [Interaction] Transfer fees
            // - Assets: leave the assets in the contract to distribute to share holders
            // - Shares: burn the shares
            if let Option::Some(fee) = fee {
                match fee {
                    Fee::Assets(_fee) => {},
                    Fee::Shares(fee) => {
                        if caller != owner {
                            contract_state.erc20._spend_allowance(owner, caller, fee);
                        }
                        contract_state.erc20.burn(owner, fee);
                    },
                };
            }
        }

        fn after_withdraw(
            ref self: ERC4626Component::ComponentState<ContractState>,
            caller: ContractAddress,
            receiver: ContractAddress,
            owner: ContractAddress,
            assets: u256,
            shares: u256,
            fee: Option<Fee>,
        ) {
            // [Effect] Update user staked amount
            let mut contract_state = self.get_contract_mut();
            let staked = contract_state.staked.read(owner);
            if staked < assets {
                contract_state.staked.write(owner, 0);
            } else {
                contract_state.staked.write(owner, staked - assets);
            }
        }
    }

    impl ERC20HooksImpl of ERC20Component::ERC20HooksTrait<ContractState> {
        fn before_update(
            ref self: ERC20Component::ComponentState<ContractState>,
            from: ContractAddress,
            recipient: ContractAddress,
            amount: u256,
        ) {
            // [Check] Only Mint and Burn are accepted, from or recipient must be the zero address
            assert(from.into() * recipient.into() == 0, 'Vault: vNUMS are soulbound');
        }
    }

    #[abi(embed_v0)]
    impl IVaultImpl of IVault<ContractState> {
        fn time_lock_of(self: @ContractState, account: ContractAddress) -> u64 {
            let world = self.world(@NAMESPACE());
            self.rewardable.time_lock(world, account.into())
        }

        fn staked_of(self: @ContractState, account: ContractAddress) -> u256 {
            self.staked.read(account)
        }

        fn claimable_of(self: @ContractState, account: ContractAddress) -> u256 {
            let world = self.world(@NAMESPACE());
            let balance = self.erc20.balance_of(account);
            self.rewardable.claimable(world, account.into(), balance)
        }

        fn pay(ref self: ContractState, player_id: felt252, amount: u256) {
            // [Check] Only provider can pay
            self.accesscontrol.assert_only_role(PROVIDER_ROLE);
            // [Interaction] Transfer rewards to the vault
            let caller = get_caller_address();
            let reward = IERC20Dispatcher { contract_address: self.reward_address() };
            let this = get_contract_address();
            reward.transfer_from(caller, this, amount);
            // [Effect] Update total rewards
            let world = self.world(@NAMESPACE());
            self.rewardable.pay(world, amount, self.erc20.total_supply());
            // [Effect] Emit events
            let store = StoreTrait::new(world);
            store.vault_paid(player_id, amount);
        }

        fn claim(ref self: ContractState) {
            // [Check] Contract is not paused
            self.pausable.assert_not_paused();
            // [Effet] Claim rewards
            let world = self.world(@NAMESPACE());
            let caller = get_caller_address();
            let balance = self.erc20.balance_of(caller);
            let amount = self.rewardable.claim(world, caller.into(), balance);
            // [Interaction] Transfer rewards
            let reward_token = IERC20Dispatcher { contract_address: self.reward_address() };
            reward_token.transfer(caller, amount);
            // [Effect] Emit events
            let store = StoreTrait::new(world);
            store.vault_claimed(caller.into(), amount);
        }

        fn reset(ref self: ContractState) {
            // [Check] Only admin can reset
            self.accesscontrol.assert_only_role(DEFAULT_ADMIN_ROLE);
            // [Effect] Reset the shares
            let this = get_contract_address();
            self.erc20.burn(this, self.erc20.balance_of(this));
            // [Effect] Reset the assets
            let asset = IERC20Dispatcher { contract_address: self.asset_address() };
            let token = ITokenDispatcher { contract_address: self.asset_address() };
            token.burn(asset.balance_of(this));
        }
    }

    #[abi(embed_v0)]
    impl PauserImpl of IPauser<ContractState> {
        fn pause(ref self: ContractState) {
            // [Check] Only pauser can pause
            self.accesscontrol.assert_only_role(PAUSER_ROLE);
            // [Effect] Pause the contract
            self.pausable.pause();
        }

        fn unpause(ref self: ContractState) {
            // [Check] Only pauser can unpause
            self.accesscontrol.assert_only_role(PAUSER_ROLE);
            // [Effect] Unpause the contract
            self.pausable.unpause();
        }
    }

    #[abi(embed_v0)]
    impl Keepermpl of IKeeper<ContractState> {
        fn open(ref self: ContractState) {
            // [Check] Only admin can open
            self.accesscontrol.assert_only_role(DEFAULT_ADMIN_ROLE);
            // [Effect] Open the contract
            let world = self.world(@NAMESPACE());
            self.rewardable.open(world);
        }

        fn close(ref self: ContractState) {
            // [Check] Only admin can close
            self.accesscontrol.assert_only_role(DEFAULT_ADMIN_ROLE);
            // [Effect] Close the contract
            let world = self.world(@NAMESPACE());
            self.rewardable.close(world);
        }
    }

    /// Calculate fees
    impl FeeConfigImpl of FeeConfigTrait<ContractState> {
        fn calculate_withdraw_fee(
            self: @ERC4626Component::ComponentState<ContractState>, assets: u256, shares: u256,
        ) -> Option<Fee> {
            let fee = fee_on_total(assets, EXIT_FEE);
            Option::Some(Fee::Assets(fee))
        }
        fn calculate_redeem_fee(
            self: @ERC4626Component::ComponentState<ContractState>, assets: u256, shares: u256,
        ) -> Option<Fee> {
            let fee = fee_on_raw(shares, EXIT_FEE);
            Option::Some(Fee::Shares(fee))
        }
    }

    #[generate_trait]
    pub impl PrivateImpl of PrivateTrait {
        fn asset_address(self: @ContractState) -> ContractAddress {
            let world = self.world(@NAMESPACE());
            let (token_address, _) = world.dns(@TOKEN()).expect('Token not found!');
            token_address
        }

        fn reward_address(self: @ContractState) -> ContractAddress {
            let world = self.world(@NAMESPACE());
            let store = StoreTrait::new(world);
            store.config().quote
        }
    }

    /// Calculates the fees that should be added to an amount `assets` that does not already
    /// include fees.
    /// Used in IERC4626::mint and IERC4626::withdraw operations.
    fn fee_on_raw(assets: u256, fee_basis_points: u256) -> u256 {
        math::u256_mul_div(assets, fee_basis_points, BASIS_POINT_SCALE, Rounding::Ceil)
    }

    /// Calculates the fee part of an amount `assets` that already includes fees.
    /// Used in IERC4626::deposit and IERC4626::redeem operations.
    fn fee_on_total(assets: u256, fee_basis_points: u256) -> u256 {
        math::u256_mul_div(
            assets, fee_basis_points, fee_basis_points + BASIS_POINT_SCALE, Rounding::Ceil,
        )
    }
}
