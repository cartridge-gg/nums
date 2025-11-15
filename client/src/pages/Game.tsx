import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SlotCounter from "react-slot-counter";
import { toast } from "sonner";
import background from "@/assets/tunnel-background.svg";
import { Header } from "@/components/header";
import { CloseIcon, HomeIcon, PointsIcon } from "@/components/icons";
import { JackpotDetails, PrizePoolModal } from "@/components/jackpot-details";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAudio } from "@/context/audio";
import { useTournaments } from "@/context/tournaments";
import { useUsage } from "@/context/usage";
import { useGame } from "@/hooks/useGame";
import { useGameApply } from "@/hooks/useGameApply";
import { useGameSet } from "@/hooks/useGameSet";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePrizesWithUsd } from "@/hooks/usePrizes";
import { useStartGame } from "@/hooks/useStartGame";
import { cn } from "@/lib/utils";
import { GameModel } from "@/models/game";
import { DEFAULT_POWER_POINTS, Power, PowerType } from "@/types/power";

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
  const { playReplay, playPositive, playNegative } = useAudio();
  const [loadingSlotIndex, setLoadingSlotIndex] = useState<number | null>(null);
  const [loadingPowerIndex, setLoadingPowerIndex] = useState<number | null>(
    null,
  );
  const [gameOverModal, setGameOverModal] = useState<boolean>(false);
  const [nextNumberModal, setNextNumberModal] = useState<boolean>(false);
  const [powerModal, setPowerModal] = useState<Power>();
  const hasStartedRef = useRef<boolean>(false);

  const tournament = useMemo(() => {
    if (!game || !tournaments) return undefined;
    return tournaments?.find(
      (tournament) => tournament.id === game.tournament_id,
    );
  }, [tournaments, game]);

  useEffect(() => {
    if (!game) return;
    const previouslyStarted = hasStartedRef.current;
    const currentlyStarted = game.hasStarted();
    hasStartedRef.current = currentlyStarted;

    if (!previouslyStarted && currentlyStarted) {
      const allSlotsEmpty = game.slots.every((slot) => !slot || slot === 0);
      if (allSlotsEmpty) {
        playReplay();
      }
    }
  }, [game, playReplay]);

  const handleSetSlot = async (index: number) => {
    setLoadingSlotIndex(index);
    try {
      await setSlot(index);
      playPositive();
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
    if (game?.over) {
      playNegative();
      setTimeout(() => {
        setGameOverModal(true);
      }, 3000);
    }
  }, [game?.over, playNegative]);

  useEffect(() => {
    if (game?.next_number) {
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

  if (!gameId) return null;

  if (!game?.hasStarted()) return <GameStart gameId={Number(gameId)} />;

  return (
    <div
      className="relative grow w-full bg-[linear-gradient(180deg,rgba(0,0,0,0.32)_0%,rgba(0,0,0,0.12)_100%)] p-4 md:px-16 md:py-12"
      onClick={(e) => {
        e.stopPropagation();
        setNextNumberModal(false);
      }}
    >
      {gameOverModal && (
        <div className="w-full absolute inset-0 z-50 p-4 md:p-6 flex justify-center">
          <GameOver game={game} close={() => setGameOverModal(false)} />
        </div>
      )}
      {nextNumberModal && (
        <div
          className="w-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 p-2 md:p-6 flex justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <GameNextNumber
            number={game.next_number}
            setModal={setNextNumberModal}
          />
        </div>
      )}
      {powerModal && (
        <div
          className="w-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 p-2 md:p-6 flex justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <GamePowerModal
            power={powerModal}
            close={() => setPowerModal(undefined)}
            onApplyPower={handleApplyPower}
          />
        </div>
      )}
      {prizePoolModal && (
        <div
          className="w-full absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/4 z-50 p-2 flex justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <PrizePoolModal
            prizes={tournamentPrizes}
            setModal={setPrizePoolModal}
          />
        </div>
      )}
      <div className="h-full max-w-[624px] mx-auto flex flex-col gap-4 md:justify-center">
        <div className="h-full md:h-auto flex flex-col gap-3 md:gap-12 justify-between md:justify-start">
          <div className="flex flex-col gap-3 md:gap-12">
            <GameHeader
              game={game}
              onApplyPower={handleApplyPower}
              loadingPowerIndex={loadingPowerIndex}
              loadingSlotIndex={loadingSlotIndex}
              setPowerModal={setPowerModal}
            />
            <GameGrid
              game={game}
              onSetSlot={handleSetSlot}
              loadingSlotIndex={loadingSlotIndex}
              highlights={game.over ? game.closests() : []}
              alloweds={game.alloweds()}
            />
          </div>
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
  onApplyPower,
  loadingPowerIndex,
  loadingSlotIndex,
  setPowerModal,
}: {
  game: GameModel;
  onApplyPower: (powerIndex: number) => Promise<void>;
  loadingPowerIndex: number | null;
  loadingSlotIndex: number | null;
  setPowerModal: (power: Power | undefined) => void;
}) => {
  return (
    <div className="h-24 md:h-[132px] w-full flex justify-between px-3 md:px-0">
      <GameNumber
        number={game.number}
        over={game.over}
        isLoading={loadingPowerIndex !== null || loadingSlotIndex !== null}
      />
      <PowerUps
        powers={game.selected_powers}
        availables={game.available_powers}
        onApplyPower={onApplyPower}
        loadingPowerIndex={loadingPowerIndex}
        setPowerModal={setPowerModal}
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
    <div className="flex flex-col gap-1 md:gap-2">
      <span className="text-purple-300 tracking-wide text-lg/6">
        Your number is...
      </span>
      <div
        className={cn(
          "text-[96px]/[68px] md:text-[136px]/[100px] font-normal translate-y-1",
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
  const Icon = power.icon();
  return (
    <div
      className="w-[288px] bg-black-300 border-[2px] border-black-300 backdrop-blur-[4px] rounded-lg p-6 flex flex-col items-center gap-6"
      style={{ boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)" }}
    >
      <Button
        variant="ghost"
        className="h-12 w-12 p-2 md:px-6 md:py-4 [&_svg]:size-8 absolute top-1.5 right-1.5 text-white-400"
        onClick={() => setModal(false)}
      >
        <CloseIcon />
      </Button>
      <div className="[&_svg]:size-16">
        <Icon role="img" aria-label={power.name()} />
      </div>
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

export const GamePowerModal = ({
  power,
  close,
  onApplyPower,
}: {
  power: Power;
  close: () => void;
  onApplyPower: (powerIndex: number) => Promise<void>;
}) => {
  const handleApplyPower = useCallback(async () => {
    await onApplyPower(power.index());
    close();
  }, [power, onApplyPower, close]);

  const Icon = power.icon();
  return (
    <div
      className="w-[288px] bg-black-300 border-[2px] border-black-300 backdrop-blur-[4px] rounded-lg p-6 flex flex-col items-center gap-6"
      style={{ boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)" }}
    >
      <Button
        variant="ghost"
        className="h-12 w-12 p-2 md:px-6 md:py-4 [&_svg]:size-8 absolute top-1.5 right-1.5 text-white-400"
        onClick={close}
      >
        <CloseIcon />
      </Button>
      <div className="[&_svg]:size-16">
        <Icon role="img" aria-label={power.name()} />
      </div>
      <p className="flex flex-col gap-3 w-full">
        <strong className="text-[22px]/[15px] tracking-wider">
          {power.name()}
        </strong>
        <span className="text-2xl/4 font-ppneuebit tracking-wider">
          {power.description()}
        </span>
      </p>
      <Button
        variant="default"
        className="w-full px-6 py-1"
        onClick={handleApplyPower}
      >
        <p
          className="text-[28px]/[19px] tracking-wide translate-y-0.5"
          style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
        >
          Use!
        </p>
      </Button>
    </div>
  );
};

export const PowerUps = ({
  powers,
  availables,
  onApplyPower,
  loadingPowerIndex,
  setPowerModal,
}: {
  powers: Power[];
  availables: Power[];
  onApplyPower: (powerIndex: number) => Promise<void>;
  loadingPowerIndex: number | null;
  setPowerModal: (power: Power | undefined) => void;
}) => {
  return (
    <div className="flex flex-col gap-2 justify-start">
      <div className="flex justify-end items-center gap-2">
        <span className="text-purple-300 tracking-wide text-lg/6 ">
          Power ups
        </span>
      </div>
      <div className="flex gap-2 md:gap-3">
        {powers.map((power) => (
          <PowerUp
            key={power.value}
            power={power}
            available={availables.map((p) => p.into()).includes(power.into())}
            onApplyPower={onApplyPower}
            isLoading={loadingPowerIndex === power.index()}
            isDisabled={false}
            setPowerModal={setPowerModal}
          />
        ))}
      </div>
    </div>
  );
};

export const PowerUp = ({
  power,
  available,
  onApplyPower,
  isLoading,
  isDisabled,
  setPowerModal,
}: {
  power: Power;
  available: boolean;
  onApplyPower: (powerIndex: number) => Promise<void>;
  isLoading: boolean;
  isDisabled: boolean;
  setPowerModal: (power: Power | undefined) => void;
}) => {
  const isNarrow = useMediaQuery("(max-width: 768px)");

  const status = useMemo(() => {
    if (available) return undefined;
    return "used";
  }, [power, available]);

  const Icon = power.icon(status);

  const handleApplyPower = useCallback(async () => {
    if (!available || isDisabled || isLoading) return;
    if (isNarrow) {
      setPowerModal(power);
      return;
    }
    await onApplyPower(power.index());
  }, [
    available,
    isDisabled,
    isLoading,
    isNarrow,
    power,
    onApplyPower,
    setPowerModal,
  ]);

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            disabled={!available || isDisabled || isLoading}
            variant="muted"
            className="size-10 md:size-[68px] p-0 [&_svg]:size-6 md:[&_svg]:size-9"
            onClick={handleApplyPower}
          >
            {isLoading ? (
              <Loader2 className="size-9 animate-spin" />
            ) : (
              <Icon role="img" aria-label={power.name()} />
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
    <div className="grid grid-flow-col grid-rows-10 md:grid-rows-5 gap-x-16 gap-y-2.5 md:gap-y-4 font-ppneuebit justify-center">
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
    <div className="flex justify-between items-center max-w-[108px]">
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

export const GameOver = ({
  game,
  close,
}: {
  game: GameModel;
  close: () => void;
}) => {
  return (
    <div
      className="w-full h-full select-none"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative w-full h-full rounded-2xl bg-black-300 border-[2px] border-black-300 backdrop-blur-[4px] p-6 flex flex-col gap-6 md:gap-12 justify-center items-center">
        <Close close={close} />
        <h1
          className="text-[64px]/[44px] md:text-[136px]/[92px]"
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

export const Close = ({ close }: { close: () => void }) => {
  return (
    <Button
      variant="ghost"
      className="self-end h-10 w-10 md:h-12 md:w-14 p-2 md:px-6 md:py-4 [&_svg]:size-6 md:[&_svg]:size-8 bg-white-900 hover:bg-white-800 rounded-lg"
      onClick={close}
    >
      <CloseIcon size="lg" />
    </Button>
  );
};

export const GameOverDetails = ({ game }: { game: GameModel }) => {
  return (
    <div className="grow md:grow-0 flex flex-col md:flex-row gap-6 w-full max-w-[480px]">
      <GameOverScore score={game.score} />
      <GameOverEarning earning={GameModel.totalReward(game.level)} />
    </div>
  );
};

export const GameOverScore = ({ score }: { score: number }) => {
  return (
    <div className="md:grow flex flex-col gap-3 justify-between px-5 py-4 bg-white-900 border border-white-900 rounded-lg">
      <p className="text-purple-300 tracking-wide text-lg/3">Score</p>
      <p
        className="text-[28px]/[19px] tracking-wide"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
      >
        {score.toLocaleString()}
      </p>
    </div>
  );
};

export const GameOverEarning = ({ earning }: { earning: number }) => {
  return (
    <div className="md:grow flex flex-col gap-3 justify-between px-5 py-4 bg-white-900 border border-white-900 rounded-lg">
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
    <Link to="/" className="w-full md:w-auto">
      <Button
        variant="secondary"
        className="gap-1 h-[56px] w-full md:w-[146px]"
      >
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

export const GameStart = ({ gameId }: { gameId: number }) => {
  const { usage } = useUsage();
  const [selection, setSelection] = useState<Power[]>([]);
  const [points, setPoints] = useState(DEFAULT_POWER_POINTS);

  const costs = useMemo(() => {
    return Power.getCosts(usage?.board || 0n) || [];
  }, [usage]);

  const handleToggle = useCallback((power: Power) => {
    setSelection((prev) => {
      if (prev.includes(power)) {
        return prev.filter((p) => p !== power);
      }
      return [...prev, power];
    });
  }, []);

  const canSelectPower = useCallback(
    (target: Power) => {
      if (selection.length === 0 || !costs) return true;
      const totalCost = selection.reduce((acc, power) => {
        const costItem = costs.find(({ power: p }) => p.value === power.value);
        return acc + (costItem ? costItem.cost : 0);
      }, 0);
      return (
        totalCost +
          (costs.find(({ power: p }) => p.value === target.value)?.cost || 0) <=
        DEFAULT_POWER_POINTS
      );
    },
    [costs, selection],
  );

  useEffect(() => {
    if (selection.length === 0 || !costs) {
      setPoints(DEFAULT_POWER_POINTS);
      return;
    }
    const totalCost = selection.reduce((acc, power) => {
      const costItem = costs.find(({ power: p }) => p.value === power.value);
      return acc + (costItem ? costItem.cost : 0);
    }, 0);
    setPoints(60 - totalCost);
  }, [costs, selection, setPoints]);

  return (
    <div
      className="relative flex flex-col justify-center h-full grow w-full bg-[linear-gradient(180deg,rgba(0,0,0,0.32)_0%,rgba(0,0,0,0.12)_100%)] p-4 md:px-16"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div className="max-h-[845px] max-w-[912px] mx-auto flex flex-1 flex-col gap-6 md:gap-12 p-0 md:py-12 overflow-hidden min-h-0">
        <GameStartHeader className="flex-shrink-0" points={points} />
        <div className="flex flex-1 flex-col gap-3 md:gap-6 overflow-hidden min-h-0">
          <GameStartPowerups
            selection={selection}
            onToggle={handleToggle}
            canSelectPower={canSelectPower}
            costs={costs}
            className="flex-1 min-h-0 basis-0 overflow-y-auto"
          />
          <GameStartPlay
            gameId={gameId}
            selection={selection}
            className="flex-shrink-0"
          />
        </div>
      </div>
    </div>
  );
};

export const GameStartHeader = ({
  points,
  className,
}: {
  points: number;
  className?: string;
}) => {
  return (
    <div
      className={cn("flex h-[76px] items-stretch justify-between", className)}
    >
      <div className="flex flex-col gap-2 justify-between">
        <p className="text-purple-300 tracking-wider text-lg/6">
          Choose your...
        </p>
        <div className="grow flex justify-center items-start">
          <strong className="text-white-100 text-5xl/[44px] md:text-[64px]/[44px]">
            Powerups
          </strong>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <p className="text-purple-300 tracking-wider text-lg/6">
          Points remaining
        </p>
        <div className="h-11 flex gap-2 items-center p-3 md:px-4 md:py-2.5 rounded bg-white-900 border border-white-900 [&_svg]:size-5 md:[&_svg]:size-6">
          <PointsIcon />
          <p className="text-white-100 text-[28px]/[19px] md:text-[36px]/[24px] translate-y-0.5">
            {points}
          </p>
        </div>
      </div>
    </div>
  );
};

export const GameStartPowerups = ({
  selection,
  onToggle,
  canSelectPower,
  costs,
  className,
}: {
  selection: Power[];
  onToggle: (power: Power) => void;
  canSelectPower: (target: Power) => boolean;
  costs: { power: Power; cost: number }[];
  className?: string;
}) => {
  const powers = useMemo(() => {
    return Power.getAllPowers();
  }, []);

  const getCost = useCallback(
    (power: Power) => {
      return costs.find(({ power: p }) => p.value === power.value)?.cost || 0;
    },
    [costs],
  );

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 overflow-y-auto",
        className,
      )}
      style={{ scrollbarWidth: "none" }}
    >
      {powers.map((power) => (
        <GameStartPowerup
          key={power.value}
          power={power}
          cost={getCost(power)}
          selected={selection.includes(power)}
          onToggle={onToggle}
          disabled={!canSelectPower(power)}
        />
      ))}
    </div>
  );
};

export const GameStartPowerup = ({
  power,
  cost,
  selected,
  onToggle,
  disabled,
}: {
  power: Power;
  cost: number;
  selected: boolean;
  onToggle: (power: Power) => void;
  disabled: boolean;
}) => {
  const [hover, setHover] = useState(false);
  const [inside, setInside] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setHover(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHover(false);
    setTimeout(() => {
      setInside(false);
    }, 500);
  }, []);

  const handleClick = useCallback(() => {
    onToggle(power);
    setInside(true);
  }, [onToggle, power, selected]);

  const Icon = power.icon(selected ? "used" : undefined);

  return (
    <div
      className="flex flex-col gap-4 items-stretch bg-black-900 p-4 md:p-6 rounded"
      style={{
        boxShadow: selected
          ? ""
          : "1px 1px 0px 0px rgba(255, 255, 255, 0.12) inset, 1px 1px 0px 0px rgba(0, 0, 0, 0.12)",
      }}
    >
      <div className="flex gap-4 h-12 md:h-16">
        <Icon
          className="min-h-12 min-w-12 md:min-h-16 md:min-w-16"
          role="img"
          aria-label={power.name()}
        />
        <div className="flex flex-col gap-1 text-white-100 ">
          <p className="text-[22px]/[15px] tracking-wider">{power.name()}</p>
          <p className="font-ppneuebit text-xl/4 font-bold">
            {power.description()}
          </p>
        </div>
      </div>
      <div className="flex gap-4 h-10">
        <div className="h-full flex gap-1 items-center px-3 py-2 rounded bg-white-900 border border-white-900">
          <PointsIcon size="sm" />
          <p className="text-white-100 text-[28px]/[19px] translate-y-0.5">
            {cost}
          </p>
        </div>
        <Button
          disabled={disabled && !selected}
          variant="secondary"
          className={cn(
            "h-full w-full transition-all duration-0",
            selected && !hover && "bg-purple-400 text-white-400",
            selected &&
              inside &&
              "hover:bg-purple-400 hover:text-white-400 cursor-default pointer-events-none",
          )}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <p
            className="text-[28px]/[19px] tracking-wide translate-y-0.5 px-1"
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
          >
            {selected && hover && !inside
              ? "Unselect"
              : selected
                ? "Selected"
                : "Select"}
          </p>
        </Button>
      </div>
    </div>
  );
};

export const GameStartPlay = ({
  gameId,
  selection,
  className,
}: {
  gameId: number;
  selection: Power[];
  className?: string;
}) => {
  const { game } = useGame(gameId);
  const { startGame } = useStartGame({ gameId: gameId, powers: selection });
  const [loading, setLoading] = useState(false);

  const handleStartGame = useCallback(() => {
    setLoading(true);
    startGame().then((success) => {
      if (!success) {
        setLoading(false);
        toast.error("Failed to start game");
      }
    });
  }, [startGame]);

  useEffect(() => {
    if (loading && game?.hasStarted()) {
      setLoading(false);
    }
  }, [game, loading]);

  return (
    <div className={cn("flex justify-end", className)}>
      <Button
        variant="default"
        className="h-10 w-full"
        onClick={handleStartGame}
      >
        {loading ? (
          <Loader2 className="size-6 animate-spin" />
        ) : (
          <p
            className="text-[28px]/[19px] tracking-wide translate-y-0.5 px-1"
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
          >
            Play
          </p>
        )}
      </Button>
    </div>
  );
};
