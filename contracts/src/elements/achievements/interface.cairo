use crate::elements::achievements::index::AchievementProps;

pub trait AchievementTrait {
    fn identifier() -> felt252;
    fn props() -> AchievementProps;
}
