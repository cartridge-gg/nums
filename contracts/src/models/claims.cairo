// use starknet::ContractAddress;

// #[derive(Drop, Serde)]
// #[dojo::model]
// pub struct Claims {
//     #[key]
//     pub player: ContractAddress,
//     #[key]
//     pub claim_id: u32,
//     pub ty: ClaimsType,
// }

// #[derive(Copy, Drop, Serde, PartialEq, Introspect, DojoStore)]
// pub struct TokenClaim {
//     pub amount: u64,
// }

// #[derive(Copy, Drop, Serde, PartialEq, Introspect, DojoStore)]
// pub struct JackpotClaim {
//     pub id: u32,
// }

// #[derive(Copy, Drop, Serde, PartialEq, Introspect, DojoStore)]
// pub enum ClaimsType {
//     TOKEN: TokenClaim,
//     JACKPOT: JackpotClaim,
// }
