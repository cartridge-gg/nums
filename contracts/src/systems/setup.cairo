use starknet::ContractAddress;

#[inline]
pub fn NAME() -> ByteArray {
    "Setup"
}

#[starknet::interface]
pub trait ISetup<T> {
    fn set_starterpack(ref self: T, starterpack_address: ContractAddress);
    fn set_target_supply(ref self: T, supply: u256);
    fn set_quote_address(ref self: T, quote_address: ContractAddress);
    fn set_ekubo_router_address(ref self: T, ekubo_router_address: ContractAddress);
    fn set_ekubo_positions_address(ref self: T, ekubo_positions_address: ContractAddress);
    fn set_burn_percentage(ref self: T, burn_percentage: u8);
    fn set_vault_percentage(ref self: T, vault_percentage: u8);
    fn set_pool_fee(ref self: T, pool_fee: u128);
    fn set_pool_tick_spacing(ref self: T, pool_tick_spacing: u128);
    fn set_pool_extension(ref self: T, pool_extension: ContractAddress);
    fn set_pool_sqrt(ref self: T, pool_sqrt: u256);
    fn set_base_price(ref self: T, base_price: u256);
    fn set_starterpack_referral(ref self: T, referral_percentage: u8);
}

const ADMIN_ROLE: felt252 = selector!("ADMIN_ROLE");

#[dojo::contract]
pub mod Setup {
    use achievement::components::achievable::AchievableComponent;
    use dojo::world::{IWorldDispatcherTrait, WorldStorageTrait};
    use openzeppelin::access::accesscontrol::{AccessControlComponent, DEFAULT_ADMIN_ROLE};
    use openzeppelin::introspection::src5::SRC5Component;
    use quest::components::questable::QuestableComponent;
    use quest::interfaces::IQuestRegistry;
    use starknet::ContractAddress;
    use crate::StoreImpl;
    use crate::components::initializable::InitializableComponent;
    use crate::components::starterpack::StarterpackComponent;
    use crate::constants::{NAMESPACE, WORLD_RESOURCE};
    use crate::mocks::registry::NAME as REGISTRY;
    use crate::mocks::vrf::NAME as VRF;
    use crate::models::config::ConfigTrait;
    use crate::systems::token::NAME as TOKEN;
    use crate::systems::treasury::NAME as TREASURY;
    use crate::systems::vault::NAME as VAULT;
    use super::{ADMIN_ROLE, ISetup};

    // Components

    component!(path: AchievableComponent, storage: achievable, event: AchievableEvent);
    impl AchievableInternalImpl = AchievableComponent::InternalImpl<ContractState>;
    component!(path: QuestableComponent, storage: questable, event: QuestableEvent);
    impl QuestableInternalImpl = QuestableComponent::InternalImpl<ContractState>;
    component!(path: InitializableComponent, storage: initializable, event: InitializableEvent);
    impl InitializableInternalImpl = InitializableComponent::InternalImpl<ContractState>;
    component!(path: StarterpackComponent, storage: starterpack, event: StarterpackEvent);
    impl StarterpackInternalImpl = StarterpackComponent::InternalImpl<ContractState>;
    component!(path: AccessControlComponent, storage: accesscontrol, event: AccessControlEvent);
    #[abi(embed_v0)]
    impl AccessControlImpl =
        AccessControlComponent::AccessControlImpl<ContractState>;
    impl AccessControlInternalImpl = AccessControlComponent::InternalImpl<ContractState>;
    component!(path: SRC5Component, storage: src5, event: SRC5Event);

    // Storage

    #[storage]
    struct Storage {
        #[substorage(v0)]
        initializable: InitializableComponent::Storage,
        #[substorage(v0)]
        achievable: AchievableComponent::Storage,
        #[substorage(v0)]
        questable: QuestableComponent::Storage,
        #[substorage(v0)]
        starterpack: StarterpackComponent::Storage,
        #[substorage(v0)]
        accesscontrol: AccessControlComponent::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
    }

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        InitializableEvent: InitializableComponent::Event,
        #[flat]
        AchievableEvent: AchievableComponent::Event,
        #[flat]
        QuestableEvent: QuestableComponent::Event,
        #[flat]
        StarterpackEvent: StarterpackComponent::Event,
        #[flat]
        AccessControlEvent: AccessControlComponent::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
    }

    fn dojo_init(
        ref self: ContractState,
        vrf_address: Option<ContractAddress>,
        starterpack_address: Option<ContractAddress>,
        quote_address: ContractAddress,
        ekubo_router_address: ContractAddress,
        ekubo_positions_address: ContractAddress,
        entry_price: u128,
        target_supply: felt252,
        burn_percentage: u8,
        vault_percentage: u8,
        average_score: u8,
        pool_fee: u128,
        pool_tick_spacing: u128,
        pool_extension: ContractAddress,
    ) {
        // [Setup] World and Store
        let mut world = self.world(@NAMESPACE());
        let mut store = StoreImpl::new(world);
        // [Effect] Create config
        let vrf_address = if let Option::Some(vrf_address) = vrf_address {
            vrf_address
        } else {
            world.dns_address(@VRF()).expect('VRF not found!')
        };
        let starterpack_address = if let Option::Some(starterpack_address) = starterpack_address {
            starterpack_address
        } else {
            world.dns_address(@REGISTRY()).expect('Registry not found!')
        };
        let nums_address = world.dns_address(@TOKEN()).expect('Token not found!');
        let pool_sqrt = if nums_address < quote_address {
            u256 { low: 0x6f3528fe26840249f4b191ef6dff7928, high: 0xfffffc080ed7b455 }
        } else {
            u256 { low: 0x1000003f7f1380b75, high: 0x0 }
        };
        let config = ConfigTrait::new(
            world_resource: WORLD_RESOURCE,
            vrf: vrf_address,
            starterpack: starterpack_address,
            quote: quote_address,
            ekubo_router: ekubo_router_address,
            ekubo_positions: ekubo_positions_address,
            burn_percentage: burn_percentage,
            vault_percentage: vault_percentage,
            target_supply: target_supply.into(),
            average_score: average_score,
            pool_fee: pool_fee,
            pool_tick_spacing: pool_tick_spacing,
            pool_extension: pool_extension,
            pool_sqrt: pool_sqrt,
            base_price: entry_price.into(),
        );
        store.set_config(config);
        // [Effect] Initialize components
        self.initializable.initialize(world);

        // [Effect] Initialize starterpack
        self.starterpack.initialize(world, entry_price.into());

        // [Effect] Initialize rights
        self.accesscontrol.initializer();
        let treasury_address = world.dns_address(@TREASURY()).expect('Treasury not found!');
        self.accesscontrol._grant_role(DEFAULT_ADMIN_ROLE, treasury_address);
        self.accesscontrol._grant_role(ADMIN_ROLE, treasury_address);
        // [Effect] FIXME: Extra rights for test purpose
        let deployer_account = starknet::get_tx_info().unbox().account_contract_address;
        self.accesscontrol._grant_role(DEFAULT_ADMIN_ROLE, deployer_account);
        self.accesscontrol._grant_role(ADMIN_ROLE, deployer_account);

        // [Event] Order torii to index the tokens
        let nums_address = world.dns_address(@TOKEN()).expect('Token not found!');
        let instance_name: felt252 = nums_address.into();
        world
            .dispatcher
            .register_external_contract(
                namespace: NAMESPACE(),
                contract_name: "ERC20",
                instance_name: format!("{}", instance_name),
                contract_address: nums_address,
                block_number: 1,
            );
        let vault_address = world.dns_address(@VAULT()).expect('Vault not found!');
        let instance_name: felt252 = vault_address.into();
        world
            .dispatcher
            .register_external_contract(
                namespace: NAMESPACE(),
                contract_name: "ERC20",
                instance_name: format!("{}", instance_name),
                contract_address: vault_address,
                block_number: 1,
            );
    }

    #[abi(embed_v0)]
    impl QuestRegistryImpl of IQuestRegistry<ContractState> {
        fn quest_claim(
            ref self: ContractState, player: ContractAddress, quest_id: felt252, interval_id: u64,
        ) {
            let world = self.world(@NAMESPACE());
            self.questable.claim(world, player.into(), quest_id, interval_id);
        }
    }

    #[abi(embed_v0)]
    impl SetupImpl of ISetup<ContractState> {
        fn set_starterpack(ref self: ContractState, starterpack_address: ContractAddress) {
            // [Setup] World and Store
            let mut world = self.world(@NAMESPACE());
            let mut store = StoreImpl::new(world);
            // [Check] Caller is allowed
            self.accesscontrol.assert_only_role(ADMIN_ROLE);
            // [Effect] Update config
            let mut config = store.config();
            config.starterpack = starterpack_address;
            store.set_config(config);
        }

        fn set_target_supply(ref self: ContractState, supply: u256) {
            // [Setup] World and Store
            let mut world = self.world(@NAMESPACE());
            let mut store = StoreImpl::new(world);
            // [Check] Caller is allowed
            self.accesscontrol.assert_only_role(ADMIN_ROLE);
            // [Effect] Update config
            let mut config = store.config();
            config.target_supply = supply;
            store.set_config(config);
        }

        fn set_quote_address(ref self: ContractState, quote_address: ContractAddress) {
            // [Setup] World and Store
            let mut world = self.world(@NAMESPACE());
            let mut store = StoreImpl::new(world);
            // [Check] Caller is allowed
            self.accesscontrol.assert_only_role(ADMIN_ROLE);
            // [Effect] Update config
            let mut config = store.config();
            config.quote = quote_address;
            store.set_config(config);
        }

        fn set_ekubo_router_address(
            ref self: ContractState, ekubo_router_address: ContractAddress,
        ) {
            // [Setup] World and Store
            let mut world = self.world(@NAMESPACE());
            let mut store = StoreImpl::new(world);
            // [Check] Caller is allowed
            self.accesscontrol.assert_only_role(ADMIN_ROLE);
            // [Effect] Update config
            let mut config = store.config();
            config.ekubo_router = ekubo_router_address;
            store.set_config(config);
        }

        fn set_ekubo_positions_address(
            ref self: ContractState, ekubo_positions_address: ContractAddress,
        ) {
            // [Setup] World and Store
            let mut world = self.world(@NAMESPACE());
            let mut store = StoreImpl::new(world);
            // [Check] Caller is allowed
            self.accesscontrol.assert_only_role(ADMIN_ROLE);
            // [Effect] Update config
            let mut config = store.config();
            config.ekubo_positions = ekubo_positions_address;
            store.set_config(config);
        }

        fn set_burn_percentage(ref self: ContractState, burn_percentage: u8) {
            // [Setup] World and Store
            let mut world = self.world(@NAMESPACE());
            let mut store = StoreImpl::new(world);
            // [Check] Caller is allowed
            self.accesscontrol.assert_only_role(ADMIN_ROLE);
            // [Effect] Update config
            let mut config = store.config();
            config.burn_percentage = burn_percentage;
            store.set_config(config);
        }

        fn set_vault_percentage(ref self: ContractState, vault_percentage: u8) {
            // [Setup] World and Store
            let mut world = self.world(@NAMESPACE());
            let mut store = StoreImpl::new(world);
            // [Check] Caller is allowed
            self.accesscontrol.assert_only_role(ADMIN_ROLE);
            // [Effect] Update config
            let mut config = store.config();
            config.vault_percentage = vault_percentage;
            store.set_config(config);
        }

        fn set_pool_fee(ref self: ContractState, pool_fee: u128) {
            // [Setup] World and Store
            let mut world = self.world(@NAMESPACE());
            let mut store = StoreImpl::new(world);
            // [Check] Caller is allowed
            self.accesscontrol.assert_only_role(ADMIN_ROLE);
            // [Effect] Update config
            let mut config = store.config();
            config.pool_fee = pool_fee;
            store.set_config(config);
        }

        fn set_pool_tick_spacing(ref self: ContractState, pool_tick_spacing: u128) {
            // [Setup] World and Store
            let mut world = self.world(@NAMESPACE());
            let mut store = StoreImpl::new(world);
            // [Check] Caller is allowed
            self.accesscontrol.assert_only_role(ADMIN_ROLE);
            // [Effect] Update config
            let mut config = store.config();
            config.pool_tick_spacing = pool_tick_spacing;
            store.set_config(config);
        }

        fn set_pool_extension(ref self: ContractState, pool_extension: ContractAddress) {
            // [Setup] World and Store
            let mut world = self.world(@NAMESPACE());
            let mut store = StoreImpl::new(world);
            // [Check] Caller is allowed
            self.accesscontrol.assert_only_role(ADMIN_ROLE);
            // [Effect] Update config
            let mut config = store.config();
            config.pool_extension = pool_extension;
            store.set_config(config);
        }

        fn set_pool_sqrt(ref self: ContractState, pool_sqrt: u256) {
            // [Setup] World and Store
            let mut world = self.world(@NAMESPACE());
            let mut store = StoreImpl::new(world);
            // [Check] Caller is allowed
            self.accesscontrol.assert_only_role(ADMIN_ROLE);
            // [Effect] Update config
            let mut config = store.config();
            config.pool_sqrt = pool_sqrt;
            store.set_config(config);
        }

        fn set_base_price(ref self: ContractState, base_price: u256) {
            // [Setup] World and Store
            let mut world = self.world(@NAMESPACE());
            let mut store = StoreImpl::new(world);
            // [Check] Caller is allowed
            self.accesscontrol.assert_only_role(ADMIN_ROLE);
            // [Effect] Update config
            let mut config = store.config();
            config.base_price = base_price;
            store.set_config(config);
        }

        fn set_starterpack_referral(ref self: ContractState, referral_percentage: u8) {
            // [Setup] World and Store
            let mut world = self.world(@NAMESPACE());
            // [Check] Caller is allowed
            self.accesscontrol.assert_only_role(ADMIN_ROLE);
            // [Effect] Fix starterpack
            self
                .starterpack
                .set_referral(world: world, from: 134, referral_percentage: referral_percentage);
        }
    }
}
