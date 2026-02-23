use dojo::event::EventStorage;
use dojo::model::ModelStorage;
use dojo::world::WorldStorage;
use ekubo::components::clear::IClearDispatcher;
use ekubo::interfaces::erc20::IERC20Dispatcher;
use ekubo::interfaces::router::IRouterDispatcher;
use crate::constants::WORLD_RESOURCE;
use crate::events::claimed::ClaimedTrait;
use crate::events::purchased::PurchasedTrait;
use crate::events::started::StartedTrait;
use crate::interfaces::nums::INumsTokenDispatcher;
use crate::interfaces::registry::IStarterpackRegistryDispatcher;
use crate::interfaces::vrf::IVrfProviderDispatcher;
use crate::models::index::{Config, Game, Starterpack};

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

    fn nums_disp(self: @Store) -> INumsTokenDispatcher {
        let config = self.config();
        INumsTokenDispatcher { contract_address: config.nums }
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
        IRouterDispatcher { contract_address: config.ekubo }
    }

    fn ekubo_clearer(self: @Store) -> IClearDispatcher {
        // Mainnet: 0x04505a9f06f2bd639b6601f37a4dc0908bb70e8e0e0c34b1220827d64f4fc066
        // Sepolia: 0x050d4da9f66589eadaa1d5e31cf73b08ac1a67c8b4dcd88e6fd4fe501c628af2
        let config = self.config();
        IClearDispatcher { contract_address: config.ekubo }
    }

    fn vrf_disp(ref self: Store) -> IVrfProviderDispatcher {
        let config = self.config();
        IVrfProviderDispatcher { contract_address: config.vrf }
    }

    fn starterpack_disp(ref self: Store) -> IStarterpackRegistryDispatcher {
        let config = self.config();
        IStarterpackRegistryDispatcher { contract_address: config.starterpack }
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

    // Starterpack

    fn starterpack(self: @Store, starterpack_id: u32) -> Starterpack {
        self.world.read_model(starterpack_id)
    }

    fn set_starterpack(mut self: Store, starterpack: @Starterpack) {
        self.world.write_model(starterpack)
    }

    // Events

    fn claimed(mut self: Store, player_id: felt252, game_id: u64, reward: u64) {
        let event = ClaimedTrait::new(player_id, game_id, reward);
        self.world.emit_event(@event);
    }

    fn purchased(
        mut self: Store, player_id: felt252, starterpack_id: u32, quantity: u32, multiplier: u8,
    ) {
        let event = PurchasedTrait::new(player_id, starterpack_id, quantity, multiplier);
        self.world.emit_event(@event);
    }

    fn started(mut self: Store, player_id: felt252, game_id: u64, multiplier: u8) {
        let event = StartedTrait::new(player_id, game_id, multiplier);
        self.world.emit_event(@event);
    }
}
