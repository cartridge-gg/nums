#[starknet::component]
pub mod PurchaseComponent {
    // Imports
    use bundle::component::Component as BundleComponent;
    use bundle::component::Component::{BundleTrait, InternalImpl as BundleInternalImpl};
    use bundle::models::bundle::BundleAssert;
    use dojo::world::{WorldStorage, WorldStorageTrait};
    use ekubo::components::clear::IClearDispatcherTrait;
    use ekubo::interfaces::erc20::IERC20Dispatcher;
    use ekubo::interfaces::router::{IRouterDispatcherTrait, RouteNode, TokenAmount};
    use ekubo::types::i129::i129;
    use ekubo::types::keys::PoolKey;
    use leaderboard::components::rankable::RankableComponent::InternalImpl as RankableInternalImpl;
    use openzeppelin::interfaces::token::erc20::{IERC20MixinDispatcher, IERC20MixinDispatcherTrait};
    use starknet::ContractAddress;
    use crate::constants::MULTIPLIER_PRECISION;
    use crate::helpers::random::RandomImpl;
    use crate::helpers::rewarder::Rewarder;
    use crate::models::config::ConfigTrait;
    use crate::models::game::GameAssert;
    use crate::systems::team::NAME as TEAM;
    use crate::systems::token::{ITokenDispatcher, ITokenDispatcherTrait, NAME as TOKEN};
    use crate::systems::vault::{IVaultDispatcher, IVaultDispatcherTrait, NAME as VAULT};
    use crate::types::metadata::Metadata;
    use crate::{StoreImpl, StoreTrait};

    // Constants

    pub const BUNDLE_COUNT: u8 = 10;
    pub const MULTIPLIER: u256 = 100000;
    pub const REFERRAL_PERCENTAGE: u8 = 5;

    // Storage

    #[storage]
    pub struct Storage {}

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {}

    #[generate_trait]
    pub impl InternalImpl<
        TContractState,
        +HasComponent<TContractState>,
        +Drop<TContractState>,
        impl Bundle: BundleComponent::HasComponent<TContractState>,
        impl BundleImpl: BundleTrait<TContractState>,
        impl BundleFeeImpl: BundleComponent::BundleFeeTrait<TContractState>,
    > of PurchaseTrait<TContractState> {
        fn initialize(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            base_price: u256,
            allower: ContractAddress,
        ) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);
            let nums_address = world.dns_address(@TOKEN()).expect('Token not found!');
            let payment_token = store.quote_disp().contract_address;
            // [Effect] Register and store all starterpacks
            let payment_tokens = array![payment_token, nums_address].span();
            let payment_receiver = starknet::get_contract_address();
            let bundle_component = get_dep_component!(@self, Bundle);
            // [Effect] Register free social bundle
            let conditions = array!["social-claim", "conditions", "numsgg"].span();
            bundle_component
                .register(
                    world: world,
                    referral_percentage: REFERRAL_PERCENTAGE,
                    reissuable: false,
                    price: 0,
                    payment_token: payment_token,
                    payment_receiver: payment_receiver,
                    metadata: Metadata::bundle(payment_tokens, conditions),
                    allower: allower,
                );
            // [Effect] Register paid bundles
            let conditions = array![].span();
            for index in 0..BUNDLE_COUNT {
                // [Interaction] Register starterpack
                let stake: u256 = (index + 1).into();
                let price = stake
                    * base_price
                    * (MULTIPLIER - stake * MULTIPLIER / 100)
                    / MULTIPLIER;
                let _bundle_id = bundle_component
                    .register(
                        world: world,
                        referral_percentage: REFERRAL_PERCENTAGE,
                        reissuable: true,
                        price: price,
                        payment_token: payment_token,
                        payment_receiver: payment_receiver,
                        metadata: Metadata::bundle(payment_tokens, conditions),
                        allower: 0.try_into().unwrap(),
                    );
            };
        }

        fn execute(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            recipient: ContractAddress,
            bundle_id: u32,
            quantity: u32,
        ) -> (ContractAddress, u128, u256, u256, u32) {
            // [Setup] Store
            let store = StoreImpl::new(world);

            // [Check] Starterpack is valid
            let bundle = store.bundle(bundle_id);
            bundle.assert_does_exist();

            // [Check] Skip if bundle is free
            let nums_address = self.get_token(world).contract_address;
            let asset = IERC20MixinDispatcher { contract_address: nums_address };
            let nums_supply = asset.total_supply();
            if bundle.price == 0 {
                // [Event] Emit purchase event
                store.purchased(recipient.into(), bundle_id, quantity, MULTIPLIER_PRECISION);

                // [Return] Result
                return (recipient, MULTIPLIER_PRECISION, nums_supply, bundle.price, quantity);
            }

            // [Interaction] Transfer the burn share to Ekubo
            let config = store.config();
            let pack_multiplier = bundle.price / config.base_price + 1;
            let amount = quantity.into()
                * pack_multiplier
                * config.base_price
                * config.burn_percentage.into()
                / 100_u256;
            let quote = IERC20MixinDispatcher { contract_address: bundle.payment_token };
            let router = store.ekubo_router();
            quote.transfer(router.contract_address, amount);

            // [Interaction] Swap Quote token for Nums
            let (token0, token1) = if quote.contract_address < nums_address {
                (quote.contract_address, nums_address)
            } else {
                (nums_address, quote.contract_address)
            };
            let pool_key = PoolKey {
                token0: token0,
                token1: token1,
                fee: config.pool_fee, // 0x28f5c28f5c28f5c28f5c28f5c28f5c2
                tick_spacing: config.pool_tick_spacing, // 0x56a4c,
                // Mainnet: 0x43e4f09c32d13d43a880e85f69f7de93ceda62d6cf2581a582c6db635548fdc
                // Sepolia: 0x73ec792c33b52d5f96940c2860d512b3884f2127d25e023eb9d44a678e4b971
                extension: config.pool_extension,
            };
            let route_node = RouteNode {
                pool_key: pool_key, sqrt_ratio_limit: config.pool_sqrt, skip_ahead: 0,
            };
            let quote_address = quote.contract_address;
            let token_amount = TokenAmount {
                token: quote_address, amount: i129 { mag: amount.low, sign: false },
            };
            router.swap(route_node, token_amount);

            // [Interaction] Clear minimum
            let clearer = store.ekubo_clearer();
            clearer.clear_minimum(IERC20Dispatcher { contract_address: nums_address }, 0);
            clearer.clear(IERC20Dispatcher { contract_address: quote_address });

            // [Interaction] Burn the corresponding amount of Nums
            let this = starknet::get_contract_address();
            let burn_amount = asset.balance_of(this);
            let asset = ITokenDispatcher { contract_address: nums_address };
            asset.burn(burn_amount);

            // [Interaction] Pay dividends to the vault
            let vault_address = self.get_vault(world).contract_address;
            let vault = IVaultDispatcher { contract_address: vault_address };
            let amount = quote.balanceOf(this);
            let vault_amount = amount * config.vault_percentage.into() / 100;
            quote.approve(spender: vault.contract_address, amount: vault_amount);
            vault.pay(recipient.into(), vault_amount);

            // [Interaction] Transfer the remaining amount to the team
            let team_address = world.dns_address(@TEAM()).expect('Team not found!');
            let team_amount = quote.balanceOf(this);
            quote.transfer(team_address, team_amount);

            // [Compute] Multiplier per game
            let burn_per_game = burn_amount / quantity.into();
            let supply_per_game = nums_supply - burn_per_game;
            let (avg_num, avg_den) = config.average_score();
            let multiplier = Rewarder::multiplier(
                supply_per_game,
                config.target_supply,
                burn_per_game,
                avg_num.into(),
                avg_den.into(),
                config.slot_count.into(),
            );

            // [Return] Result
            (recipient, multiplier, supply_per_game, bundle.price, quantity)
        }

        fn fix(ref self: ComponentState<TContractState>, world: WorldStorage) {
            // [Setup] Store
            let store = StoreImpl::new(world);
            let bundle = store.bundle(0);
            let nums_address = world.dns_address(@TOKEN()).expect('Token not found!');
            let payment_token = store.quote_disp().contract_address;
            let bundle_component = get_dep_component!(@self, Bundle);
            // [Effect] Register free social bundle
            let conditions = array!["social-claim", "TWITTER", "numsgg"].span();
            let payment_tokens = array![payment_token, nums_address].span();
            bundle_component
                .update_metadata(
                    world: world,
                    bundle_id: bundle.id,
                    metadata: Metadata::bundle(payment_tokens, conditions),
                );
        }
    }

    #[generate_trait]
    pub impl PrivateImpl<
        TContractState, +HasComponent<TContractState>,
    > of PrivateTrait<TContractState> {
        fn get_token(
            self: @ComponentState<TContractState>, world: WorldStorage,
        ) -> ITokenDispatcher {
            let token_address = world.dns_address(@TOKEN()).expect('Token not found!');
            ITokenDispatcher { contract_address: token_address }
        }

        fn get_vault(
            self: @ComponentState<TContractState>, world: WorldStorage,
        ) -> IVaultDispatcher {
            let vault_address = world.dns_address(@VAULT()).expect('Vault not found!');
            IVaultDispatcher { contract_address: vault_address }
        }
    }
}
