use nums::constants::ONE_MINUTE;
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


pub impl DefaultGameConfig of Default<GameConfig> {
    fn default() -> GameConfig {
        GameConfig {
            max_slots: 20,
            min_number: 1,
            max_number: 1000,
            entry_cost: 1000,
            game_duration: 3 * ONE_MINUTE,
        }
    }
}
#[generate_trait]
pub impl DefaultGameRewardImpl of DefaultGameRewardTrait {
    fn default() -> Array<u32> {
        array![
            32, 32, 32, 32, 64, 64, 64, 64, 64, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384,
            42000, 69000,
        ]
    }
}
