use game_components::minigame::extensions::settings::structs::GameSetting;
use crate::constants::{
    DEFAULT_SLOT_COUNT, DEFAULT_SLOT_MAX, DEFAULT_SLOT_MIN, MAX_SLOT_COUNT, MAX_SLOT_VALUE,
};
pub use crate::models::index::Setting;

pub mod errors {
    pub const SETTINGS_INVALID_SLOT_COUNT: felt252 = 'Setting: invalid slot count';
    pub const SETTINGS_INVALID_SLOT_MAX: felt252 = 'Setting: invalid slot max';
    pub const SETTINGS_INVALID_SLOT_MIN: felt252 = 'Setting: invalid slot min';
    pub const SETTINGS_INVALID_SLOT_BOUNDS: felt252 = 'Setting: invalid slot bounds';
}

#[generate_trait]
pub impl SettingImpl of SettingTrait {
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
        powers: u16,
    ) -> Setting {
        // [Check] Inputs are valid
        SettingAssert::assert_valid_count(slot_count);
        SettingAssert::assert_valid_max(slot_max);
        SettingAssert::assert_valid_bounds(slot_min, slot_max);
        // [Return] New game settings
        Setting {
            id: id,
            slot_count: slot_count,
            slot_min: slot_min,
            slot_max: slot_max,
            powers: powers,
            name: name,
            description: description,
            created_by: created_by,
            created_at: created_at,
        }
    }

    #[inline]
    fn default(id: u32) -> Setting {
        Self::new(
            id: id,
            name: "Default",
            description: "These are the default Nums settings",
            created_by: starknet::get_caller_address(),
            created_at: starknet::get_block_timestamp(),
            slot_count: DEFAULT_SLOT_COUNT,
            slot_min: DEFAULT_SLOT_MIN,
            slot_max: DEFAULT_SLOT_MAX,
            powers: 0 // Default games get their powers from the autonomous tournament
        )
    }

    #[inline]
    fn exists(self: @Setting) -> bool {
        self.slot_max != @0
    }

    #[inline]
    fn details(self: @Setting) -> Span<GameSetting> {
        array![
            GameSetting { name: "Slots", value: format!("{}", self.slot_count) },
            GameSetting { name: "Min Number", value: format!("{}", self.slot_min) },
            GameSetting { name: "Max Number", value: format!("{}", self.slot_max) },
            GameSetting { name: "Powers", value: format!("{}", self.powers) },
        ]
            .span()
    }

    #[inline]
    fn rewards(self: @Setting) -> Array<u32> {
        array![
            1, 4, 10, 20, 35, 60, 100, 160, 225, 300, 600, 900, 1800, 2500, 4000, 6500, 8000, 10000,
            20000, 42000,
        ]
    }
}

#[generate_trait]
pub impl SettingAssert of AssertTrait {
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
