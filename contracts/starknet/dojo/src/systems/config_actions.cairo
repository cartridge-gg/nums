use nums_common::models::config::Config;

#[starknet::interface]
pub trait IConfigActions<T> {
    fn set_config(ref self: T, config: Config);
}


#[dojo::contract]
pub mod config_actions {
    use super::IConfigActions;
    use nums_common::models::config::Config;
    use nums_common::WORLD_RESOURCE;
    use nums_starknet::models::message::{Message, Destination};
    use nums_starknet::interfaces::messaging::{IMessagingDispatcher, IMessagingDispatcherTrait};

    use dojo::model::ModelStorage;
    use dojo::world::IWorldDispatcherTrait;

    #[abi(embed_v0)]
    impl ConfigActions of IConfigActions<ContractState> {
        fn set_config(ref self: ContractState, config: Config) {
            let player = starknet::get_caller_address();
            let owner = starknet::get_caller_address();
            let mut world = self.world(@"nums");

            assert!(world.dispatcher.is_owner(WORLD_RESOURCE, owner), "Unauthorized owner");
            assert!(config.world_resource == WORLD_RESOURCE, "Invalid config state");

            let mut payload: Array<felt252> = array![];
            config.serialize(ref payload);

            let (hash, _) = IMessagingDispatcher {
                contract_address: config.starknet_messenger.try_into().unwrap()
            }
                .send_message_to_appchain(
                    config.appchain_handler.try_into().unwrap(),
                    selector!("set_config_handler"),
                    payload.span(),
                );

            let message = Message { player, hash, destination: Destination::APPCHAIN, };
            world.write_model(@message);
            world.write_model(@config);
        }
    }
}
