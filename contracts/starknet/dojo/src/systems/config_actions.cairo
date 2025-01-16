use nums_common::messages::AppChain;
use nums_common::models::config::Config;

#[starknet::interface]
pub trait IConfigActions<T> {
    fn set_config(ref self: T, config: Config);
}


#[dojo::contract]
pub mod config_actions {
    use super::IConfigActions;
    use nums_common::messages::AppChain;
    use nums_common::models::config::Config;
    use nums_starknet::interfaces::messaging::{IMessagingDispatcher, IMessagingDispatcherTrait};

    use dojo::model::ModelStorage;
    use dojo::world::IWorldDispatcherTrait;

    const WORLD: felt252 = 0;

    #[abi(embed_v0)]
    impl ConfigActions of IConfigActions<ContractState> {
        fn set_config(ref self: ContractState, config: Config) {
            let owner = starknet::get_caller_address();
            let mut world = self.world(@"nums");

            assert!(world.dispatcher.is_owner(WORLD, owner), "Unauthorized owner");
            assert!(config.world_resource == WORLD, "Invalid config state");

            world.write_model(@config);

            // let mut payload: Array<felt252> = array![];
            // appchain.serialize(ref payload);

            // IMessagingDispatcher { contract_address: appchain.message_contract.try_into().unwrap() }.send_message_to_appchain(
            //     appchain.to_address.try_into().unwrap(),
            //     appchain.to_selector,
            //     payload.span(),
            // );
        }
    }
}