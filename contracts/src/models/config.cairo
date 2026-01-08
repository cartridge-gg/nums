use starknet::ContractAddress;
use crate::constants;
pub use crate::models::index::Config;

pub mod errors {
    pub const CONFIG_CALLER_NOT_OWNER: felt252 = 'Config: caller not owner';
    pub const CONFIG_CALLER_NOT_STARTERPACK: felt252 = 'Config: caller not starterpack';
}

pub const BURN_PCT: u256 = 50;

#[generate_trait]
pub impl ConfigImpl of ConfigTrait {
    fn new(
        world_resource: felt252,
        nums: ContractAddress,
        vrf: ContractAddress,
        starterpack: ContractAddress,
        owner: ContractAddress,
        entry_price: u128,
        target_supply: u256,
    ) -> Config {
        Config {
            world_resource: world_resource,
            nums: nums,
            vrf: vrf,
            starterpack: starterpack,
            owner: owner,
            entry_price: entry_price,
            target_supply: target_supply,
            count: 0,
            slot_count: constants::DEFAULT_SLOT_COUNT,
            slot_min: constants::DEFAULT_SLOT_MIN,
            slot_max: constants::DEFAULT_SLOT_MAX,
        }
    }


    fn uuid(ref self: Config) -> u32 {
        self.count += 1;
        self.count
    }


    fn split(self: Config, cost: u256) -> (u256, u256) {
        let to_burn = cost * BURN_PCT / 100;
        let to_jackpot = cost - to_burn;
        (to_burn, to_jackpot)
    }
}

#[generate_trait]
pub impl ConfigAssert of AssertTrait {
    fn assert_is_owner(self: @Config, caller: ContractAddress) {
        assert(caller == *self.owner, errors::CONFIG_CALLER_NOT_OWNER);
    }


    fn assert_is_starterpack(self: @Config, starterpack: ContractAddress) {
        assert(starterpack == *self.starterpack, errors::CONFIG_CALLER_NOT_STARTERPACK);
    }
}
