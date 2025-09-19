use starknet::ContractAddress;

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct FreeGame {
    #[key]
    pub player: ContractAddress,
    pub played: bool,
}
