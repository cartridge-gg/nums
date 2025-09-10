use nums::constants::ONE_MINUTE;

#[derive(Copy, Drop, Serde, Introspect, DojoStore, PartialEq)]
pub struct GameConfig {
    pub max_slots: u8,
    pub max_number: u16,
    pub min_number: u16,
    pub entry_cost: u32,
    pub game_duration: u64,
}

// #[generate_trait]
// pub impl GameConfigImpl of GameConfigTrait {
//     fn get_reward(self: @Config, level: u8) -> u32 {
//         *self.reward.at(level.into())
//     }
// }


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
