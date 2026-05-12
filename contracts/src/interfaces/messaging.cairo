//! Minimal Piltover messaging interface used by mainnet `Play`.
//!
//! Mirrors `piltover::messaging::interface::IMessaging` from the Katana repo
//! (`katana/crates/contracts/contracts/piltover/src/messaging/interface.cairo`).
//! Only the methods Nums uses are declared; the upstream trait can replace
//! this once Piltover is added as a workspace dependency.
//!
//! Both methods are intended to be called on **mainnet**:
//! - `send_message_to_appchain` is called by mainnet `Play.mint` to queue
//!   the forward game-mint message.
//! - `consume_message_from_appchain` is called by mainnet `Play.claim` to
//!   validate the reverse claim message.
//!
//! Note: there is NO send-side dispatcher method for the appchain →
//! mainnet direction. That direction uses Cairo's native
//! `starknet::send_message_to_l1_syscall(to_address: felt252, payload: Span<felt252>)`
//! syscall directly from the appchain `Playable.finish` code.

use starknet::ContractAddress;

#[starknet::interface]
pub trait IMessaging<T> {
    /// [mainnet] Send a message from Starknet to the Appchain.
    /// Called by mainnet `Play.mint` for the forward direction.
    /// Returns (message_hash, nonce).
    fn send_message_to_appchain(
        ref self: T, to_address: ContractAddress, selector: felt252, payload: Span<felt252>,
    ) -> (felt252, felt252);

    /// [mainnet] Consume a message that originated on the Appchain.
    /// Called by mainnet `Play.claim` for the reverse direction.
    /// Returns the message hash that was consumed.
    fn consume_message_from_appchain(
        ref self: T, from_address: ContractAddress, payload: Span<felt252>,
    ) -> felt252;
}
