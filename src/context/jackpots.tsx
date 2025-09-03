import { Jackpot, JackpotFactory } from "@/bindings";
import { useDojoSdk } from "@/hooks/dojo";
import { ClauseBuilder, ToriiQueryBuilder } from "@dojoengine/sdk";
import { useEntityQuery, useModels } from "@dojoengine/sdk/react";
import { Controller } from "@dojoengine/torii-client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { BigNumberish } from "starknet";

type JackpotProviderProps = {
  children: React.ReactNode;
};

type JackpotProviderState = {
  jackpots?: Jackpot[];
  jackpotFactories?: JackpotFactory[];
  getJackpotById: (id: number) => Jackpot | undefined;
  getFactoryById: (id: number) => JackpotFactory | undefined;
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
  .includeHashedKeys();

const jackpotsQuery = new ToriiQueryBuilder()
  .withEntityModels(["nums-Jackpot"])
  .withClause(
    new ClauseBuilder().keys(["nums-Jackpot"], [undefined], "FixedLen").build()
  )
  .includeHashedKeys();

export function JackpotProvider({ children, ...props }: JackpotProviderProps) {
  const { sdk } = useDojoSdk();

  useEntityQuery(jackpotFactoriesQuery);
  useEntityQuery(jackpotsQuery);

  const jackpotsItems = useModels("nums-Jackpot");
  const factoriesItems = useModels("nums-JackpotFactory");

  const { jackpots, factories } = useMemo(() => {
    const jackpots = Object.keys(jackpotsItems).flatMap((key) => {
      return Object.values(jackpotsItems[key] as Jackpot[]);
    });

    const factories = Object.keys(factoriesItems).flatMap((key) => {
      return Object.values(factoriesItems[key] as JackpotFactory[]);
    });

    if (jackpots && factories) {
      console.log("factories", factories);
      console.log("jackpots", jackpots);
    }

    return {
      jackpots,
      factories,
    };
  }, [jackpotsItems, factoriesItems]);

  const getJackpotById = useCallback(
    (id: number) => {
      return jackpots.find((i) => i.id === id);
    },
    [jackpots]
  );
  const getFactoryById = useCallback(
    (id: number) => {
      return factories.find((i) => i.id === id);
    },
    [factories]
  );

  return (
    <JackpotProviderContext.Provider
      {...props}
      value={{
        jackpots,
        jackpotFactories: factories,
        getJackpotById,
        getFactoryById,
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
