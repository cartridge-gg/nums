#[starknet::component]
pub mod RenderableComponent {
    // Imports

    use dojo::world::WorldStorage;
    use game_components::minigame::structs::GameDetail;
    use crate::constants::{DESCRIPTION, NAME};
    use crate::types::game_config::{DefaultGameConfig, GameConfig};
    use crate::{StoreImpl, StoreTrait};

    // Storage

    #[storage]
    pub struct Storage {}

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {}

    #[generate_trait]
    pub impl InternalImpl<
        TContractState, +HasComponent<TContractState>,
    > of InternalTrait<TContractState> {
        fn get_token_name(self: @ComponentState<TContractState>, token_id: u256) -> ByteArray {
            format!("{} #{}", NAME(), token_id)
        }

        fn get_token_description(
            self: @ComponentState<TContractState>, token_id: u256,
        ) -> ByteArray {
            DESCRIPTION()
        }

        fn get_token_details(
            self: @ComponentState<TContractState>, world: WorldStorage, token_id: u256,
        ) -> Span<GameDetail> {
            // [Setup] Store
            let mut store = StoreImpl::new(world);
            let game_id: u64 = token_id.try_into().expect('Game: invalid token ID');
            let game = store.game(game_id);
            array![
                GameDetail { name: "Reward", value: format!("{}", game.reward) },
                GameDetail { name: "Level", value: format!("{}", game.level) },
                GameDetail { name: "Jackpot ID", value: format!("{}", game.jackpot_id) },
                GameDetail { name: "Game Over", value: format!("{}", game.over) },
            ]
                .span()
        }


        fn get_token_metadata(
            self: @ComponentState<TContractState>, world: WorldStorage, token_id: u256,
        ) -> (Span<u16>, u16, bool, bool) {
            // [Setup] Store
            let mut store = StoreImpl::new(world);

            // [Check] Token ID is valid
            let game_id: u64 = token_id.try_into().expect('Game: invalid token ID');

            // [Compute] Slots
            let game = store.game(game_id);
            let config: GameConfig = DefaultGameConfig::default();
            let mut idx = 0;
            let mut slots: Array<u16> = array![];
            while idx < config.max_slots {
                let slot = store.slot(game_id, idx);
                slots.append(slot.number);
                idx += 1;
            }

            // [Return] Slots
            let game_completed = game.over && game.level == config.max_slots;
            (slots.span(), game.next_number, game_completed, game.over)
        }
    }
}
