import { Jackpot, JackpotFactory, JackpotWinner } from "@/bindings";
import { useDojoSdk } from "@/hooks/dojo";
import { ClauseBuilder, ToriiQueryBuilder } from "@dojoengine/sdk";
import { useEntityQuery, useModels } from "@dojoengine/sdk/react";
import { createContext, useCallback, useContext, useMemo } from "react";
import { BigNumberish } from "starknet";

type JackpotProviderProps = {
  children: React.ReactNode;
};

type JackpotProviderState = {
  jackpots?: Jackpot[];
  jackpotFactories?: JackpotFactory[];
  jackpotWinners?: JackpotWinner[];
  getJackpotById: (id: BigNumberish) => Jackpot | undefined;
  getFactoryById: (id: BigNumberish) => JackpotFactory | undefined;
  getWinnersById: (id: BigNumberish) => JackpotWinner[] | undefined;
  getClaimableByUser: (address: BigNumberish) => Jackpot[];
};

const JackpotProviderContext = createContext<JackpotProviderState | undefined>(
  undefined
);

const jackpotFactoriesQuery = new ToriiQueryBuilder()
  .withEntityModels(["nums-JackpotFactory"])
  .withClause(
    new ClauseBuilder()
      .keys(["nums-JackpotFactory"], [undefined], "FixedLen")
      .build()
  )
  .withLimit(1_000)
  .includeHashedKeys();

const jackpotsQuery = new ToriiQueryBuilder()
  .withEntityModels(["nums-Jackpot"])
  .withClause(
    new ClauseBuilder().keys(["nums-Jackpot"], [undefined], "FixedLen").build()
  )
  .withLimit(1_000)
  .includeHashedKeys();

const jackpotWinnersQuery = new ToriiQueryBuilder()
  .withEntityModels(["nums-JackpotWinner"])
  .withClause(
    new ClauseBuilder()
      .keys(["nums-JackpotWinner"], [undefined, undefined], "FixedLen")
      .build()
  )
  .withLimit(10_000)
  .includeHashedKeys();

export function JackpotProvider({ children, ...props }: JackpotProviderProps) {
  const { sdk } = useDojoSdk();

  useEntityQuery(jackpotFactoriesQuery);
  useEntityQuery(jackpotsQuery);
  useEntityQuery(jackpotWinnersQuery);

  const jackpotsItems = useModels("nums-Jackpot");
  const factoriesItems = useModels("nums-JackpotFactory");
  const winnersItems = useModels("nums-JackpotWinner");

  const { jackpots, factories, winners } = useMemo(() => {
    const jackpots = Object.keys(jackpotsItems).flatMap((key) => {
      return Object.values(jackpotsItems[key] as Jackpot[]);
    });

    const factories = Object.keys(factoriesItems).flatMap((key) => {
      return Object.values(factoriesItems[key] as JackpotFactory[]);
    });

    const winners = Object.keys(winnersItems).flatMap((key) => {
      return Object.values(winnersItems[key] as JackpotWinner[]);
    });

    // if (jackpots && factories) {
    //   console.log("factories", factories);
    //   console.log("jackpots", jackpots);
    // }

    return {
      jackpots,
      factories,
      winners,
    };
  }, [jackpotsItems, factoriesItems, winnersItems]);

  const getJackpotById = useCallback(
    (id: BigNumberish) => {
      return jackpots.find((i) => i.id === id);
    },
    [jackpots]
  );
  const getFactoryById = useCallback(
    (id: BigNumberish) => {
      return factories.find((i) => i.id === id);
    },
    [factories]
  );
  const getWinnersById = useCallback(
    (id: BigNumberish) => {
      const jackpot = getJackpotById(id);
      if (!jackpot) return undefined;

      return winners.filter(
        (i) => i.jackpot_id === id && i.index < jackpot?.total_winners
      );
    },
    [winners, jackpots]
  );

  const getClaimableByUser = useCallback(
    (address: BigNumberish) => {
      return winners
        .filter((i) => BigInt(i.player) === BigInt(address) && !i.claimed)
        .flatMap((i) => {
          const jackpot = getJackpotById(i.jackpot_id);
          if (i.index < (jackpot?.total_winners || 0n)) {
            return [jackpot];
          } else {
            return [];
          }
        });
    },
    [winners, jackpots]
  );

  return (
    <JackpotProviderContext.Provider
      {...props}
      value={{
        jackpots,
        jackpotFactories: factories,
        jackpotWinners: winners,
        getJackpotById,
        getFactoryById,
        getWinnersById,
        // @ts-ignore
        getClaimableByUser,
      }}
    >
      {children}
    </JackpotProviderContext.Provider>
  );
}

export const useJackpots = () => {
  const context = useContext(JackpotProviderContext);

  if (context === undefined)
    throw new Error("useJackpots must be used within a JackpotProvider");

  return context;
};
