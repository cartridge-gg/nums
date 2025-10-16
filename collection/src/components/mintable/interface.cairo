use starknet::ContractAddress;

#[starknet::interface]
pub trait IMintable<TState> {
    fn minter(self: @TState) -> ContractAddress;
    fn transfer_minter(ref self: TState, new_minter: ContractAddress);
    fn renounce_minter(ref self: TState);
}
