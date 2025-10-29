import background from "@/assets/tunnel-background.svg";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTournaments } from "@/context/tournaments";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { TournamentModel } from "@/models/tournament";
import { Leaderboard } from "@/components/leaderboard";
import { Header } from "@/components/header";
import { Inventory } from "@/components/inventory";
import { Button } from "@/components/ui/button";
import { useModal } from "@/context/modal";
import { TrophyIcon } from "@/components/icons/Trophy";
import { LiveIcon } from "@/components/icons/Live";
import { CircleInfoIcon } from "@/components/icons/CircleInfo";
import { useAccount, useConnect } from "@starknet-react/core";
import { JackpotDetails } from "@/components/jackpot-details";

export const Home = () => {
  const { isInventoryOpen, closeInventory } = useModal();
  
  return (
    <div className="relative h-screen w-screen flex flex-col" onClick={isInventoryOpen ? closeInventory : undefined}>
      <img src={background} alt="Background" className="absolute inset-0 w-full h-full object-cover z-[-1]" />
      <Header />
      <Main />
    </div>
  );
};

export const Main = () => {
  const { tournaments } = useTournaments();
  const { isInventoryOpen, openInventory, closeInventory } = useModal();
  const [selectedTournament, setSelectedTournament] = useState<number | undefined>();

  useEffect(() => {
    if (!tournaments || tournaments.length === 0 || selectedTournament !== undefined) return;
    setSelectedTournament(tournaments[0].id);
  }, [tournaments, selectedTournament]);

  const handleSelect = (value: string) => {
    setSelectedTournament(Number(value));
  };

  return (
    <div className="relative grow w-full bg-[linear-gradient(180deg,rgba(0,0,0,0.32)_0%,rgba(0,0,0,0.12)_100%)] px-16 py-12">
      {isInventoryOpen && (
        <div className="absolute inset-0 z-50 p-6" onClick={closeInventory}>
          <Inventory />
        </div>
      )}
      <div className="h-full max-w-[784px] mx-auto flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <JackpotSelector tournaments={tournaments || []} selected={selectedTournament} handleSelect={handleSelect} />
          <div className="flex gap-3">
            <Info onClick={() => {}} />
            <Play onClick={openInventory} />
          </div>
        </div>
        {!!selectedTournament && <JackpotDetails tournament={tournaments?.find((tournament) => tournament.id === selectedTournament) as TournamentModel} />}
        <div className="flex-1 min-h-0">
          <Leaderboard />
        </div>
      </div>
    </div>
  )
}

export const Info = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button disabled variant="muted" className="p-2 cursor-pointer" onClick={onClick}>
      <div className="[&_svg]:size-6 flex items-center justify-center">
        <CircleInfoIcon  />
      </div>
    </Button>
  );
};

export const Play = ({ onClick }: { onClick: () => void }) => {
  const { account } = useAccount();
  const { connectAsync, connectors } = useConnect();

  const handleClick = () => {
    if (!account) {
      connectAsync({ connector: connectors[0] });
    } else {
      onClick();
    }
  };

  return (
    <Button variant={!account ? "muted" : "default"} className="h-10 px-6 py-2 tracking-wider cursor-pointer" onClick={handleClick}>
      <p className="text-[28px]/[19px] translate-y-0.5" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.24)' }}>Play!</p>
    </Button>
  );
};

export const JackpotSelector = ({ tournaments, selected, handleSelect }: { tournaments: TournamentModel[], selected: number | undefined, handleSelect: (value: string) => void }) => {
  const selectedTournament = tournaments.find((tournament) => tournament.id === selected);

  return (
    <Select value={selected?.toString()} onValueChange={handleSelect}>
      <SelectTrigger className="w-[218px] h-10 rounded-lg gap-2 px-3 py-2 tracking-wider bg-purple-600 border-0 focus:ring-0 focus:outline-none shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12),inset_1px_1px_0px_0px_rgba(255,255,255,0.12)]">
        {selectedTournament ? (
          <div className="flex items-center gap-2">
            <TrophyIcon />
            <span className="text-white text-2xl translate-y-0.5" style={{ textShadow: '2px 2px 0px rgba(0,0,0,1)' }}>{`Jackpot #${selectedTournament.id}`}</span>
          </div>
        ) : (
          <SelectValue placeholder="Coming soon" />
        )}
      </SelectTrigger>
      <SelectContent className="w-[400px] h-[360px] rounded-lg border-2 border-black-300 px-3 py-0 bg-black-300 backdrop-blur-xl tracking-wider shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
        <div className="flex flex-col gap-2 py-3">
          {tournaments && tournaments.map((tournament) => (
            <SelectItem key={tournament.id} value={tournament.id.toString()} className={cn("w-full h-10 rounded px-3 py-2 bg-purple-600 focus:bg-purple-500 cursor-pointer justify-between", selected === tournament.id && "bg-purple-500 hover:bg-purple-500 pointer-events-none cursor-default")}>
              <div className="w-[340px] flex gap-2 justify-between items-center">
                <div className="flex items-center gap-2">
                  { tournament.hasStarted() && !tournament.hasEnded() ?
                  <div className="animate-pulse p-1.5 flex justify-center items-center">
                    <LiveIcon />
                  </div>
                  :
                  <TrophyIcon />
                  }
                  <span className="text-white text-2xl translate-y-0.5" style={{ textShadow: '2px 2px 0px rgba(0,0,0,1)' }}>{`Jackpot #${tournament.id}`}</span>
                </div>
                <div className="leading-[12px] translate-y-0.5 text-lg uppercase">
                  {tournament.hasEnded() ?
                  <span className="text-purple-300" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.25)' }}>Completed</span>
                  : !tournament.hasStarted() ?
                  <span className="text-white-200" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.25)' }}>Upcoming</span>
                  :
                  <span style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.25)' }}>$521.15</span>
                  }
                </div>
              </div>
            </SelectItem>
          ))}
        </div>
      </SelectContent>
    </Select>
  );
};

