use starknet::ContractAddress;

#[derive(Drop, Clone, Serde, PartialEq, Introspect, DojoStore)]
pub struct Token {
    pub address: ContractAddress,
    pub ty: TokenType,
}

#[derive(Drop, Clone, Serde, PartialEq, Default, Introspect, DojoStore)]
pub enum TokenType {
    #[default]
    ERC20: TokenTypeERC20,
    ERC721: TokenTypeERC721,
    ERC1155: TokenTypeERC1155,
}


#[derive(Drop, Clone, Serde, PartialEq, Default, Introspect, DojoStore)]
pub struct TokenTypeERC20 {
    pub amount: u256,
    pub count: u8,
}

#[derive(Drop, Clone, Serde, PartialEq, Default, Introspect, DojoStore)]
pub struct TokenTypeERC721 {
    pub ids: Array<u256>,
}

#[derive(Drop, Clone, Serde, PartialEq, Default, Introspect, DojoStore)]
pub struct TokenTypeERC1155 {
    pub ids: Array<u256>,
    pub amounts: Array<u256>,
}

