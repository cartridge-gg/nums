#[starknet::interface]
pub trait IClaimActions<T> {
    fn claim_reward(ref self: T);
    fn claim_jackpot(ref self: T, game_id: u32);
}

#[dojo::contract]
pub mod claim_actions {
    use achievement::store::StoreTrait as AchievementStoreTrait;
    use core::array::ArrayTrait;
    use dojo::event::EventStorage;
    use dojo::world::IWorldDispatcherTrait;
    // use nums::models::claims::{Claims, ClaimsType, TokenClaim, JackpotClaim};
    use nums::elements::tasks::index::{Task, TaskTrait};
    use nums::models::game::GameTrait;
    // use nums::models::jackpot::JackpotTrait;
    use nums::{StoreImpl, StoreTrait};
    use starknet::ContractAddress;
    use super::IClaimActions;

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
        fn claim_reward(ref self: ContractState) {// let mut world = self.world(@"nums");
        // let mut store = StoreImpl::new(world);
        // let player = starknet::get_caller_address();

        // // let config = store.config();
        // let mut totals = store.totals(player);
        // let claim_amount = totals.rewards_earned - totals.rewards_claimed;
        // assert(claim_amount > 0, 'nothing to claim');

        // //  ????
        // let claim_id = world.dispatcher.uuid();
        // // let block_info = starknet::get_block_info().unbox();
        // // let claims = Claims {
        // //     player, claim_id, ty: ClaimsType::TOKEN(TokenClaim { amount: claim_amount }),
        // // };

        // totals.rewards_claimed += claim_amount;

        // store.set_totals(@totals);
        // // world.write_model(@claims);
        // world.emit_event(@RewardClaimed { claim_id, player, amount: claim_amount });

        // // Update player progression
        // let capped_amount = if claim_amount > 1_000_000_u64 {
        //     1_000_000_u32
        // } else {
        //     claim_amount.try_into().unwrap()
        // };

        // let player_id: felt252 = player.into();
        // let task_id: felt252 = Task::Claimer.identifier();
        // let mut achievement_store = AchievementStoreTrait::new(world);
        // achievement_store
        //     .progress(
        //         player_id, task_id, capped_amount.into(), starknet::get_block_timestamp(),
        //     );
        }

        /// Claims the jackpot for a specific game. Ensures that the player is authorized and that
        /// the jackpot has not been claimed before.
        /// Transfers the jackpot token to the player and updates the jackpot state.
        ///
        /// # Arguments
        /// * `game_id` - The identifier of the game.
        fn claim_jackpot(ref self: ContractState, game_id: u32) {// let mut world = self.world(@"nums");
        // let mut store = StoreImpl::new(world);

        // let player = starknet::get_caller_address();

        // let game = store.game(game_id, player);
        // let game_config = store.game_config();

        // let jackpot_id = game.jackpot_id.expect('jackpot not defined');
        // let mut jackpot = store.jackpot(jackpot_id);

        // if jackpot.expiration > 0 {
        //     assert(jackpot.expiration < starknet::get_block_timestamp(), 'cannot claim yet')
        // }
        // assert(jackpot.winner.is_none(), 'jackpot already claimed');

        // let mut nums = ArrayTrait::<u16>::new();
        // let mut idx = game_config.max_slots;
        // while idx > 0 {
        //     let slot = store.slot(game_id, player, game_config.max_slots - idx);
        //     if slot.number != 0 {
        //         nums.append(slot.number);
        //     }
        //     idx -= 1_u8;
        // }

        // assert(nums.len() != 0, 'no slots filled');
        // assert(game.is_valid(@nums), 'invalid game state');
        // assert(jackpot.can_claim(@nums), 'cannot claim jackpot');

        // jackpot.winner = Option::Some(player);
        // jackpot.claimed = true;

        // let _claim_id = world.dispatcher.uuid();
        // // let block_info = starknet::get_block_info().unbox();
        // // let claims = Claims {
        // //     player, claim_id, ty: ClaimsType::JACKPOT(JackpotClaim { id: jackpot.id }),
        // // };

        // store.set_jackpot(@jackpot);
        // // world.write_model(@claims);
        // world.emit_event(@JackpotClaimed { game_id, jackpot_id, player });
        }
    }
}
