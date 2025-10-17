use core::num::traits::Pow;
use starknet::ContractAddress;

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

pub const ZERO_ADDRESS: ContractAddress = 0.try_into().unwrap();
pub const BUDOKAN_MAINNET: ContractAddress =
    0x58f888ba5897efa811eca5e5818540d35b664f4281660cd839cd5a4b0bf4582
    .try_into()
    .unwrap();
pub const BUDOKAN_SEPOLIA: ContractAddress =
    0x57c8cd92cfbedd2bac670b776d371d40ea96f13d9dc8c2da6ef83a6c4d3922f
    .try_into()
    .unwrap();

pub const TEN_POW_18: u128 = 10_u128.pow(18);

pub const ENTRY_PRICE: u128 = 2000;
pub const ONE_MINUTE: u64 = 60;
pub const ONE_HOUR: u64 = 60 * ONE_MINUTE;
pub const ONE_DAY: u64 = 24 * ONE_HOUR;
pub const ONE_MONTH: u64 = 30 * ONE_DAY;
pub const ONE_YEAR: u64 = 365 * ONE_DAY;
