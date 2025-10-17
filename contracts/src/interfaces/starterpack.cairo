use starknet::ContractAddress;

#[derive(Drop, Serde)]
pub struct StarterPackMetadata {
    pub name: ByteArray,
    pub description: ByteArray,
    pub image_uri: ByteArray,
}

#[derive(Drop, Serde)]
pub struct StarterpackQuote {
    pub base_price: u256,
    pub referral_fee: u256,
    pub protocol_fee: u256,
    pub total_cost: u256,
    pub payment_token: ContractAddress,
}

#[starknet::interface]
pub trait IStarterpack<TContractState> {
    fn quote(self: @TContractState, starterpack_id: u32, has_referrer: bool) -> StarterpackQuote;
    fn register(
        ref self: TContractState,
        implementation: ContractAddress,
        referral_percentage: u8,
        reissuable: bool,
        price: u256,
        payment_token: ContractAddress,
        metadata: StarterPackMetadata,
    ) -> u32; // returns starterpack_id

    fn update(
        ref self: TContractState,
        starterpack_id: u32,
        implementation: ContractAddress,
        referral_percentage: u8,
        reissuable: bool,
        price: u256,
        payment_token: ContractAddress,
        metadata: StarterPackMetadata,
    );

    fn pause(ref self: TContractState, starterpack_id: u32);

    fn resume(ref self: TContractState, starterpack_id: u32);

    fn issue(
        ref self: TContractState,
        recipient: ContractAddress,
        starterpack_id: u32,
        referrer: Option<ContractAddress>,
        referrer_group: Option<felt252>,
    );
}
