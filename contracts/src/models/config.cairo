use starknet::ContractAddress;
pub use crate::models::index::Config;

pub mod errors {
    pub const CONFIG_CALLER_NOT_OWNER: felt252 = 'Config: caller not owner';
    pub const CONFIG_CALLER_NOT_STARTERPACK: felt252 = 'Config: caller not starterpack';
    pub const CONFIG_CALLER_NOT_FORWARDER: felt252 = 'Config: caller not forwarder';
}

pub const BURN_PCT: u256 = 50;

#[generate_trait]
pub impl ConfigImpl of ConfigTrait {
    #[inline]
    fn new(
        world_resource: felt252,
        nums: ContractAddress,
        vrf: ContractAddress,
        starterpack: ContractAddress,
        forwarder: ContractAddress,
        owner: ContractAddress,
    ) -> Config {
        Config { world_resource, nums, vrf, starterpack, forwarder, owner, count: 0 }
    }

    #[inline]
    fn uuid(ref self: Config) -> u32 {
        self.count += 1;
        self.count
    }

    #[inline]
    fn split(self: Config, cost: u256) -> (u256, u256) {
        let to_burn = cost * BURN_PCT / 100;
        let to_jackpot = cost - to_burn;
        (to_burn, to_jackpot)
    }
}

#[generate_trait]
pub impl ConfigAssert of AssertTrait {
    #[inline]
    fn assert_is_owner(self: @Config, caller: ContractAddress) {
        assert(caller == *self.owner, errors::CONFIG_CALLER_NOT_OWNER);
    }

    #[inline]
    fn assert_is_starterpack(self: @Config, starterpack: ContractAddress) {
        assert(starterpack == *self.starterpack, errors::CONFIG_CALLER_NOT_STARTERPACK);
    }

    #[inline]
    fn assert_is_forwarder(self: @Config, caller: ContractAddress) {
        assert(caller == *self.forwarder, errors::CONFIG_CALLER_NOT_FORWARDER);
    }
}
