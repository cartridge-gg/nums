use starknet::ContractAddress;

pub const ZERO_ADDRESS: ContractAddress = 0.try_into().unwrap();

pub const ONE_MINUTE: u64 = 60;
pub const ONE_HOUR: u64 = 60 * ONE_MINUTE;
pub const ONE_DAY: u64 = 24 * ONE_HOUR;
pub const ONE_MONTH: u64 = 30 * ONE_DAY;
pub const ONE_YEAR: u64 = 365 * ONE_DAY;
