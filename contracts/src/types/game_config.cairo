use game_components::minigame::extensions::settings::structs::GameSetting;
use crate::constants::ONE_MINUTE;
pub use crate::models::index::GameConfig;

#[generate_trait]
pub impl GameConfigImpl of GameConfigTrait {
    fn settings() -> Span<GameSetting> {
        let default = DefaultGameConfig::default();
        array![
            GameSetting { name: "Slots", value: format!("{}", default.max_slots) },
            GameSetting { name: "Min Number", value: format!("{}", default.min_number) },
            GameSetting { name: "Max Number", value: format!("{}", default.max_number) },
            GameSetting { name: "Duration (min)", value: format!("{}", default.game_duration) },
        ]
            .span()
    }
}

pub impl DefaultGameConfig of Default<GameConfig> {
    fn default() -> GameConfig {
        GameConfig {
            max_slots: 20,
            max_number: 999,
            min_number: 1,
            entry_cost: 2_000,
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
        ]
    }
}
