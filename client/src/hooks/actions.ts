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
import { usePostHog } from "@/context/posthog";
import { GameEngine } from "@/engines";
import { Random } from "@/helpers/random";

export const useActions = () => {
  const { account } = useAccount();
  const { chain } = useNetwork();
  const { withLoading, setLoading } = useLoading();
  const location = useLocation();
  const { capture } = usePostHog();

  const isPracticeMode = useMemo(
    () =>
      location.pathname === "/practice" || location.pathname === "/tutorial",
    [location.pathname],
  );

  const mode = useMemo(() => {
    if (location.pathname === "/tutorial") return "tutorial";
    if (location.pathname === "/practice") return "practice";
    return "real";
  }, [location.pathname]);

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
            capture("slot_placed", {
              game_id: gameId,
              slot_index: index,
              mode,
            });
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
          capture("slot_placed", { game_id: gameId, slot_index: index, mode });
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
      capture,
      mode,
    ],
  );

  const select = useCallback(
    async (gameId: number, index: number) => {
      if (isPracticeMode) {
        if (!practiceGame) return false;
        try {
          const result = await withLoading("select", index, async () => {
            GameEngine.select(practiceGame, index);
            setGame(practiceGame.clone());
            return true;
          });
          if (result) {
            setLoading("select", index, false);
            capture("power_selected", {
              game_id: gameId,
              power_index: index,
              mode,
            });
          }
          return result;
        } catch (e) {
          console.error(e);
          setLoading("select", index, false);
          return false;
        }
      }

      if (!account?.address) return false;

      try {
        return await withLoading("select", index, async () => {
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
            setLoading("select", index, false);
            return false;
          }
          capture("power_selected", {
            game_id: gameId,
            power_index: index,
            mode,
          });
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
      capture,
      mode,
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
            capture("power_applied", {
              game_id: gameId,
              power_index: index,
              mode,
            });
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
          capture("power_applied", {
            game_id: gameId,
            power_index: index,
            mode,
          });
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
      capture,
      mode,
    ],
  );

  const claim = useCallback(
    async (gameId: number) => {
      if (isPracticeMode) {
        if (!practiceGame) return false;
        try {
          GameEngine.claim(practiceGame);
          setGame(practiceGame.clone());
          capture("reward_claimed", { game_id: gameId, mode });
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
        capture("reward_claimed", { game_id: gameId, mode });
        return true;
      } catch (e) {
        console.log({ e });
        return false;
      }
    },
    [isPracticeMode, practiceGame, setGame, account, chain.id, capture, mode],
  );

  const start = useCallback(
    async (gameId: number, game: any) => {
      if (isPracticeMode) {
        if (!practiceGame) return false;
        try {
          const rand = new Random(BigInt(Math.floor(Math.random() * 1000000)));
          GameEngine.start(practiceGame, rand);
          setGame(practiceGame.clone());
          capture("game_started", { game_id: gameId, mode });
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
        capture("game_started", { game_id: gameId, mode });
        return true;
      } catch (e) {
        console.log({ e });
        return false;
      }
    },
    [isPracticeMode, practiceGame, setGame, capture, mode],
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
        capture("quest_claimed", {
          quest_id: questId,
          interval_id: intervalId,
        });
        return true;
      } catch (e) {
        console.log({ e });
        return false;
      }
    },
    [account, chain.id, capture],
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
        capture("faucet_minted", {});
        return true;
      } catch (e) {
        console.log({ e });
        return false;
      }
    },
    [account, chain.id, capture],
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
        capture("vault_deposit", { amount: amount.toString() });
        return true;
      } catch (e) {
        console.log({ e });
        return false;
      }
    },
    [account, chain.id, capture],
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
        capture("vault_mint", { amount: amount.toString() });
        return true;
      } catch (e) {
        console.log({ e });
        return false;
      }
    },
    [account, chain.id, capture],
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
        capture("vault_withdraw", { amount: amount.toString() });
        return true;
      } catch (e) {
        console.log({ e });
        return false;
      }
    },
    [account, chain.id, capture],
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
        capture("vault_redeem", { amount: amount.toString() });
        return true;
      } catch (e) {
        console.log({ e });
        return false;
      }
    },
    [account, chain.id, capture],
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
      capture("vault_claim", {});
      return true;
    } catch (e) {
      console.log({ e });
      return false;
    }
  }, [account, chain.id, capture]);

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
        capture("merkledrop_claimed", { tree_id: treeId });
        return true;
      } catch (e) {
        console.log({ e });
        return false;
      }
    },
    [account, chain.id, capture],
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
