//! Minimal Piltover messaging interface used by mainnet `Setup`.
//!
//! Mirrors `piltover::messaging::interface::IMessaging` from the Katana repo
//! (`katana/crates/contracts/contracts/piltover/src/messaging/interface.cairo`).
//! We only declare the methods Nums uses; the upstream trait can replace this
//! once Piltover is added as a workspace dependency.
//!
//! Note: there is NO send-side dispatcher method for the appchain → mainnet
//! direction. That direction uses Cairo's native
//! `starknet::send_message_to_l1_syscall(to_address: felt252, payload: Span<felt252>)`
//! syscall directly from the appchain Play / Playable code.

use starknet::ContractAddress;

#[starknet::interface]
pub trait IMessaging<T> {
    /// Send a message from Starknet to the Appchain.
    /// Returns (message_hash, nonce).
    fn send_message_to_appchain(
        ref self: T, to_address: ContractAddress, selector: felt252, payload: Span<felt252>,
    ) -> (felt252, felt252);

    /// Consume a message that originated on the Appchain.
    /// Returns the message hash that was consumed.
    fn consume_message_from_appchain(
        ref self: T, from_address: ContractAddress, payload: Span<felt252>,
    ) -> felt252;
}
