use game_components::minigame::extensions::settings::structs::GameSetting;
use crate::constants::{
    DEFAULT_SETTINGS_ID, DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MAX, DEFAULT_SLOT_MIN, MAX_SLOT_COUNT,
    MAX_SLOT_VALUE,
};
pub use crate::models::index::Settings;

pub mod errors {
    pub const SETTINGS_INVALID_SLOT_COUNT: felt252 = 'Settings: invalid slot count';
    pub const SETTINGS_INVALID_SLOT_MAX: felt252 = 'Settings: invalid slot max';
    pub const SETTINGS_INVALID_SLOT_MIN: felt252 = 'Settings: invalid slot min';
    pub const SETTINGS_INVALID_SLOT_BOUNDS: felt252 = 'Settings: invalid slot bounds';
}

#[generate_trait]
pub impl SettingsImpl of SettingsTrait {
    #[inline]
    fn new(
        id: u32,
        name: ByteArray,
        description: ByteArray,
        created_by: starknet::ContractAddress,
        created_at: u64,
        slot_count: u8,
        slot_min: u16,
        slot_max: u16,
    ) -> Settings {
        // [Check] Inputs are valid
        SettingsAssert::assert_valid_count(slot_count);
        SettingsAssert::assert_valid_max(slot_max);
        SettingsAssert::assert_valid_bounds(slot_min, slot_max);
        // [Return] New game settings
        Settings {
            id: id,
            slot_count: slot_count,
            slot_min: slot_min,
            slot_max: slot_max,
            name: name,
            description: description,
            created_by: created_by,
            created_at: created_at,
        }
    }

    #[inline]
    fn default() -> Settings {
        Self::new(
            id: DEFAULT_SETTINGS_ID,
            name: "Default",
            description: "These are the default Nums settings",
            created_by: starknet::get_caller_address(),
            created_at: starknet::get_block_timestamp(),
            slot_count: DEFAULT_SLOT_COUNT,
            slot_min: DEFAULT_SLOT_MIN,
            slot_max: DEFAULT_SLOT_MAX,
        )
    }

    #[inline]
    fn exists(self: @Settings) -> bool {
        self.slot_max != @0
    }

    #[inline]
    fn details(self: @Settings) -> Span<GameSetting> {
        array![
            GameSetting { name: "Slots", value: format!("{}", self.slot_count) },
            GameSetting { name: "Min Number", value: format!("{}", self.slot_min) },
            GameSetting { name: "Max Number", value: format!("{}", self.slot_max) },
        ]
            .span()
    }

    #[inline]
    fn rewards(self: @Settings) -> Array<u32> {
        array![
            1, 4, 10, 20, 35, 60, 100, 160, 225, 300, 600, 900, 1800, 2500, 4000, 6500, 8000, 10000,
            20000, 42000,
        ]
    }
}

#[generate_trait]
pub impl SettingsAssert of AssertTrait {
    #[inline]
    fn assert_valid_count(slot_count: u8) {
        assert(slot_count <= MAX_SLOT_COUNT, errors::SETTINGS_INVALID_SLOT_COUNT);
    }

    #[inline]
    fn assert_valid_max(slot_max: u16) {
        assert(slot_max <= MAX_SLOT_VALUE, errors::SETTINGS_INVALID_SLOT_MAX);
    }

    #[inline]
    fn assert_valid_min(slot_min: u16) {
        assert(slot_min != 0, errors::SETTINGS_INVALID_SLOT_MIN);
    }

    #[inline]
    fn assert_valid_bounds(slot_min: u16, slot_max: u16) {
        assert(slot_min <= slot_max, errors::SETTINGS_INVALID_SLOT_BOUNDS);
    }
}
