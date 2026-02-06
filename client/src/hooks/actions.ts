import { useAccount, useNetwork } from "@starknet-react/core";
import { useCallback } from "react";
import { CallData, uint256 } from "starknet";
import {
  getSetupAddress,
  getGameAddress,
  getTokenAddress,
  getVrfAddress,
} from "@/config";
import { useLoading } from "@/context/loading";

export const useActions = () => {
  const { account } = useAccount();
  const { chain } = useNetwork();
  const { withLoading, setLoading } = useLoading();

  const set = useCallback(
    async (gameId: number, index: number) => {
      try {
        return await withLoading("slot", index, async () => {
          if (!account?.address) return false;
          const gameAddress = getGameAddress(chain.id);
          const vrfAddress = getVrfAddress(chain.id);
          const { transaction_hash } = await account.execute([
            {
              contractAddress: vrfAddress,
              entrypoint: "request_random",
              calldata: CallData.compile({
                caller: gameAddress,
                source: { type: 0, address: gameAddress },
              }),
            },
            {
              contractAddress: gameAddress,
              entrypoint: "set",
              calldata: CallData.compile({
                gameId: gameId,
                index: index,
              }),
            },
          ]);
          const receipt = await account.waitForTransaction(transaction_hash);
          if (!receipt.isSuccess()) {
            setLoading("slot", index, false);
            return false;
          }
          return true;
        });
      } catch (e) {
        console.log({ e });
        setLoading("slot", index, false);
        return false;
      }
    },
    [account, chain.id, withLoading, setLoading],
  );

  const select = useCallback(
    async (gameId: number, index: number) => {
      try {
        return await withLoading("power", index, async () => {
          if (!account?.address) return false;
          const gameAddress = getGameAddress(chain.id);
          const { transaction_hash } = await account.execute([
            {
              contractAddress: gameAddress,
              entrypoint: "select",
              calldata: CallData.compile({
                gameId: gameId,
                index: index,
              }),
            },
          ]);
          const receipt = await account.waitForTransaction(transaction_hash);
          if (!receipt.isSuccess()) {
            setLoading("power", index, false);
            return false;
          }
          return true;
        });
      } catch (e) {
        console.log({ e });
        return false;
      }
    },
    [account, chain.id, withLoading, setLoading],
  );

  const apply = useCallback(
    async (gameId: number, index: number) => {
      try {
        return await withLoading("power", index, async () => {
          if (!account?.address) return false;
          const gameAddress = getGameAddress(chain.id);
          const vrfAddress = getVrfAddress(chain.id);
          const { transaction_hash } = await account.execute([
            {
              contractAddress: vrfAddress,
              entrypoint: "request_random",
              calldata: CallData.compile({
                caller: gameAddress,
                source: { type: 0, address: gameAddress },
              }),
            },
            {
              contractAddress: gameAddress,
              entrypoint: "apply",
              calldata: CallData.compile({
                gameId: gameId,
                index: index,
              }),
            },
          ]);
          const receipt = await account.waitForTransaction(transaction_hash);
          if (!receipt.isSuccess()) {
            setLoading("power", index, false);
            return false;
          }
          return true;
        });
      } catch (e) {
        console.log({ e });
        setLoading("power", index, false);
        return false;
      }
    },
    [account, chain.id, withLoading, setLoading],
  );

  const claim = useCallback(
    async (gameId: number) => {
      try {
        if (!account?.address) return false;
        const gameAddress = getGameAddress(chain.id);
        await account.execute([
          {
            contractAddress: gameAddress,
            entrypoint: "claim",
            calldata: CallData.compile({
              gameId: gameId,
            }),
          },
        ]);
        return true;
      } catch (e) {
        console.log({ e });
        return false;
      }
    },
    [account, chain.id],
  );

  const questClaims = useCallback(
    async (
      params: { playerAddress: string; questId: string; intervalId: number }[],
    ) => {
      try {
        if (!account?.address) return false;
        const setupAddress = getSetupAddress(chain.id);
        const calls = params.map(({ playerAddress, questId, intervalId }) => ({
          contractAddress: setupAddress,
          entrypoint: "quest_claim",
          calldata: CallData.compile({
            player: playerAddress,
            quest_id: questId,
            interval_id: intervalId,
          }),
        }));
        await account.execute(calls);
        return true;
      } catch (e) {
        console.log({ e });
        return false;
      }
    },
    [account, chain.id],
  );

  const questClaim = useCallback(
    async (playerAddress: string, questId: string, intervalId: number) => {
      try {
        if (!account?.address) return false;
        const setupAddress = getSetupAddress(chain.id);
        await account.execute([
          {
            contractAddress: setupAddress,
            entrypoint: "quest_claim",
            calldata: CallData.compile({
              player: playerAddress,
              quest_id: questId,
              interval_id: intervalId,
            }),
          },
        ]);
        return true;
      } catch (e) {
        console.log({ e });
        return false;
      }
    },
    [account, chain.id],
  );

  const mint = useCallback(
    async (tokenAddress?: string) => {
      try {
        if (!account?.address) return false;
        const address = tokenAddress || getTokenAddress(chain.id);
        await account.execute([
          {
            contractAddress: address,
            entrypoint: "mint",
            calldata: CallData.compile({
              recipient: account?.address,
              amount: uint256.bnToUint256(1_000n * 10n ** 18n), // 1000 tokens with 18 decimals
            }),
          },
        ]);
        return true;
      } catch (e) {
        console.log({ e });
        return false;
      }
    },
    [account, chain.id],
  );

  return {
    set,
    select,
    apply,
    claim,
    mint,
    quest: {
      claims: questClaims,
      claim: questClaim,
    },
  };
};
