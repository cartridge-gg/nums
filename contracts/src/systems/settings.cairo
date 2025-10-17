// Constants

#[inline]
pub fn NAME() -> ByteArray {
    "Settings"
}

pub const SETTINGS_ID: u32 = 0;

#[dojo::contract]
mod Settings {
    use dojo::world::{WorldStorage, WorldStorageTrait};
    use game_components::minigame::extensions::settings::interface::{
        IMinigameSettings, IMinigameSettingsDetails,
    };
    use game_components::minigame::extensions::settings::settings::SettingsComponent;
    use game_components::minigame::extensions::settings::structs::{GameSetting, GameSettingDetails};
    use game_components::minigame::interface::{IMinigameDispatcher, IMinigameDispatcherTrait};
    use openzeppelin::introspection::src5::SRC5Component;
    use crate::constants::NAMESPACE;
    use crate::systems::minigame::NAME as GAME_NAME;
    use crate::systems::settings::SETTINGS_ID;
    use crate::types::game_config::GameConfigTrait;

    #[inline]
    fn SETTINGS_NAME() -> ByteArray {
        "Default"
    }

    #[inline]
    fn SETTINGS_DESCRIPTION() -> ByteArray {
        "These are the default Nums settings"
    }

    // Components

    component!(path: SettingsComponent, storage: settings, event: SettingsEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);

    impl SettingsInternalImpl = SettingsComponent::InternalImpl<ContractState>;

    #[abi(embed_v0)]
    impl SRC5Impl = SRC5Component::SRC5Impl<ContractState>;

    // Storage

    #[storage]
    struct Storage {
        #[substorage(v0)]
        settings: SettingsComponent::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
    }

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        SettingsEvent: SettingsComponent::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
    }

    fn dojo_init(ref self: ContractState) {
        self.settings.initializer();
        let mut world: WorldStorage = self.world(@NAMESPACE());
        let (game_address, _) = world.dns(@GAME_NAME()).unwrap();
        let minigame_dispatcher = IMinigameDispatcher { contract_address: game_address };
        let token_address = minigame_dispatcher.token_address();
        let settings: Span<GameSetting> = GameConfigTrait::settings();

        self
            .settings
            .create_settings(
                game_address: game_address,
                settings_id: SETTINGS_ID,
                name: "Default",
                description: "These are the default Nums settings",
                settings: settings,
                minigame_token_address: token_address,
            );
    }

    #[abi(embed_v0)]
    impl GameSettingsImpl of IMinigameSettings<ContractState> {
        fn settings_exist(self: @ContractState, settings_id: u32) -> bool {
            settings_id == SETTINGS_ID
        }
    }

    #[abi(embed_v0)]
    impl GameSettingsDetailsImpl of IMinigameSettingsDetails<ContractState> {
        fn settings_details(self: @ContractState, settings_id: u32) -> GameSettingDetails {
            let settings: Span<GameSetting> = GameConfigTrait::settings();
            GameSettingDetails {
                name: SETTINGS_NAME(), description: SETTINGS_DESCRIPTION(), settings,
            }
        }
    }
}
