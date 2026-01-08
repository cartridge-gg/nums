use starknet::ContractAddress;
use crate::elements::quests::index::QuestProps;

pub trait QuestTrait {
    fn identifier() -> felt252;
    fn props(registry: ContractAddress) -> QuestProps;
}
