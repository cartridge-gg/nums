// Constants

#[inline]
pub fn NAME() -> ByteArray {
    "Renderer"
}

#[dojo::contract]
mod Renderer {
    use dojo::world::WorldStorageTrait;
    use game_components::minigame::interface::{
        IMinigameDetails, IMinigameDetailsSVG, IMinigameDispatcher, IMinigameDispatcherTrait,
    };
    use game_components::minigame::libs::require_owned_token;
    use game_components::minigame::structs::GameDetail;
    use crate::components::renderable::RenderableComponent;
    use crate::constants::NAMESPACE;
    use crate::systems::minigame::NAME as GAME_NAME;
    use crate::types::svg::SvgTrait;

    // Components

    component!(path: RenderableComponent, storage: renderable, event: RenderableEvent);
    impl RenderableInternalImpl = RenderableComponent::InternalImpl<ContractState>;

    // Storage

    #[storage]
    struct Storage {
        #[substorage(v0)]
        renderable: RenderableComponent::Storage,
    }

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        RenderableEvent: RenderableComponent::Event,
    }

    #[abi(embed_v0)]
    impl GameDetailsImpl of IMinigameDetails<ContractState> {
        fn game_details(self: @ContractState, token_id: u64) -> Span<GameDetail> {
            // [Check] Token ownership
            self.validate_token_ownership(token_id);
            // [Return] Token details
            let world = self.world(@NAMESPACE());
            self.renderable.get_token_details(world, token_id.into())
        }

        fn token_name(self: @ContractState, token_id: u64) -> ByteArray {
            // [Check] Token ownership
            self.validate_token_ownership(token_id);
            // [Return] Token name
            self.renderable.get_token_name(token_id.into())
        }

        fn token_description(self: @ContractState, token_id: u64) -> ByteArray {
            // [Check] Token ownership
            self.validate_token_ownership(token_id);
            // [Return] Token description
            self.renderable.get_token_description(token_id.into())
        }
    }

    #[abi(embed_v0)]
    impl GameDetailsSVGImpl of IMinigameDetailsSVG<ContractState> {
        fn game_details_svg(self: @ContractState, token_id: u64) -> ByteArray {
            self.validate_token_ownership(token_id);
            let world = self.world(@NAMESPACE());
            let (slots, number, game_completed, game_over) = self
                .renderable
                .get_token_metadata(world, token_id.into());
            let svg = SvgTrait::eval(number, game_completed, game_over);
            svg.gen(slots, number)
        }
    }

    #[generate_trait]
    impl RendererInternal of RendererInternalTrait {
        fn validate_token_ownership(self: @ContractState, token_id: u64) {
            let mut world = self.world(@NAMESPACE());
            let (game_address, _) = world.dns(@GAME_NAME()).unwrap();
            let minigame_dispatcher = IMinigameDispatcher { contract_address: game_address };
            let token_address = minigame_dispatcher.token_address();
            require_owned_token(token_address, token_id);
        }
    }
}
