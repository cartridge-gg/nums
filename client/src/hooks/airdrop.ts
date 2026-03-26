import { useMemo, useCallback, useState, useEffect, useRef } from "react";
import { useMerkledrops } from "@/context/merkledrops";
import { useActions } from "@/hooks/actions";
import { useGames } from "@/context/games";

export const useAirdrop = () => {
  const { merkledrops } = useMerkledrops();
  const { merkledrop: merkledropActions } = useActions();
  const { playerGames } = useGames();
  const [loading, setLoading] = useState(false);
  const gameCountRef = useRef(playerGames.length);

  const claimable = useMemo(
    () => merkledrops.filter((m) => !m.claimed && !m.expired),
    [merkledrops],
  );

  const hasMerkledrop = claimable.length > 0;

  const count = useMemo(
    () => claimable.reduce((sum, m) => sum + Number(m.data[1] || 0), 0),
    [claimable],
  );

  useEffect(() => {
    if (loading && playerGames.length > gameCountRef.current) {
      setLoading(false);
    }
    if (!loading) {
      gameCountRef.current = playerGames.length;
    }
  }, [playerGames.length, loading]);

  const claim = useCallback(async () => {
    gameCountRef.current = playerGames.length;
    setLoading(true);
    const drops = claimable.map((drop) => ({
      treeId: drop.root,
      proofs: drop.proofs,
      data: drop.data,
    }));
    await merkledropActions.claim(drops);
  }, [claimable, merkledropActions, playerGames.length]);

  return { hasMerkledrop, count, loading, claim };
};
