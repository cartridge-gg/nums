#[starknet::component]
pub mod RenderableComponent {
    // Imports

    use dojo::world::WorldStorage;
    use game_components::minigame::structs::GameDetail;
    use crate::constants::{DESCRIPTION, NAME};
    use crate::models::game::GameTrait;
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
            NAME()
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
                GameDetail { name: "Level", value: format!("{}", game.level) },
                GameDetail { name: "Tournament ID", value: format!("{}", game.tournament_id) },
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

            // [Return] Slots
            let game = store.game(game_id);
            let game_completed = game.over && game.level == game.slot_count;
            (game.slots().span(), game.number, game_completed, game.over)
        }
    }
}
