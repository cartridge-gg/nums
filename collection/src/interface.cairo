use collection::types::contract_metadata::ContractMetadata;
use starknet::ContractAddress;

#[starknet::interface]
pub trait GameTrait<TContractState> {
    fn assert_token_owner(self: @TContractState, caller: ContractAddress, token_id: u256);
    fn assert_token_authorized(self: @TContractState, caller: ContractAddress, token_id: u256);
    // fn mint(ref self: TContractState, to: ContractAddress, token_id: u256);
    // fn burn(ref self: TContractState, token_id: u256);
    // fn update_token_metadata(ref self: TContractState, token_id: u256);
    fn set_contract_metadata(ref self: TContractState, metadata: ContractMetadata);
}

#[starknet::interface]
pub trait Minter<TContractState> {
    fn get_token_metadata(
        self: @TContractState, token_id: u256,
    ) -> (Span<u16>, u16, u32, u32, u64, u64, bool, bool, u32, u8);
}
