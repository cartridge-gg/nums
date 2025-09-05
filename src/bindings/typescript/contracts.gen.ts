import { DojoProvider, DojoCall } from "@dojoengine/core";
import { Account, AccountInterface, BigNumberish, CairoOption, CairoCustomEnum } from "starknet";
import * as models from "./models.gen";

export function setupWorld(provider: DojoProvider) {

	const build_MockNumsToken_allowance_calldata = (owner: string, spender: string): DojoCall => {
		return {
			contractName: "MockNumsToken",
			entrypoint: "allowance",
			calldata: [owner, spender],
		};
	};

	const MockNumsToken_allowance = async (owner: string, spender: string) => {
		try {
			return await provider.call("nums", build_MockNumsToken_allowance_calldata(owner, spender));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_MockNumsToken_approve_calldata = (spender: string, amount: BigNumberish): DojoCall => {
		return {
			contractName: "MockNumsToken",
			entrypoint: "approve",
			calldata: [spender, amount],
		};
	};

	const MockNumsToken_approve = async (snAccount: Account | AccountInterface, spender: string, amount: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_MockNumsToken_approve_calldata(spender, amount),
				"nums",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_MockNumsToken_balanceOf_calldata = (account: string): DojoCall => {
		return {
			contractName: "MockNumsToken",
			entrypoint: "balanceOf",
			calldata: [account],
		};
	};

	const MockNumsToken_balanceOf = async (account: string) => {
		try {
			return await provider.call("nums", build_MockNumsToken_balanceOf_calldata(account));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_MockNumsToken_decimals_calldata = (): DojoCall => {
		return {
			contractName: "MockNumsToken",
			entrypoint: "decimals",
			calldata: [],
		};
	};

	const MockNumsToken_decimals = async () => {
		try {
			return await provider.call("nums", build_MockNumsToken_decimals_calldata());
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_MockNumsToken_name_calldata = (): DojoCall => {
		return {
			contractName: "MockNumsToken",
			entrypoint: "name",
			calldata: [],
		};
	};

	const MockNumsToken_name = async () => {
		try {
			return await provider.call("nums", build_MockNumsToken_name_calldata());
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_MockNumsToken_symbol_calldata = (): DojoCall => {
		return {
			contractName: "MockNumsToken",
			entrypoint: "symbol",
			calldata: [],
		};
	};

	const MockNumsToken_symbol = async () => {
		try {
			return await provider.call("nums", build_MockNumsToken_symbol_calldata());
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_MockNumsToken_totalSupply_calldata = (): DojoCall => {
		return {
			contractName: "MockNumsToken",
			entrypoint: "totalSupply",
			calldata: [],
		};
	};

	const MockNumsToken_totalSupply = async () => {
		try {
			return await provider.call("nums", build_MockNumsToken_totalSupply_calldata());
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_MockNumsToken_transfer_calldata = (recipient: string, amount: BigNumberish): DojoCall => {
		return {
			contractName: "MockNumsToken",
			entrypoint: "transfer",
			calldata: [recipient, amount],
		};
	};

	const MockNumsToken_transfer = async (snAccount: Account | AccountInterface, recipient: string, amount: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_MockNumsToken_transfer_calldata(recipient, amount),
				"nums",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_MockNumsToken_transferFrom_calldata = (sender: string, recipient: string, amount: BigNumberish): DojoCall => {
		return {
			contractName: "MockNumsToken",
			entrypoint: "transferFrom",
			calldata: [sender, recipient, amount],
		};
	};

	const MockNumsToken_transferFrom = async (snAccount: Account | AccountInterface, sender: string, recipient: string, amount: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_MockNumsToken_transferFrom_calldata(sender, recipient, amount),
				"nums",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_MockRewardToken_allowance_calldata = (owner: string, spender: string): DojoCall => {
		return {
			contractName: "MockRewardToken",
			entrypoint: "allowance",
			calldata: [owner, spender],
		};
	};

	const MockRewardToken_allowance = async (owner: string, spender: string) => {
		try {
			return await provider.call("nums", build_MockRewardToken_allowance_calldata(owner, spender));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_MockRewardToken_approve_calldata = (spender: string, amount: BigNumberish): DojoCall => {
		return {
			contractName: "MockRewardToken",
			entrypoint: "approve",
			calldata: [spender, amount],
		};
	};

	const MockRewardToken_approve = async (snAccount: Account | AccountInterface, spender: string, amount: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_MockRewardToken_approve_calldata(spender, amount),
				"nums",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_MockRewardToken_balanceOf_calldata = (account: string): DojoCall => {
		return {
			contractName: "MockRewardToken",
			entrypoint: "balance_of",
			calldata: [account],
		};
	};

	const MockRewardToken_balanceOf = async (account: string) => {
		try {
			return await provider.call("nums", build_MockRewardToken_balanceOf_calldata(account));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_MockRewardToken_totalSupply_calldata = (): DojoCall => {
		return {
			contractName: "MockRewardToken",
			entrypoint: "total_supply",
			calldata: [],
		};
	};

	const MockRewardToken_totalSupply = async () => {
		try {
			return await provider.call("nums", build_MockRewardToken_totalSupply_calldata());
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_MockRewardToken_transfer_calldata = (recipient: string, amount: BigNumberish): DojoCall => {
		return {
			contractName: "MockRewardToken",
			entrypoint: "transfer",
			calldata: [recipient, amount],
		};
	};

	const MockRewardToken_transfer = async (snAccount: Account | AccountInterface, recipient: string, amount: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_MockRewardToken_transfer_calldata(recipient, amount),
				"nums",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_MockRewardToken_transferFrom_calldata = (sender: string, recipient: string, amount: BigNumberish): DojoCall => {
		return {
			contractName: "MockRewardToken",
			entrypoint: "transfer_from",
			calldata: [sender, recipient, amount],
		};
	};

	const MockRewardToken_transferFrom = async (snAccount: Account | AccountInterface, sender: string, recipient: string, amount: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_MockRewardToken_transferFrom_calldata(sender, recipient, amount),
				"nums",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_claim_actions_claimJackpot_calldata = (gameId: BigNumberish): DojoCall => {
		return {
			contractName: "claim_actions",
			entrypoint: "claim_jackpot",
			calldata: [gameId],
		};
	};

	const claim_actions_claimJackpot = async (snAccount: Account | AccountInterface, gameId: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_claim_actions_claimJackpot_calldata(gameId),
				"nums",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_claim_actions_claimReward_calldata = (): DojoCall => {
		return {
			contractName: "claim_actions",
			entrypoint: "claim_reward",
			calldata: [],
		};
	};

	const claim_actions_claimReward = async (snAccount: Account | AccountInterface) => {
		try {
			return await provider.execute(
				snAccount,
				build_claim_actions_claimReward_calldata(),
				"nums",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_config_actions_setConfig_calldata = (config: models.Config): DojoCall => {
		return {
			contractName: "config_actions",
			entrypoint: "set_config",
			calldata: [config],
		};
	};

	const config_actions_setConfig = async (snAccount: Account | AccountInterface, config: models.Config) => {
		try {
			return await provider.execute(
				snAccount,
				build_config_actions_setConfig_calldata(config),
				"nums",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_game_actions_createGame_calldata = (jackpotId: BigNumberish): DojoCall => {
		return {
			contractName: "game_actions",
			entrypoint: "create_game",
			calldata: [jackpotId],
		};
	};

	const game_actions_createGame = async (snAccount: Account | AccountInterface, jackpotId: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_game_actions_createGame_calldata(jackpotId),
				"nums",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_game_actions_setSlot_calldata = (gameId: BigNumberish, targetIdx: BigNumberish): DojoCall => {
		return {
			contractName: "game_actions",
			entrypoint: "set_slot",
			calldata: [gameId, targetIdx],
		};
	};

	const game_actions_setSlot = async (snAccount: Account | AccountInterface, gameId: BigNumberish, targetIdx: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_game_actions_setSlot_calldata(gameId, targetIdx),
				"nums",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_jackpot_actions_claimJackpot_calldata = (jackpotId: BigNumberish): DojoCall => {
		return {
			contractName: "jackpot_actions",
			entrypoint: "claim_jackpot",
			calldata: [jackpotId],
		};
	};

	const jackpot_actions_claimJackpot = async (snAccount: Account | AccountInterface, jackpotId: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_jackpot_actions_claimJackpot_calldata(jackpotId),
				"nums",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_jackpot_actions_createJackpotFactory_calldata = (params: models.CreateJackpotFactoryParams): DojoCall => {
		return {
			contractName: "jackpot_actions",
			entrypoint: "create_jackpot_factory",
			calldata: [params],
		};
	};

	const jackpot_actions_createJackpotFactory = async (snAccount: Account | AccountInterface, params: models.CreateJackpotFactoryParams) => {
		try {
			return await provider.execute(
				snAccount,
				build_jackpot_actions_createJackpotFactory_calldata(params),
				"nums",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_jackpot_actions_rescueJackpot_calldata = (jackpotId: BigNumberish): DojoCall => {
		return {
			contractName: "jackpot_actions",
			entrypoint: "rescue_jackpot",
			calldata: [jackpotId],
		};
	};

	const jackpot_actions_rescueJackpot = async (snAccount: Account | AccountInterface, jackpotId: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_jackpot_actions_rescueJackpot_calldata(jackpotId),
				"nums",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};



	return {
		MockNumsToken: {
			allowance: MockNumsToken_allowance,
			buildAllowanceCalldata: build_MockNumsToken_allowance_calldata,
			approve: MockNumsToken_approve,
			buildApproveCalldata: build_MockNumsToken_approve_calldata,
			balanceOf: MockNumsToken_balanceOf,
			buildBalanceOfCalldata: build_MockNumsToken_balanceOf_calldata,
			decimals: MockNumsToken_decimals,
			buildDecimalsCalldata: build_MockNumsToken_decimals_calldata,
			name: MockNumsToken_name,
			buildNameCalldata: build_MockNumsToken_name_calldata,
			symbol: MockNumsToken_symbol,
			buildSymbolCalldata: build_MockNumsToken_symbol_calldata,
			totalSupply: MockNumsToken_totalSupply,
			buildTotalSupplyCalldata: build_MockNumsToken_totalSupply_calldata,
			transfer: MockNumsToken_transfer,
			buildTransferCalldata: build_MockNumsToken_transfer_calldata,
			transferFrom: MockNumsToken_transferFrom,
			buildTransferFromCalldata: build_MockNumsToken_transferFrom_calldata,
		},
		MockRewardToken: {
			allowance: MockRewardToken_allowance,
			buildAllowanceCalldata: build_MockRewardToken_allowance_calldata,
			approve: MockRewardToken_approve,
			buildApproveCalldata: build_MockRewardToken_approve_calldata,
			balanceOf: MockRewardToken_balanceOf,
			buildBalanceOfCalldata: build_MockRewardToken_balanceOf_calldata,
			totalSupply: MockRewardToken_totalSupply,
			buildTotalSupplyCalldata: build_MockRewardToken_totalSupply_calldata,
			transfer: MockRewardToken_transfer,
			buildTransferCalldata: build_MockRewardToken_transfer_calldata,
			transferFrom: MockRewardToken_transferFrom,
			buildTransferFromCalldata: build_MockRewardToken_transferFrom_calldata,
		},
		claim_actions: {
			claimJackpot: claim_actions_claimJackpot,
			buildClaimJackpotCalldata: build_claim_actions_claimJackpot_calldata,
			claimReward: claim_actions_claimReward,
			buildClaimRewardCalldata: build_claim_actions_claimReward_calldata,
		},
		config_actions: {
			setConfig: config_actions_setConfig,
			buildSetConfigCalldata: build_config_actions_setConfig_calldata,
		},
		game_actions: {
			createGame: game_actions_createGame,
			buildCreateGameCalldata: build_game_actions_createGame_calldata,
			setSlot: game_actions_setSlot,
			buildSetSlotCalldata: build_game_actions_setSlot_calldata,
		},
		jackpot_actions: {
			claimJackpot: jackpot_actions_claimJackpot,
			buildClaimJackpotCalldata: build_jackpot_actions_claimJackpot_calldata,
			createJackpotFactory: jackpot_actions_createJackpotFactory,
			buildCreateJackpotFactoryCalldata: build_jackpot_actions_createJackpotFactory_calldata,
			rescueJackpot: jackpot_actions_rescueJackpot,
			buildRescueJackpotCalldata: build_jackpot_actions_rescueJackpot_calldata,
		},
	};
}