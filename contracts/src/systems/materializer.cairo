#[inline]
pub fn NAME() -> ByteArray {
    "Materializer"
}

/// Minimal Play interface re-declared here to avoid pulling the entire Play
/// dispatcher (which depends on the Dojo macros). We only need the one method
/// the Materializer calls.
#[starknet::interface]
pub trait IPlayCreate<T> {
    fn create(
        ref self: T,
        player: starknet::ContractAddress,
        multiplier: u128,
        supply: u256,
        price: u256,
        quantity: u32,
        purchase_id: u64,
    );
}

/// Plain Starknet contract (NOT a Dojo contract) deployed on the appchain.
///
/// Owns the `#[l1_handler] materialize` entry point that receives game-mint
/// messages from mainnet's `Setup.issue` bridge path. Authenticates the sender
/// against `mainnet_setup`, guards against replay using `processed_ids[purchase_id]`,
/// then calls into the appchain Play contract to create the games.
#[starknet::contract]
pub mod Materializer {
    use starknet::{ContractAddress, get_caller_address};
    use starknet::storage::{
        Map, StoragePathEntry, StoragePointerReadAccess, StoragePointerWriteAccess,
    };
    use super::{IPlayCreateDispatcher, IPlayCreateDispatcherTrait};

    #[storage]
    struct Storage {
        // The mainnet Setup contract — only authorized origin for messages.
        mainnet_setup: ContractAddress,
        // The appchain Play contract — Materializer calls create() on it.
        play: ContractAddress,
        // Replay guard keyed by purchase_id (assigned by mainnet, monotonic
        // per Setup deployment). Set on first delivery; blocks duplicates
        // even if a future replay_pending feature produces a fresh Piltover
        // hash for the same purchase.
        processed_ids: Map<u64, bool>,
        // Test-driven admin: lets the e2e harness patch addresses post-deploy
        // to resolve the circular dependency between Setup ↔ Materializer.
        admin: ContractAddress,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState, mainnet_setup: ContractAddress, play: ContractAddress,
    ) {
        // Sentinel: neither address may be zero at construction time. (Test
        // harness uses set_mainnet_setup/set_play to patch post-deploy if
        // needed, but the initial deploy must provide non-zero addresses.)
        assert(mainnet_setup.into() != 0_felt252, 'Materializer: zero mainnet');
        assert(play.into() != 0_felt252, 'Materializer: zero play');
        self.mainnet_setup.write(mainnet_setup);
        self.play.write(play);
        self.admin.write(get_caller_address());
    }

    #[l1_handler]
    fn materialize(
        ref self: ContractState,
        from_address: felt252,
        purchase_id: u64,
        recipient: ContractAddress,
        multiplier: u128,
        price_lo: u128,
        price_hi: u128,
        quantity: u32,
    ) {
        // [Check] Origin authentication: only the configured mainnet Setup
        // contract is allowed to send messages this Materializer accepts.
        let expected: felt252 = self.mainnet_setup.read().into();
        assert(from_address == expected, 'Invalid sender');

        // [Check] Replay guard: this purchase_id must not have been processed
        // before. Piltover's mailbox semantics handle the same message twice
        // naturally, but a future replay_pending feature could resend the
        // same logical purchase with a fresh Piltover nonce — this guards
        // against double-mint there.
        assert(!self.processed_ids.entry(purchase_id).read(), 'Already materialized');
        self.processed_ids.entry(purchase_id).write(true);

        let price = u256 { low: price_lo, high: price_hi };
        // supply is dead in the cross-chain payload (Game.supply field is no
        // longer read on the appchain side; see plan's Dead Field Cleanup).
        // Pass zero; the Game model stores it but nothing reads it.
        let supply = u256 { low: 0, high: 0 };

        let mut play = IPlayCreateDispatcher { contract_address: self.play.read() };
        play.create(recipient, multiplier, supply, price, quantity, purchase_id);
    }

    #[generate_trait]
    pub impl ViewImpl of ViewTrait {
        fn mainnet_setup(self: @ContractState) -> ContractAddress {
            self.mainnet_setup.read()
        }
        fn play(self: @ContractState) -> ContractAddress {
            self.play.read()
        }
        fn is_processed(self: @ContractState, purchase_id: u64) -> bool {
            self.processed_ids.entry(purchase_id).read()
        }
    }

    /// Test-driven admin surface — see constructor.
    #[abi(per_item)]
    #[generate_trait]
    pub impl AdminImpl of AdminTrait {
        #[external(v0)]
        fn set_mainnet_setup(ref self: ContractState, mainnet_setup: ContractAddress) {
            assert(get_caller_address() == self.admin.read(), 'Materializer: not admin');
            self.mainnet_setup.write(mainnet_setup);
        }
        #[external(v0)]
        fn set_play(ref self: ContractState, play: ContractAddress) {
            assert(get_caller_address() == self.admin.read(), 'Materializer: not admin');
            self.play.write(play);
        }
    }
}
