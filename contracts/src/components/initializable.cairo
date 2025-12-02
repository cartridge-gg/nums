#[starknet::component]
pub mod InitializableComponent {
    // Imports

    use achievement::components::achievable::AchievableComponent;
    use achievement::components::achievable::AchievableComponent::InternalImpl as AchievableInternalImpl;
    use dojo::world::{WorldStorage, WorldStorageTrait};
    use quest::components::questable::QuestableComponent;
    use quest::components::questable::QuestableComponent::InternalImpl as QuestableInternalImpl;
    use crate::elements::achievements::index::{ACHIEVEMENT_COUNT, Achievement, AchievementTrait};
    use crate::elements::quests::index::{IQuest, QUEST_COUNT, QuestProps, QuestType};
    use crate::systems::play::NAME as PLAY;

    // Storage

    #[storage]
    pub struct Storage {}

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {}

    #[generate_trait]
    pub impl InternalImpl<
        TContractState,
        +HasComponent<TContractState>,
        +Drop<TContractState>,
        impl Achievable: AchievableComponent::HasComponent<TContractState>,
        impl Quest: QuestableComponent::HasComponent<TContractState>,
    > of InternalTrait<TContractState> {
        fn initialize(ref self: ComponentState<TContractState>, world: WorldStorage) {
            // [Event] Initialize all Achievements
            let (play_address, _) = world.dns(@PLAY()).expect('Play contract not found!');
            let mut achievement_id: u8 = ACHIEVEMENT_COUNT;
            let achievable = get_dep_component!(@self, Achievable);
            while achievement_id > 0 {
                let achievement: Achievement = achievement_id.into();
                achievable
                    .create(
                        world,
                        id: achievement.identifier(),
                        rewarder: 0.try_into().unwrap(),
                        start: 0,
                        end: 0,
                        tasks: achievement.tasks(),
                        metadata: achievement.metadata(),
                        to_store: true,
                    );
                achievement_id -= 1;
            }
            // [Event] Initialize all Quests
            let mut quest_id: u8 = QUEST_COUNT;
            let questable = get_dep_component!(@self, Quest);
            while quest_id > 0 {
                let quest_type: QuestType = quest_id.into();
                let props: QuestProps = quest_type.props();
                questable
                    .create(
                        world: world,
                        id: props.id,
                        rewarder: play_address,
                        start: props.start,
                        end: props.end,
                        duration: props.duration,
                        interval: props.interval,
                        tasks: props.tasks.span(),
                        conditions: props.conditions.span(),
                        metadata: props.metadata,
                        to_store: true,
                    );
                quest_id -= 1;
            };
        }
    }
}
