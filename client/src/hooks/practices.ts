import { useCallback } from "react";
import { GameEngine } from "@/engines";
import { Random } from "@/helpers/random";
import { useEntities } from "@/context/entities";
import { useLoading } from "@/context/loading";
import { usePractice } from "@/context/practice";

/**
 * Hook for practice mode actions that use GameEngine instead of blockchain transactions
 */
export const usePractices = () => {
  const { game, setGame } = usePractice();
  const { config } = useEntities();
  const { withLoading, setLoading } = useLoading();

  const set = useCallback(
    async (_gameId: number, index: number) => {
      if (!game) return false;
      try {
        const result = await withLoading("slot", index, async () => {
          const rand = new Random(BigInt(Math.floor(Math.random() * 1000000)));
          const targetSupply = config?.target_supply || 0n;
          GameEngine.set(game, index, rand, targetSupply);
          // Update game state by creating a new instance
          setGame(game.clone());
          return true;
        });
        // Disable loading after successful set
        if (result) {
          setLoading("slot", index, false);
        }
        return result;
      } catch (e) {
        console.error(e);
        setLoading("slot", index, false);
        return false;
      }
    },
    [game, config, setGame, withLoading, setLoading],
  );

  const select = useCallback(
    async (_gameId: number, index: number) => {
      if (!game) return false;
      try {
        const result = await withLoading("power", index, async () => {
          GameEngine.select(game, index);
          // Update game state by creating a new instance
          setGame(game.clone());
          return true;
        });
        // Disable loading after successful selection
        if (result) {
          setLoading("power", index, false);
        }
        return result;
      } catch (e) {
        console.error(e);
        setLoading("power", index, false);
        return false;
      }
    },
    [game, setGame, withLoading, setLoading],
  );

  const apply = useCallback(
    async (_gameId: number, index: number) => {
      if (!game) return false;
      try {
        const result = await withLoading("power", index, async () => {
          const rand = new Random(BigInt(Math.floor(Math.random() * 1000000)));
          GameEngine.apply(game, index, rand);
          // Update game state by creating a new instance
          setGame(game.clone());
          return true;
        });
        // Disable loading after successful apply
        if (result) {
          setLoading("power", index, false);
        }
        return result;
      } catch (e) {
        console.error(e);
        setLoading("power", index, false);
        return false;
      }
    },
    [game, setGame, withLoading, setLoading],
  );

  const claim = useCallback(
    async (_gameId: number) => {
      if (!game) return false;
      try {
        GameEngine.claim(game);
        // Update game state by creating a new instance
        setGame(game.clone());
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    },
    [game, setGame],
  );

  const start = useCallback(async () => {
    if (!game) return false;
    try {
      const rand = new Random(BigInt(Math.floor(Math.random() * 1000000)));
      GameEngine.start(game, rand);
      // Update game state by creating a new instance
      setGame(game.clone());
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }, [game, setGame]);

  return {
    start,
    set,
    select,
    apply,
    claim,
  };
};
