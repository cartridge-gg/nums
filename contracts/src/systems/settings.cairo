use crate::models::setting::Setting;

#[inline]
pub fn NAME() -> ByteArray {
    "Settings"
}

#[starknet::interface]
pub trait ISettings<T> {
    fn add_setting(
        ref self: T,
        name: ByteArray,
        description: ByteArray,
        slot_count: u8,
        slot_min: u16,
        slot_max: u16,
        powers: u16,
    ) -> u32;
    fn setting_details(self: @T, setting_id: u32) -> Setting;
    fn game_setting(self: @T, game_id: u64) -> Setting;
    fn setting_count(self: @T) -> u32;
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
    use crate::models::setting::{Setting, SettingTrait};
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
        // [Effect] Create setting
        let mut store = StoreTrait::new(world);
        let mut config = store.config();
        let setting_id = config.uuid();
        let setting = SettingTrait::default(setting_id);
        store.set_setting(@setting);
        store.set_config(config);
        // [Interaction] Create settings
        self
            .settings
            .create_settings(
                game_address: minigame.contract_address,
                settings_id: setting.id,
                name: setting.name.clone(),
                description: setting.description.clone(),
                settings: setting.details(),
                minigame_token_address: token_address,
            );
        store.set_setting(@setting);
    }

    #[abi(embed_v0)]
    impl GameSettingsImpl of IMinigameSettings<ContractState> {
        fn settings_exist(self: @ContractState, settings_id: u32) -> bool {
            let world: WorldStorage = self.world(@NAMESPACE());
            let mut store = StoreTrait::new(world);
            let setting = store.setting(settings_id);
            setting.exists()
        }
    }

    #[abi(embed_v0)]
    impl GameSettingsDetailsImpl of IMinigameSettingsDetails<ContractState> {
        fn settings_details(self: @ContractState, settings_id: u32) -> GameSettingDetails {
            let world: WorldStorage = self.world(@NAMESPACE());
            let mut store = StoreTrait::new(world);
            let setting = store.setting(settings_id);
            GameSettingDetails {
                name: setting.name.clone(),
                description: setting.description.clone(),
                settings: setting.details(),
            }
        }
    }

    #[abi(embed_v0)]
    impl SettingsSystemsImpl of ISettings<ContractState> {
        fn add_setting(
            ref self: ContractState,
            name: ByteArray,
            description: ByteArray,
            slot_count: u8,
            slot_min: u16,
            slot_max: u16,
            powers: u16,
        ) -> u32 {
            // [Effect] Create settings
            let mut world: WorldStorage = self.world(@NAMESPACE());
            let mut store = StoreTrait::new(world);
            let mut config = store.config();
            let setting = SettingTrait::new(
                id: config.uuid(),
                name: name.clone(),
                description: description.clone(),
                created_by: starknet::get_caller_address(),
                created_at: starknet::get_block_timestamp(),
                slot_count: slot_count,
                slot_min: slot_min,
                slot_max: slot_max,
                powers: powers,
            );

            // [Effect] Update entities
            store.set_setting(@setting);
            store.set_config(config);

            // [Interaction] Create settings
            let minigame = self.get_minigame(world);
            let token_address = minigame.token_address();
            self
                .settings
                .create_settings(
                    game_address: minigame.contract_address,
                    settings_id: setting.id,
                    name: setting.name.clone(),
                    description: setting.description.clone(),
                    settings: setting.details(),
                    minigame_token_address: token_address,
                );

            // [Return] Settings ID
            setting.id
        }

        fn setting_details(self: @ContractState, setting_id: u32) -> Setting {
            let world: WorldStorage = self.world(@NAMESPACE());
            let mut store = StoreTrait::new(world);
            store.setting(setting_id)
        }

        fn game_setting(self: @ContractState, game_id: u64) -> Setting {
            let world: WorldStorage = self.world(@NAMESPACE());
            let minigame = self.get_minigame(world);
            let token_address = minigame.token_address();
            let setting_id = self.settings.get_settings_id(game_id, token_address);
            let mut store = StoreTrait::new(world);
            store.setting(setting_id)
        }

        fn setting_count(self: @ContractState) -> u32 {
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
            let (game_address, _) = world.dns(@MINIGAME()).expect('Minigame not found!');
            IMinigameDispatcher { contract_address: game_address }
        }
    }
}
