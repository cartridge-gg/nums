import { DojoProvider, DojoCall } from "@dojoengine/core";
import { Account, AccountInterface, BigNumberish, CairoCustomEnum } from "starknet";

export function setupWorld(provider: DojoProvider) {

	const build_Collection_approve_calldata = (to: string, tokenId: BigNumberish): DojoCall => {
		return {
			contractName: "Collection",
			entrypoint: "approve",
			calldata: [to, tokenId],
		};
	};

	const Collection_approve = async (snAccount: Account | AccountInterface, to: string, tokenId: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_Collection_approve_calldata(to, tokenId),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Collection_assertIsOwner_calldata = (owner: string, tokenId: BigNumberish): DojoCall => {
		return {
			contractName: "Collection",
			entrypoint: "assert_is_owner",
			calldata: [owner, tokenId],
		};
	};

	const Collection_assertIsOwner = async (snAccount: Account | AccountInterface, owner: string, tokenId: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_Collection_assertIsOwner_calldata(owner, tokenId),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Collection_balanceOf_calldata = (account: string): DojoCall => {
		return {
			contractName: "Collection",
			entrypoint: "balance_of",
			calldata: [account],
		};
	};

	const Collection_balanceOf = async (account: string) => {
		try {
			return await provider.call("NUMS", build_Collection_balanceOf_calldata(account));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Collection_burn_calldata = (tokenId: BigNumberish): DojoCall => {
		return {
			contractName: "Collection",
			entrypoint: "burn",
			calldata: [tokenId],
		};
	};

	const Collection_burn = async (snAccount: Account | AccountInterface, tokenId: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_Collection_burn_calldata(tokenId),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Collection_contractUri_calldata = (): DojoCall => {
		return {
			contractName: "Collection",
			entrypoint: "contract_uri",
			calldata: [],
		};
	};

	const Collection_contractUri = async () => {
		try {
			return await provider.call("NUMS", build_Collection_contractUri_calldata());
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Collection_getApproved_calldata = (tokenId: BigNumberish): DojoCall => {
		return {
			contractName: "Collection",
			entrypoint: "get_approved",
			calldata: [tokenId],
		};
	};

	const Collection_getApproved = async (tokenId: BigNumberish) => {
		try {
			return await provider.call("NUMS", build_Collection_getApproved_calldata(tokenId));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Collection_getRoleAdmin_calldata = (role: BigNumberish): DojoCall => {
		return {
			contractName: "Collection",
			entrypoint: "get_role_admin",
			calldata: [role],
		};
	};

	const Collection_getRoleAdmin = async (role: BigNumberish) => {
		try {
			return await provider.call("NUMS", build_Collection_getRoleAdmin_calldata(role));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Collection_grantRole_calldata = (role: BigNumberish, account: string): DojoCall => {
		return {
			contractName: "Collection",
			entrypoint: "grant_role",
			calldata: [role, account],
		};
	};

	const Collection_grantRole = async (snAccount: Account | AccountInterface, role: BigNumberish, account: string) => {
		try {
			return await provider.execute(
				snAccount,
				build_Collection_grantRole_calldata(role, account),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Collection_hasRole_calldata = (role: BigNumberish, account: string): DojoCall => {
		return {
			contractName: "Collection",
			entrypoint: "has_role",
			calldata: [role, account],
		};
	};

	const Collection_hasRole = async (role: BigNumberish, account: string) => {
		try {
			return await provider.call("NUMS", build_Collection_hasRole_calldata(role, account));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Collection_isApprovedForAll_calldata = (owner: string, operator: string): DojoCall => {
		return {
			contractName: "Collection",
			entrypoint: "is_approved_for_all",
			calldata: [owner, operator],
		};
	};

	const Collection_isApprovedForAll = async (owner: string, operator: string) => {
		try {
			return await provider.call("NUMS", build_Collection_isApprovedForAll_calldata(owner, operator));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Collection_mint_calldata = (to: string, souldbound: boolean): DojoCall => {
		return {
			contractName: "Collection",
			entrypoint: "mint",
			calldata: [to, souldbound],
		};
	};

	const Collection_mint = async (snAccount: Account | AccountInterface, to: string, souldbound: boolean) => {
		try {
			return await provider.execute(
				snAccount,
				build_Collection_mint_calldata(to, souldbound),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Collection_name_calldata = (): DojoCall => {
		return {
			contractName: "Collection",
			entrypoint: "name",
			calldata: [],
		};
	};

	const Collection_name = async () => {
		try {
			return await provider.call("NUMS", build_Collection_name_calldata());
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Collection_owner_calldata = (): DojoCall => {
		return {
			contractName: "Collection",
			entrypoint: "owner",
			calldata: [],
		};
	};

	const Collection_owner = async () => {
		try {
			return await provider.call("NUMS", build_Collection_owner_calldata());
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Collection_ownerOf_calldata = (tokenId: BigNumberish): DojoCall => {
		return {
			contractName: "Collection",
			entrypoint: "owner_of",
			calldata: [tokenId],
		};
	};

	const Collection_ownerOf = async (tokenId: BigNumberish) => {
		try {
			return await provider.call("NUMS", build_Collection_ownerOf_calldata(tokenId));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Collection_renounceOwnership_calldata = (): DojoCall => {
		return {
			contractName: "Collection",
			entrypoint: "renounce_ownership",
			calldata: [],
		};
	};

	const Collection_renounceOwnership = async (snAccount: Account | AccountInterface) => {
		try {
			return await provider.execute(
				snAccount,
				build_Collection_renounceOwnership_calldata(),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Collection_renounceRole_calldata = (role: BigNumberish, account: string): DojoCall => {
		return {
			contractName: "Collection",
			entrypoint: "renounce_role",
			calldata: [role, account],
		};
	};

	const Collection_renounceRole = async (snAccount: Account | AccountInterface, role: BigNumberish, account: string) => {
		try {
			return await provider.execute(
				snAccount,
				build_Collection_renounceRole_calldata(role, account),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Collection_revokeRole_calldata = (role: BigNumberish, account: string): DojoCall => {
		return {
			contractName: "Collection",
			entrypoint: "revoke_role",
			calldata: [role, account],
		};
	};

	const Collection_revokeRole = async (snAccount: Account | AccountInterface, role: BigNumberish, account: string) => {
		try {
			return await provider.execute(
				snAccount,
				build_Collection_revokeRole_calldata(role, account),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Collection_safeTransferFrom_calldata = (from: string, to: string, tokenId: BigNumberish, data: Array<BigNumberish>): DojoCall => {
		return {
			contractName: "Collection",
			entrypoint: "safe_transfer_from",
			calldata: [from, to, tokenId, data],
		};
	};

	const Collection_safeTransferFrom = async (snAccount: Account | AccountInterface, from: string, to: string, tokenId: BigNumberish, data: Array<BigNumberish>) => {
		try {
			return await provider.execute(
				snAccount,
				build_Collection_safeTransferFrom_calldata(from, to, tokenId, data),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Collection_setApprovalForAll_calldata = (operator: string, approved: boolean): DojoCall => {
		return {
			contractName: "Collection",
			entrypoint: "set_approval_for_all",
			calldata: [operator, approved],
		};
	};

	const Collection_setApprovalForAll = async (snAccount: Account | AccountInterface, operator: string, approved: boolean) => {
		try {
			return await provider.execute(
				snAccount,
				build_Collection_setApprovalForAll_calldata(operator, approved),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Collection_symbol_calldata = (): DojoCall => {
		return {
			contractName: "Collection",
			entrypoint: "symbol",
			calldata: [],
		};
	};

	const Collection_symbol = async () => {
		try {
			return await provider.call("NUMS", build_Collection_symbol_calldata());
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Collection_tokenUri_calldata = (tokenId: BigNumberish): DojoCall => {
		return {
			contractName: "Collection",
			entrypoint: "token_uri",
			calldata: [tokenId],
		};
	};

	const Collection_tokenUri = async (tokenId: BigNumberish) => {
		try {
			return await provider.call("NUMS", build_Collection_tokenUri_calldata(tokenId));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Collection_transferFrom_calldata = (from: string, to: string, tokenId: BigNumberish): DojoCall => {
		return {
			contractName: "Collection",
			entrypoint: "transfer_from",
			calldata: [from, to, tokenId],
		};
	};

	const Collection_transferFrom = async (snAccount: Account | AccountInterface, from: string, to: string, tokenId: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_Collection_transferFrom_calldata(from, to, tokenId),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Collection_transferOwnership_calldata = (newOwner: string): DojoCall => {
		return {
			contractName: "Collection",
			entrypoint: "transfer_ownership",
			calldata: [newOwner],
		};
	};

	const Collection_transferOwnership = async (snAccount: Account | AccountInterface, newOwner: string) => {
		try {
			return await provider.execute(
				snAccount,
				build_Collection_transferOwnership_calldata(newOwner),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Collection_update_calldata = (tokenId: BigNumberish): DojoCall => {
		return {
			contractName: "Collection",
			entrypoint: "update",
			calldata: [tokenId],
		};
	};

	const Collection_update = async (snAccount: Account | AccountInterface, tokenId: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_Collection_update_calldata(tokenId),
				"NUMS",
			);
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

	const build_Play_onQuestClaim_calldata = (player: string, questId: BigNumberish, intervalId: BigNumberish): DojoCall => {
		return {
			contractName: "Play",
			entrypoint: "on_quest_claim",
			calldata: [player, questId, intervalId],
		};
	};

	const Play_onQuestClaim = async (snAccount: Account | AccountInterface, player: string, questId: BigNumberish, intervalId: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_Play_onQuestClaim_calldata(player, questId, intervalId),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Play_onQuestComplete_calldata = (player: string, questId: BigNumberish, intervalId: BigNumberish): DojoCall => {
		return {
			contractName: "Play",
			entrypoint: "on_quest_complete",
			calldata: [player, questId, intervalId],
		};
	};

	const Play_onQuestComplete = async (snAccount: Account | AccountInterface, player: string, questId: BigNumberish, intervalId: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_Play_onQuestComplete_calldata(player, questId, intervalId),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Play_onQuestUnlock_calldata = (player: string, questId: BigNumberish, intervalId: BigNumberish): DojoCall => {
		return {
			contractName: "Play",
			entrypoint: "on_quest_unlock",
			calldata: [player, questId, intervalId],
		};
	};

	const Play_onQuestUnlock = async (snAccount: Account | AccountInterface, player: string, questId: BigNumberish, intervalId: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_Play_onQuestUnlock_calldata(player, questId, intervalId),
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

	const build_Setup_questClaim_calldata = (player: string, questId: BigNumberish, intervalId: BigNumberish): DojoCall => {
		return {
			contractName: "Setup",
			entrypoint: "quest_claim",
			calldata: [player, questId, intervalId],
		};
	};

	const Setup_questClaim = async (snAccount: Account | AccountInterface, player: string, questId: BigNumberish, intervalId: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_Setup_questClaim_calldata(player, questId, intervalId),
				"NUMS",
			);
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

	const build_Setup_setNumsAddress_calldata = (numsAddress: string): DojoCall => {
		return {
			contractName: "Setup",
			entrypoint: "set_nums_address",
			calldata: [numsAddress],
		};
	};

	const Setup_setNumsAddress = async (snAccount: Account | AccountInterface, numsAddress: string) => {
		try {
			return await provider.execute(
				snAccount,
				build_Setup_setNumsAddress_calldata(numsAddress),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Setup_setOwnerAddress_calldata = (ownerAddress: string): DojoCall => {
		return {
			contractName: "Setup",
			entrypoint: "set_owner_address",
			calldata: [ownerAddress],
		};
	};

	const Setup_setOwnerAddress = async (snAccount: Account | AccountInterface, ownerAddress: string) => {
		try {
			return await provider.execute(
				snAccount,
				build_Setup_setOwnerAddress_calldata(ownerAddress),
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

	const build_Setup_setTargetSupply_calldata = (supply: BigNumberish): DojoCall => {
		return {
			contractName: "Setup",
			entrypoint: "set_target_supply",
			calldata: [supply],
		};
	};

	const Setup_setTargetSupply = async (snAccount: Account | AccountInterface, supply: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_Setup_setTargetSupply_calldata(supply),
				"NUMS",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};



	return {
		Collection: {
			approve: Collection_approve,
			buildApproveCalldata: build_Collection_approve_calldata,
			assertIsOwner: Collection_assertIsOwner,
			buildAssertIsOwnerCalldata: build_Collection_assertIsOwner_calldata,
			balanceOf: Collection_balanceOf,
			buildBalanceOfCalldata: build_Collection_balanceOf_calldata,
			burn: Collection_burn,
			buildBurnCalldata: build_Collection_burn_calldata,
			contractUri: Collection_contractUri,
			buildContractUriCalldata: build_Collection_contractUri_calldata,
			getApproved: Collection_getApproved,
			buildGetApprovedCalldata: build_Collection_getApproved_calldata,
			getRoleAdmin: Collection_getRoleAdmin,
			buildGetRoleAdminCalldata: build_Collection_getRoleAdmin_calldata,
			grantRole: Collection_grantRole,
			buildGrantRoleCalldata: build_Collection_grantRole_calldata,
			hasRole: Collection_hasRole,
			buildHasRoleCalldata: build_Collection_hasRole_calldata,
			isApprovedForAll: Collection_isApprovedForAll,
			buildIsApprovedForAllCalldata: build_Collection_isApprovedForAll_calldata,
			mint: Collection_mint,
			buildMintCalldata: build_Collection_mint_calldata,
			name: Collection_name,
			buildNameCalldata: build_Collection_name_calldata,
			owner: Collection_owner,
			buildOwnerCalldata: build_Collection_owner_calldata,
			ownerOf: Collection_ownerOf,
			buildOwnerOfCalldata: build_Collection_ownerOf_calldata,
			renounceOwnership: Collection_renounceOwnership,
			buildRenounceOwnershipCalldata: build_Collection_renounceOwnership_calldata,
			renounceRole: Collection_renounceRole,
			buildRenounceRoleCalldata: build_Collection_renounceRole_calldata,
			revokeRole: Collection_revokeRole,
			buildRevokeRoleCalldata: build_Collection_revokeRole_calldata,
			safeTransferFrom: Collection_safeTransferFrom,
			buildSafeTransferFromCalldata: build_Collection_safeTransferFrom_calldata,
			setApprovalForAll: Collection_setApprovalForAll,
			buildSetApprovalForAllCalldata: build_Collection_setApprovalForAll_calldata,
			symbol: Collection_symbol,
			buildSymbolCalldata: build_Collection_symbol_calldata,
			tokenUri: Collection_tokenUri,
			buildTokenUriCalldata: build_Collection_tokenUri_calldata,
			transferFrom: Collection_transferFrom,
			buildTransferFromCalldata: build_Collection_transferFrom_calldata,
			transferOwnership: Collection_transferOwnership,
			buildTransferOwnershipCalldata: build_Collection_transferOwnership_calldata,
			update: Collection_update,
			buildUpdateCalldata: build_Collection_update_calldata,
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
			onIssue: Play_onIssue,
			buildOnIssueCalldata: build_Play_onIssue_calldata,
			onQuestClaim: Play_onQuestClaim,
			buildOnQuestClaimCalldata: build_Play_onQuestClaim_calldata,
			onQuestComplete: Play_onQuestComplete,
			buildOnQuestCompleteCalldata: build_Play_onQuestComplete_calldata,
			onQuestUnlock: Play_onQuestUnlock,
			buildOnQuestUnlockCalldata: build_Play_onQuestUnlock_calldata,
			registerStarterpack: Play_registerStarterpack,
			buildRegisterStarterpackCalldata: build_Play_registerStarterpack_calldata,
			set: Play_set,
			buildSetCalldata: build_Play_set_calldata,
			start: Play_start,
			buildStartCalldata: build_Play_start_calldata,
			supply: Play_supply,
			buildSupplyCalldata: build_Play_supply_calldata,
			updateMetadata: Play_updateMetadata,
			buildUpdateMetadataCalldata: build_Play_updateMetadata_calldata,
			updateStarterpack: Play_updateStarterpack,
			buildUpdateStarterpackCalldata: build_Play_updateStarterpack_calldata,
		},
		Setup: {
			questClaim: Setup_questClaim,
			buildQuestClaimCalldata: build_Setup_questClaim_calldata,
			setEntryPrice: Setup_setEntryPrice,
			buildSetEntryPriceCalldata: build_Setup_setEntryPrice_calldata,
			setNumsAddress: Setup_setNumsAddress,
			buildSetNumsAddressCalldata: build_Setup_setNumsAddress_calldata,
			setOwnerAddress: Setup_setOwnerAddress,
			buildSetOwnerAddressCalldata: build_Setup_setOwnerAddress_calldata,
			setStarterpack: Setup_setStarterpack,
			buildSetStarterpackCalldata: build_Setup_setStarterpack_calldata,
			setTargetSupply: Setup_setTargetSupply,
			buildSetTargetSupplyCalldata: build_Setup_setTargetSupply_calldata,
		},
	};
}