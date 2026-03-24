use bundle::models::index::Bundle;
use dojo::event::EventStorage;
use dojo::model::ModelStorage;
use dojo::world::{WorldStorage, WorldStorageTrait};
use ekubo::components::clear::IClearDispatcher;
use ekubo::interfaces::erc20::IERC20Dispatcher;
use ekubo::interfaces::positions::IPositionsDispatcher;
use ekubo::interfaces::router::IRouterDispatcher;
use crate::constants::WORLD_RESOURCE;
use crate::events::claimed::ClaimedTrait;
use crate::events::purchased::PurchasedTrait;
use crate::events::started::StartedTrait;
use crate::events::vault::{VaultClaimedTrait, VaultPaidTrait};
use crate::interfaces::vrf::IVrfProviderDispatcher;
use crate::models::index::{Config, Game, VaultInfo, VaultPosition};
use crate::systems::token::{ITokenDispatcher, NAME as TOKEN};
use crate::systems::vault::{IVaultDispatcher, NAME as VAULT};

#[derive(Copy, Drop)]
pub struct Store {
    pub world: WorldStorage,
}

#[generate_trait]
pub impl StoreImpl of StoreTrait {
    fn new(world: WorldStorage) -> Store {
        Store { world }
    }

    //  Dispatchers

    fn nums_disp(self: @Store) -> ITokenDispatcher {
        let token_address = self.world.dns_address(@TOKEN()).expect('Token not found!');
        ITokenDispatcher { contract_address: token_address }
    }

    fn vrf_disp(self: @Store) -> IVrfProviderDispatcher {
        let config = self.config();
        IVrfProviderDispatcher { contract_address: config.vrf }
    }

    fn vault_disp(self: @Store) -> IVaultDispatcher {
        let vault_address = self.world.dns_address(@VAULT()).expect('Vault not found!');
        IVaultDispatcher { contract_address: vault_address }
    }

    fn quote_disp(self: @Store) -> IERC20Dispatcher {
        // Mainnet: 0x033068F6539f8e6e6b131e6B2B814e6c34A5224bC66947c47DaB9dFeE93b35fb
        // Sepolia: 0x053b40A647CEDfca6cA84f542A0fe36736031905A9639a7f19A3C1e66bFd5080
        let config = self.config();
        IERC20Dispatcher { contract_address: config.quote }
    }

    fn ekubo_router(self: @Store) -> IRouterDispatcher {
        // Mainnet: 0x04505a9f06f2bd639b6601f37a4dc0908bb70e8e0e0c34b1220827d64f4fc066
        // Sepolia: 0x050d4da9f66589eadaa1d5e31cf73b08ac1a67c8b4dcd88e6fd4fe501c628af2
        let config = self.config();
        IRouterDispatcher { contract_address: config.ekubo_router }
    }

    fn ekubo_clearer(self: @Store) -> IClearDispatcher {
        // Mainnet: 0x04505a9f06f2bd639b6601f37a4dc0908bb70e8e0e0c34b1220827d64f4fc066
        // Sepolia: 0x050d4da9f66589eadaa1d5e31cf73b08ac1a67c8b4dcd88e6fd4fe501c628af2
        let config = self.config();
        IClearDispatcher { contract_address: config.ekubo_router }
    }

    fn ekubo_positions(self: @Store) -> IPositionsDispatcher {
        // Mainnet: 0x07b696af58c967c1b14c9dde0ace001720635a660a8e90c565ea459345318b30
        // Sepolia: 0x04afc78d6fec3b122fc1f60276f074e557749df1a77a93416451be72c435120f
        let config = self.config();
        IPositionsDispatcher { contract_address: config.ekubo_positions }
    }

    // Config

    fn config(self: @Store) -> Config {
        self.world.read_model(WORLD_RESOURCE)
    }

    fn set_config(mut self: Store, config: Config) {
        let mut config = config;
        config.world_resource = 0;
        self.world.write_model(@config)
    }

    // Game

    fn game(self: @Store, game_id: u64) -> Game {
        self.world.read_model(game_id)
    }

    fn set_game(mut self: Store, game: @Game) {
        self.world.write_model(game)
    }

    // Bundle

    fn bundle(self: @Store, bundle_id: u32) -> Bundle {
        self.world.read_model(bundle_id)
    }

    fn set_bundle(mut self: Store, bundle: @Bundle) {
        self.world.write_model(bundle)
    }

    // Vault

    fn vault(self: @Store) -> VaultInfo {
        self.world.read_model(WORLD_RESOURCE)
    }

    fn set_vault(mut self: Store, vault: @VaultInfo) {
        self.world.write_model(vault)
    }

    // Position

    fn position(self: @Store, user: felt252) -> VaultPosition {
        self.world.read_model(user)
    }

    fn set_position(mut self: Store, position: @VaultPosition) {
        self.world.write_model(position)
    }

    // Events

    fn claimed(mut self: Store, player_id: felt252, game_id: u64, reward: u128) {
        let event = ClaimedTrait::new(player_id, game_id, reward);
        self.world.emit_event(@event);
    }

    fn purchased(
        mut self: Store, player_id: felt252, bundle_id: u32, quantity: u32, multiplier: u128,
    ) {
        let event = PurchasedTrait::new(player_id, bundle_id, quantity, multiplier);
        self.world.emit_event(@event);
    }

    fn started(mut self: Store, player_id: felt252, game_id: u64, multiplier: u128) {
        let event = StartedTrait::new(player_id, game_id, multiplier);
        self.world.emit_event(@event);
    }

    fn vault_paid(mut self: Store, player_id: felt252, amount: u256) {
        let event = VaultPaidTrait::new(player_id, amount);
        self.world.emit_event(@event);
    }

    fn vault_claimed(mut self: Store, user: felt252, amount: u256) {
        let event = VaultClaimedTrait::new(user, amount);
        self.world.emit_event(@event);
    }
}
