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
    fn set_average_score(ref self: T, average_score: u32, average_weigth: u16);
    // Cross-chain bridge config setters (admin only).
    fn set_appchain_materializer(ref self: T, addr: ContractAddress);
    fn set_bridge_messaging(ref self: T, addr: ContractAddress);
    fn set_appchain_play(ref self: T, addr: ContractAddress);
    fn set_mainnet_setup(ref self: T, addr: ContractAddress);
    fn merkledrop_register(ref self: T, data: Span<Span<felt252>>, expiration: u64) -> felt252;
    fn merkledrop_claim(
        ref self: T,
        tree_id: felt252,
        proofs: Span<felt252>,
        data: Span<felt252>,
        receiver: ContractAddress,
    );
    /// Apply a batch of game-claim messages from the appchain. For each payload:
    /// authenticates origin via Piltover, updates EMA, mints NUMS reward, and
    /// flips PendingPurchase status to Materialized. Public; anyone can call.
    /// Payloads are sorted by purchase_id internally for deterministic execution
    /// (config.push is non-commutative).
    fn apply_game_claim_batch(ref self: T, payloads: Span<Span<felt252>>);
}

const ADMIN_ROLE: felt252 = selector!("ADMIN_ROLE");

#[dojo::contract]
pub mod Setup {
    use bundle::component::Component as BundleComponent;
    use bundle::component::Component::{BundleQuote, BundleTrait};
    use bundle::interface::IBundle;
    use core::num::traits::Zero;
    use dojo::world::WorldStorageTrait;
    use merkledrop::component::Component as MerkledropComponent;
    use merkledrop::component::Component::MerkledropTrait;
    use openzeppelin::access::accesscontrol::{AccessControlComponent, DEFAULT_ADMIN_ROLE};
    use openzeppelin::introspection::src5::SRC5Component;
    use starknet::ContractAddress;
    use crate::StoreImpl;
    use crate::components::purchase::PurchaseComponent;
    use crate::constants::{MATERIALIZE_SELECTOR, MULTIPLIER_PRECISION, NAMESPACE, WORLD_RESOURCE};
    use crate::interfaces::messaging::{IMessagingDispatcher, IMessagingDispatcherTrait};
    use crate::mocks::vrf::NAME as VRF;
    use crate::models::config::ConfigTrait;
    use crate::models::index::{PendingPurchase, PendingStatus};
    use crate::systems::faucet::NAME as FAUCET;
    use crate::systems::play::{IPlayDispatcher, IPlayDispatcherTrait, NAME as PLAY};
    use crate::systems::token::{ITokenDispatcher, ITokenDispatcherTrait, NAME as TOKEN};
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
            let store = StoreImpl::new(world);
            let config = store.config();
            let bundle = store.bundle(bundle_id);

            // Run swap+burn+vault.pay+team.transfer on mainnet. Returns the
            // resolved values used downstream (multiplier from the EMA-fed
            // Rewarder formula, supply snapshot, etc.).
            let (recipient, multiplier, supply, price, quantity) = contract_state
                .purchase
                .execute(world, recipient, bundle_id, quantity);

            // Free bundles always materialize locally (no payment to bridge,
            // gives the player games immediately even in bridge mode).
            if bundle.price == 0 || config.appchain_materializer.is_zero() {
                // Pure-Starknet path — bit-identical to today's behavior.
                let play_address = world.dns_address(@PLAY()).expect('Play contract not found!');
                let play = IPlayDispatcher { contract_address: play_address };
                play.create(recipient, multiplier, supply, price, quantity, 0);
            } else {
                // Bridge mode — record PendingPurchase and queue a Piltover
                // game-mint message to the appchain Materializer. Game creation
                // happens on the appchain once the L1Handler delivers.
                let mut store_mut = StoreImpl::new(world);
                let purchase_id = store_mut.next_purchase_nonce();
                store_mut
                    .set_pending_purchase(
                        @PendingPurchase {
                            purchase_id,
                            recipient,
                            bundle_id,
                            quantity,
                            status: PendingStatus::Pending,
                        },
                    );

                let payload = array![
                    purchase_id.into(), recipient.into(), multiplier.into(), price.low.into(),
                    price.high.into(), quantity.into(),
                ];

                let messaging = IMessagingDispatcher { contract_address: config.bridge_messaging };
                messaging
                    .send_message_to_appchain(
                        config.appchain_materializer, MATERIALIZE_SELECTOR, payload.span(),
                    );

                store_mut.purchase_initiated(purchase_id, recipient, bundle_id, quantity);
            }
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
        // Cross-chain bridge config. All zero = pure-Starknet mode (today's
        // behavior). Non-zero appchain_materializer activates the bridge path
        // in BundleImpl::on_issue and is paired with bridge_messaging +
        // appchain_play. `mainnet_setup` is only read on the appchain side
        // (irrelevant on mainnet but kept symmetric for shared model).
        appchain_materializer: ContractAddress,
        bridge_messaging: ContractAddress,
        appchain_play: ContractAddress,
        mainnet_setup: ContractAddress,
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

        // [Sentinel] Bridge mode consistency: appchain_materializer, bridge_messaging,
        // and appchain_play must either all be zero (local mode) or all non-zero
        // (bridge mode). Self-referencing materializer is also rejected.
        let self_addr = starknet::get_contract_address();
        let mat_zero = appchain_materializer.is_zero();
        let msg_zero = bridge_messaging.is_zero();
        let play_zero = appchain_play.is_zero();
        let all_zero = mat_zero && msg_zero && play_zero;
        let all_set = !mat_zero && !msg_zero && !play_zero;
        assert(all_zero || all_set, 'Setup: bridge config mixed');
        assert(appchain_materializer != self_addr, 'Setup: materializer is self');

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
            appchain_materializer: appchain_materializer,
            bridge_messaging: bridge_messaging,
            appchain_play: appchain_play,
            mainnet_setup: mainnet_setup,
        );
        store.set_config(config);

        // [Effect] Initialize starterpack
        self.purchase.initialize(world, entry_price.into(), bundle_allower);

        // [Effect] Initialize rights
        self.accesscontrol.initializer();
        let treasury_address = world.dns_address(@TREASURY()).expect('Treasury not found!');
        self.accesscontrol._grant_role(DEFAULT_ADMIN_ROLE, treasury_address);
        self.accesscontrol._grant_role(ADMIN_ROLE, treasury_address);
        // [Effect] Test-driven: grant admin to deployer so e2e harness can call
        // post-deploy setters (set_appchain_materializer etc.). Mirrors Vault.
        let deployer_account = starknet::get_tx_info().unbox().account_contract_address;
        self.accesscontrol._grant_role(DEFAULT_ADMIN_ROLE, deployer_account);
        self.accesscontrol._grant_role(ADMIN_ROLE, deployer_account);
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
            let mut world = self.world(@NAMESPACE());
            let mut store = StoreImpl::new(world);
            self.accesscontrol.assert_only_role(ADMIN_ROLE);
            let mut config = store.config();
            config.target_supply = supply;
            store.set_config(config);
        }

        fn set_quote_address(ref self: ContractState, quote_address: ContractAddress) {
            let mut world = self.world(@NAMESPACE());
            let mut store = StoreImpl::new(world);
            self.accesscontrol.assert_only_role(ADMIN_ROLE);
            let mut config = store.config();
            config.quote = quote_address;
            store.set_config(config);
        }

        fn set_ekubo_router_address(
            ref self: ContractState, ekubo_router_address: ContractAddress,
        ) {
            let mut world = self.world(@NAMESPACE());
            let mut store = StoreImpl::new(world);
            self.accesscontrol.assert_only_role(ADMIN_ROLE);
            let mut config = store.config();
            config.ekubo_router = ekubo_router_address;
            store.set_config(config);
        }

        fn set_ekubo_positions_address(
            ref self: ContractState, ekubo_positions_address: ContractAddress,
        ) {
            let mut world = self.world(@NAMESPACE());
            let mut store = StoreImpl::new(world);
            self.accesscontrol.assert_only_role(ADMIN_ROLE);
            let mut config = store.config();
            config.ekubo_positions = ekubo_positions_address;
            store.set_config(config);
        }

        fn set_burn_percentage(ref self: ContractState, burn_percentage: u8) {
            let mut world = self.world(@NAMESPACE());
            let mut store = StoreImpl::new(world);
            self.accesscontrol.assert_only_role(ADMIN_ROLE);
            let mut config = store.config();
            config.burn_percentage = burn_percentage;
            store.set_config(config);
        }

        fn set_vault_percentage(ref self: ContractState, vault_percentage: u8) {
            let mut world = self.world(@NAMESPACE());
            let mut store = StoreImpl::new(world);
            self.accesscontrol.assert_only_role(ADMIN_ROLE);
            let mut config = store.config();
            config.vault_percentage = vault_percentage;
            store.set_config(config);
        }

        fn set_pool_fee(ref self: ContractState, pool_fee: u128) {
            let mut world = self.world(@NAMESPACE());
            let mut store = StoreImpl::new(world);
            self.accesscontrol.assert_only_role(ADMIN_ROLE);
            let mut config = store.config();
            config.pool_fee = pool_fee;
            store.set_config(config);
        }

        fn set_pool_tick_spacing(ref self: ContractState, pool_tick_spacing: u128) {
            let mut world = self.world(@NAMESPACE());
            let mut store = StoreImpl::new(world);
            self.accesscontrol.assert_only_role(ADMIN_ROLE);
            let mut config = store.config();
            config.pool_tick_spacing = pool_tick_spacing;
            store.set_config(config);
        }

        fn set_pool_extension(ref self: ContractState, pool_extension: ContractAddress) {
            let mut world = self.world(@NAMESPACE());
            let mut store = StoreImpl::new(world);
            self.accesscontrol.assert_only_role(ADMIN_ROLE);
            let mut config = store.config();
            config.pool_extension = pool_extension;
            store.set_config(config);
        }

        fn set_pool_sqrt(ref self: ContractState, pool_sqrt: u256) {
            let mut world = self.world(@NAMESPACE());
            let mut store = StoreImpl::new(world);
            self.accesscontrol.assert_only_role(ADMIN_ROLE);
            let mut config = store.config();
            config.pool_sqrt = pool_sqrt;
            store.set_config(config);
        }

        fn set_base_price(ref self: ContractState, base_price: u256) {
            let mut world = self.world(@NAMESPACE());
            let mut store = StoreImpl::new(world);
            self.accesscontrol.assert_only_role(ADMIN_ROLE);
            let mut config = store.config();
            config.base_price = base_price;
            store.set_config(config);
        }

        fn set_average_score(ref self: ContractState, average_score: u32, average_weigth: u16) {
            let mut world = self.world(@NAMESPACE());
            let mut store = StoreImpl::new(world);
            self.accesscontrol.assert_only_role(ADMIN_ROLE);
            let mut config = store.config();
            config.average_score = average_score;
            config.average_weigth = average_weigth;
            store.set_config(config);
        }

        fn set_appchain_materializer(ref self: ContractState, addr: ContractAddress) {
            let mut world = self.world(@NAMESPACE());
            let mut store = StoreImpl::new(world);
            self.accesscontrol.assert_only_role(ADMIN_ROLE);
            assert(addr != starknet::get_contract_address(), 'Setup: materializer is self');
            let mut config = store.config();
            config.appchain_materializer = addr;
            store.set_config(config);
        }

        fn set_bridge_messaging(ref self: ContractState, addr: ContractAddress) {
            let mut world = self.world(@NAMESPACE());
            let mut store = StoreImpl::new(world);
            self.accesscontrol.assert_only_role(ADMIN_ROLE);
            let mut config = store.config();
            config.bridge_messaging = addr;
            store.set_config(config);
        }

        fn set_appchain_play(ref self: ContractState, addr: ContractAddress) {
            let mut world = self.world(@NAMESPACE());
            let mut store = StoreImpl::new(world);
            self.accesscontrol.assert_only_role(ADMIN_ROLE);
            let mut config = store.config();
            config.appchain_play = addr;
            store.set_config(config);
        }

        fn set_mainnet_setup(ref self: ContractState, addr: ContractAddress) {
            let mut world = self.world(@NAMESPACE());
            let mut store = StoreImpl::new(world);
            self.accesscontrol.assert_only_role(ADMIN_ROLE);
            let mut config = store.config();
            config.mainnet_setup = addr;
            store.set_config(config);
        }

        fn merkledrop_register(
            ref self: ContractState, data: Span<Span<felt252>>, expiration: u64,
        ) -> felt252 {
            self.accesscontrol.assert_only_role(ADMIN_ROLE);
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

        // Public; anyone can call. Caller supplies pending claim payloads they
        // discovered from the appchain (off-chain via Torii). For each payload:
        //
        // 1. Sort by purchase_id (deterministic ordering; config.push is NOT
        //    commutative — verified by test_ema_push_commutative).
        // 2. consume_message_from_appchain(appchain_play, payload) authenticates
        //    the origin and reverts if no matching Piltover message exists.
        // 3. Update EMA via config.push (level, weight).
        // 4. Mint NUMS reward to player via Token.reward (Setup holds
        //    MINTER_ROLE; granted post-migration).
        // 5. Flip PendingPurchase{purchase_id}.status to Materialized.
        //
        // Partial-failure behavior: one bad payload reverts the whole batch.
        // Caller must remove the offending payload and retry. Operator-trust
        // model: well-formed payloads are the operator's responsibility.
        fn apply_game_claim_batch(ref self: ContractState, payloads: Span<Span<felt252>>) {
            let mut world = self.world(@NAMESPACE());
            let mut store = StoreImpl::new(world);
            let config = store.config();

            // Sentinel: bridge mode must be active.
            assert(!config.bridge_messaging.is_zero(), 'Setup: bridge not configured');
            assert(!config.appchain_play.is_zero(), 'Setup: appchain_play unset');

            let messaging = IMessagingDispatcher { contract_address: config.bridge_messaging };
            let token = ITokenDispatcher {
                contract_address: world.dns_address(@TOKEN()).expect('Token not found!'),
            };

            // Sort payloads by purchase_id (first felt) for deterministic
            // EMA application. Caller can replicate sort offline.
            let sorted = sort_by_purchase_id(payloads);

            let mut config_mut = store.config();
            let mut i = 0;
            while i < sorted.len() {
                let payload = *sorted.at(i);
                assert(payload.len() == 6, 'Setup: bad payload len');

                // Authenticate via Piltover. Reverts if no matching message.
                messaging.consume_message_from_appchain(config.appchain_play, payload);

                let purchase_id: u64 = (*payload.at(0)).try_into().expect('Setup: bad purchase_id');
                let player_felt: felt252 = *payload.at(1);
                let player: ContractAddress = player_felt.try_into().expect('Setup: bad player');
                let level: u32 = (*payload.at(2)).try_into().expect('Setup: bad level');
                let weight: u16 = (*payload.at(3)).try_into().expect('Setup: bad weight');
                let reward_amount: u128 = (*payload.at(4)).try_into().expect('Setup: bad reward');
                let _game_id: u64 = (*payload.at(5)).try_into().expect('Setup: bad game_id');

                // EMA push (rolling difficulty feedback).
                config_mut.push(level, weight, crate::constants::EMA_MIN_SCORE.into());

                // Mint NUMS reward.
                token.reward(player, reward_amount.into());

                // Flip PendingPurchase status. Defensive: only allow Pending →
                // Materialized so a replay would revert.
                let mut pending = store.pending_purchase(purchase_id);
                assert(pending.status == PendingStatus::Pending, 'Setup: pending not Pending');
                pending.status = PendingStatus::Materialized;
                store.set_pending_purchase(@pending);

                store.game_claim_applied(purchase_id, player, level, weight, reward_amount);

                i += 1;
            }

            store.set_config(config_mut);
        }
    }

    /// Sort payloads in ascending order of purchase_id (first felt).
    /// Insertion sort — N is small (caller's gas budget bounds the batch).
    fn sort_by_purchase_id(payloads: Span<Span<felt252>>) -> Span<Span<felt252>> {
        let n = payloads.len();
        let mut buf: Array<Span<felt252>> = ArrayTrait::new();
        let mut i = 0;
        while i < n {
            buf.append(*payloads.at(i));
            i += 1;
        }
        // In-place insertion sort over the Array.
        let mut sorted: Array<Span<felt252>> = ArrayTrait::new();
        let mut remaining = buf;
        while remaining.len() > 0 {
            // Find min in remaining
            let mut min_idx: u32 = 0;
            let mut min_pid: u64 = (*remaining.at(0).at(0)).try_into().unwrap_or(0_u64);
            let mut k: u32 = 1;
            while k < remaining.len() {
                let pid: u64 = (*remaining.at(k).at(0)).try_into().unwrap_or(0_u64);
                if pid < min_pid {
                    min_pid = pid;
                    min_idx = k;
                }
                k += 1;
            }
            // Pop min from remaining, push to sorted, copy rest back
            let mut rest: Array<Span<felt252>> = ArrayTrait::new();
            let mut j: u32 = 0;
            while j < remaining.len() {
                if j == min_idx {
                    sorted.append(*remaining.at(j));
                } else {
                    rest.append(*remaining.at(j));
                }
                j += 1;
            }
            remaining = rest;
        }
        sorted.span()
    }
}
