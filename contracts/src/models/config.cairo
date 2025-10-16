use starknet::ContractAddress;
pub use crate::models::index::Config;

pub mod errors {
    pub const CONFIG_CALLER_NOT_OWNER: felt252 = 'Config: caller not owner';
}

#[generate_trait]
pub impl ConfigImpl of ConfigTrait {
    #[inline]
    fn new(
        world_resource: felt252,
        nums_address: ContractAddress,
        vrf_address: ContractAddress,
        owner: ContractAddress,
        burn_pct: u8,
    ) -> Config {
        Config { world_resource, nums_address, vrf_address, owner, burn_pct }
    }

    #[inline]
    fn split(self: Config, cost: u256) -> (u256, u256) {
        let to_burn = cost * self.burn_pct.into() / 100;
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
}
