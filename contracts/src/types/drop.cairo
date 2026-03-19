#[derive(Drop, Copy, Serde)]
pub struct MerkleDrop {
    pub recipient: starknet::ContractAddress,
    pub quantity: u8,
}
