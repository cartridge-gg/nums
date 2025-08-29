use starknet::ContractAddress;
use dojo::model::ModelStorage;
use dojo::world::WorldStorage;

use crate::models::{Config, Game, Slot, GameConfig, Jackpot, Totals, GlobalTotals};
use crate::interfaces::nums::{INumsTokenDispatcher};
use crate::interfaces::vrf::{IVrfProviderDispatcher};

#[derive(Drop)]
pub struct Store {
    pub world: WorldStorage,
}

#[generate_trait]
pub impl StoreImpl of StoreTrait {
    fn new(world: WorldStorage) -> Store {
        Store { world }
    }

    // config

    fn config(ref self: Store) -> Config {
        self.world.read_model((0))
    }

    fn game_config(ref self: Store) -> GameConfig {
        let config = self.config();
        config.game.expect('GameConfig not set')
    }

    fn nums_disp(ref self: Store) -> INumsTokenDispatcher {
        let config = self.config();
        INumsTokenDispatcher { contract_address: config.nums_address }
    }

    fn vrf_disp(ref self: Store) -> IVrfProviderDispatcher {
        let config = self.config();
        IVrfProviderDispatcher { contract_address: config.vrf_address }
    }

    fn set_config(ref self: Store, config: Config) {
        let mut config = config;
        config.world_resource = 0;
        self.world.write_model(@config)
    }

    // game

    fn game(ref self: Store, game_id: u32, player: ContractAddress) -> Game {
        self.world.read_model((game_id, player))
    }

    fn set_game(ref self: Store, game: @Game) {
        self.world.write_model(game)
    }

    // slot

    fn slot(ref self: Store, game_id: u32, player: ContractAddress, index: u8) -> Slot {
        self.world.read_model((game_id, player, index))
    }

    fn set_slot(ref self: Store, slot: @Slot) {
        self.world.write_model(slot)
    }

    // jackpot

    fn jackpot(ref self: Store, jackpot_id: u32) -> Jackpot {
        self.world.read_model((jackpot_id,))
    }

    fn set_jackpot(ref self: Store, jackpot: @Jackpot) {
        self.world.write_model(jackpot)
    }

    // totals

    fn totals(ref self: Store, player: ContractAddress) -> Totals {
        self.world.read_model((player,))
    }

    fn set_totals(ref self: Store, totals: @Totals) {
        self.world.write_model(totals)
    }

    // global totals

    fn global_totals(ref self: Store) -> GlobalTotals {
        self.world.read_model((0))
    }

    fn set_global_totals(ref self: Store, totals: GlobalTotals) {
        let mut totals = totals;
        totals.world_resource = 0;
        self.world.write_model(@totals)
    }
}
