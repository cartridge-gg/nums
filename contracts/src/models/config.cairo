use starknet::ContractAddress;
use crate::constants;
pub use crate::models::index::Config;

pub mod errors {
    pub const CONFIG_CALLER_NOT_OWNER: felt252 = 'Config: caller not owner';
    pub const CONFIG_CALLER_NOT_STARTERPACK: felt252 = 'Config: caller not starterpack';
}

#[generate_trait]
pub impl ConfigImpl of ConfigTrait {
    fn new(
        world_resource: felt252,
        nums: ContractAddress,
        vrf: ContractAddress,
        starterpack: ContractAddress,
        vault: ContractAddress,
        owner: ContractAddress,
        quote: ContractAddress,
        ekubo_router: ContractAddress,
        ekubo_positions: ContractAddress,
        burn_percentage: u8,
        target_supply: u256,
        average_score: u8,
        pool_fee: u128,
        pool_tick_spacing: u128,
        pool_extension: ContractAddress,
        pool_sqrt: u256,
        base_price: u256,
    ) -> Config {
        Config {
            world_resource: world_resource,
            nums: nums,
            vrf: vrf,
            starterpack: starterpack,
            vault: vault,
            owner: owner,
            quote: quote,
            ekubo_router: ekubo_router,
            ekubo_positions: ekubo_positions,
            burn_percentage: burn_percentage,
            target_supply: target_supply,
            count: 0,
            slot_count: constants::DEFAULT_SLOT_COUNT,
            slot_min: constants::DEFAULT_SLOT_MIN,
            slot_max: constants::DEFAULT_SLOT_MAX,
            average_weigth: constants::EMA_INITIAL_WEIGTH,
            average_score: average_score.into()
                * constants::EMA_SCORE_PRECISION
                * constants::EMA_INITIAL_WEIGTH.into(),
            last_updated: starknet::get_block_timestamp(),
            pool_fee: pool_fee,
            pool_tick_spacing: pool_tick_spacing,
            pool_extension: pool_extension,
            pool_sqrt: pool_sqrt,
            base_price: base_price,
        }
    }

    fn average_score(self: @Config) -> (u32, u32) {
        (*self.average_score, (*self.average_weigth).into() * constants::EMA_SCORE_PRECISION)
    }

    fn push(ref self: Config, score: u32, min_score: u32) {
        // [Check] Score is above the minimum score
        if score < min_score {
            return;
        }
        // [Check] Last updated is beyond the minimum time
        let now = starknet::get_block_timestamp();
        if now < self.last_updated + constants::EMA_MIN_TIME {
            return;
        }
        // [Effect] Update the average score
        self
            .average_score =
                if self.average_weigth < constants::EMA_MAX_WEIGTH {
                    self.average_weigth += 1;
                    self.average_score + score * constants::EMA_SCORE_PRECISION
                } else {
                    let average = self.average_score / self.average_weigth.into();
                    self.average_score + score * constants::EMA_SCORE_PRECISION - average
                };
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

#[cfg(test)]
mod tests {
    use starknet::testing::set_block_timestamp;
    use super::*;

    #[test]
    fn test_average_score_from_0_to_20() {
        let initial_score = 0;
        let final_score = 20;
        let mut config: Config = ConfigTrait::new(
            world_resource: 0,
            nums: 0.try_into().unwrap(),
            vrf: 0.try_into().unwrap(),
            starterpack: 0.try_into().unwrap(),
            vault: 0.try_into().unwrap(),
            owner: 0.try_into().unwrap(),
            quote: 0.try_into().unwrap(),
            ekubo_router: 0.try_into().unwrap(),
            ekubo_positions: 0.try_into().unwrap(),
            burn_percentage: 0,
            target_supply: 0,
            average_score: initial_score,
            pool_fee: 0,
            pool_tick_spacing: 0,
            pool_extension: 0.try_into().unwrap(),
            pool_sqrt: 0,
            base_price: 0,
        );
        for i in 0..constants::EMA_MAX_WEIGTH {
            set_block_timestamp(i.into() * constants::EMA_MIN_TIME);
            config.push(final_score, 0);
        }
        let (avg_num, avg_den) = config.average_score();
        assert_eq!(config.average_weigth, constants::EMA_MAX_WEIGTH);
        assert_eq!(avg_num, 18188656);
        assert_eq!(avg_den, 1000000);
    }

    #[test]
    fn test_average_score_from_20_to_0() {
        let initial_score = 20;
        let final_score = 0;
        let mut config: Config = ConfigTrait::new(
            world_resource: 0,
            nums: 0.try_into().unwrap(),
            vrf: 0.try_into().unwrap(),
            starterpack: 0.try_into().unwrap(),
            vault: 0.try_into().unwrap(),
            owner: 0.try_into().unwrap(),
            quote: 0.try_into().unwrap(),
            ekubo_router: 0.try_into().unwrap(),
            ekubo_positions: 0.try_into().unwrap(),
            burn_percentage: 0,
            target_supply: 0,
            average_score: initial_score,
            pool_fee: 0,
            pool_tick_spacing: 0,
            pool_extension: 0.try_into().unwrap(),
            pool_sqrt: 0,
            base_price: 0,
        );
        for i in 0..constants::EMA_MAX_WEIGTH {
            set_block_timestamp(i.into() * constants::EMA_MIN_TIME);
            config.push(final_score, 0);
        }
        let (avg_num, avg_den) = config.average_score();
        assert_eq!(config.average_weigth, constants::EMA_MAX_WEIGTH);
        assert_eq!(avg_num, 1811437);
        assert_eq!(avg_den, 1000000);
    }
}
