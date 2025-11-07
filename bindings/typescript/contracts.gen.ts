import { DojoProvider, DojoCall } from "@dojoengine/core";
import { Account, AccountInterface, BigNumberish, CairoOption, CairoCustomEnum } from "starknet";
import * as models from "./models.gen";

export function setupWorld(provider: DojoProvider) {

	const build_Minigame_gameOver_calldata = (tokenId: BigNumberish): DojoCall => {
		return {
			contractName: "Minigame",
			entrypoint: "game_over",
			calldata: [tokenId],
		};
	};

	const Minigame_gameOver = async (tokenId: BigNumberish) => {
		try {
			return await provider.call("NUMS", build_Minigame_gameOver_calldata(tokenId));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Minigame_mintGame_calldata = (playerName: CairoOption<BigNumberish>, settingsId: CairoOption<BigNumberish>, start: CairoOption<BigNumberish>, end: CairoOption<BigNumberish>, objectiveIds: CairoOption<Array<BigNumberish>>, context: CairoOption<GameContextDetails>, clientUrl: CairoOption<string>, rendererAddress: CairoOption<string>, to: string, soulbound: boolean): DojoCall => {
		return {
			contractName: "Minigame",
			entrypoint: "mint_game",
			calldata: [playerName, settingsId, start, end, objectiveIds, context, clientUrl, rendererAddress, to, soulbound],
		};
	};

	const Minigame_mintGame = async (playerName: CairoOption<BigNumberish>, settingsId: CairoOption<BigNumberish>, start: CairoOption<BigNumberish>, end: CairoOption<BigNumberish>, objectiveIds: CairoOption<Array<BigNumberish>>, context: CairoOption<GameContextDetails>, clientUrl: CairoOption<string>, rendererAddress: CairoOption<string>, to: string, soulbound: boolean) => {
		try {
			return await provider.call("NUMS", build_Minigame_mintGame_calldata(playerName, settingsId, start, end, objectiveIds, context, clientUrl, rendererAddress, to, soulbound));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Minigame_objectivesAddress_calldata = (): DojoCall => {
		return {
			contractName: "Minigame",
			entrypoint: "objectives_address",
			calldata: [],
		};
	};

	const Minigame_objectivesAddress = async () => {
		try {
			return await provider.call("NUMS", build_Minigame_objectivesAddress_calldata());
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Minigame_score_calldata = (tokenId: BigNumberish): DojoCall => {
		return {
			contractName: "Minigame",
			entrypoint: "score",
			calldata: [tokenId],
		};
	};

	const Minigame_score = async (tokenId: BigNumberish) => {
		try {
			return await provider.call("NUMS", build_Minigame_score_calldata(tokenId));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Minigame_settingsAddress_calldata = (): DojoCall => {
		return {
			contractName: "Minigame",
			entrypoint: "settings_address",
			calldata: [],
		};
	};

	const Minigame_settingsAddress = async () => {
		try {
			return await provider.call("NUMS", build_Minigame_settingsAddress_calldata());
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Minigame_supportsInterface_calldata = (interfaceId: BigNumberish): DojoCall => {
		return {
			contractName: "Minigame",
			entrypoint: "supports_interface",
			calldata: [interfaceId],
		};
	};

	const Minigame_supportsInterface = async (interfaceId: BigNumberish) => {
		try {
			return await provider.call("NUMS", build_Minigame_supportsInterface_calldata(interfaceId));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Minigame_tokenAddress_calldata = (): DojoCall => {
		return {
			contractName: "Minigame",
			entrypoint: "token_address",
			calldata: [],
		};
	};

	const Minigame_tokenAddress = async () => {
		try {
			return await provider.call("NUMS", build_Minigame_tokenAddress_calldata());
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_MockNumsToken_allowance_calldata = (owner: string, spender: string): DojoCall => {
		return {
			contractName: "MockNumsToken",
			entrypoint: "allowance",
			calldata: [owner, spender],
		};
	};

	const MockNumsToken_allowance = async (owner: string, spender: string) => {
		try {
			return await provider.call("NUMS", build_MockNumsToken_allowance_calldata(owner, spender));
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
				"NUMS",
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
			return await provider.call("NUMS", build_MockNumsToken_balanceOf_calldata(account));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_MockNumsToken_burn_calldata = (amount: BigNumberish): DojoCall => {
		return {
			contractName: "MockNumsToken",
			entrypoint: "burn",
			calldata: [amount],
		};
	};

	const MockNumsToken_burn = async (snAccount: Account | AccountInterface, amount: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_MockNumsToken_burn_calldata(amount),
				"NUMS",
			);
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
			return await provider.call("NUMS", build_MockNumsToken_decimals_calldata());
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_MockNumsToken_getRoleAdmin_calldata = (role: BigNumberish): DojoCall => {
		return {
			contractName: "MockNumsToken",
			entrypoint: "get_role_admin",
			calldata: [role],
		};
	};

	const MockNumsToken_getRoleAdmin = async (role: BigNumberish) => {
		try {
			return await provider.call("NUMS", build_MockNumsToken_getRoleAdmin_calldata(role));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_MockNumsToken_grantRole_calldata = (role: BigNumberish, account: string): DojoCall => {
		return {
			contractName: "MockNumsToken",
			entrypoint: "grant_role",
			calldata: [role, account],
		};
	};

	const MockNumsToken_grantRole = async (snAccount: Account | AccountInterface, role: BigNumberish, account: string) => {
		try {
			return await provider.execute(
				snAccount,
				build_MockNumsToken_grantRole_calldata(role, account),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_MockNumsToken_hasRole_calldata = (role: BigNumberish, account: string): DojoCall => {
		return {
			contractName: "MockNumsToken",
			entrypoint: "has_role",
			calldata: [role, account],
		};
	};

	const MockNumsToken_hasRole = async (role: BigNumberish, account: string) => {
		try {
			return await provider.call("NUMS", build_MockNumsToken_hasRole_calldata(role, account));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_MockNumsToken_mint_calldata = (recipient: string, amount: BigNumberish): DojoCall => {
		return {
			contractName: "MockNumsToken",
			entrypoint: "mint",
			calldata: [recipient, amount],
		};
	};

	const MockNumsToken_mint = async (snAccount: Account | AccountInterface, recipient: string, amount: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_MockNumsToken_mint_calldata(recipient, amount),
				"NUMS",
			);
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
			return await provider.call("NUMS", build_MockNumsToken_name_calldata());
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_MockNumsToken_renounceRole_calldata = (role: BigNumberish, account: string): DojoCall => {
		return {
			contractName: "MockNumsToken",
			entrypoint: "renounce_role",
			calldata: [role, account],
		};
	};

	const MockNumsToken_renounceRole = async (snAccount: Account | AccountInterface, role: BigNumberish, account: string) => {
		try {
			return await provider.execute(
				snAccount,
				build_MockNumsToken_renounceRole_calldata(role, account),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_MockNumsToken_revokeRole_calldata = (role: BigNumberish, account: string): DojoCall => {
		return {
			contractName: "MockNumsToken",
			entrypoint: "revoke_role",
			calldata: [role, account],
		};
	};

	const MockNumsToken_revokeRole = async (snAccount: Account | AccountInterface, role: BigNumberish, account: string) => {
		try {
			return await provider.execute(
				snAccount,
				build_MockNumsToken_revokeRole_calldata(role, account),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_MockNumsToken_reward_calldata = (recipient: string, amount: BigNumberish): DojoCall => {
		return {
			contractName: "MockNumsToken",
			entrypoint: "reward",
			calldata: [recipient, amount],
		};
	};

	const MockNumsToken_reward = async (snAccount: Account | AccountInterface, recipient: string, amount: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_MockNumsToken_reward_calldata(recipient, amount),
				"NUMS",
			);
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
			return await provider.call("NUMS", build_MockNumsToken_symbol_calldata());
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
			return await provider.call("NUMS", build_MockNumsToken_totalSupply_calldata());
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
				"NUMS",
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
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_MockStarterpack_register_calldata = (implementation: string, referralPercentage: BigNumberish, reissuable: boolean, price: BigNumberish, paymentToken: string, metadata: string): DojoCall => {
		return {
			contractName: "MockStarterpack",
			entrypoint: "register",
			calldata: [implementation, referralPercentage, reissuable, price, paymentToken, metadata],
		};
	};

	const MockStarterpack_register = async (snAccount: Account | AccountInterface, implementation: string, referralPercentage: BigNumberish, reissuable: boolean, price: BigNumberish, paymentToken: string, metadata: string) => {
		try {
			return await provider.execute(
				snAccount,
				build_MockStarterpack_register_calldata(implementation, referralPercentage, reissuable, price, paymentToken, metadata),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_MockStarterpack_update_calldata = (starterpackId: BigNumberish, implementation: string, referralPercentage: BigNumberish, reissuable: boolean, price: BigNumberish, paymentToken: string): DojoCall => {
		return {
			contractName: "MockStarterpack",
			entrypoint: "update",
			calldata: [starterpackId, implementation, referralPercentage, reissuable, price, paymentToken],
		};
	};

	const MockStarterpack_update = async (snAccount: Account | AccountInterface, starterpackId: BigNumberish, implementation: string, referralPercentage: BigNumberish, reissuable: boolean, price: BigNumberish, paymentToken: string) => {
		try {
			return await provider.execute(
				snAccount,
				build_MockStarterpack_update_calldata(starterpackId, implementation, referralPercentage, reissuable, price, paymentToken),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_MockStarterpack_updateMetadata_calldata = (starterpackId: BigNumberish, metadata: string): DojoCall => {
		return {
			contractName: "MockStarterpack",
			entrypoint: "update_metadata",
			calldata: [starterpackId, metadata],
		};
	};

	const MockStarterpack_updateMetadata = async (snAccount: Account | AccountInterface, starterpackId: BigNumberish, metadata: string) => {
		try {
			return await provider.execute(
				snAccount,
				build_MockStarterpack_updateMetadata_calldata(starterpackId, metadata),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_MockVRF_assertConsumed_calldata = (source: CairoCustomEnum): DojoCall => {
		return {
			contractName: "MockVRF",
			entrypoint: "assert_consumed",
			calldata: [source],
		};
	};

	const MockVRF_assertConsumed = async (snAccount: Account | AccountInterface, source: CairoCustomEnum) => {
		try {
			return await provider.execute(
				snAccount,
				build_MockVRF_assertConsumed_calldata(source),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_MockVRF_consumeRandom_calldata = (source: CairoCustomEnum): DojoCall => {
		return {
			contractName: "MockVRF",
			entrypoint: "consume_random",
			calldata: [source],
		};
	};

	const MockVRF_consumeRandom = async (snAccount: Account | AccountInterface, source: CairoCustomEnum) => {
		try {
			return await provider.execute(
				snAccount,
				build_MockVRF_consumeRandom_calldata(source),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_MockVRF_requestRandom_calldata = (caller: string, source: CairoCustomEnum): DojoCall => {
		return {
			contractName: "MockVRF",
			entrypoint: "request_random",
			calldata: [caller, source],
		};
	};

	const MockVRF_requestRandom = async (snAccount: Account | AccountInterface, caller: string, source: CairoCustomEnum) => {
		try {
			return await provider.execute(
				snAccount,
				build_MockVRF_requestRandom_calldata(caller, source),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Play_apply_calldata = (gameId: BigNumberish, power: BigNumberish): DojoCall => {
		return {
			contractName: "Play",
			entrypoint: "apply",
			calldata: [gameId, power],
		};
	};

	const Play_apply = async (snAccount: Account | AccountInterface, gameId: BigNumberish, power: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_Play_apply_calldata(gameId, power),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Play_claim_calldata = (tournamentId: BigNumberish, tokenAddress: string, gameId: BigNumberish, position: BigNumberish): DojoCall => {
		return {
			contractName: "Play",
			entrypoint: "claim",
			calldata: [tournamentId, tokenAddress, gameId, position],
		};
	};

	const Play_claim = async (snAccount: Account | AccountInterface, tournamentId: BigNumberish, tokenAddress: string, gameId: BigNumberish, position: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_Play_claim_calldata(tournamentId, tokenAddress, gameId, position),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Play_onClaim_calldata = (recipient: string, leafData: Array<BigNumberish>): DojoCall => {
		return {
			contractName: "Play",
			entrypoint: "on_claim",
			calldata: [recipient, leafData],
		};
	};

	const Play_onClaim = async (snAccount: Account | AccountInterface, recipient: string, leafData: Array<BigNumberish>) => {
		try {
			return await provider.execute(
				snAccount,
				build_Play_onClaim_calldata(recipient, leafData),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Play_onIssue_calldata = (recipient: string, starterpackId: BigNumberish, quantity: BigNumberish): DojoCall => {
		return {
			contractName: "Play",
			entrypoint: "on_issue",
			calldata: [recipient, starterpackId, quantity],
		};
	};

	const Play_onIssue = async (snAccount: Account | AccountInterface, recipient: string, starterpackId: BigNumberish, quantity: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_Play_onIssue_calldata(recipient, starterpackId, quantity),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Play_registerStarterpack_calldata = (paymentToken: string, reissuable: boolean, referralPercentage: BigNumberish, price: BigNumberish): DojoCall => {
		return {
			contractName: "Play",
			entrypoint: "register_starterpack",
			calldata: [paymentToken, reissuable, referralPercentage, price],
		};
	};

	const Play_registerStarterpack = async (snAccount: Account | AccountInterface, paymentToken: string, reissuable: boolean, referralPercentage: BigNumberish, price: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_Play_registerStarterpack_calldata(paymentToken, reissuable, referralPercentage, price),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Play_rescue_calldata = (tournamentId: BigNumberish, tokenAddress: string): DojoCall => {
		return {
			contractName: "Play",
			entrypoint: "rescue",
			calldata: [tournamentId, tokenAddress],
		};
	};

	const Play_rescue = async (snAccount: Account | AccountInterface, tournamentId: BigNumberish, tokenAddress: string) => {
		try {
			return await provider.execute(
				snAccount,
				build_Play_rescue_calldata(tournamentId, tokenAddress),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Play_set_calldata = (gameId: BigNumberish, index: BigNumberish): DojoCall => {
		return {
			contractName: "Play",
			entrypoint: "set",
			calldata: [gameId, index],
		};
	};

	const Play_set = async (snAccount: Account | AccountInterface, gameId: BigNumberish, index: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_Play_set_calldata(gameId, index),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Play_sponsor_calldata = (tournamentId: BigNumberish, tokenAddress: string, amount: BigNumberish): DojoCall => {
		return {
			contractName: "Play",
			entrypoint: "sponsor",
			calldata: [tournamentId, tokenAddress, amount],
		};
	};

	const Play_sponsor = async (snAccount: Account | AccountInterface, tournamentId: BigNumberish, tokenAddress: string, amount: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_Play_sponsor_calldata(tournamentId, tokenAddress, amount),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Play_start_calldata = (gameId: BigNumberish, powers: BigNumberish): DojoCall => {
		return {
			contractName: "Play",
			entrypoint: "start",
			calldata: [gameId, powers],
		};
	};

	const Play_start = async (snAccount: Account | AccountInterface, gameId: BigNumberish, powers: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_Play_start_calldata(gameId, powers),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Play_supply_calldata = (starterpackId: BigNumberish): DojoCall => {
		return {
			contractName: "Play",
			entrypoint: "supply",
			calldata: [starterpackId],
		};
	};

	const Play_supply = async (starterpackId: BigNumberish) => {
		try {
			return await provider.call("NUMS", build_Play_supply_calldata(starterpackId));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Play_updateMetadata_calldata = (starterpackId: BigNumberish): DojoCall => {
		return {
			contractName: "Play",
			entrypoint: "update_metadata",
			calldata: [starterpackId],
		};
	};

	const Play_updateMetadata = async (snAccount: Account | AccountInterface, starterpackId: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_Play_updateMetadata_calldata(starterpackId),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Play_updateStarterpack_calldata = (starterpackId: BigNumberish, reissuable: boolean, paymentToken: string, referralPercentage: BigNumberish, price: BigNumberish): DojoCall => {
		return {
			contractName: "Play",
			entrypoint: "update_starterpack",
			calldata: [starterpackId, reissuable, paymentToken, referralPercentage, price],
		};
	};

	const Play_updateStarterpack = async (snAccount: Account | AccountInterface, starterpackId: BigNumberish, reissuable: boolean, paymentToken: string, referralPercentage: BigNumberish, price: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_Play_updateStarterpack_calldata(starterpackId, reissuable, paymentToken, referralPercentage, price),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Renderer_gameDetails_calldata = (tokenId: BigNumberish): DojoCall => {
		return {
			contractName: "Renderer",
			entrypoint: "game_details",
			calldata: [tokenId],
		};
	};

	const Renderer_gameDetails = async (tokenId: BigNumberish) => {
		try {
			return await provider.call("NUMS", build_Renderer_gameDetails_calldata(tokenId));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Renderer_gameDetailsSvg_calldata = (tokenId: BigNumberish): DojoCall => {
		return {
			contractName: "Renderer",
			entrypoint: "game_details_svg",
			calldata: [tokenId],
		};
	};

	const Renderer_gameDetailsSvg = async (tokenId: BigNumberish) => {
		try {
			return await provider.call("NUMS", build_Renderer_gameDetailsSvg_calldata(tokenId));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Renderer_tokenDescription_calldata = (tokenId: BigNumberish): DojoCall => {
		return {
			contractName: "Renderer",
			entrypoint: "token_description",
			calldata: [tokenId],
		};
	};

	const Renderer_tokenDescription = async (tokenId: BigNumberish) => {
		try {
			return await provider.call("NUMS", build_Renderer_tokenDescription_calldata(tokenId));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Renderer_tokenName_calldata = (tokenId: BigNumberish): DojoCall => {
		return {
			contractName: "Renderer",
			entrypoint: "token_name",
			calldata: [tokenId],
		};
	};

	const Renderer_tokenName = async (tokenId: BigNumberish) => {
		try {
			return await provider.call("NUMS", build_Renderer_tokenName_calldata(tokenId));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Settings_addSetting_calldata = (name: string, description: string, slotCount: BigNumberish, slotMin: BigNumberish, slotMax: BigNumberish, powers: BigNumberish): DojoCall => {
		return {
			contractName: "Settings",
			entrypoint: "add_setting",
			calldata: [name, description, slotCount, slotMin, slotMax, powers],
		};
	};

	const Settings_addSetting = async (snAccount: Account | AccountInterface, name: string, description: string, slotCount: BigNumberish, slotMin: BigNumberish, slotMax: BigNumberish, powers: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_Settings_addSetting_calldata(name, description, slotCount, slotMin, slotMax, powers),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Settings_gameSetting_calldata = (gameId: BigNumberish): DojoCall => {
		return {
			contractName: "Settings",
			entrypoint: "game_setting",
			calldata: [gameId],
		};
	};

	const Settings_gameSetting = async (gameId: BigNumberish) => {
		try {
			return await provider.call("NUMS", build_Settings_gameSetting_calldata(gameId));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Settings_settingCount_calldata = (): DojoCall => {
		return {
			contractName: "Settings",
			entrypoint: "setting_count",
			calldata: [],
		};
	};

	const Settings_settingCount = async () => {
		try {
			return await provider.call("NUMS", build_Settings_settingCount_calldata());
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Settings_settingDetails_calldata = (settingId: BigNumberish): DojoCall => {
		return {
			contractName: "Settings",
			entrypoint: "setting_details",
			calldata: [settingId],
		};
	};

	const Settings_settingDetails = async (settingId: BigNumberish) => {
		try {
			return await provider.call("NUMS", build_Settings_settingDetails_calldata(settingId));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Settings_settingsDetails_calldata = (settingsId: BigNumberish): DojoCall => {
		return {
			contractName: "Settings",
			entrypoint: "settings_details",
			calldata: [settingsId],
		};
	};

	const Settings_settingsDetails = async (settingsId: BigNumberish) => {
		try {
			return await provider.call("NUMS", build_Settings_settingsDetails_calldata(settingsId));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Settings_settingsExist_calldata = (settingsId: BigNumberish): DojoCall => {
		return {
			contractName: "Settings",
			entrypoint: "settings_exist",
			calldata: [settingsId],
		};
	};

	const Settings_settingsExist = async (settingsId: BigNumberish) => {
		try {
			return await provider.call("NUMS", build_Settings_settingsExist_calldata(settingsId));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Settings_supportsInterface_calldata = (interfaceId: BigNumberish): DojoCall => {
		return {
			contractName: "Settings",
			entrypoint: "supports_interface",
			calldata: [interfaceId],
		};
	};

	const Settings_supportsInterface = async (interfaceId: BigNumberish) => {
		try {
			return await provider.call("NUMS", build_Settings_supportsInterface_calldata(interfaceId));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Setup_setEntryPrice_calldata = (entryPrice: BigNumberish): DojoCall => {
		return {
			contractName: "Setup",
			entrypoint: "set_entry_price",
			calldata: [entryPrice],
		};
	};

	const Setup_setEntryPrice = async (snAccount: Account | AccountInterface, entryPrice: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_Setup_setEntryPrice_calldata(entryPrice),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Setup_setStarterpack_calldata = (starterpackAddress: string): DojoCall => {
		return {
			contractName: "Setup",
			entrypoint: "set_starterpack",
			calldata: [starterpackAddress],
		};
	};

	const Setup_setStarterpack = async (snAccount: Account | AccountInterface, starterpackAddress: string) => {
		try {
			return await provider.execute(
				snAccount,
				build_Setup_setStarterpack_calldata(starterpackAddress),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};



	return {
		Minigame: {
			gameOver: Minigame_gameOver,
			buildGameOverCalldata: build_Minigame_gameOver_calldata,
			mintGame: Minigame_mintGame,
			buildMintGameCalldata: build_Minigame_mintGame_calldata,
			objectivesAddress: Minigame_objectivesAddress,
			buildObjectivesAddressCalldata: build_Minigame_objectivesAddress_calldata,
			score: Minigame_score,
			buildScoreCalldata: build_Minigame_score_calldata,
			settingsAddress: Minigame_settingsAddress,
			buildSettingsAddressCalldata: build_Minigame_settingsAddress_calldata,
			supportsInterface: Minigame_supportsInterface,
			buildSupportsInterfaceCalldata: build_Minigame_supportsInterface_calldata,
			tokenAddress: Minigame_tokenAddress,
			buildTokenAddressCalldata: build_Minigame_tokenAddress_calldata,
		},
		MockNumsToken: {
			allowance: MockNumsToken_allowance,
			buildAllowanceCalldata: build_MockNumsToken_allowance_calldata,
			approve: MockNumsToken_approve,
			buildApproveCalldata: build_MockNumsToken_approve_calldata,
			balanceOf: MockNumsToken_balanceOf,
			buildBalanceOfCalldata: build_MockNumsToken_balanceOf_calldata,
			burn: MockNumsToken_burn,
			buildBurnCalldata: build_MockNumsToken_burn_calldata,
			decimals: MockNumsToken_decimals,
			buildDecimalsCalldata: build_MockNumsToken_decimals_calldata,
			getRoleAdmin: MockNumsToken_getRoleAdmin,
			buildGetRoleAdminCalldata: build_MockNumsToken_getRoleAdmin_calldata,
			grantRole: MockNumsToken_grantRole,
			buildGrantRoleCalldata: build_MockNumsToken_grantRole_calldata,
			hasRole: MockNumsToken_hasRole,
			buildHasRoleCalldata: build_MockNumsToken_hasRole_calldata,
			mint: MockNumsToken_mint,
			buildMintCalldata: build_MockNumsToken_mint_calldata,
			name: MockNumsToken_name,
			buildNameCalldata: build_MockNumsToken_name_calldata,
			renounceRole: MockNumsToken_renounceRole,
			buildRenounceRoleCalldata: build_MockNumsToken_renounceRole_calldata,
			revokeRole: MockNumsToken_revokeRole,
			buildRevokeRoleCalldata: build_MockNumsToken_revokeRole_calldata,
			reward: MockNumsToken_reward,
			buildRewardCalldata: build_MockNumsToken_reward_calldata,
			symbol: MockNumsToken_symbol,
			buildSymbolCalldata: build_MockNumsToken_symbol_calldata,
			totalSupply: MockNumsToken_totalSupply,
			buildTotalSupplyCalldata: build_MockNumsToken_totalSupply_calldata,
			transfer: MockNumsToken_transfer,
			buildTransferCalldata: build_MockNumsToken_transfer_calldata,
			transferFrom: MockNumsToken_transferFrom,
			buildTransferFromCalldata: build_MockNumsToken_transferFrom_calldata,
		},
		MockStarterpack: {
			register: MockStarterpack_register,
			buildRegisterCalldata: build_MockStarterpack_register_calldata,
			update: MockStarterpack_update,
			buildUpdateCalldata: build_MockStarterpack_update_calldata,
			updateMetadata: MockStarterpack_updateMetadata,
			buildUpdateMetadataCalldata: build_MockStarterpack_updateMetadata_calldata,
		},
		MockVRF: {
			assertConsumed: MockVRF_assertConsumed,
			buildAssertConsumedCalldata: build_MockVRF_assertConsumed_calldata,
			consumeRandom: MockVRF_consumeRandom,
			buildConsumeRandomCalldata: build_MockVRF_consumeRandom_calldata,
			requestRandom: MockVRF_requestRandom,
			buildRequestRandomCalldata: build_MockVRF_requestRandom_calldata,
		},
		Play: {
			apply: Play_apply,
			buildApplyCalldata: build_Play_apply_calldata,
			claim: Play_claim,
			buildClaimCalldata: build_Play_claim_calldata,
			onClaim: Play_onClaim,
			buildOnClaimCalldata: build_Play_onClaim_calldata,
			onIssue: Play_onIssue,
			buildOnIssueCalldata: build_Play_onIssue_calldata,
			registerStarterpack: Play_registerStarterpack,
			buildRegisterStarterpackCalldata: build_Play_registerStarterpack_calldata,
			rescue: Play_rescue,
			buildRescueCalldata: build_Play_rescue_calldata,
			set: Play_set,
			buildSetCalldata: build_Play_set_calldata,
			sponsor: Play_sponsor,
			buildSponsorCalldata: build_Play_sponsor_calldata,
			start: Play_start,
			buildStartCalldata: build_Play_start_calldata,
			supply: Play_supply,
			buildSupplyCalldata: build_Play_supply_calldata,
			updateMetadata: Play_updateMetadata,
			buildUpdateMetadataCalldata: build_Play_updateMetadata_calldata,
			updateStarterpack: Play_updateStarterpack,
			buildUpdateStarterpackCalldata: build_Play_updateStarterpack_calldata,
		},
		Renderer: {
			gameDetails: Renderer_gameDetails,
			buildGameDetailsCalldata: build_Renderer_gameDetails_calldata,
			gameDetailsSvg: Renderer_gameDetailsSvg,
			buildGameDetailsSvgCalldata: build_Renderer_gameDetailsSvg_calldata,
			tokenDescription: Renderer_tokenDescription,
			buildTokenDescriptionCalldata: build_Renderer_tokenDescription_calldata,
			tokenName: Renderer_tokenName,
			buildTokenNameCalldata: build_Renderer_tokenName_calldata,
		},
		Settings: {
			addSetting: Settings_addSetting,
			buildAddSettingCalldata: build_Settings_addSetting_calldata,
			gameSetting: Settings_gameSetting,
			buildGameSettingCalldata: build_Settings_gameSetting_calldata,
			settingCount: Settings_settingCount,
			buildSettingCountCalldata: build_Settings_settingCount_calldata,
			settingDetails: Settings_settingDetails,
			buildSettingDetailsCalldata: build_Settings_settingDetails_calldata,
			settingsDetails: Settings_settingsDetails,
			buildSettingsDetailsCalldata: build_Settings_settingsDetails_calldata,
			settingsExist: Settings_settingsExist,
			buildSettingsExistCalldata: build_Settings_settingsExist_calldata,
			supportsInterface: Settings_supportsInterface,
			buildSupportsInterfaceCalldata: build_Settings_supportsInterface_calldata,
		},
		Setup: {
			setEntryPrice: Setup_setEntryPrice,
			buildSetEntryPriceCalldata: build_Setup_setEntryPrice_calldata,
			setStarterpack: Setup_setStarterpack,
			buildSetStarterpackCalldata: build_Setup_setStarterpack_calldata,
		},
	};
}