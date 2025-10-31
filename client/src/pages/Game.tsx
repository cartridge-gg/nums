import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SlotCounter from "react-slot-counter";
import background from "@/assets/tunnel-background.svg";
import { Header } from "@/components/header";
import { HomeIcon } from "@/components/icons/Home";
import { InfoIcon } from "@/components/icons/Info";
import { LinkIcon } from "@/components/icons/Link";
import { JackpotDetails, PrizePoolModal } from "@/components/jackpot-details";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTournaments } from "@/context/tournaments";
import { useGame } from "@/hooks/useGame";
import { useGameApply } from "@/hooks/useGameApply";
import { useGameSet } from "@/hooks/useGameSet";
import { usePrizesWithUsd } from "@/hooks/usePrizes";
import { cn } from "@/lib/utils";
import { GameModel } from "@/models/game";
import type { TournamentModel } from "@/models/tournament";
import { Power, PowerType } from "@/types/power";

export const Game = () => {
  const [prizePoolModal, setPrizePoolModal] = useState(false);

  return (
    <div
      className="select-none relative h-screen w-screen flex flex-col"
      onClick={() => {
        if (prizePoolModal) setPrizePoolModal(false);
      }}
    >
      <img
        src={background}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover z-[-1]"
      />
      <Header />
      <Main
        prizePoolModal={prizePoolModal}
        setPrizePoolModal={setPrizePoolModal}
      />
    </div>
  );
};

export const Main = ({
  prizePoolModal,
  setPrizePoolModal,
}: {
  prizePoolModal: boolean;
  setPrizePoolModal: (value: boolean) => void;
}) => {
  const { gameId } = useParams();
  const { tournaments } = useTournaments();
  const { game } = useGame(Number(gameId));
  const { prizes } = usePrizesWithUsd();
  const { setSlot } = useGameSet({ gameId: Number(gameId) });
  const { applyPower } = useGameApply({ gameId: Number(gameId) });
  const [loadingSlotIndex, setLoadingSlotIndex] = useState<number | null>(null);
  const [loadingPowerIndex, setLoadingPowerIndex] = useState<number | null>(
    null,
  );
  const [gameOverModal, setGameOverModal] = useState<boolean>(false);
  const [nextNumberModal, setNextNumberModal] = useState<boolean>(false);

  const tournament = useMemo(() => {
    if (!game || !tournaments) return undefined;
    return tournaments?.find(
      (tournament) => tournament.id === game.tournament_id,
    );
  }, [tournaments, game]);

  const handleSetSlot = async (index: number) => {
    setLoadingSlotIndex(index);
    try {
      await setSlot(index);
      setLoadingSlotIndex(null);
    } catch (_error) {
      setLoadingSlotIndex(null);
    }
  };

  const handleApplyPower = async (powerIndex: number) => {
    setLoadingPowerIndex(powerIndex);
    try {
      await applyPower(powerIndex);
      setLoadingPowerIndex(null);
    } catch (_error) {
      setLoadingPowerIndex(null);
    }
  };

  useEffect(() => {
    if (game?.over && !gameOverModal) {
      setTimeout(() => {
        setGameOverModal(true);
      }, 3000);
    }
  }, [game?.over]);

  useEffect(() => {
    if (game?.next_number && !nextNumberModal) {
      setNextNumberModal(true);
    }
  }, [game?.next_number]);

  useEffect(() => {
    if (loadingSlotIndex !== null && game?.slots[loadingSlotIndex]) {
      setLoadingSlotIndex(null);
    }
  }, [game?.slots, loadingSlotIndex]);

  const tournamentPrizes = useMemo(() => {
    if (!tournament) return [];
    return prizes.filter((p) => p.tournament_id === tournament.id);
  }, [prizes, tournament]);

  if (!game || !tournament) return null;

  return (
    <div
      className="relative grow w-full bg-[linear-gradient(180deg,rgba(0,0,0,0.32)_0%,rgba(0,0,0,0.12)_100%)] px-16 py-12"
      onClick={(e) => {
        e.stopPropagation();
        setNextNumberModal(false);
      }}
    >
      {gameOverModal && (
        <div className="absolute inset-0 z-50 p-6">
          <GameOver game={game} />
        </div>
      )}
      {nextNumberModal && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <GameNextNumber
            number={game.next_number}
            setModal={setNextNumberModal}
          />
        </div>
      )}
      {prizePoolModal && (
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/4 z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <PrizePoolModal
            prizes={tournamentPrizes}
            setModal={setPrizePoolModal}
          />
        </div>
      )}
      <div className="h-full max-w-[624px] mx-auto flex flex-col gap-4 justify-center">
        <div className="flex flex-col gap-12">
          <GameHeader
            game={game}
            tournament={tournament}
            onApplyPower={handleApplyPower}
            loadingPowerIndex={loadingPowerIndex}
            loadingSlotIndex={loadingSlotIndex}
          />
          <GameGrid
            game={game}
            onSetSlot={handleSetSlot}
            loadingSlotIndex={loadingSlotIndex}
            highlights={game.over ? game.closests() : []}
            alloweds={game.alloweds()}
          />
          {tournament && (
            <JackpotDetails
              tournament={tournament}
              onOpenPrizeModal={() => setPrizePoolModal(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export const GameHeader = ({
  game,
  tournament,
  onApplyPower,
  loadingPowerIndex,
  loadingSlotIndex,
}: {
  game: GameModel;
  tournament: TournamentModel;
  onApplyPower: (powerIndex: number) => Promise<void>;
  loadingPowerIndex: number | null;
  loadingSlotIndex: number | null;
}) => {
  return (
    <div className="w-full flex justify-between">
      <GameNumber
        number={game.number}
        over={game.over}
        isLoading={loadingPowerIndex !== null || loadingSlotIndex !== null}
      />
      <PowerUps
        powers={tournament.powers}
        availables={game.powers}
        count={game.adjacent()}
        onApplyPower={onApplyPower}
        loadingPowerIndex={loadingPowerIndex}
      />
    </div>
  );
};

export const GameNumber = ({
  number,
  over,
  isLoading,
}: {
  number: number;
  over: boolean;
  isLoading: boolean;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-purple-300 tracking-wide text-lg/6">
        Your number is...
      </span>
      <div
        className={cn(
          "text-[136px]/[100px] font-normal",
          over ? "text-red-100" : "text-white-100",
        )}
        style={{ textShadow: "4px 4px 0px rgba(28, 3, 101, 1)" }}
      >
        <SlotCounter
          value={isLoading ? "???" : number.toString()}
          startValueOnce
          duration={1.5}
          dummyCharacters={"0123456789".split("")}
          animateOnVisible={false}
          useMonospaceWidth
        />
      </div>
    </div>
  );
};

export const GameNextNumber = ({
  number,
  setModal,
}: {
  number: number;
  setModal: (modal: boolean) => void;
}) => {
  const power = new Power(PowerType.Foresight);
  return (
    <div
      className="h-64 w-[288px] bg-black-300 border-[2px] border-black-300 backdrop-blur-[4px] rounded-lg p-6 flex flex-col items-center gap-6"
      style={{ boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)" }}
    >
      <img src={power.icon(undefined)} alt={power.name()} className="size-16" />
      <p
        className="text-white-100 text-[64px]/[44px]"
        style={{ textShadow: "4px 4px 0px rgba(28, 3, 101, 1)" }}
      >
        {number}
      </p>
      <Button
        variant="secondary"
        className="w-full px-6 py-1"
        onClick={() => setModal(false)}
      >
        <p
          className="text-[28px]/[19px] tracking-wide translate-y-0.5"
          style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
        >
          Close
        </p>
      </Button>
    </div>
  );
};

export const PowerUps = ({
  powers,
  availables,
  count,
  onApplyPower,
  loadingPowerIndex,
}: {
  powers: Power[];
  availables: Power[];
  count: number;
  onApplyPower: (powerIndex: number) => Promise<void>;
  loadingPowerIndex: number | null;
}) => {
  return (
    <div className="flex flex-col gap-2 justify-between">
      <div className="flex justify-between items-center gap-2">
        <span className="text-purple-300 tracking-wide text-lg/6 ">
          Power ups
        </span>
        <div className="hover:cursor-pointer transition-colors duration-100 hover:text-purple-400 text-purple-300 [&_svg]:size-6">
          <InfoIcon />
        </div>
      </div>
      <div className="flex gap-3">
        {powers.map((power) => (
          <PowerUp
            key={power.value}
            power={power}
            available={availables.map((p) => p.into()).includes(power.into())}
            count={count}
            onApplyPower={onApplyPower}
            isLoading={loadingPowerIndex === power.index()}
            isDisabled={
              loadingPowerIndex !== null && loadingPowerIndex !== power.index()
            }
          />
        ))}
      </div>
    </div>
  );
};

export const PowerUp = ({
  power,
  available,
  count,
  onApplyPower,
  isLoading,
  isDisabled,
}: {
  power: Power;
  available: boolean;
  count: number;
  onApplyPower: (powerIndex: number) => Promise<void>;
  isLoading: boolean;
  isDisabled: boolean;
}) => {
  const status = useMemo(() => {
    if (power.isLocked(count)) return "locked";
    if (available) return undefined;
    return "used";
  }, [power, available, count]);

  const handleApplyPower = async () => {
    if (!available || power.isLocked(count) || isDisabled || isLoading) return;
    await onApplyPower(power.index());
  };

  return (
    <div className="flex flex-col gap-2 items-center justify-between text-purple-300">
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              disabled={
                !available || power.isLocked(count) || isDisabled || isLoading
              }
              variant="muted"
              className="size-[68px] p-0"
              onClick={handleApplyPower}
            >
              {isLoading ? (
                <Loader2 className="size-9 animate-spin" />
              ) : (
                <img
                  src={power.icon(status)}
                  alt={power.name()}
                  className="size-9"
                />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent
            className="max-w-[288px] bg-black-300 border-[2px] border-black-300 rounded-lg p-6 flex flex-col gap-3 backdrop-blur-[4px]"
            style={{ boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <h2 className="text-white-100 tracking-wide text-[22px]/[15px] translate-y-0.5">
              {power.name()}
            </h2>
            <p className="text-white-100 font-ppneuebit text-2xl/5">
              {power.description()}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div className="w-[52px] h-6 flex items-center gap-0.5 px-2 py-0.5 bg-black-700 rounded-full [&_svg]:text-purple-300 [&_svg]:size-5">
        <p className="text-[22px]/[15px] translate-y-0.5 px-0.5">
          {power.condition()}
        </p>
        <LinkIcon />
      </div>
    </div>
  );
};

const GameGrid = ({
  game,
  onSetSlot,
  loadingSlotIndex,
  highlights,
  alloweds,
}: {
  game: GameModel;
  onSetSlot: (index: number) => Promise<void>;
  loadingSlotIndex: number | null;
  highlights: number[];
  alloweds: number[];
}) => {
  return (
    <div className="grid grid-flow-col grid-rows-5 gap-x-16 gap-y-4 font-ppneuebit">
      {game.slots.map((slot, index) => (
        <GameSlot
          key={index}
          slot={slot}
          index={index}
          onSetSlot={onSetSlot}
          isLoading={loadingSlotIndex === index}
          isDisabled={
            game.over ||
            (loadingSlotIndex !== null && loadingSlotIndex !== index) ||
            !alloweds.includes(index)
          }
          isHighlighted={highlights.includes(index)}
        />
      ))}
    </div>
  );
};

const GameSlot = ({
  slot,
  index,
  onSetSlot,
  isLoading,
  isDisabled,
  isHighlighted,
}: {
  slot: number;
  index: number;
  onSetSlot: (index: number) => Promise<void>;
  isLoading: boolean;
  isDisabled: boolean;
  isHighlighted: boolean;
}) => {
  const handleSetSlot = async () => {
    if (slot || isDisabled) return; // Ne rien faire si le slot est déjà rempli ou désactivé
    await onSetSlot(index);
  };

  return (
    <div className="flex justify-between items-center">
      <p className="text-purple-300 tracking-wide text-[28px] min-w-8">{`${index + 1}.`}</p>
      {slot ? (
        <div
          className="h-10 w-16 rounded-xl flex justify-center items-center bg-purple-300"
          style={{
            boxShadow:
              "1px 1px 0px 0px rgba(255, 255, 255, 0.12) inset, 1px 1px 0px 0px rgba(0, 0, 0, 0.12)",
          }}
        >
          <p
            className={cn(
              "text-2xl",
              isHighlighted ? "text-red-100" : "text-white-100",
            )}
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.85)" }}
          >
            {slot}
          </p>
        </div>
      ) : (
        <Button
          disabled={isDisabled || isLoading}
          variant="muted"
          className="h-10 w-16 rounded-xl"
          onClick={handleSetSlot}
        >
          {isLoading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <p
              className="text-2xl"
              style={{
                textShadow: !isDisabled
                  ? "2px 2px 0px rgba(0, 0, 0, 0.85)"
                  : undefined,
              }}
            >
              Set
            </p>
          )}
        </Button>
      )}
    </div>
  );
};

export const GameOver = ({ game }: { game: GameModel }) => {
  return (
    <div
      className="w-full h-full select-none"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative w-full h-full rounded-2xl bg-black-300 border-[2px] border-black-300 backdrop-blur-[4px] p-6 flex flex-col gap-12 justify-center items-center">
        <h1
          className="text-[136px]/[92px]"
          style={{ textShadow: "5px 5px 0px rgba(26, 5, 87, 1)" }}
        >
          Game Over!
        </h1>
        <GameOverDetails game={game} />
        <GameOverButton />
      </div>
    </div>
  );
};

export const GameOverDetails = ({ game }: { game: GameModel }) => {
  return (
    <div className="flex gap-6 w-[480px]">
      <GameOverScore score={game.score} />
      <GameOverEarning earning={GameModel.totalReward(game.level)} />
    </div>
  );
};

export const GameOverScore = ({ score }: { score: number }) => {
  return (
    <div className="grow flex flex-col gap-3 justify-between px-5 py-4 bg-white-900 border border-white-900 rounded-xl">
      <p className="text-purple-300 tracking-wide text-lg/3">Score</p>
      <p
        className="text-[28px]/[19px] tracking-wide"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
      >
        {score}
      </p>
    </div>
  );
};

export const GameOverEarning = ({ earning }: { earning: number }) => {
  return (
    <div className="grow flex flex-col gap-3 justify-between px-5 py-4 bg-white-900 border border-white-900 rounded-xl">
      <p className="text-purple-300 tracking-wide text-lg/3">Earned</p>
      <p
        className="text-[28px]/[19px] tracking-wide"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
      >{`${earning.toLocaleString()} NUMS`}</p>
    </div>
  );
};

export const GameOverButton = () => {
  return (
    <Link to="/">
      <Button variant="secondary" className="gap-1 h-[56px] w-[146px]">
        <div className="[&_svg]:size-8">
          <HomeIcon />
        </div>
        <p
          className="text-[28px]/[19px] tracking-wide translate-y-0.5 px-1"
          style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
        >
          Home
        </p>
      </Button>
    </Link>
  );
};
