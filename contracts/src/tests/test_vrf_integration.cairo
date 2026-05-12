use dojo::model::ModelStorage;
use dojo::world::{WorldStorage, WorldStorageTrait};
use crate::constants::{DEFAULT_SLOT_MAX, DEFAULT_SLOT_MIN, WORLD_RESOURCE};
use crate::helpers::random::RandomImpl;
use crate::mocks::vrf::NAME as VRF;
use crate::models::index::Config;
use crate::tests::setup::setup::spawn_game;
use crate::{StoreImpl, StoreTrait};

#[starknet::interface]
trait IVrfMockTestExt<TContractState> {
    fn set_test_seed(ref self: TContractState, seed: felt252);
}

/// Point `Config.vrf` at the deployed Vrf mock and pin a known seed. Mirrors
/// the production wiring done by `Setup.dojo_init`, condensed to the parts
/// the random-consumption chain needs.
fn wire_vrf(mut world: WorldStorage, seed: felt252) {
    let (vrf_address, _) = world.dns(@VRF()).expect('Vrf not found');
    let config = Config {
        world_resource: WORLD_RESOURCE,
        vrf: vrf_address,
        quote: 0.try_into().unwrap(),
        team_address: 0.try_into().unwrap(),
        ekubo_router: 0.try_into().unwrap(),
        ekubo_positions: 0.try_into().unwrap(),
        target_supply: 0,
        burn_percentage: 0,
        vault_percentage: 0,
        slot_count: 18,
        slot_min: DEFAULT_SLOT_MIN,
        slot_max: DEFAULT_SLOT_MAX,
        average_weigth: 0,
        average_score: 0,
        last_updated: 0,
        pool_fee: 0,
        pool_tick_spacing: 0,
        pool_extension: 0.try_into().unwrap(),
        pool_sqrt: 0,
        base_price: 0,
    };
    world.write_model(@config);

    IVrfMockTestExtDispatcher { contract_address: vrf_address }.set_test_seed(seed);
}

/// Validates the exact randomness-consumption chain the game contract runs
/// inside `playable.cairo::set` / `playable.cairo::apply`:
///
///     store.vrf_disp() → RandomImpl::new_vrf(dispatcher) → rand.next_unique(...)
///
/// `rand.next_unique` is the call `Game.next` makes to draw the next number,
/// so different VRF seeds must yield different game-relevant outputs.
/// If the canonical dispatcher import, the `Config.vrf` → `Store::vrf_disp`
/// lookup, or `RandomImpl::new_vrf` regressed (fell back to `tx_hash`, a
/// constant, or the wrong contract), both runs would produce the same
/// output and this test would fail.
///
/// NOTE: this stops short of invoking `Play.set` through the deployed
/// `IPlayDispatcher` because that path's `owner_of` lookup requires a minted
/// Collection NFT, which requires running `Play.dojo_init` to wire up the
/// AccessControl roles, which cascades into needing Treasury / Setup /
/// Token / Vault all initialized. The test world in `tests/setup.cairo`
/// does not call `sync_perms_and_inits`. Building that harness is out of
/// scope for this VRF migration; every line of the migration is exercised
/// by the chain above.
#[test]
fn test_game_randomness_consumes_canonical_vrf() {
    let (world_a, _, _) = spawn_game();
    let (world_b, _, _) = spawn_game();

    wire_vrf(world_a, 0xAAAA);
    wire_vrf(world_b, 0xBBBB);

    let store_a = StoreImpl::new(world_a);
    let store_b = StoreImpl::new(world_b);

    let mut rand_a = RandomImpl::new_vrf(store_a.vrf_disp());
    let mut rand_b = RandomImpl::new_vrf(store_b.vrf_disp());

    let next_a = rand_a.next_unique(DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, @array![]);
    let next_b = rand_b.next_unique(DEFAULT_SLOT_MIN, DEFAULT_SLOT_MAX, @array![]);

    assert(next_a != next_b, 'vrf seed not driving game rand');
}
