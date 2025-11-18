import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  EyeIcon,
  LiveIcon,
  NumsIcon,
} from "@/components/icons";
import { formatCompactNumber, formatScore8Digits } from "@/helpers/number";
import { usePlayerGames } from "@/hooks/useAssets";
import { useGames } from "@/hooks/useGames";
import type { GameModel } from "@/models/game";
import type { TournamentModel } from "@/models/tournament";
import { Button } from "./ui/button";

export type GamesProps = {};

export const Games = ({ tournament }: { tournament?: TournamentModel }) => {
  const { gameIds, isLoading, error } = usePlayerGames();
  const { games } = useGames(gameIds || []);

  const filteredGames = useMemo(() => {
    if (!tournament) return [];
    return games
      .filter(
        (game) =>
          (game.tournament_id === tournament?.id &&
            (game.over || tournament.isActive())) ||
          (!game.hasStarted() && tournament.isActive()),
      )
      .sort((a, b) => a.id - b.id)
      .sort((a, b) => (b.hasStarted() ? 1 : a.hasStarted() ? -1 : 0))
      .sort((a, b) => (b.over ? -1 : a.over ? 1 : 0));
  }, [games, tournament]);

  if (isLoading) {
    return (
      <div className="h-full overflow-hidden flex flex-col gap-6">
        <div className="flex items-center gap-2 px-4 h-3">
          <p
            className="md:w-[188px] tracking-wide text-purple-300 text-lg leading-[22px]"
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            Game ID
          </p>
          <p
            className="grow tracking-wide text-purple-300 text-lg leading-[22px]"
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            Score
          </p>
        </div>
        <div className="h-full rounded-lg flex justify-center items-center bg-black-900 border border-purple-600">
          <p
            className="text-[22px] text-white-400 tracking-wide text-center"
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full overflow-hidden flex flex-col gap-6">
        <div className="flex items-center gap-2 px-4 h-3">
          <p
            className="md:w-[188px] tracking-wide text-purple-300 text-lg leading-[22px]"
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            Game ID
          </p>
          <p
            className="grow tracking-wide text-purple-300 text-lg leading-[22px]"
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            Score
          </p>
        </div>
        <div className="h-full rounded-lg flex justify-center items-center bg-black-900 border border-purple-600">
          <p
            className="text-[22px] text-white-400 tracking-wide text-center"
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            Error loading games
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden flex flex-col gap-6">
      <div className="w-full flex items-center gap-2 px-4 h-3 justify-between md:justify-start pr-[72px] md:pr-0">
        <p
          className="md:w-[188px] tracking-wide text-purple-300 text-lg leading-[22px]"
          style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
        >
          Game ID
        </p>
        <p
          className="tracking-wide text-purple-300 text-lg leading-[22px]"
          style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
        >
          Score
        </p>
      </div>
      {filteredGames.length > 0 ? (
        <div
          className="font-ppneuebit text-2xl leading-[34px] overflow-y-auto flex flex-col gap-3"
          style={{ scrollbarWidth: "none" }}
        >
          {filteredGames.map((game) => (
            <GameDetails key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <EmptyGames />
      )}
    </div>
  );
};

export const EmptyGames = () => {
  return (
    <div className="h-full rounded-lg flex justify-center items-center bg-black-900 border border-purple-600">
      <p
        className="text-[22px] text-white-400 tracking-wide text-center"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
      >
        You do not have any
        <br />
        nums tickets
      </p>
    </div>
  );
};

export const GameDetails = ({ game }: { game: GameModel }) => {
  return (
    <div className="flex gap-4 items-center">
      <div className="h-10 grow px-3 py-2 rounded-lg flex gap-2 items-center bg-white-900 border border-white-900">
        {game.hasStarted() && !game.over ? (
          <div className="[&_svg]:size-3 w-5 flex items-center justify-center">
            <LiveIcon />
          </div>
        ) : (
          <div className="[&_svg]:size-5 w-5 flex items-center justify-center">
            <NumsIcon />
          </div>
        )}
        <div className="w-full flex items-center justify-between md:justify-start">
          <p className="text-[22px] leading-[12px] md:w-[168px]">{`Nums #${game.id}`}</p>
          {game.hasStarted() ? (
            <p className="text-[22px] leading-[12px]">
              <span className="md:hidden">
                {formatCompactNumber(game.score)}
              </span>
              <span
                className="hidden md:inline font-mono text-sm"
                style={{ whiteSpace: "pre" }}
              >
                {formatScore8Digits(game.score)}
              </span>
            </p>
          ) : (
            <p className="text-2xl leading-[12px] text-white-700">---</p>
          )}
        </div>
      </div>
      <Link to={`/${game.id}`}>
        {game.hasStarted() && !game.over ? (
          <Button
            variant="secondary"
            className="h-10 w-10 md:w-[108px] px-2 md:px-2.5 [&_svg]:size-6"
          >
            <p
              className="font-[PixelGame] text-[22px] translate-y-0.5 hidden md:block"
              style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
            >
              Continue
            </p>
            <ArrowRightIcon
              className="size-6 block md:hidden"
              variant="solid"
            />
          </Button>
        ) : !game.over ? (
          <Button
            variant="default"
            className="h-10 w-10 md:w-[108px] px-2 md:px-2.5 [&_svg]:size-6"
          >
            <p
              className="font-[PixelGame] text-[28px] translate-y-0.5 hidden md:block"
              style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
            >
              Play!
            </p>
            <ArrowRightIcon
              className="text-brown-100 block md:hidden"
              variant="solid"
            />
          </Button>
        ) : (
          <Button
            variant="secondary"
            className="h-10 w-10 md:w-[108px] px-2 md:px-2.5 grayscale [&_svg]:size-6"
          >
            <p
              className="font-[PixelGame] text-[22px] translate-y-0.5 hidden md:block"
              style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
            >
              View
            </p>
            <EyeIcon className="size-6 block md:hidden" variant="solid" />
          </Button>
        )}
      </Link>
    </div>
  );
};
