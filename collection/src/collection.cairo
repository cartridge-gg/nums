#[starknet::contract]
pub mod Collection {
    // use collection::components::erc4906::erc4906::ERC4906Component;
    use collection::components::erc7572::erc7572::ERC7572Component;
    // use collection::components::mintable::mintable::MintableComponent;
    use collection::constants;
    use collection::interface::{GameTrait, MinterDispatcher, MinterDispatcherTrait};
    use collection::types::contract_metadata::{ContractMetadata, ContractMetadataTrait};
    use collection::types::svg::SvgTrait;
    use collection::types::token_metadata::TokenMetadataTrait;
    use game_components::minigame::interface::IMinigameTokenData;
    use game_components::minigame::minigame::MinigameComponent;
    use game_components::token::core::core_token::CoreTokenComponent;
    use game_components::token::core::noop_traits::{
        NoOpContext, NoOpObjectives, NoOpRenderer, NoOpSettings, NoOpSoulbound,
    };
    use game_components::token::extensions::minter::minter::MinterComponent;
    use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::token::erc721::interface::IERC721Metadata;
    use openzeppelin::token::erc721::{ERC721Component, ERC721HooksEmptyImpl};
    use openzeppelin::upgrades::UpgradeableComponent;
    use openzeppelin::upgrades::interface::IUpgradeable;
    use starknet::ContractAddress;

    mod config {
        pub const MINTER_ENABLED: bool = true; // Only enable minter
        pub const MULTI_GAME_ENABLED: bool = false; // Disable multi-game
        pub const OBJECTIVES_ENABLED: bool = false; // Disable objectives
        pub const SETTINGS_ENABLED: bool = false; // Disable settings
        pub const SOULBOUND_ENABLED: bool = false; // Disable soulbound
        pub const CONTEXT_ENABLED: bool = false; // Disable context
        pub const RENDERER_ENABLED: bool = false; // Disable renderer
    }

    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    // component!(path: MintableComponent, storage: mintable, event: MintableEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: ERC721Component, storage: erc721, event: ERC721Event);
    // component!(path: ERC4906Component, storage: erc4906, event: ERC4906Event);
    component!(path: ERC7572Component, storage: erc7572, event: ERC7572Event);
    component!(path: MinigameComponent, storage: minigame, event: MinigameEvent);
    component!(path: CoreTokenComponent, storage: core_token, event: CoreTokenEvent);
    component!(path: MinterComponent, storage: minter, event: MinterEvent);

    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;

    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableTwoStepMixinImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    // #[abi(embed_v0)]
    // impl MintableImpl = MintableComponent::MintableImpl<ContractState>;
    // impl MintableInternalImpl = MintableComponent::InternalImpl<ContractState>;

    #[abi(embed_v0)]
    impl MinterImpl = MinterComponent::MinterImpl<ContractState>;
    impl MinterInternalImpl = MinterComponent::InternalImpl<ContractState>;

    #[abi(embed_v0)]
    impl MinigameImpl = MinigameComponent::MinigameImpl<ContractState>;
    impl MinigameInternalImpl = MinigameComponent::InternalImpl<ContractState>;

    #[abi(embed_v0)]
    impl CoreTokenImpl = CoreTokenComponent::CoreTokenImpl<ContractState>;
    impl CoreTokenInternalImpl = CoreTokenComponent::InternalImpl<ContractState>;

    #[abi(embed_v0)]
    impl SRC5Impl = SRC5Component::SRC5Impl<ContractState>;
    impl SRC5InternalImpl = SRC5Component::InternalImpl<ContractState>;

    #[abi(embed_v0)]
    impl ERC721Impl = ERC721Component::ERC721Impl<ContractState>;
    #[abi(embed_v0)]
    impl ERC721CamelOnlyImpl = ERC721Component::ERC721CamelOnlyImpl<ContractState>;
    impl ERC721InternalImpl = ERC721Component::InternalImpl<ContractState>;

    // impl ERC4906InternalImpl = ERC4906Component::InternalImpl<ContractState>;

    #[abi(embed_v0)]
    impl ERC7572Impl = ERC7572Component::ERC7572Impl<ContractState>;
    impl ERC7572InternalImpl = ERC7572Component::InternalImpl<ContractState>;

    // Optional trait implementations
    impl MinterOptionalImpl = MinterComponent::MinterOptionalImpl<ContractState>;
    impl ObjectivesOptionalImpl = NoOpObjectives<ContractState>; // Zero-cost NoOp
    impl SettingsOptionalImpl = NoOpSettings<ContractState>; // Zero-cost NoOp
    impl ContextOptionalImpl = NoOpContext<ContractState>; // Zero-cost NoOp
    impl SoulboundOptionalImpl = NoOpSoulbound<ContractState>; // Zero-cost NoOp
    impl RendererOptionalImpl = NoOpRenderer<ContractState>; // Zero-cost NoOp

    #[storage]
    struct Storage {
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        // #[substorage(v0)]
        // mintable: MintableComponent::Storage,
        #[substorage(v0)]
        minigame: MinigameComponent::Storage,
        #[substorage(v0)]
        minter: MinterComponent::Storage,
        #[substorage(v0)]
        core_token: CoreTokenComponent::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        #[substorage(v0)]
        erc721: ERC721Component::Storage,
        #[substorage(v0)]
        erc7572: ERC7572Component::Storage,
        // #[substorage(v0)]
    // erc4906: ERC4906Component::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        UpgradeableEvent: UpgradeableComponent::Event,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        // #[flat]
        // MintableEvent: MintableComponent::Event,
        #[flat]
        MinigameEvent: MinigameComponent::Event,
        #[flat]
        MinterEvent: MinterComponent::Event,
        #[flat]
        CoreTokenEvent: CoreTokenComponent::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
        #[flat]
        ERC721Event: ERC721Component::Event,
        #[flat]
        ERC7572Event: ERC7572Component::Event,
        // FIXME: EIP 4906 is partially implemented in CoreTokenComponent
    // #[flat]
    // ERC4906Event: ERC4906Component::Event,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        name: ByteArray,
        symbol: ByteArray,
        minter: ContractAddress,
        owner: ContractAddress,
    ) {
        let contract_address = starknet::get_contract_address();
        self.ownable.initializer(owner);
        // self.mintable.initializer(minter);
        self.erc721.initializer(name.clone(), symbol.clone(), Default::default());
        // self.erc4906.initializer();
        self.erc7572.initializer();
        self.erc7572.set_contract_metadata(ContractMetadataTrait::new(name, symbol));
        self.minter.initializer();
        self
            .core_token
            .initializer(
                Option::Some(contract_address), Option::Some(owner), Option::None, Option::None,
            );
        self
            .minigame
            .initializer(
                creator_address: owner,
                name: constants::NAME(),
                description: constants::DESCRIPTION(),
                developer: constants::DEVELOPER(),
                publisher: constants::PUBLISHER(),
                genre: constants::GENRE(),
                image: constants::IMAGE(),
                color: Option::None,
                client_url: Option::None,
                renderer_address: Option::None,
                settings_address: Option::None,
                objectives_address: Option::None,
                token_address: contract_address,
            );
    }

    #[abi(embed_v0)]
    impl UpgradeableImpl of IUpgradeable<ContractState> {
        /// Upgrades the contract class hash to `new_class_hash`.
        /// This may only be called by the contract owner.
        fn upgrade(ref self: ContractState, new_class_hash: starknet::ClassHash) {
            self.ownable.assert_only_owner();
            self.upgradeable.upgrade(new_class_hash);
        }
    }

    #[abi(embed_v0)]
    impl MetadataImpl of IERC721Metadata<ContractState> {
        fn name(self: @ContractState) -> ByteArray {
            self.erc721.name()
        }

        fn symbol(self: @ContractState) -> ByteArray {
            self.erc721.symbol()
        }

        fn token_uri(self: @ContractState, token_id: u256) -> ByteArray {
            let game_address = self.core_token.game_address();
            let game = MinterDispatcher { contract_address: game_address };
            let (
                slots,
                next_number,
                game_id,
                game_reward,
                start_time,
                end_time,
                game_completed,
                game_over,
                jackpot_id,
                game_level,
            ) =
                game
                .get_token_metadata(token_id);
            let svg = SvgTrait::eval(next_number, game_completed, game_over);
            TokenMetadataTrait::new(
                game_id: game_id,
                image: svg.gen(slots, next_number),
                reward: game_reward,
                start_time: start_time,
                end_time: end_time,
                game_over: game_over,
                game_completed: game_completed,
                jackpot_id: jackpot_id,
                level: game_level,
            )
                .jsonify()
        }
    }

    #[abi(embed_v0)]
    impl MinigameTokenDataImpl of IMinigameTokenData<ContractState> {
        fn score(self: @ContractState, token_id: u64) -> u32 {
            let game_address = self.core_token.game_address();
            let game = MinterDispatcher { contract_address: game_address };
            let (_, _, _, _, _, _, _, _, _, game_level) = game.get_token_metadata(token_id.into());
            game_level.into()
        }

        fn game_over(self: @ContractState, token_id: u64) -> bool {
            let now = starknet::get_block_timestamp();
            let game_address = self.core_token.game_address();
            let game = MinterDispatcher { contract_address: game_address };
            let (_, _, _, _, _, end_time, _, game_over, _, _) = game
                .get_token_metadata(token_id.into());
            game_over || now > end_time
        }
    }

    #[abi(embed_v0)]
    pub impl GameImpl of GameTrait<ContractState> {
        fn assert_token_owner(self: @ContractState, caller: ContractAddress, token_id: u256) {
            // [Checks] Token must be owned by the caller
            let owner = self.erc721._require_owned(token_id);
            assert(owner == caller, ERC721Component::Errors::UNAUTHORIZED);
        }

        fn assert_token_authorized(self: @ContractState, caller: ContractAddress, token_id: u256) {
            // [Checks] Token must be owned or authorized by the caller
            let owner = self.erc721.owner_of(token_id);
            self.erc721._check_authorized(owner, caller, token_id);
        }

        // fn mint(ref self: ContractState, to: ContractAddress, token_id: u256) {
        //     // [Checks] Only minter
        //     self.mintable.assert_only_minter();
        //     // [Effect] Mint token
        //     self.erc721.mint(to, token_id);
        //     // [Event] Mint token
        // // self.erc4906.update_metadata(token_id);
        // }

        // fn burn(ref self: ContractState, token_id: u256) {
        //     // [Check] Only token owner
        //     self.mintable.assert_only_minter();
        //     // [Effect] Burn token
        //     self.erc721.burn(token_id);
        // }

        // fn update_token_metadata(ref self: ContractState, token_id: u256) {
        //     // [Check] Only minter
        //     self.mintable.assert_only_minter();
        //     // [Event] Update token metadata
        // // self.erc4906.update_metadata(token_id);
        // }

        fn set_contract_metadata(ref self: ContractState, metadata: ContractMetadata) {
            // [Checks] Only owner
            self.ownable.assert_only_owner();
            // [Effect] Set contract metadata
            self.erc7572.set_contract_metadata(metadata);
        }
    }
}
