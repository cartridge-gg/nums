#[starknet::interface]
pub trait IClaimActions<T> {
    fn claim_reward(ref self: T);
    fn claim_jackpot(ref self: T, game_id: u32);
    fn claimed_on_starknet(ref self: T, claim_id: u32);
}

#[dojo::contract]
pub mod claim_actions {
    use super::IClaimActions;
    use core::array::ArrayTrait;
    use dojo::model::ModelStorage;
    use dojo::event::EventStorage;
    use dojo::world::IWorldDispatcherTrait;
    use achievement::store::StoreTrait;

    use piltover::messaging::hash::compute_message_hash_appc_to_sn;

    use nums_appchain::models::game::{Game, GameTrait};
    use nums_appchain::models::totals::Totals;
    use nums_appchain::models::slot::Slot;
    use nums_common::models::claims::{Claims, ClaimsType, TokenClaim, JackpotClaim};
    use nums_appchain::elements::tasks::index::{Task, TaskTrait};
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
        claim_id: u32,
        player: ContractAddress,
        amount: u64,
    }

    #[abi(embed_v0)]
    impl ClaimActionsImpl of IClaimActions<ContractState> {
        fn claimed_on_starknet(ref self: ContractState, claim_id: u32) {
            let mut world = self.world(@"nums");
            let mut claims: Claims = world.read_model(claim_id);
            claims.claimed_on_starknet = true;
            world.write_model(@claims);
        }

        fn claim_reward(ref self: ContractState) {
            let mut world = self.world(@"nums");
            let config: Config = world.read_model(WORLD_RESOURCE);
            let player = starknet::get_caller_address();
            let mut totals: Totals = world.read_model(player);
            let claim_amount = totals.rewards_earned - totals.rewards_claimed;
            assert(claim_amount > 0, 'nothing to claim');

            let claim_id = world.dispatcher.uuid();
            let block_info = starknet::get_block_info().unbox();
            let claims = Claims {
                player,
                claim_id,
                claimed_on_starknet: false,
                ty: ClaimsType::TOKEN(TokenClaim { amount: claim_amount }),
                block_timestamp: block_info.block_timestamp,
                block_number: block_info.block_number,
                message_hash: compute_message_hash_appc_to_sn(
                    starknet::get_contract_address(),
                    config.starknet_consumer,
                    array![player.into(), claim_id.into(), claim_amount.into()].span(),
                ),
            };

            totals.rewards_claimed += claim_amount;

            world.write_model(@totals);
            world.write_model(@claims);
            world.emit_event(@RewardClaimed { claim_id, player, amount: claim_amount });

            send_message_to_l1_syscall(
                MSG_TO_L2_MAGIC,
                array![
                    config.starknet_consumer.into(),
                    player.into(),
                    claim_id.into(),
                    claim_amount.into(),
                ]
                    .span(),
            )
                .unwrap_syscall();

            // Update player progression
            let capped_amount = if claim_amount > 1_000_000_u64 {
                1_000_000_u32
            } else {
                claim_amount.try_into().unwrap()
            };

            let player_id: felt252 = player.into();
            let task_id: felt252 = Task::Claimer.identifier();
            let mut store = StoreTrait::new(world);
            store.progress(player_id, task_id, capped_amount,starknet::get_block_timestamp());
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

            let claim_id = world.dispatcher.uuid();
            let block_info = starknet::get_block_info().unbox();
            let claims = Claims {
                player,
                claim_id,
                claimed_on_starknet: false,
                ty: ClaimsType::JACKPOT(JackpotClaim { id: jackpot.id }),
                block_number: block_info.block_number,
                block_timestamp: block_info.block_timestamp,
                message_hash: compute_message_hash_appc_to_sn(
                    starknet::get_contract_address(),
                    config.starknet_consumer,
                    array![player.into(), claim_id.into(), jackpot_id.into()].span(),
                ),
            };

            world.write_model(@jackpot);
            world.write_model(@claims);
            world.emit_event(@JackpotClaimed { game_id, jackpot_id, player });

            send_message_to_l1_syscall(
                MSG_TO_L2_MAGIC,
                array![
                    config.starknet_consumer.into(),
                    player.into(),
                    claim_id.into(),
                    jackpot_id.into(),
                ]
                    .span(),
            )
                .unwrap_syscall();
        }
    }
}
