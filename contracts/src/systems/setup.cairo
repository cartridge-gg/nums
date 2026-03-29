use starknet::ContractAddress;

#[inline]
pub fn NAME() -> ByteArray {
    "Setup"
}

#[starknet::interface]
pub trait ISetup<T> {
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
    fn merkledrop_register(ref self: T, data: Span<Span<felt252>>, expiration: u64) -> felt252;
    fn merkledrop_claim(
        ref self: T,
        tree_id: felt252,
        proofs: Span<felt252>,
        data: Span<felt252>,
        receiver: ContractAddress,
    );
}

const ADMIN_ROLE: felt252 = selector!("ADMIN_ROLE");

#[dojo::contract]
pub mod Setup {
    use bundle::component::Component as BundleComponent;
    use bundle::component::Component::{BundleQuote, BundleTrait};
    use bundle::interface::IBundle;
    use dojo::world::WorldStorageTrait;
    use merkledrop::component::Component as MerkledropComponent;
    use merkledrop::component::Component::MerkledropTrait;
    use openzeppelin::access::accesscontrol::{AccessControlComponent, DEFAULT_ADMIN_ROLE};
    use openzeppelin::introspection::src5::SRC5Component;
    use starknet::ContractAddress;
    use crate::StoreImpl;
    use crate::components::purchase::PurchaseComponent;
    use crate::constants::{MULTIPLIER_PRECISION, NAMESPACE, WORLD_RESOURCE};
    use crate::mocks::vrf::NAME as VRF;
    use crate::models::config::ConfigTrait;
    use crate::systems::faucet::NAME as FAUCET;
    use crate::systems::play::{IPlayDispatcher, IPlayDispatcherTrait, NAME as PLAY};
    use crate::systems::token::NAME as TOKEN;
    use crate::systems::treasury::NAME as TREASURY;
    use crate::types::drop::MerkleDrop;
    use super::{ADMIN_ROLE, ISetup};

    // Components

    component!(path: BundleComponent, storage: bundle, event: BundleEvent);
    impl BundleInternalImpl = BundleComponent::InternalImpl<ContractState>;
    impl BundleFeeImpl of BundleComponent::BundleFeeTrait<ContractState> {}
    component!(path: PurchaseComponent, storage: purchase, event: PurchaseEvent);
    impl PurchaseInternalImpl = PurchaseComponent::InternalImpl<ContractState>;
    component!(path: MerkledropComponent, storage: merkledrop, event: MerkledropEvent);
    impl MerkledropInternalImpl = MerkledropComponent::InternalImpl<ContractState>;
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
        bundle: BundleComponent::Storage,
        #[substorage(v0)]
        purchase: PurchaseComponent::Storage,
        #[substorage(v0)]
        merkledrop: MerkledropComponent::Storage,
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
        BundleEvent: BundleComponent::Event,
        #[flat]
        PurchaseEvent: PurchaseComponent::Event,
        #[flat]
        MerkledropEvent: MerkledropComponent::Event,
        #[flat]
        AccessControlEvent: AccessControlComponent::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
    }

    impl BundleImpl of BundleTrait<ContractState> {
        fn on_issue(
            ref self: BundleComponent::ComponentState<ContractState>,
            recipient: ContractAddress,
            bundle_id: u32,
            quantity: u32,
        ) {
            let mut contract_state = self.get_contract_mut();
            let world = contract_state.world(@NAMESPACE());
            let (recipient, multiplier, supply, price, quantity) = contract_state
                .purchase
                .execute(world, recipient, bundle_id, quantity);
            let play_address = world.dns_address(@PLAY()).expect('Play contract not found!');
            let play = IPlayDispatcher { contract_address: play_address };
            play.create(recipient, multiplier, supply, price, quantity);
        }
        fn supply(
            self: @BundleComponent::ComponentState<ContractState>, bundle_id: u32,
        ) -> Option<u32> {
            Option::None
        }
    }

    impl MerkledropImpl of MerkledropTrait<ContractState> {
        fn get_recipient(
            self: @MerkledropComponent::ComponentState<ContractState>, mut data: Span<felt252>,
        ) -> ContractAddress {
            // [Return] Return recipient, first item in the data array
            let drop: MerkleDrop = Serde::<MerkleDrop>::deserialize(ref data).unwrap();
            drop.recipient
        }
        fn on_merkledrop_claim(
            ref self: MerkledropComponent::ComponentState<ContractState>,
            root: felt252,
            leaf: felt252,
            receiver: ContractAddress,
            mut data: Span<felt252>,
        ) {
            // [Effect] Claim free games
            let drop: MerkleDrop = Serde::<MerkleDrop>::deserialize(ref data).unwrap();
            let mut contract_state = self.get_contract_mut();
            let world = contract_state.world(@NAMESPACE());
            let play_address = world.dns_address(@PLAY()).expect('Play contract not found!');
            let play = IPlayDispatcher { contract_address: play_address };
            play.mint(receiver, drop.quantity.into());
            // [Event] Emit purchase event
            let mut store = StoreImpl::new(world);
            store.purchased(receiver.into(), 0, drop.quantity.into(), MULTIPLIER_PRECISION, 0);
        }
    }

    // Constructor

    fn dojo_init(
        ref self: ContractState,
        vrf_address: Option<ContractAddress>,
        quote_address: Option<ContractAddress>,
        team_address: ContractAddress,
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
        bundle_allower: ContractAddress,
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
        let quote_address = if let Option::Some(quote_address) = quote_address {
            quote_address
        } else {
            world.dns_address(@FAUCET()).expect('Faucet not found!')
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
            quote: quote_address,
            team_address: team_address,
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

        // [Effect] Initialize starterpack
        self.purchase.initialize(world, entry_price.into(), bundle_allower);

        // [Effect] Initialize rights
        self.accesscontrol.initializer();
        let treasury_address = world.dns_address(@TREASURY()).expect('Treasury not found!');
        self.accesscontrol._grant_role(DEFAULT_ADMIN_ROLE, treasury_address);
        self.accesscontrol._grant_role(ADMIN_ROLE, treasury_address);
    }

    #[abi(embed_v0)]
    impl IBundleImpl of IBundle<ContractState> {
        fn get_metadata(self: @ContractState, bundle_id: u32) -> ByteArray {
            let world = self.world(@NAMESPACE());
            self.bundle.get_metadata(world, bundle_id)
        }

        fn quote(
            self: @ContractState,
            bundle_id: u32,
            quantity: u32,
            has_referrer: bool,
            client_percentage: u8,
        ) -> BundleQuote {
            let world = self.world(@NAMESPACE());
            self.bundle.quote(world, bundle_id, quantity, has_referrer, client_percentage)
        }

        fn issue(
            ref self: ContractState,
            recipient: ContractAddress,
            bundle_id: u32,
            quantity: u32,
            referrer: Option<ContractAddress>,
            referrer_group: Option<felt252>,
            client: Option<ContractAddress>,
            client_percentage: u8,
            voucher_key: Option<felt252>,
            signature: Option<Span<felt252>>,
        ) {
            let mut world = self.world(@NAMESPACE());
            self
                .bundle
                .issue(
                    world,
                    recipient,
                    bundle_id,
                    quantity,
                    referrer,
                    referrer_group,
                    client,
                    client_percentage,
                    voucher_key,
                    signature,
                )
        }
    }

    #[abi(embed_v0)]
    impl SetupImpl of ISetup<ContractState> {
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

        fn merkledrop_register(
            ref self: ContractState, data: Span<Span<felt252>>, expiration: u64,
        ) -> felt252 {
            // [Check] Only admin can register
            self.accesscontrol.assert_only_role(ADMIN_ROLE);
            // [Effect] Register merkledrop
            let world = self.world(@NAMESPACE());
            self.merkledrop.register(world, data, expiration)
        }

        fn merkledrop_claim(
            ref self: ContractState,
            tree_id: felt252,
            proofs: Span<felt252>,
            data: Span<felt252>,
            receiver: ContractAddress,
        ) {
            let world = self.world(@NAMESPACE());
            self.merkledrop.claim(world, tree_id, proofs, data, receiver)
        }
    }
}
