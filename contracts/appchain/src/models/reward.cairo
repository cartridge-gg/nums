use starknet::ContractAddress;

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct Reward {
    #[key]
    pub player: ContractAddress,
    #[key]
    pub game_id: u32,
    pub amount: u16,
    pub claimed: bool,
}
