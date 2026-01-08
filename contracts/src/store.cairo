use dojo::event::EventStorage;
use dojo::model::ModelStorage;
use dojo::world::WorldStorage;
use ekubo::components::clear::IClearDispatcher;
use ekubo::interfaces::erc20::IERC20Dispatcher;
use ekubo::interfaces::router::IRouterDispatcher;
use crate::constants::WORLD_RESOURCE;
use crate::events::reward::GameRewardTrait;
use crate::interfaces::nums::INumsTokenDispatcher;
use crate::interfaces::starterpack::IStarterpackDispatcher;
use crate::interfaces::vrf::IVrfProviderDispatcher;
use crate::models::index::{Claim, Config, Game, Starterpack, Usage};

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
        let contract_address: starknet::ContractAddress =
            0x053b40A647CEDfca6cA84f542A0fe36736031905A9639a7f19A3C1e66bFd5080
            .try_into()
            .unwrap();
        IERC20Dispatcher { contract_address: contract_address }
    }

    fn ekubo_router(self: @Store) -> IRouterDispatcher {
        // Mainnet: 0x04505a9f06f2bd639b6601f37a4dc0908bb70e8e0e0c34b1220827d64f4fc066
        let contract_address: starknet::ContractAddress =
            0x050d4da9f66589eadaa1d5e31cf73b08ac1a67c8b4dcd88e6fd4fe501c628af2
            .try_into()
            .unwrap();
        IRouterDispatcher { contract_address: contract_address }
    }

    fn ekubo_clearer(self: @Store) -> IClearDispatcher {
        // Mainnet: 0x04505a9f06f2bd639b6601f37a4dc0908bb70e8e0e0c34b1220827d64f4fc066
        let contract_address: starknet::ContractAddress =
            0x050d4da9f66589eadaa1d5e31cf73b08ac1a67c8b4dcd88e6fd4fe501c628af2
            .try_into()
            .unwrap();
        IClearDispatcher { contract_address: contract_address }
    }

    fn vrf_disp(ref self: Store) -> IVrfProviderDispatcher {
        let config = self.config();
        IVrfProviderDispatcher { contract_address: config.vrf }
    }

    fn starterpack_disp(ref self: Store) -> IStarterpackDispatcher {
        let config = self.config();
        IStarterpackDispatcher { contract_address: config.starterpack }
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

    // Usage

    fn usage(self: @Store) -> Usage {
        self.world.read_model(WORLD_RESOURCE)
    }

    fn set_usage(mut self: Store, usage: @Usage) {
        self.world.write_model(usage)
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

    // Claim

    fn claim(self: @Store, player: felt252, starterpack_id: u32) -> Claim {
        self.world.read_model((player, starterpack_id))
    }

    fn set_claim(mut self: Store, claim: @Claim) {
        self.world.write_model(claim)
    }

    // Reward

    fn reward(mut self: Store, game_id: u64, reward: u64) {
        let event = GameRewardTrait::new(game_id, reward);
        self.world.emit_event(@event);
    }
}
