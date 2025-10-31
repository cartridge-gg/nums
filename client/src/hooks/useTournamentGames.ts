import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { num } from "starknet";
import { dojoConfigs, getGameAddress } from "@/config";
import useChain from "./chain";
import { useDojoSdk } from "./dojo";

export type TournamentGameRow = {
  rank: number;
  token_id: string;
  username: string;
  address: string;
  score: number;
  level: number;
};

const executeSqlQuery = async (
  toriiUrl: string,
  collectionAddress: string,
  gameAddress: string,
  tournamentId: number,
): Promise<TournamentGameRow[]> => {
  const sqlQuery = `
    SELECT
      ROW_NUMBER() OVER (ORDER BY g.score DESC) AS rank,
      t.token_id,
      c.username,
      c.address,
      g.score,
      g.level
    FROM tokens AS t
    JOIN token_balances AS tb ON tb.token_id = t.id
    JOIN token_attributes AS ta ON ta.token_id = t.id
    JOIN controllers AS c ON c.address = tb.account_address
    JOIN "NUMS-Game" AS g ON lower(substr(t.token_id, -16)) = lower(substr(g.id, -16))
    WHERE t.contract_address = '${collectionAddress}'
    AND tb.balance != '0x0000000000000000000000000000000000000000000000000000000000000000'
    AND ta.trait_name = 'Minted By'
    AND ta.trait_value = '${gameAddress}'
    AND g.tournament_id = ${tournamentId}
    ORDER BY g.score DESC
    LIMIT 1000;
  `;

  const response = await fetch(`${toriiUrl}/sql`, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
    },
    body: sqlQuery,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SQL query failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data || [];
};

export const useTournamentGames = (tournamentId: number) => {
  const { chain } = useChain();
  const { sdk } = useDojoSdk();
  const [collectionAddress, setCollectionAddress] = useState<string>("");

  const toriiUrl = useMemo(() => {
    const chainIdHex = `0x${chain.id.toString(16)}`;
    return dojoConfigs[chainIdHex].toriiUrl;
  }, [chain.id]);

  const gameAddress = useMemo(() => {
    return getGameAddress(chain.id);
  }, [chain.id]);

  // Fetch collection address from Torii
  useEffect(() => {
    const fetchCollectionAddress = async () => {
      try {
        const contracts = await sdk.client.getContracts({
          contract_addresses: [],
          contract_types: ["ERC721"],
        });

        if (contracts && contracts.length > 0) {
          const address = num.toHex64(contracts[0].contract_address);
          setCollectionAddress(address);
        }
      } catch (error) {
        console.error("Error fetching collection address:", error);
      }
    };

    fetchCollectionAddress();
  }, [sdk]);

  const query = useQuery({
    queryKey: ["tournamentGames", tournamentId, chain.id.toString()],
    queryFn: async () => {
      return await executeSqlQuery(
        toriiUrl,
        collectionAddress,
        gameAddress,
        tournamentId,
      );
    },
    staleTime: 30000, // 30 seconds
    gcTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 2,
    enabled: !!collectionAddress && !!gameAddress,
  });

  return {
    games: query.data || [],
    loading: query.isLoading || !collectionAddress,
    refresh: query.refetch,
    error: query.error,
  };
};
