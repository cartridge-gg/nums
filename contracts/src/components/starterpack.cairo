#[starknet::component]
pub mod StarterpackComponent {
    // Imports

    use dojo::world::{WorldStorage, WorldStorageTrait};
    use crate::interfaces::registry::IStarterpackRegistryDispatcherTrait;
    use crate::models::config::ConfigAssert;
    use crate::models::starterpack::{StarterpackAssert, StarterpackTrait};
    use crate::systems::play::NAME as PLAY;
    use crate::systems::token::NAME as TOKEN;
    use crate::{StoreImpl, StoreTrait};

    // Constants

    pub const MULTIPLIER: u256 = 100000;
    pub const STARTERPACK_COUNT: u8 = 10;
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
        TContractState, +HasComponent<TContractState>,
    > of InternalTrait<TContractState> {
        fn initialize(
            ref self: ComponentState<TContractState>, world: WorldStorage, base_price: u256,
        ) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);
            let starterpack_disp = store.starterpack_disp();
            let nums_address = world.dns_address(@TOKEN()).expect('Token not found!');
            let payment_token = store.quote_disp().contract_address;
            let play_address = world.dns_address(@PLAY()).expect('Play contract not found!');
            // [Effect] Register and store all starterpacks
            let reissuable = true;
            let payment_tokens = array![payment_token, nums_address].span();
            for index in 0..STARTERPACK_COUNT {
                // [Interaction] Register starterpack
                let multiplier: u8 = index + 1;
                let stake: u256 = multiplier.into();
                let price = stake
                    * base_price
                    * (MULTIPLIER - stake * MULTIPLIER / 100)
                    / MULTIPLIER;
                let starterpack_id = starterpack_disp
                    .register(
                        implementation: play_address,
                        referral_percentage: REFERRAL_PERCENTAGE,
                        reissuable: reissuable,
                        price: price,
                        payment_token: payment_token,
                        payment_receiver: Option::Some(play_address),
                        metadata: StarterpackTrait::metadata(payment_tokens, multiplier),
                    );
                // [Effect] Create starterpack
                let pack = StarterpackTrait::new(
                    id: starterpack_id,
                    reissuable: reissuable,
                    referral_percentage: REFERRAL_PERCENTAGE,
                    price: price,
                    payment_token: payment_token,
                    multiplier: multiplier,
                );
                store.set_starterpack(@pack);
            };
        }

        fn set_referral(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            from: u32,
            referral_percentage: u8,
        ) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);
            let starterpack_disp = store.starterpack_disp();
            let payment_token = store.quote_disp().contract_address;
            let play_address = world.dns_address(@PLAY()).expect('Play contract not found!');
            // [Effect] Register and store all starterpacks
            for index in 0_u32..STARTERPACK_COUNT.into() {
                let mut pack = store.starterpack(index + from);
                starterpack_disp
                    .update(
                        starterpack_id: pack.id,
                        implementation: play_address,
                        referral_percentage: referral_percentage,
                        reissuable: pack.reissuable,
                        price: pack.price,
                        payment_token: payment_token,
                        payment_receiver: Option::Some(play_address),
                    );
                pack.referral_percentage = referral_percentage;
                store.set_starterpack(@pack);
            };
        }

        fn update(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            starterpack_id: u32,
            reissuable: bool,
            payment_token: starknet::ContractAddress,
            referral_percentage: u8,
            price: u256,
        ) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Check] Starterpack does exist
            let mut starterpack = store.starterpack(starterpack_id);
            starterpack.assert_does_exist();

            // [Effect] Update starterpack
            starterpack.update(reissuable, referral_percentage, price, payment_token);
            store.set_starterpack(@starterpack);

            // [Interaction] Update starterpack
            store
                .starterpack_disp()
                .update(
                    starterpack_id: starterpack_id,
                    implementation: starknet::get_contract_address(),
                    referral_percentage: referral_percentage,
                    reissuable: reissuable,
                    price: price,
                    payment_token: payment_token,
                    payment_receiver: None,
                );
        }

        fn update_metadata(
            ref self: ComponentState<TContractState>, world: WorldStorage, starterpack_id: u32,
        ) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Check] Starterpack does exist
            let pack = store.starterpack(starterpack_id);
            pack.assert_does_exist();

            // [Interaction] Update metadata
            let payment_token = store.quote_disp().contract_address;
            let nums_address = store.nums_disp().contract_address;
            let starterpack_disp = store.starterpack_disp();
            let payment_tokens = array![payment_token, nums_address].span();
            starterpack_disp
                .update_metadata(
                    starterpack_id, StarterpackTrait::metadata(payment_tokens, pack.multiplier),
                );
        }
    }
}
