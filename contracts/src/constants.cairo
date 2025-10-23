use core::num::traits::Pow;

pub fn NAMESPACE() -> ByteArray {
    "NUMS"
}

pub fn NAME() -> ByteArray {
    "Nums"
}

pub fn DESCRIPTION() -> ByteArray {
    "Number Challenge is a fully onchain game built using Dojo Engine on Starknet that blends strategy and chance. The goal is to place 20 randomly generated numbers into slots in ascending order to win significant prizes."
}

pub fn DEVELOPER() -> ByteArray {
    "Cartridge"
}

pub fn PUBLISHER() -> ByteArray {
    "Cartridge"
}

pub fn GENRE() -> ByteArray {
    "Puzzle Game"
}

pub fn IMAGE() -> ByteArray {
    "https://static.cartridge.gg/presets/nums/icon.png"
}

pub fn CLIENT_URL() -> ByteArray {
    "https://nums.gg"
}

pub const WORLD_RESOURCE: felt252 = 0;

pub const SLOT_SIZE: u128 = 2_u128.pow(12);
pub const TEN_POW_18: u128 = 10_u128.pow(18);

pub const DEFAULT_SETTINGS_ID: u32 = 1;
pub const DEFAULT_SLOT_COUNT: u8 = 20;
pub const DEFAULT_SLOT_MIN: u16 = 1;
pub const DEFAULT_SLOT_MAX: u16 = 999;

pub const MAX_POWER_COUNT: u8 = 3;
pub const MAX_SLOT_COUNT: u8 = 20;
pub const MAX_SLOT_VALUE: u16 = 4095; // 2**12 - 1
