pub const IERC7572_ID: felt252 = 0x7572;

#[starknet::interface]
pub trait IERC7572Metadata<TContractState> {
    fn contract_uri(self: @TContractState) -> ByteArray;
}
