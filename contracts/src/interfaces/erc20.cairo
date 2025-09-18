use starknet::ContractAddress;

#[starknet::interface]
pub trait IERC20<T> {
    // IERC20Metadata
    fn decimals(self: @T) -> u8;
    fn name(self: @T) -> felt252;
    fn symbol(self: @T) -> felt252;

    // IERC20Allowance
    fn allowance(self: @T, owner: ContractAddress, spender: ContractAddress) -> u256;
    fn approve(ref self: T, spender: ContractAddress, amount: u256) -> bool;

    // IERC20Balance
    fn balance_of(self: @T, account: ContractAddress) -> u256;
    fn transfer(ref self: T, recipient: ContractAddress, amount: u256) -> bool;
    fn transfer_from(
        ref self: T, sender: ContractAddress, recipient: ContractAddress, amount: u256,
    ) -> bool;

    fn total_supply(self: @T) -> u256;
}
