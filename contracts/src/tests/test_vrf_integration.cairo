use cartridge_vrf::{IVrfProviderDispatcher, IVrfProviderDispatcherTrait, PublicKey, Source};
use crate::helpers::random::RandomImpl;
use crate::tests::setup::setup::spawn_game;

#[starknet::interface]
trait IVrfMockTestExt<TContractState> {
    fn set_test_seed(ref self: TContractState, seed: felt252);
}

#[test]
fn test_vrf_mock_implements_canonical_trait_surface() {
    let (_, systems, _) = spawn_game();
    let provider = systems.vrf;

    provider.request_random(starknet::get_contract_address(), Source::Salt('test'));
    assert(provider.get_consume_count() == 0, 'count should start at 0');
    assert(!provider.is_vrf_call(), 'is_vrf_call should be false');

    let pubkey = PublicKey { x: 0xaa, y: 0xbb };
    provider.set_public_key(pubkey);
    let read_back = provider.get_public_key();
    assert(read_back.x == 0xaa, 'pubkey.x roundtrip');
    assert(read_back.y == 0xbb, 'pubkey.y roundtrip');

    provider.assert_consumed(0x1234);
}

#[test]
fn test_vrf_mock_test_seed_override() {
    let (_, systems, _) = spawn_game();
    let override_ext = IVrfMockTestExtDispatcher { contract_address: systems.vrf.contract_address };
    override_ext.set_test_seed(0x42);

    let consumed = systems.vrf.consume_random(Source::Salt('s'));
    assert(consumed == 0x42, 'override seed not applied');
}

#[test]
fn test_random_new_vrf_uses_canonical_dispatcher() {
    let (_, systems, _) = spawn_game();
    let override_ext = IVrfMockTestExtDispatcher { contract_address: systems.vrf.contract_address };
    override_ext.set_test_seed(0x1000);

    let mut rand = RandomImpl::new_vrf(systems.vrf);
    assert(rand.seed == 0x1000, 'seed wired from dispatcher');

    let v = rand.between::<u8>(0, 99);
    assert(v <= 99, 'between returns in-range value');
}

#[test]
fn test_random_new_vrf_falls_back_to_tx_hash() {
    let (_, systems, _) = spawn_game();

    let mut rand = RandomImpl::new_vrf(systems.vrf);
    let _ = rand.between::<u8>(0, 100);
}
