use starknet::ContractAddress;

#[derive(Drop, Serde)]
#[dojo::model]
pub struct Config {
    #[key]
    pub world_resource: felt252,
    pub nums_address: ContractAddress,
    pub vrf_address: ContractAddress,
    pub game: GameConfig,
    pub reward: Array<u32>,
}

#[derive(Copy, Drop, Serde, Introspect, DojoStore)]
pub struct GameConfig {
    pub max_slots: u8,
    pub max_number: u16,
    pub min_number: u16,
    pub entry_cost: u32,
    pub game_duration: u64,
}

#[generate_trait]
pub impl ConfigImpl of ConfigTrait {
    fn get_reward(self: @Config, level: u8) -> u32 {
        *self.reward.at(level.into())
    }
}
