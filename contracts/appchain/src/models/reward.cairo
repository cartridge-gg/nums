use starknet::ContractAddress;

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct Reward {
    #[key]
    pub game_id: u32,
    #[key]
    pub player: ContractAddress,
    pub total: u32
}