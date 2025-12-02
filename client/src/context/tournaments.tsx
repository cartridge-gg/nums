import { ClauseBuilder, ToriiQueryBuilder } from "@dojoengine/sdk";
import { useEntityQuery, useModels } from "@dojoengine/sdk/react";
import { createContext, useCallback, useContext, useMemo } from "react";
import type { BigNumberish } from "starknet";
import type {
  Tournament as TournamentEntity,
} from "@/bindings";
import { NAMESPACE } from "@/config";
import type { PrizeModel } from "@/models/prize";
import { Tournament, TournamentModel } from "@/models/tournament";

type TournamentProviderProps = {
  children: React.ReactNode;
};

type TournamentProviderState = {
  tournaments?: TournamentModel[];
  prizes?: PrizeModel[];
  getTournamentById: (id: BigNumberish) => TournamentModel | undefined;
  getPrizeByTournamentId: (
    tournamentId: BigNumberish,
  ) => PrizeModel | undefined;
};

const TournamentProviderContext = createContext<
  TournamentProviderState | undefined
>(undefined);

const tournamentsQuery = new ToriiQueryBuilder()
  .withEntityModels([`${NAMESPACE}-${Tournament.getModelName()}`])
  .withClause(
    new ClauseBuilder()
      .keys(
        [`${NAMESPACE}-${Tournament.getModelName()}`],
        [undefined],
        "FixedLen",
      )
      .build(),
  )
  .withLimit(1_000)
  .includeHashedKeys();

const leaderboardQuery = new ToriiQueryBuilder()
  .withEntityModels([`${NAMESPACE}-Leaderboard`])
  .withClause(
    new ClauseBuilder()
      .keys([`${NAMESPACE}-Leaderboard`], [undefined], "FixedLen")
      .build(),
  )
  .withLimit(1_000)
  .includeHashedKeys();

const prizeQuery = new ToriiQueryBuilder()
  .withEntityModels([`${NAMESPACE}-Prize`])
  .withClause(
    new ClauseBuilder()
      .keys([`${NAMESPACE}-Prize`], [undefined, undefined], "FixedLen")
      .build(),
  )
  .withLimit(10_000)
  .includeHashedKeys();

export function TournamentProvider({
  children,
  ...props
}: TournamentProviderProps) {
  useEntityQuery(tournamentsQuery);
  useEntityQuery(leaderboardQuery);
  useEntityQuery(prizeQuery);

  const tournamentItems = useModels(`${NAMESPACE}-Tournament`);
  const tournaments = useMemo(() => {
    return Object.keys(tournamentItems).flatMap((key) => {
      const items = tournamentItems[key] as TournamentEntity[];
      return Object.values(items).map((entity) =>
        TournamentModel.from(key, entity),
      );
    });
  }, [tournamentItems]);

  const prizeItems = useModels(`${NAMESPACE}-Prize`);
  const prizes = useMemo(() => {
    return Object.keys(prizeItems).flatMap((key) => {
      const items = prizeItems[key] as PrizeModel[];
      return Object.values(items);
    });
  }, [prizeItems]);

  const getTournamentById = useCallback(
    (id: BigNumberish) => {
      return tournaments.find((i) => i.id === id);
    },
    [tournaments],
  );

  const getPrizeByTournamentId = useCallback(
    (tournamentId: BigNumberish) => {
      return prizes.find((i) => i.tournament_id === tournamentId);
    },
    [prizes],
  );

  return (
    <TournamentProviderContext.Provider
      {...props}
      value={{
        tournaments: tournaments.sort((a, b) => b.id - a.id),
        prizes,
        getTournamentById,
        getPrizeByTournamentId,
      }}
    >
      {children}
    </TournamentProviderContext.Provider>
  );
}

export const useTournaments = () => {
  const context = useContext(TournamentProviderContext);

  if (context === undefined)
    throw new Error("useTournaments must be used within a TournamentProvider");

  return context;
};
