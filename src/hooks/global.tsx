import { useState, useEffect } from "react";
import { useQuery } from "urql";
import { graphql } from "@/graphql/appchain";

const GlobalQuery = graphql(`
  query GlobalQuery {
    numsGlobalTotalsModels {
      edges {
        node {
          games_played
        }
      }
    }
    numsConfigModels {
      edges {
        node {
          game {
            Some {
              active
              max_games {
                Some
              }
            }
          }
        }
      }
    }
  }
`);

interface GlobalState {
  gamesPlayed: number;
  maxGames: number;
  isActive: boolean;
}

export function useGlobal(): GlobalState {
  const [gamesPlayed, setGamesPlayed] = useState<number>(0);
  const [maxGames, setMaxGames] = useState<number>(1000);
  const [isActive, setIsActive] = useState<boolean>(true);

  const [globalResult, executeQuery] = useQuery({
    query: GlobalQuery,
    requestPolicy: "network-only",
  });

  useEffect(() => {
    // Poll every 10 seconds
    const id = setInterval(() => {
      executeQuery({ requestPolicy: "network-only" });
    }, 10000);
    return () => clearInterval(id);
  }, [executeQuery]);

  useEffect(() => {
    const globalTotals =
      globalResult.data?.numsGlobalTotalsModels?.edges?.[0]?.node;
    const config = globalResult.data?.numsConfigModels?.edges?.[0]?.node;

    if (globalTotals) {
      setGamesPlayed(globalTotals.games_played || 0);
    }

    if (config?.game?.Some) {
      setIsActive((config.game.Some.active as boolean) || false);
      setMaxGames(config.game.Some.max_games?.Some || 0);
    }
  }, [globalResult]);

  return { gamesPlayed, maxGames, isActive };
}
