use dojo::model::ModelStorage;
use dojo::world::WorldStorage;
use crate::constants::WORLD_RESOURCE;
use crate::interfaces::nums::INumsTokenDispatcher;
use crate::interfaces::starterpack::IStarterpackDispatcher;
use crate::interfaces::vrf::IVrfProviderDispatcher;
use crate::models::index::{
    Config, Game, Leaderboard, Merkledrop, Prize, Reward, Setting, Starterpack, Tournament, Usage,
};

#[derive(Drop)]
pub struct Store {
    pub world: WorldStorage,
}

#[generate_trait]
pub impl StoreImpl of StoreTrait {
    fn new(world: WorldStorage) -> Store {
        Store { world }
    }

    //  Dispatchers

    fn nums_disp(ref self: Store) -> INumsTokenDispatcher {
        let config = self.config();
        INumsTokenDispatcher { contract_address: config.nums }
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

    fn config(ref self: Store) -> Config {
        self.world.read_model(WORLD_RESOURCE)
    }

    fn set_config(ref self: Store, config: Config) {
        let mut config = config;
        config.world_resource = 0;
        self.world.write_model(@config)
    }

    // Usage

    fn usage(ref self: Store) -> Usage {
        self.world.read_model(WORLD_RESOURCE)
    }

    fn set_usage(ref self: Store, usage: @Usage) {
        self.world.write_model(usage)
    }

    // Game

    fn game(ref self: Store, game_id: u64) -> Game {
        self.world.read_model(game_id)
    }

    fn set_game(ref self: Store, game: @Game) {
        self.world.write_model(game)
    }

    // Leaderboard

    fn leaderboard(ref self: Store, tournament_id: u16) -> Leaderboard {
        self.world.read_model(tournament_id)
    }

    fn set_leaderboard(ref self: Store, leaderboard: @Leaderboard) {
        self.world.write_model(leaderboard)
    }

    // Tournament

    fn tournament(ref self: Store, id: u16) -> Tournament {
        self.world.read_model(id)
    }

    fn set_tournament(ref self: Store, tournament: @Tournament) {
        self.world.write_model(tournament)
    }

    // Prize

    fn prize(ref self: Store, tournament_id: u16, address: felt252) -> Prize {
        self.world.read_model((tournament_id, address))
    }

    fn set_prize(ref self: Store, prize: @Prize) {
        self.world.write_model(prize)
    }

    // Reward

    fn reward(ref self: Store, tournament_id: u16, address: felt252, game_id: u64) -> Reward {
        self.world.read_model((tournament_id, address, game_id))
    }

    fn set_reward(ref self: Store, reward: @Reward) {
        self.world.write_model(reward)
    }

    // Starterpack

    fn starterpack(ref self: Store, starterpack_id: u32) -> Starterpack {
        self.world.read_model(starterpack_id)
    }

    fn set_starterpack(ref self: Store, starterpack: @Starterpack) {
        self.world.write_model(starterpack)
    }

    // Merkledrop

    fn merkledrop(ref self: Store, id: felt252) -> Merkledrop {
        self.world.read_model(id)
    }

    fn set_merkledrop(ref self: Store, merkledrop: @Merkledrop) {
        self.world.write_model(merkledrop)
    }

    // Setting

    fn setting(ref self: Store, setting_id: u32) -> Setting {
        self.world.read_model(setting_id)
    }

    fn set_setting(ref self: Store, setting: @Setting) {
        self.world.write_model(setting)
    }
}
