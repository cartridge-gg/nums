#[starknet::interface]
pub trait ICollection<TContractState> {
    fn mint(ref self: TContractState, to: starknet::ContractAddress, souldbound: bool) -> u64;
    fn burn(ref self: TContractState, token_id: u256);
    fn update(ref self: TContractState, token_id: u256);
    fn assert_is_owner(ref self: TContractState, owner: starknet::ContractAddress, token_id: u256);
}

pub fn NAME() -> ByteArray {
    "Collection"
}

pub const MINTER_ROLE: felt252 = selector!("MINTER_ROLE");

#[dojo::contract]
pub mod Collection {
    use alexandria_encoding::base64::Base64ByteArrayEncoder;
    use collection::components::erc4906::erc4906::ERC4906Component;
    use collection::components::erc7572::erc7572::ERC7572Component;
    use collection::types::contract_metadata::ContractMetadata;
    use dojo::world::{IWorldDispatcherTrait, WorldStorage, WorldStorageTrait};
    use graffiti::json::JsonImpl;
    use openzeppelin::access::accesscontrol::{AccessControlComponent, DEFAULT_ADMIN_ROLE};
    use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::token::erc721::interface::{IERC721, IERC721Metadata};
    use openzeppelin::token::erc721::{ERC721Component, ERC721HooksEmptyImpl};
    use starknet::ContractAddress;
    use starknet::storage::{
        Map, StoragePathEntry, StoragePointerReadAccess, StoragePointerWriteAccess,
    };
    use crate::constants::{BANNER, CLIENT_URL, DESCRIPTION, IMAGE, NAME, NAMESPACE, SYMBOL};
    use crate::models::game::GameTrait;
    use crate::store::StoreTrait;
    use crate::systems::play::NAME as PLAY_NAME;
    use crate::types::metadata::Metadata;
    use super::{ICollection, MINTER_ROLE};

    // Errors

    pub mod ERRORS {
        pub const COLLECTION_NOT_OWNER: felt252 = 'Collection: caller not owner';
        pub const COLLECTION_SOULBOUND: felt252 = 'Collection: token is soulbound';
    }

    // Components

    component!(path: AccessControlComponent, storage: accesscontrol, event: AccessControlEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    component!(path: ERC721Component, storage: erc721, event: ERC721Event);
    component!(path: ERC4906Component, storage: erc4906, event: ERC4906Event);
    component!(path: ERC7572Component, storage: erc7572, event: ERC7572Event);

    // AccessControl
    #[abi(embed_v0)]
    impl AccessControlImpl =
        AccessControlComponent::AccessControlImpl<ContractState>;
    impl AccessControlInternalImpl = AccessControlComponent::InternalImpl<ContractState>;

    // Ownable
    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    // ERC721
    impl ERC721StandardImpl = ERC721Component::ERC721Impl<ContractState>;
    impl ERC721InternalImpl = ERC721Component::InternalImpl<ContractState>;

    // ERC4906
    impl ERC4906InternalImpl = ERC4906Component::InternalImpl<ContractState>;

    // ERC7572
    #[abi(embed_v0)]
    impl ERC7572Impl = ERC7572Component::ERC7572Impl<ContractState>;
    impl ERC7572InternalImpl = ERC7572Component::InternalImpl<ContractState>;

    #[storage]
    pub struct Storage {
        #[substorage(v0)]
        pub accesscontrol: AccessControlComponent::Storage,
        #[substorage(v0)]
        pub ownable: OwnableComponent::Storage,
        #[substorage(v0)]
        pub src5: SRC5Component::Storage,
        #[substorage(v0)]
        pub erc721: ERC721Component::Storage,
        #[substorage(v0)]
        pub erc4906: ERC4906Component::Storage,
        #[substorage(v0)]
        pub erc7572: ERC7572Component::Storage,
        pub game_id: u64,
        pub soulbound: Map<u256, bool>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        AccessControlEvent: AccessControlComponent::Event,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
        #[flat]
        ERC721Event: ERC721Component::Event,
        #[flat]
        ERC4906Event: ERC4906Component::Event,
        #[flat]
        ERC7572Event: ERC7572Component::Event,
    }

    fn dojo_init(ref self: ContractState) {
        // [Setup] World
        let world: WorldStorage = self.world(@NAMESPACE());
        // [Effect] Initialize components
        let deployer_account = starknet::get_tx_info().unbox().account_contract_address;
        self.accesscontrol.initializer();
        self.ownable.initializer(deployer_account);
        self.erc721.initializer(NAME(), SYMBOL(), "");
        self.erc4906.initializer();
        self.erc7572.initializer();
        // [Effect] Grant roles
        let play_address = world.dns_address(@PLAY_NAME()).expect('Play contract not found!');
        self.accesscontrol._grant_role(DEFAULT_ADMIN_ROLE, deployer_account);
        self.accesscontrol._grant_role(MINTER_ROLE, play_address);
        // [Effect] Set contract metadata
        let metadata = ContractMetadata {
            name: self.erc721.name(),
            symbol: Option::Some(self.erc721.symbol()),
            description: Option::Some(DESCRIPTION()),
            image: Option::Some(IMAGE()),
            banner_image: Option::Some(BANNER()),
            featured_image: None,
            external_link: Option::Some(CLIENT_URL()),
            collaborators: None,
            properties: None,
            socials: None,
        };
        self.erc7572.set_contract_metadata(metadata);
        // [Event] Emit a new registered contract for torii to index
        let this = starknet::get_contract_address();
        let instance_name: felt252 = this.into();
        world
            .dispatcher
            .register_external_contract(
                namespace: NAMESPACE(),
                contract_name: "ERC721",
                instance_name: format!("{}", instance_name),
                contract_address: this,
                block_number: 1,
            )
    }

    #[abi(embed_v0)]
    impl ERC721Impl of IERC721<ContractState> {
        fn balance_of(self: @ContractState, account: ContractAddress) -> u256 {
            self.erc721.balance_of(account)
        }

        fn owner_of(self: @ContractState, token_id: u256) -> ContractAddress {
            self.erc721.owner_of(token_id)
        }

        fn safe_transfer_from(
            ref self: ContractState,
            from: ContractAddress,
            to: ContractAddress,
            token_id: u256,
            data: Span<felt252>,
        ) {
            // [Check] Token is not soulbound
            let is_soulbound = self.soulbound.entry(token_id).read();
            assert(!is_soulbound, ERRORS::COLLECTION_SOULBOUND);
            // [Effect] Transfer token
            self.erc721.safe_transfer_from(from, to, token_id, data)
        }

        fn transfer_from(
            ref self: ContractState, from: ContractAddress, to: ContractAddress, token_id: u256,
        ) {
            // [Check] Token is not soulbound
            let is_soulbound = self.soulbound.entry(token_id).read();
            assert(!is_soulbound, ERRORS::COLLECTION_SOULBOUND);
            // [Effect] Transfer token
            self.erc721.transfer_from(from, to, token_id)
        }

        fn approve(ref self: ContractState, to: ContractAddress, token_id: u256) {
            self.erc721.approve(to, token_id)
        }

        fn set_approval_for_all(
            ref self: ContractState, operator: ContractAddress, approved: bool,
        ) {
            self.erc721.set_approval_for_all(operator, approved)
        }

        fn get_approved(self: @ContractState, token_id: u256) -> ContractAddress {
            self.erc721.get_approved(token_id)
        }

        fn is_approved_for_all(
            self: @ContractState, owner: ContractAddress, operator: ContractAddress,
        ) -> bool {
            self.erc721.is_approved_for_all(owner, operator)
        }
    }

    #[abi(embed_v0)]
    impl ERC721MetadataImpl of IERC721Metadata<ContractState> {
        fn name(self: @ContractState) -> ByteArray {
            self.erc721.name()
        }

        fn symbol(self: @ContractState) -> ByteArray {
            self.erc721.symbol()
        }

        fn token_uri(self: @ContractState, token_id: u256) -> ByteArray {
            // [Check] Token exists
            let owner = self.erc721.owner_of(token_id);
            if (owner.into() == 0) {
                return "";
            }

            // [Check] Token ID is valid
            let game_id: u64 = token_id.try_into().expect('Game: invalid token ID');

            // [Return] Token URI
            let world = self.world(@NAMESPACE());
            let mut store = StoreTrait::new(world);
            let game = store.game(game_id);
            Metadata::gen(
                name: "Nums Games",
                description: "Nums Games",
                game_slots: game.slots().span(),
                game_id: game.id,
                game_number: game.number,
                game_level: game.level,
                game_completed: game.over != 0 && game.level == game.slot_count,
                game_over: game.over != 0,
            )
        }
    }

    #[abi(embed_v0)]
    impl CollectionImpl of ICollection<ContractState> {
        fn mint(ref self: ContractState, to: ContractAddress, souldbound: bool) -> u64 {
            // [Check] Only minter can mint
            self.accesscontrol.assert_only_role(MINTER_ROLE);
            // [Effect] Mint token
            let game_id = self.game_id.read() + 1;
            self.game_id.write(game_id);
            self.erc721.mint(to, game_id.into());
            // [Effect] Set soulbound
            self.soulbound.entry(game_id.into()).write(souldbound);
            // [Return] Game ID
            game_id
        }

        fn burn(ref self: ContractState, token_id: u256) {
            // [Check] Only token owner can burn
            let caller = starknet::get_caller_address();
            self.assert_is_owner(caller, token_id);
            // [Effect] Burn token
            self.erc721.burn(token_id)
        }

        fn update(ref self: ContractState, token_id: u256) {
            // [Check] Only minter can mint
            self.accesscontrol.assert_only_role(MINTER_ROLE);
            // [Effect] Mint token
            self.erc4906.update_metadata(token_id)
        }

        fn assert_is_owner(ref self: ContractState, owner: ContractAddress, token_id: u256) {
            let token_owner = self.erc721.owner_of(token_id);
            assert(token_owner == owner, ERRORS::COLLECTION_NOT_OWNER);
        }
    }
}
