import { Tournament as TournamentEntity, Leaderboard as LeaderboardModel } from "@/bindings";
import { TournamentModel, Tournament } from "@/models/tournament";
import { NAMESPACE } from "@/config";
import { ClauseBuilder, ToriiQueryBuilder } from "@dojoengine/sdk";
import { useEntityQuery, useModels } from "@dojoengine/sdk/react";
import { createContext, useCallback, useContext, useMemo } from "react";
import { BigNumberish } from "starknet";

type TournamentProviderProps = {
  children: React.ReactNode;
};

type TournamentProviderState = {
  tournaments?: TournamentModel[];
  leaderboards?: LeaderboardModel[];
  getTournamentById: (id: BigNumberish) => TournamentModel | undefined;
  getLeaderboardById: (id: BigNumberish) => LeaderboardModel | undefined;
};

const TournamentProviderContext = createContext<TournamentProviderState | undefined>(
  undefined
);

const tournamentsQuery = new ToriiQueryBuilder()
  .withEntityModels([`${NAMESPACE}-${Tournament.getModelName()}`])
  .withClause(
    new ClauseBuilder().keys([`${NAMESPACE}-${Tournament.getModelName()}`], [undefined], "FixedLen").build()
  )
  .withLimit(1_000)
  .includeHashedKeys();

const leaderboardQuery = new ToriiQueryBuilder()
  .withEntityModels([`${NAMESPACE}-Leaderboard`])
  .withClause(
    new ClauseBuilder().keys([`${NAMESPACE}-Leaderboard`], [undefined], "FixedLen").build()
  )
  .withLimit(1_000)
  .includeHashedKeys();

export function TournamentProvider({ children, ...props }: TournamentProviderProps) {
  useEntityQuery(tournamentsQuery);
  useEntityQuery(leaderboardQuery);

  const tournamentItems = useModels(`${NAMESPACE}-Tournament`);
  const tournaments = useMemo(() => {
    return Object.keys(tournamentItems).flatMap((key) => {
      const items = tournamentItems[key] as TournamentEntity[];
      return Object.values(items).map((entity) => TournamentModel.from(key, entity));
    });
  }, [tournamentItems]);

  const leaderboardItems = useModels(`${NAMESPACE}-Leaderboard`);
  const leaderboards = useMemo(() => {
    return Object.keys(leaderboardItems).flatMap((key) => {
      const items = leaderboardItems[key] as LeaderboardModel[];
      return Object.values(items);
    });
  }, [leaderboardItems]);

  const getLeaderboardById = useCallback(
    (id: BigNumberish) => {
      return leaderboards.find((i) => i.tournament_id === id);
    },
    [leaderboards]
  );

  const getTournamentById = useCallback(
    (id: BigNumberish) => {
      return tournaments.find((i) => i.id === id);
    },
    [tournaments]
  );

  return (
    <TournamentProviderContext.Provider
      {...props}
      value={{
        tournaments,
        leaderboards,
        getTournamentById,
        getLeaderboardById,
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
