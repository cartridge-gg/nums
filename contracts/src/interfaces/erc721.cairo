use starknet::ContractAddress;

#[starknet::interface]
pub trait IERC721<T> {
    // IERC721
    fn balance_of(self: @T, account: ContractAddress) -> u256;
    fn owner_of(self: @T, token_id: u256) -> ContractAddress;
    fn safe_transfer_from(
        ref self: T,
        from: ContractAddress,
        to: ContractAddress,
        token_id: u256,
        data: Span<felt252>,
    );
    fn transfer_from(ref self: T, from: ContractAddress, to: ContractAddress, token_id: u256);
    fn approve(ref self: T, to: ContractAddress, token_id: u256);
    fn set_approval_for_all(ref self: T, operator: ContractAddress, approved: bool);
    fn get_approved(self: @T, token_id: u256) -> ContractAddress;
    fn is_approved_for_all(self: @T, owner: ContractAddress, operator: ContractAddress) -> bool;

    // ISRC5
    fn supports_interface(self: @T, interface_id: felt252) -> bool;

    // IERC721Metadata
    fn name(self: @T) -> ByteArray;
    fn symbol(self: @T) -> ByteArray;
    fn token_uri(self: @T, token_id: u256) -> ByteArray;
}
