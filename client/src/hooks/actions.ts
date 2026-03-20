import { useAccount, useNetwork } from "@starknet-react/core";
import { useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { CallData, uint256 } from "starknet";
import {
  getSetupAddress,
  getGameAddress,
  getTokenAddress,
  getVrfAddress,
  getVaultAddress,
  getFaucetAddress,
} from "@/config";
import { useLoading } from "@/context/loading";
import { useEntities } from "@/context/entities";
import { usePractice } from "@/context/practice";
import { GameEngine } from "@/engines";
import { Random } from "@/helpers/random";

export const useActions = () => {
  const { account } = useAccount();
  const { chain } = useNetwork();
  const { withLoading, setLoading } = useLoading();
  const location = useLocation();

  const isPracticeMode = useMemo(
    () =>
      location.pathname === "/practice" || location.pathname === "/tutorial",
    [location.pathname],
  );

  const { game: practiceGame, setGame } = usePractice();
  const { config } = useEntities();

  const set = useCallback(
    async (gameId: number, index: number) => {
      if (isPracticeMode) {
        if (!practiceGame) return false;
        try {
          const result = await withLoading("slot", index, async () => {
            const rand = new Random(
              BigInt(Math.floor(Math.random() * 1000000)),
            );
            const targetSupply = config?.target_supply || 0n;
            GameEngine.set(practiceGame, index, rand, targetSupply);
            setGame(practiceGame.clone());
            return true;
          });
          if (result) {
            setLoading("slot", index, false);
          }
          return result;
        } catch (e) {
          console.error(e);
          setLoading("slot", index, false);
          return false;
        }
      }

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
    [
      isPracticeMode,
      practiceGame,
      config,
      setGame,
      account,
      chain.id,
      withLoading,
      setLoading,
    ],
  );

  const select = useCallback(
    async (gameId: number, index: number) => {
      if (isPracticeMode) {
        if (!practiceGame) return false;
        try {
          const result = await withLoading("power", index, async () => {
            GameEngine.select(practiceGame, index);
            setGame(practiceGame.clone());
            return true;
          });
          if (result) {
            setLoading("power", index, false);
          }
          return result;
        } catch (e) {
          console.error(e);
          setLoading("power", index, false);
          return false;
        }
      }

      if (!account?.address) return false;

      try {
        return await withLoading("power", index, async () => {
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
    [
      isPracticeMode,
      practiceGame,
      setGame,
      account,
      chain.id,
      withLoading,
      setLoading,
    ],
  );

  const apply = useCallback(
    async (gameId: number, index: number) => {
      if (isPracticeMode) {
        if (!practiceGame) return false;
        try {
          const result = await withLoading("power", index, async () => {
            const rand = new Random(
              BigInt(Math.floor(Math.random() * 1000000)),
            );
            GameEngine.apply(practiceGame, index, rand);
            setGame(practiceGame.clone());
            return true;
          });
          if (result) {
            setLoading("power", index, false);
          }
          return result;
        } catch (e) {
          console.error(e);
          setLoading("power", index, false);
          return false;
        }
      }

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
    [
      isPracticeMode,
      practiceGame,
      setGame,
      account,
      chain.id,
      withLoading,
      setLoading,
    ],
  );

  const claim = useCallback(
    async (gameId: number) => {
      if (isPracticeMode) {
        if (!practiceGame) return false;
        try {
          GameEngine.claim(practiceGame);
          setGame(practiceGame.clone());
          return true;
        } catch (e) {
          console.error(e);
          return false;
        }
      }

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
    [isPracticeMode, practiceGame, setGame, account, chain.id],
  );

  const start = useCallback(
    async (gameId: number, game: any) => {
      if (isPracticeMode) {
        if (!practiceGame) return false;
        try {
          const rand = new Random(BigInt(Math.floor(Math.random() * 1000000)));
          GameEngine.start(practiceGame, rand);
          setGame(practiceGame.clone());
          return true;
        } catch (e) {
          console.error(e);
          return false;
        }
      }

      try {
        if (!game) return false;
        const rand = new Random(BigInt(gameId));
        GameEngine.start(game, rand);
        return true;
      } catch (e) {
        console.log({ e });
        return false;
      }
    },
    [isPracticeMode, practiceGame, setGame],
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
    async (amount: bigint = 100n * 10n ** 6n) => {
      try {
        if (!account?.address) return false;
        const faucetAddress = getFaucetAddress(chain.id);
        await account.execute([
          {
            contractAddress: faucetAddress,
            entrypoint: "mint",
            calldata: CallData.compile({
              recipient: account.address,
              amount: uint256.bnToUint256(amount),
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

  const vaultDeposit = useCallback(
    async (amount: bigint) => {
      try {
        if (!account?.address) return false;
        const numsAddress = getTokenAddress(chain.id);
        const vaultAddress = getVaultAddress(chain.id);
        await account.execute([
          {
            contractAddress: numsAddress,
            entrypoint: "approve",
            calldata: CallData.compile({
              spender: vaultAddress,
              amount: uint256.bnToUint256(amount),
            }),
          },
          {
            contractAddress: vaultAddress,
            entrypoint: "deposit",
            calldata: CallData.compile({
              assets: uint256.bnToUint256(amount),
              receiver: account.address,
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

  const vaultMint = useCallback(
    async (amount: bigint) => {
      try {
        if (!account?.address) return false;
        const numsAddress = getTokenAddress(chain.id);
        const vaultAddress = getVaultAddress(chain.id);
        await account.execute([
          {
            contractAddress: numsAddress,
            entrypoint: "approve",
            calldata: CallData.compile({
              spender: vaultAddress,
              amount: uint256.bnToUint256(amount),
            }),
          },
          {
            contractAddress: vaultAddress,
            entrypoint: "mint",
            calldata: CallData.compile({
              shares: uint256.bnToUint256(amount),
              receiver: account.address,
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

  const vaultWithdraw = useCallback(
    async (amount: bigint) => {
      try {
        if (!account?.address) return false;
        const vaultAddress = getVaultAddress(chain.id);
        await account.execute([
          {
            contractAddress: vaultAddress,
            entrypoint: "withdraw",
            calldata: CallData.compile({
              assets: uint256.bnToUint256(amount),
              receiver: account.address,
              owner: account.address,
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

  const vaultRedeem = useCallback(
    async (amount: bigint) => {
      try {
        if (!account?.address) return false;
        const vaultAddress = getVaultAddress(chain.id);
        await account.execute([
          {
            contractAddress: vaultAddress,
            entrypoint: "redeem",
            calldata: CallData.compile({
              shares: uint256.bnToUint256(amount),
              receiver: account.address,
              owner: account.address,
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

  const vaultClaim = useCallback(async () => {
    try {
      if (!account?.address) return false;
      const vaultAddress = getVaultAddress(chain.id);
      await account.execute([
        {
          contractAddress: vaultAddress,
          entrypoint: "claim",
          calldata: [],
        },
      ]);
      return true;
    } catch (e) {
      console.log({ e });
      return false;
    }
  }, [account, chain.id]);

  const merkledropClaim = useCallback(
    async (treeId: string, proofs: string[], data: string[]) => {
      try {
        if (!account?.address) return false;
        const gameAddress = getGameAddress(chain.id);
        await account.execute([
          {
            contractAddress: gameAddress,
            entrypoint: "merkledrop_claim",
            calldata: CallData.compile({
              tree_id: treeId,
              proofs,
              data,
              receiver: account.address,
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
    isPracticeMode,
    start,
    set,
    select,
    apply,
    claim,
    mint,
    quest: {
      claims: questClaims,
      claim: questClaim,
    },
    merkledrop: {
      claim: merkledropClaim,
    },
    vault: {
      deposit: vaultDeposit,
      mint: vaultMint,
      withdraw: vaultWithdraw,
      redeem: vaultRedeem,
      claim: vaultClaim,
    },
  };
};
