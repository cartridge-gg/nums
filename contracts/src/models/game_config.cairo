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
            max_number: 999,
            entry_cost: 1000,
            game_duration: 3 * ONE_MINUTE,
        }
    }
}
#[generate_trait]
pub impl DefaultGameRewardImpl of DefaultGameRewardTrait {
    fn default() -> Array<u32> {
        array![
            1, 4, 10, 20, 35, 60, 100, 160, 225, 300, 600, 900, 1800, 2500, 4000, 6500, 8000, 10000,
            20000, 42000,
            // 32, 32, 32, 32, 64, 64, 64, 64, 64, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384,
        // 42000, 69000,
        ]
    }
}
