#[starknet::interface]
pub trait IClaimActions<T> {
    fn claim_reward(ref self: T, game_id: u32);
    fn claim_jackpot(ref self: T, game_id: u32);
}

#[dojo::contract]
pub mod claim_actions {
    use super::IClaimActions;
    use core::array::ArrayTrait;
    use dojo::model::ModelStorage;
    use dojo::event::EventStorage;

    use nums_appchain::models::game::{Game, GameTrait};
    use nums_appchain::models::slot::Slot;
    use nums_common::models::jackpot::{Jackpot, JackpotTrait};
    use nums_common::models::config::Config;
    use nums_common::WORLD_RESOURCE;

    use starknet::{ContractAddress, SyscallResultTrait};
    use starknet::syscalls::send_message_to_l1_syscall;
    const MSG_TO_L2_MAGIC: felt252 = 'MSG';

    #[derive(Drop, Serde)]
    #[dojo::event]
    pub struct JackpotClaimed {
        #[key]
        game_id: u32,
        #[key]
        jackpot_id: u32,
        player: ContractAddress,
    }

    #[derive(Drop, Serde)]
    #[dojo::event]
    pub struct RewardClaimed {
        #[key]
        game_id: u32,
        player: ContractAddress,
        amount: u32,
    }

    #[abi(embed_v0)]
    impl ClaimActionsImpl of IClaimActions<ContractState> {
        fn claim_reward(ref self: ContractState, game_id: u32) {
            let mut world = self.world(@"nums");
            let player = starknet::get_caller_address();
            let mut game: Game = world.read_model((game_id, player));
            let config: Config = world.read_model(WORLD_RESOURCE);
            assert!(game.player == player, "Unauthorized player");
            assert!(!game.claimed, "Already claimed");
            assert!(game.reward > 0, "No reward to claim");

            game.claimed = true;
            world.write_model(@game);
            world.emit_event(@RewardClaimed { game_id, player, amount: game.reward });

            send_message_to_l1_syscall(
                MSG_TO_L2_MAGIC,
                array![
                    config.starknet_consumer.into(),
                    player.into(),
                    game_id.into(),
                    game.reward.into(),
                ]
                    .span()
            )
                .unwrap_syscall();
        }

        /// Claims the jackpot for a specific game. Ensures that the player is authorized and that
        /// the jackpot has not been claimed before.
        /// Transfers the jackpot token to the player and updates the jackpot state.
        ///
        /// # Arguments
        /// * `game_id` - The identifier of the game.
        fn claim_jackpot(ref self: ContractState, game_id: u32) {
            let mut world = self.world(@"nums");
            let player = starknet::get_caller_address();
            let game: Game = world.read_model((game_id, player));
            let config: Config = world.read_model(WORLD_RESOURCE);
            let game_config = config.game.expect('game config not set');
            let jackpot_id = game.jackpot_id.expect('jackpot not defined');
            let mut jackpot: Jackpot = world.read_model(jackpot_id);

            if jackpot.expiration > 0 {
                assert(jackpot.expiration < starknet::get_block_timestamp(), 'cannot claim yet')
            }
            assert(jackpot.winner.is_none(), 'jackpot already claimed');

            let mut nums = ArrayTrait::<u16>::new();
            let mut idx = game_config.max_slots;
            while idx > 0 {
                let slot: Slot = world.read_model(((game_id, player, game_config.max_slots - idx)));
                if slot.number != 0 {
                    nums.append(slot.number);
                }
                idx -= 1_u8;
            };

            assert(nums.len() != 0, 'no slots filled');
            assert(game.is_valid(@nums), 'invalid game state');
            assert(jackpot.can_claim(@nums), 'cannot claim jackpot');

            jackpot.winner = Option::Some(player);
            jackpot.claimed = true;
            world.write_model(@jackpot);
            world.emit_event(@JackpotClaimed { game_id, jackpot_id, player });

            send_message_to_l1_syscall(
                MSG_TO_L2_MAGIC,
                array![
                    config.starknet_consumer.into(),
                    player.into(),
                    game_id.into(),
                    jackpot.id.into(),
                ]
                    .span()
            )
                .unwrap_syscall();
        }
    }
}
