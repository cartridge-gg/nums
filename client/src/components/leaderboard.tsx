import { useAccount } from "@starknet-react/core";
import { useMemo } from "react";
import { CrownIcon, LaurelIcon } from "@/components/icons";
import { formatCompactNumber, formatScore8Digits } from "@/helpers/number";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePrizesWithUsd } from "@/hooks/usePrizes";
import { useTournamentGames } from "@/hooks/useTournamentGames";
import { cn } from "@/lib/utils";
import { PrizeModel } from "@/models/prize";
import type { TournamentModel } from "@/models/tournament";

export type LeaderboardProps = {
  tournament: TournamentModel;
};

export type LeaderboardRow = {
  rank: number;
  username: string;
  address: string;
  score: number;
  level: number;
  game_id: number;
  prize: number;
  share: number;
};

const EmptyLeaderboard = () => {
  return (
    <div className="select-none w-full h-full p-6 rounded-lg bg-black-900 border border-purple-600 flex justify-center items-center">
      <p
        className="text-white-400 tracking-wide text-xl"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
      >
        No games have been played yet
      </p>
    </div>
  );
};

export const Leaderboard = ({ tournament }: LeaderboardProps) => {
  const tournamentId = tournament.id;
  const { account } = useAccount();
  const { leaderboard } = useLeaderboard(tournamentId);
  const { games } = useTournamentGames(tournamentId);
  const { prizes } = usePrizesWithUsd();

  const tournamentPrizes = useMemo(() => {
    return prizes.filter((p) => p.tournament_id === tournamentId);
  }, [prizes, tournamentId]);

  const totalPrize = useMemo(() => {
    const total = tournamentPrizes.reduce((sum, prize) => {
      if (prize.totalUsd) {
        return sum + parseFloat(prize.totalUsd);
      }
      return sum;
    }, 0);
    return total > 0 ? total : 0;
  }, [tournamentPrizes]);

  const rows: LeaderboardRow[] = useMemo(() => {
    if (games.length === 0 || !leaderboard || !tournament) return [];
    return games.map((game) => {
      const gameId = parseInt(game.token_id, 16);
      const position = leaderboard.games.indexOf(gameId) + 1;
      const prize =
        PrizeModel.payout(
          totalPrize,
          position,
          leaderboard.getCapacity(tournament.entry_count),
        ) || 0;
      return {
        rank: game.rank,
        username: game.username,
        address: game.address,
        score: game.score,
        level: game.level,
        game_id: gameId,
        prize: Number(prize),
        share: Math.floor((Number(prize) / totalPrize) * 100),
      };
    });
  }, [games, leaderboard, tournament, totalPrize]);

  const hasData = games.length > 0;

  return (
    <div
      className="select-none w-full h-full p-4 md:p-6 rounded-lg bg-[rgba(0,0,0,0.04)] flex flex-col"
      style={{
        boxShadow:
          "1px 1px 0px 0px rgba(255, 255, 255, 0.12) inset, 1px 1px 0px 0px rgba(0, 0, 0, 0.12)",
      }}
    >
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="px-3 md:px-4 grid grid-cols-[1fr_4fr_2fr_1fr] md:grid-cols-[1fr_3fr_2fr_1fr_1fr] gap-4 pb-4 text-purple-300 text-lg leading-[22px] uppercase tracking-wide sticky top-0">
          <div style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}>
            Rank
          </div>
          <div style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}>
            Player
          </div>
          <div style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}>
            Score
          </div>
          <div style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}>
            Prize
          </div>
        </div>
        {hasData ? (
          <div
            className="text-base/[21px] font-dmmono font-bold overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="flex flex-col gap-2">
              {rows.map((item) => (
                <Row
                  key={item.rank}
                  item={item}
                  self={BigInt(item.address) === BigInt(account?.address || 0)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <EmptyLeaderboard />
          </div>
        )}
      </div>
    </div>
  );
};

export const Row = ({
  item,
  self,
}: {
  item: LeaderboardRow;
  self: boolean;
}) => {
  const isNarrow = useMediaQuery("(max-width: 768px)");

  const prize =
    item.prize && item.prize !== 0
      ? `$${item.prize.toFixed(isNarrow ? 0 : 2).toLocaleString()}`
      : null;
  const formattedScore =
    item.score >= 1000
      ? formatCompactNumber(item.score)
      : item.score.toLocaleString();

  return (
    <div
      className={cn(
        "h-[45px] px-3 md:px-4 py-3 grid grid-cols-[minmax(0,1fr)_minmax(0,4fr)_minmax(0,2fr)_minmax(0,1fr)] md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)_minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] gap-4 items-center min-w-0 border border-black-900 rounded-lg [&_svg]:size-5",
        self ? "text-orange-100 bg-black-900" : "text-white-100",
      )}
    >
      <p className="truncate md:hidden" title={`Rank #${item.rank}`}>
        {item.rank === 1 && prize ? (
          <CrownIcon variant="solid" />
        ) : prize ? (
          <LaurelIcon variant="solid" />
        ) : (
          item.rank
        )}
      </p>
      <p className="truncate hidden md:block" title={`Rank #${item.rank}`}>
        {item.rank}
      </p>
      <div className="flex items-center gap-1.5">
        {item.rank === 1 && prize ? (
          <CrownIcon variant="solid" className="hidden md:block" />
        ) : prize ? (
          <LaurelIcon variant="solid" className="hidden md:block" />
        ) : null}
        <p className="truncate" title={item.username}>
          {item.username}
        </p>
      </div>
      <p className="truncate" title={item.score.toLocaleString()}>
        <span className="md:hidden">{formattedScore}</span>
        <span className="hidden md:inline" style={{ whiteSpace: "pre" }}>
          {formatScore8Digits(item.score)}
        </span>
      </p>
      {prize && (
        <p className="truncate" title={prize}>
          {prize}
        </p>
      )}
      {!prize && <p className="text-white-700">---</p>}
      {prize && <Share share={item.share} self={self} />}
    </div>
  );
};

export const Share = ({ share, self }: { share: number; self: boolean }) => {
  return (
    <div className="h-4 w-16 overflow-hidden relative rounded-full bg-black-900 hidden md:block">
      <div
        className={cn(
          "h-full w-full absolute top-0 left-0",
          self ? "bg-orange-100" : "bg-white-100",
        )}
        style={{ width: `${share}%` }}
      />
    </div>
  );
};
