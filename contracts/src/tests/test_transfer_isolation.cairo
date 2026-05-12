//! Isolation test for `IERC20MixinDispatcher.transfer`.
//!
//! The e2e bridge test fails with `ERC20: transfer to 0` inside Settler's
//! burn==0 short-circuit, even though debug asserts confirm `team_address`
//! is non-zero in Settler's frame. This test isolates the dispatcher
//! mechanics from Settler's broader context to localize the bug:
//!
//!   Test 1: EOA → Faucet.transfer via IERC20MixinDispatcher
//!   Test 2: Contract → Faucet.transfer via IERC20MixinDispatcher
//!           (mirrors Settler.settle's `quote.transfer(team, amount)`)
//!
//! If both pass, the bug is something specific to Settler's setup
//! (Dojo macro, AccessControl interference, storage layout, etc.).
//! If Test 2 fails the same way, the bug is in contract-to-contract
//! dispatch through IERC20MixinDispatcher.

#[starknet::interface]
pub trait ITransferRelay<TState> {
    fn relay_transfer(
        ref self: TState,
        token: starknet::ContractAddress,
        recipient: starknet::ContractAddress,
        amount: u256,
    );
}

/// Minimal pass-through contract that mirrors Settler.settle's failing
/// callsite: a contract calls `IERC20MixinDispatcher.transfer(...)` to
/// move tokens from its own balance to a recipient.
#[starknet::contract]
pub mod TransferRelay {
    use openzeppelin::interfaces::token::erc20::{IERC20MixinDispatcher, IERC20MixinDispatcherTrait};
    use starknet::ContractAddress;
    use super::ITransferRelay;

    #[storage]
    struct Storage {}

    #[abi(embed_v0)]
    impl Impl of ITransferRelay<ContractState> {
        fn relay_transfer(
            ref self: ContractState,
            token: ContractAddress,
            recipient: ContractAddress,
            amount: u256,
        ) {
            IERC20MixinDispatcher { contract_address: token }.transfer(recipient, amount);
        }
    }
}

#[cfg(test)]
mod tests {
    use dojo::world::{WorldStorage, WorldStorageTrait};
    use dojo_cairo_test::{NamespaceDef, TestResource, spawn_test_world};
    use openzeppelin::interfaces::token::erc20::{IERC20MixinDispatcher, IERC20MixinDispatcherTrait};
    use starknet::ContractAddress;
    use starknet::syscalls::deploy_syscall;
    use starknet::testing::{set_account_contract_address, set_contract_address};
    use crate::constants::NAMESPACE;
    use crate::models::index as models;
    use crate::systems::faucet::{Faucet, IFaucetDispatcher, IFaucetDispatcherTrait, NAME as FAUCET};
    use super::{ITransferRelayDispatcher, ITransferRelayDispatcherTrait, TransferRelay};

    fn OWNER() -> ContractAddress {
        'OWNER'.try_into().unwrap()
    }

    fn ALICE() -> ContractAddress {
        'ALICE'.try_into().unwrap()
    }

    fn BOB() -> ContractAddress {
        'BOB'.try_into().unwrap()
    }

    fn spawn_faucet_only() -> (WorldStorage, ContractAddress) {
        set_contract_address(OWNER());
        set_account_contract_address(OWNER());

        let namespace_def = NamespaceDef {
            namespace: NAMESPACE(),
            resources: [
                TestResource::Model(models::m_Config::TEST_CLASS_HASH),
                TestResource::Contract(Faucet::TEST_CLASS_HASH),
            ]
                .span(),
        };

        let world = spawn_test_world(dojo::world::world::TEST_CLASS_HASH, [namespace_def].span());
        let (faucet_addr, _) = world.dns(@FAUCET()).expect('Faucet not found');
        (world, faucet_addr)
    }

    /// Sanity: EOA-style caller calls Faucet.transfer via IERC20MixinDispatcher.
    /// If this fails the dispatcher is broken at a fundamental level.
    #[test]
    fn eoa_transfer_via_mixin_dispatcher_works() {
        let (_world, faucet) = spawn_faucet_only();

        // Mint 1000 to ALICE via Faucet's IFaucet.mint (anyone can call).
        IFaucetDispatcher { contract_address: faucet }.mint(ALICE(), 1000_u256);

        // Switch caller to ALICE and have her transfer 100 to BOB.
        set_contract_address(ALICE());
        let mixin = IERC20MixinDispatcher { contract_address: faucet };
        mixin.transfer(BOB(), 100_u256);

        // Verify balances.
        assert(mixin.balance_of(BOB()) == 100_u256, 'BOB balance != 100');
        assert(mixin.balance_of(ALICE()) == 900_u256, 'ALICE balance != 900');
    }

    /// Contract-to-contract: a relay contract calls Faucet.transfer via
    /// IERC20MixinDispatcher. This mirrors Settler.settle's pattern at
    /// settler.cairo:331 (`quote.transfer(team_address, team_amount)`).
    #[test]
    fn contract_to_contract_transfer_via_mixin_dispatcher_works() {
        let (_world, faucet) = spawn_faucet_only();

        // Deploy TransferRelay via deploy_syscall.
        let (relay, _) = deploy_syscall(
            TransferRelay::TEST_CLASS_HASH.try_into().unwrap(), 0, [].span(), false,
        )
            .expect('relay deploy failed');

        // Mint 1000 to the RELAY contract.
        IFaucetDispatcher { contract_address: faucet }.mint(relay, 1000_u256);

        // Trigger relay_transfer from OWNER (EOA). Inside the relay,
        // `get_caller_address()` will be RELAY itself, so the Faucet's
        // ERC20 transfer pulls from RELAY's balance.
        set_contract_address(OWNER());
        ITransferRelayDispatcher { contract_address: relay }
            .relay_transfer(faucet, BOB(), 100_u256);

        // Verify balances.
        let mixin = IERC20MixinDispatcher { contract_address: faucet };
        assert(mixin.balance_of(BOB()) == 100_u256, 'BOB balance != 100');
        assert(mixin.balance_of(relay) == 900_u256, 'RELAY balance != 900');
    }
}
