import background from "@/assets/tunnel-background.svg";
import { useTournaments } from "@/context/tournaments";
import { useMemo, useState, useEffect } from "react";
import { Header } from "@/components/header";
import { useParams } from "react-router-dom";
import { useGame } from "@/hooks/useGame";
import { useGameSet } from "@/hooks/useGameSet";
import { JackpotDetails } from "@/components/jackpot-details";
import { GameModel } from "@/models/game";
import { Power } from "@/types/power";
import { InfoIcon } from "@/components/icons/Info";
import { LinkIcon } from "@/components/icons/Link";
import { Button } from "@/components/ui/button";
import { TournamentModel } from "@/models/tournament";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Game = () => {
  return (
    <div className="select-none relative h-screen w-screen flex flex-col">
      <img src={background} alt="Background" className="absolute inset-0 w-full h-full object-cover z-[-1]" />
      <Header />
      <Main />
    </div>
  );
};

export const Main = () => {
  const { gameId } = useParams();
  const { tournaments } = useTournaments();
  const { game } = useGame(Number(gameId));
  const { setSlot } = useGameSet({ gameId: Number(gameId) });
  const [loadingSlotIndex, setLoadingSlotIndex] = useState<number | null>(null);

  const tournament = useMemo(() => {
    if (!game || !tournaments) return undefined;
    return tournaments?.find((tournament) => tournament.id === game.tournament_id);
  }, [tournaments, game]);

  const handleSetSlot = async (index: number) => {
    setLoadingSlotIndex(index);
    try {
      await setSlot(index);
      setLoadingSlotIndex(null);
    } catch (error) {
      setLoadingSlotIndex(null);
    }
  };

  useEffect(() => {
    if (loadingSlotIndex !== null && game?.slots[loadingSlotIndex]) {
      setLoadingSlotIndex(null);
    }
  }, [game?.slots, loadingSlotIndex]);

  if (!game || !tournament) return null;

  return (
    <div className="relative grow w-full bg-[linear-gradient(180deg,rgba(0,0,0,0.32)_0%,rgba(0,0,0,0.12)_100%)] px-16 py-12">
      <div className="h-full max-w-[624px] mx-auto flex flex-col gap-4 justify-center">
        <div className="flex flex-col gap-12">
          <GameHeader game={game} tournament={tournament} />
          <GameGrid game={game} onSetSlot={handleSetSlot} loadingSlotIndex={loadingSlotIndex} highlights={game.over ?game.closests() : []} />
          {tournament && <JackpotDetails tournament={tournament} />}
        </div>
      </div>
    </div>
  )
}

export const GameHeader = ({ game, tournament }: { game: GameModel, tournament: TournamentModel }) => {
  return (
    <div className="w-full flex justify-between">
      <GameNumber number={game.number} over={game.over} />
      <PowerUps powers={tournament.powers} availables={game.powers} adjacentCount={game.adjacentCount()} />
    </div>
  )
}

export const GameNumber = ({ number, over }: { number: number, over: boolean }) => {
  return (
    <div className="flex flex-col gap-2 justify-between">
      <span className="text-purple-300 tracking-wider text-lg/6">Your number is...</span>
      <strong className={cn("text-[136px]/[100px] font-normal", over ? "text-red-100" : "text-white-100")} style={{ textShadow: '4px 4px 0px rgba(28, 3, 101, 1)' }}>{number}</strong>
    </div>
  )
}

export const PowerUps = ({ powers, availables, adjacentCount }: { powers: Power[], availables: Power[], adjacentCount: number }) => {
  return (
    <div className="flex flex-col gap-2 justify-between">
      <div className="flex justify-between items-center gap-2">
        <span className="text-purple-300 tracking-wider text-lg/6 ">Power ups</span>
        <div className="hover:cursor-pointer transition-colors duration-100 hover:text-purple-400 text-purple-300 [&_svg]:size-6">
          <InfoIcon />
        </div>
      </div>
      <div className="flex gap-3">
        {powers.map((power) => (
          <PowerUp key={power.value} power={power} available={!availables.includes(power)} count={adjacentCount} />
        ))}
      </div>
    </div>
  )
}

export const PowerUp = ({ power, available, count }: { power: Power, available: boolean, count: number }) => {
  const status = useMemo(() => {
    if (power.isLocked(count)) return "locked";
    if (available) return undefined;
    return "used";
  }, [power, available, count]);
  
  return (
    <div className="flex flex-col gap-2 items-center justify-between text-purple-300">
      <Button disabled={!!available} variant="muted" className="size-[68px] p-0">
        <img src={power.icon(status)} alt={power.name()} className="size-9" />
      </Button>
      <div className="w-[52px] h-6 flex items-center gap-0.5 px-2 py-0.5 bg-black-700 rounded-full [&_svg]:text-purple-300 [&_svg]:size-5">
        <p className="text-[22px]/[15px] translate-y-0.5 px-0.5">{power.condition()}</p>
        <LinkIcon />
      </div>
    </div>
  )
}

const GameGrid = ({ game, onSetSlot, loadingSlotIndex, highlights }: { game: GameModel, onSetSlot: (index: number) => Promise<void>, loadingSlotIndex: number | null, highlights: number[] }) => {
  return (
    <div className="grid grid-flow-col grid-rows-5 gap-x-16 gap-y-4 font-ppneuebit">
      {game.slots.map((slot, index) => (
        <GameSlot 
          key={index} 
          slot={slot} 
          index={index} 
          onSetSlot={onSetSlot} 
          isLoading={loadingSlotIndex === index}
          isDisabled={loadingSlotIndex !== null && loadingSlotIndex !== index}
          isHighlighted={highlights.includes(index)}
        />
      ))}
    </div>
  )
}

const GameSlot = ({ 
  slot, 
  index, 
  onSetSlot, 
  isLoading, 
  isDisabled ,
  isHighlighted,
}: { 
  slot: number, 
  index: number, 
  onSetSlot: (index: number) => Promise<void>, 
  isLoading: boolean, 
  isDisabled: boolean 
  isHighlighted: boolean
}) => {
  const handleSetSlot = async () => {
    if (slot || isDisabled) return; // Ne rien faire si le slot est déjà rempli ou désactivé
    await onSetSlot(index);
  };

  return (
    <div className="flex justify-between items-center">
      <p className="text-purple-300 tracking-wider text-[28px] min-w-8">{`${index + 1}.`}</p>
      {slot ? 
        <div className="h-10 w-16 rounded-xl flex justify-center items-center bg-purple-300" style={{ boxShadow: '1px 1px 0px 0px rgba(255, 255, 255, 0.12) inset, 1px 1px 0px 0px rgba(0, 0, 0, 0.12)' }}>
          <p className={cn("text-2xl", isHighlighted ? "text-red-100" : "text-white-100")} style={{ textShadow: '2px 2px 0px rgba(0, 0, 0, 0.85)' }}>{slot}</p>
        </div>
        :
        <Button 
          disabled={isDisabled || isLoading} 
          variant="muted" 
          className="h-10 w-16 rounded-xl" 
          onClick={handleSetSlot}
        >
          {isLoading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <p className="text-2xl" style={{ textShadow: '2px 2px 0px rgba(0, 0, 0, 0.85)' }}>Set</p>
          )}
        </Button>
      }
    </div>
  )
}


