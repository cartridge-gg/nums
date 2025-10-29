import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { usePlayerGames } from "@/hooks/useAssets";
import { useGames } from "@/hooks/useGames";
import { useStartGame } from "@/hooks/useStartGame";
import type { GameModel } from "@/models/game";
import { LiveIcon } from "./icons/Live";
import { Button } from "./ui/button";

export type GamesProps = {};

export const Games = () => {
  const { gameIds, isLoading, error } = usePlayerGames();
  const { games } = useGames(gameIds || []);

  if (isLoading) {
    return (
      <div className="h-full overflow-hidden flex flex-col gap-6">
        <div className="flex items-center gap-2 px-4 h-3">
          <p
            className="w-[188px] tracking-wider text-purple-300 text-lg leading-[22px]"
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            Game ID
          </p>
          <p
            className="grow tracking-wider text-purple-300 text-lg leading-[22px]"
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            Score
          </p>
        </div>
        <div className="h-full rounded-lg flex justify-center items-center bg-black-900 border border-purple-600">
          <p
            className="text-[22px] text-white-400 tracking-wider text-center"
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
            className="w-[188px] tracking-wider text-purple-300 text-lg leading-[22px]"
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            Game ID
          </p>
          <p
            className="grow tracking-wider text-purple-300 text-lg leading-[22px]"
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            Score
          </p>
        </div>
        <div className="h-full rounded-lg flex justify-center items-center bg-black-900 border border-purple-600">
          <p
            className="text-[22px] text-white-400 tracking-wider text-center"
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
      <div className="flex items-center gap-2 px-4 h-3">
        <p
          className="w-[188px] tracking-wider text-purple-300 text-lg leading-[22px]"
          style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
        >
          Game ID
        </p>
        <p
          className="grow tracking-wider text-purple-300 text-lg leading-[22px]"
          style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
        >
          Score
        </p>
      </div>
      {games && games.length > 0 ? (
        <div
          className="font-ppneuebit text-2xl leading-[34px] overflow-y-auto flex flex-col gap-3"
          style={{ scrollbarWidth: "none" }}
        >
          {games
            .sort((a, b) => b.id - a.id)
            .sort((a, b) => (b.hasStarted() ? 1 : a.hasStarted() ? -1 : 0))
            .map((game) => (
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
        className="text-[22px] text-white-400 tracking-wider text-center"
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
  const { startGame } = useStartGame({ gameId: Number(game?.id || 0) });
  const navigate = useNavigate();

  const handleContinueGame = useCallback(() => {
    navigate(`/${game.id}`);
  }, [navigate, game.id]);

  const handleStartGame = useCallback(() => {
    startGame().then((success) => {
      if (success) {
        navigate(`/${game.id}`);
      } else {
        toast.error("Failed to start game");
      }
    });
  }, [startGame, navigate, game.id]);

  if (!game || game.over) return null;

  return (
    <div className="flex gap-4 items-center">
      <div className="h-10 grow px-3 py-2 rounded-lg flex gap-2 items-center bg-white-900 border border-white-900">
        <div className="w-5">
          {game.hasStarted() && !game.over && <LiveIcon />}
        </div>
        <p className="text-[22px] leading-[12px] w-[168px]">{`Nums #${game.id}`}</p>
        {game.hasStarted() ? (
          <p className="text-[22px] leading-[12px]">{game.score}</p>
        ) : (
          <p className="text-2xl leading-[12px] text-white-700">---</p>
        )}
      </div>
      {game.hasStarted() ? (
        <Button
          variant="secondary"
          className="h-10 w-[108px]"
          onClick={handleContinueGame}
        >
          <p
            className="font-[PixelGame] text-[22px] translate-y-0.5"
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
          >
            Continue
          </p>
        </Button>
      ) : (
        <Button
          variant="default"
          className="h-10 w-[108px]"
          onClick={handleStartGame}
        >
          <p
            className="font-[PixelGame] text-[28px] translate-y-0.5"
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
          >
            Play!
          </p>
        </Button>
      )}
    </div>
  );
};
