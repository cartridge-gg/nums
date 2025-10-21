use crate::models::settings::Settings as GameSettings;

#[inline]
pub fn NAME() -> ByteArray {
    "Settings"
}

#[starknet::interface]
pub trait ISettings<T> {
    fn add_settings(
        ref self: T,
        name: ByteArray,
        description: ByteArray,
        slot_count: u8,
        slot_min: u16,
        slot_max: u16,
    ) -> u32;
    fn setting_details(self: @T, settings_id: u32) -> GameSettings;
    fn game_settings(self: @T, game_id: u64) -> GameSettings;
    fn settings_count(self: @T) -> u32;
}

#[dojo::contract]
mod Settings {
    use dojo::world::{WorldStorage, WorldStorageTrait};
    use game_components::minigame::extensions::settings::interface::{
        IMinigameSettings, IMinigameSettingsDetails,
    };
    use game_components::minigame::extensions::settings::settings::SettingsComponent;
    use game_components::minigame::extensions::settings::structs::GameSettingDetails;
    use game_components::minigame::interface::{IMinigameDispatcher, IMinigameDispatcherTrait};
    use openzeppelin::introspection::src5::SRC5Component;
    use crate::constants::NAMESPACE;
    use crate::models::config::ConfigTrait;
    use crate::models::settings::{Settings as GameSettings, SettingsTrait};
    use crate::store::StoreTrait;
    use crate::systems::minigame::NAME as MINIGAME;
    use super::ISettings;

    #[inline]
    fn SETTINGS_NAME() -> ByteArray {
        "Default"
    }

    #[inline]
    fn SETTINGS_DESCRIPTION() -> ByteArray {
        "These are the default Nums settings"
    }

    // Components

    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: SettingsComponent, storage: settings, event: SettingsEvent);
    #[abi(embed_v0)]
    impl SRC5Impl = SRC5Component::SRC5Impl<ContractState>;
    impl SettingsInternalImpl = SettingsComponent::InternalImpl<ContractState>;

    // Storage

    #[storage]
    struct Storage {
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        #[substorage(v0)]
        settings: SettingsComponent::Storage,
    }

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        SRC5Event: SRC5Component::Event,
        #[flat]
        SettingsEvent: SettingsComponent::Event,
    }

    fn dojo_init(ref self: ContractState) {
        self.settings.initializer();
        let mut world: WorldStorage = self.world(@NAMESPACE());
        let minigame = self.get_minigame(world);
        let token_address = minigame.token_address();
        let settings = SettingsTrait::default();
        self
            .settings
            .create_settings(
                game_address: minigame.contract_address,
                settings_id: settings.id,
                name: settings.name.clone(),
                description: settings.description.clone(),
                settings: settings.details(),
                minigame_token_address: token_address,
            );
    }

    #[abi(embed_v0)]
    impl GameSettingsImpl of IMinigameSettings<ContractState> {
        fn settings_exist(self: @ContractState, settings_id: u32) -> bool {
            let world: WorldStorage = self.world(@NAMESPACE());
            let mut store = StoreTrait::new(world);
            let settings = store.settings(settings_id);
            settings.exists()
        }
    }

    #[abi(embed_v0)]
    impl GameSettingsDetailsImpl of IMinigameSettingsDetails<ContractState> {
        fn settings_details(self: @ContractState, settings_id: u32) -> GameSettingDetails {
            let world: WorldStorage = self.world(@NAMESPACE());
            let mut store = StoreTrait::new(world);
            let settings = store.settings(settings_id);
            GameSettingDetails {
                name: settings.name.clone(),
                description: settings.description.clone(),
                settings: settings.details(),
            }
        }
    }

    #[abi(embed_v0)]
    impl SettingsSystemsImpl of ISettings<ContractState> {
        fn add_settings(
            ref self: ContractState,
            name: ByteArray,
            description: ByteArray,
            slot_count: u8,
            slot_min: u16,
            slot_max: u16,
        ) -> u32 {
            // [Effect] Create settings
            let mut world: WorldStorage = self.world(@NAMESPACE());
            let mut store = StoreTrait::new(world);
            let mut config = store.config();
            let settings = SettingsTrait::new(
                id: config.uuid(),
                name: name.clone(),
                description: description.clone(),
                created_by: starknet::get_caller_address(),
                created_at: starknet::get_block_timestamp(),
                slot_count: slot_count,
                slot_min: slot_min,
                slot_max: slot_max,
            );

            // [Effect] Update entities
            store.set_settings(@settings);
            store.set_config(config);

            // [Interaction] Create settings
            let minigame = self.get_minigame(world);
            let token_address = minigame.token_address();
            self
                .settings
                .create_settings(
                    game_address: minigame.contract_address,
                    settings_id: settings.id,
                    name: settings.name.clone(),
                    description: settings.description.clone(),
                    settings: settings.details(),
                    minigame_token_address: token_address,
                );

            // [Return] Settings ID
            settings.id
        }

        fn setting_details(self: @ContractState, settings_id: u32) -> GameSettings {
            let world: WorldStorage = self.world(@NAMESPACE());
            let mut store = StoreTrait::new(world);
            store.settings(settings_id)
        }

        fn game_settings(self: @ContractState, game_id: u64) -> GameSettings {
            let world: WorldStorage = self.world(@NAMESPACE());
            let minigame = self.get_minigame(world);
            let token_address = minigame.token_address();
            let settings_id = self.settings.get_settings_id(game_id, token_address);
            let mut store = StoreTrait::new(world);
            store.settings(settings_id)
        }

        fn settings_count(self: @ContractState) -> u32 {
            let world: WorldStorage = self.world(@NAMESPACE());
            let mut store = StoreTrait::new(world);
            let config = store.config();
            config.count
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        #[inline]
        fn get_minigame(self: @ContractState, world: WorldStorage) -> IMinigameDispatcher {
            let (game_address, _) = world.dns(@MINIGAME()).unwrap();
            IMinigameDispatcher { contract_address: game_address }
        }
    }
}
