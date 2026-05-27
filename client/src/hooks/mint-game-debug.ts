import type ControllerConnector from "@cartridge/connector/controller";
import { useAccount } from "@starknet-react/core";
import { useCallback } from "react";
import { num } from "starknet";
import { getGameAddress, PLAY_CHAIN_ID, SETTLEMENT_CHAIN_ID } from "@/config";

// Dev-only: call settlement `Play.mint` directly so the L1→L2 `create`
// message gets sent without going through Setup.issue / USDC payment /
// bundle bookkeeping. Useful for exercising just the bridge-forward
// plumbing in isolation.
//
// Routes through `controller.openExecute` (the same path
// `controller.openBundle` uses), not `account.execute` — that surfaces
// the keychain confirmation UI and ensures the session/paymaster flow
// is the same as a normal purchase, so `get_caller_address()` inside
// Play.mint matches the controller address (and matches the address we
// granted CREATOR_ROLE to).
//
// Prereq: the connected wallet must hold CREATOR_ROLE on settlement
// Play. By default only Setup + Play-self get it (see Play.dojo_init).
// Grant from the deployer (DEFAULT_ADMIN_ROLE):
//
//     DOJO_PRIVATE_KEY=$SEPOLIA_DEPLOYER_PRIVATE_KEY sozo execute \
//       --profile settlement NUMS-Play grant_role \
//       <selector_of_CREATOR_ROLE> <controller_address>
//
// where selector_of_CREATOR_ROLE = `sozo hash compute CREATOR_ROLE`.
export const useMintGameOnSettlement = () => {
  const { account, connector } = useAccount();
  return useCallback(
    async (player?: string): Promise<string> => {
      if (!connector || !account) {
        throw new Error("Wallet not connected — cannot mint game");
      }
      const recipient = player ?? account.address;
      const playAddress = getGameAddress(num.toBigInt(SETTLEMENT_CHAIN_ID));
      const controller = (connector as unknown as ControllerConnector)
        .controller;
      await controller.switchStarknetChain(SETTLEMENT_CHAIN_ID);
      try {
        // Play.mint(player, multiplier=None, supply=None, price=None,
        //           soulbound=None, quantity=1)
        // Cairo Option serde: None → [1], Some(v) → [0, ...v_felts].
        // quantity=1 (u32) also serializes as the felt 0x1.
        const result = await controller.openExecute(
          [
            {
              contractAddress: playAddress,
              entrypoint: "mint",
              calldata: [recipient, "0x1", "0x1", "0x1", "0x1", "0x1"],
            },
          ],
          SETTLEMENT_CHAIN_ID,
        );
        if (!result?.status) {
          throw new Error("openExecute rejected or failed");
        }
        return result.transactionHash;
      } finally {
        await controller.switchStarknetChain(PLAY_CHAIN_ID);
      }
    },
    [account, connector],
  );
};
