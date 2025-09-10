use dojo::model::ModelStorage;
use dojo::world::WorldStorage;
use starknet::ContractAddress;
use crate::interfaces::nums::INumsTokenDispatcher;
use crate::interfaces::vrf::IVrfProviderDispatcher;
use crate::models::{Config, Game, Identifier, Jackpot, JackpotFactory, JackpotWinner, Slot};

#[derive(Drop)]
pub struct Store {
    pub world: WorldStorage,
}

#[generate_trait]
pub impl StoreImpl of StoreTrait {
    fn new(world: WorldStorage) -> Store {
        Store { world }
    }

    // identifiers
    fn next_id(ref self: Store, typ: felt252) -> u32 {
        let mut identifier: Identifier = self.world.read_model((typ));
        identifier.id += 1;
        self.world.write_model(@identifier);
        identifier.id
    }

    //  disp

    fn nums_disp(ref self: Store) -> INumsTokenDispatcher {
        let config = self.config();
        INumsTokenDispatcher { contract_address: config.nums_address }
    }

    fn vrf_disp(ref self: Store) -> IVrfProviderDispatcher {
        let config = self.config();
        IVrfProviderDispatcher { contract_address: config.vrf_address }
    }

    // config

    fn config(ref self: Store) -> Config {
        self.world.read_model((0))
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


    // jackpot factory

    fn jackpot_factory(ref self: Store, factory_id: u32) -> JackpotFactory {
        self.world.read_model((factory_id,))
    }

    fn set_jackpot_factory(ref self: Store, factory: @JackpotFactory) {
        self.world.write_model(factory)
    }


    // jackpot

    fn jackpot(ref self: Store, jackpot_id: u32) -> Jackpot {
        self.world.read_model((jackpot_id,))
    }

    fn set_jackpot(ref self: Store, jackpot: @Jackpot) {
        self.world.write_model(jackpot)
    }

    // jackpot winner

    fn jackpot_winner(ref self: Store, jackpot_id: u32, index: u8) -> JackpotWinner {
        self.world.read_model((jackpot_id, index))
    }

    fn set_jackpot_winner(ref self: Store, jackpot_winner: @JackpotWinner) {
        self.world.write_model(jackpot_winner)
    }
}
