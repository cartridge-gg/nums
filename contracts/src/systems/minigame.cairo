// Constants

#[inline]
pub fn NAME() -> ByteArray {
    "Minigame"
}

#[dojo::contract]
mod Minigame {
    use dojo::world::{WorldStorage, WorldStorageTrait};
    use game_components::minigame::interface::IMinigameTokenData;
    use game_components::minigame::minigame::MinigameComponent;
    use openzeppelin::introspection::src5::SRC5Component;
    use starknet::ContractAddress;
    use crate::constants::NAMESPACE;
    use crate::models::game::GameTrait;
    use crate::systems::renderer::NAME as RENDERER;
    use crate::systems::settings::NAME as SETTINGS;
    use crate::{StoreTrait, constants};

    // Components
    component!(path: MinigameComponent, storage: minigame, event: MinigameEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);

    #[abi(embed_v0)]
    impl MinigameImpl = MinigameComponent::MinigameImpl<ContractState>;
    impl MinigameInternalImpl = MinigameComponent::InternalImpl<ContractState>;

    #[abi(embed_v0)]
    impl SRC5Impl = SRC5Component::SRC5Impl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        minigame: MinigameComponent::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        MinigameEvent: MinigameComponent::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
    }

    fn dojo_init(ref self: ContractState, denshokan_address: ContractAddress) {
        let mut world: WorldStorage = self.world(@NAMESPACE());
        let (settings_address, _) = world.dns(@SETTINGS()).unwrap();
        let (renderer_address, _) = world.dns(@RENDERER()).unwrap();
        self
            .minigame
            .initializer(
                creator_address: starknet::get_caller_address(),
                name: constants::NAME(),
                description: constants::DESCRIPTION(),
                developer: constants::DEVELOPER(),
                publisher: constants::PUBLISHER(),
                genre: constants::GENRE(),
                image: constants::IMAGE(),
                color: Option::None,
                client_url: Option::None,
                renderer_address: Option::Some(renderer_address),
                settings_address: Option::Some(settings_address),
                objectives_address: Option::None,
                token_address: denshokan_address,
            );
    }

    #[abi(embed_v0)]
    impl GameTokenDataImpl of IMinigameTokenData<ContractState> {
        fn score(self: @ContractState, token_id: u64) -> u32 {
            let mut store = StoreTrait::new(self.world(@NAMESPACE()));
            let game = store.game(token_id);
            game.score
        }

        fn game_over(self: @ContractState, token_id: u64) -> bool {
            let mut store = StoreTrait::new(self.world(@NAMESPACE()));
            let game = store.game(token_id);
            game.is_over(game.slots())
        }
    }
}
