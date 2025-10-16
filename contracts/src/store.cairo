use dojo::model::ModelStorage;
use dojo::world::WorldStorage;
use crate::interfaces::nums::INumsTokenDispatcher;
use crate::interfaces::vrf::IVrfProviderDispatcher;
use crate::models::index::{Config, Game, Leaderboard, Slot, Tournament};
use crate::types::game_config::GameConfig;

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
        INumsTokenDispatcher { contract_address: config.nums_address }
    }

    fn vrf_disp(ref self: Store) -> IVrfProviderDispatcher {
        let config = self.config();
        IVrfProviderDispatcher { contract_address: config.vrf_address }
    }

    // Config

    fn config(ref self: Store) -> Config {
        self.world.read_model((0))
    }

    fn set_config(ref self: Store, config: Config) {
        let mut config = config;
        config.world_resource = 0;
        assert!(config.burn_pct < 101, "invalid burn pct");
        self.world.write_model(@config)
    }

    // Game

    fn game(ref self: Store, game_id: u64) -> Game {
        self.world.read_model(game_id)
    }

    fn set_game(ref self: Store, game: @Game) {
        self.world.write_model(game)
    }

    // Slot

    fn slot(ref self: Store, game_id: u64, index: u8) -> Slot {
        self.world.read_model((game_id, index))
    }

    fn slots(ref self: Store, game_id: u64, config: GameConfig) -> Array<Slot> {
        let mut slots = array![];
        let mut index: u8 = 0;
        while index < config.max_slots {
            let slot = self.slot(game_id, index);
            slots.append(slot);
            index += 1;
        }
        slots
    }

    fn set_slot(ref self: Store, slot: @Slot) {
        self.world.write_model(slot)
    }

    // Leaderboard

    fn leaderboard(ref self: Store, tournament_id: u64) -> Leaderboard {
        self.world.read_model(tournament_id)
    }

    fn set_leaderboard(ref self: Store, leaderboard: @Leaderboard) {
        self.world.write_model(leaderboard)
    }

    // Tournament

    fn tournament(ref self: Store, uuid: u64) -> Tournament {
        self.world.read_model(uuid)
    }

    fn set_tournament(ref self: Store, tournament: @Tournament) {
        self.world.write_model(tournament)
    }
}
