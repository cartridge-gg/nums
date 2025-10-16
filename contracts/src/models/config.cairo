pub use crate::models::index::Config;


#[generate_trait]
pub impl ConfigImpl of ConfigTrait {
    fn split(self: Config, cost: u256) -> (u256, u256) {
        let to_burn = cost * self.burn_pct.into() / 100;
        let to_jackpot = cost - to_burn;
        (to_burn, to_jackpot)
    }
}
