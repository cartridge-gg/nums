import background from "@/assets/tunnel-background.svg";
import { Formatter } from "@/helpers/formatter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTournaments } from "@/context/tournaments";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { TournamentModel } from "@/models/tournament";
import { Leaderboard } from "@/components/leaderboard";
import { Header } from "@/components/header";
import { Inventory } from "@/components/inventory";
import { useBuyGame } from "@/hooks/useBuyGame";
import { Button } from "@/components/ui/button";

export const Home = () => {
  return (
    <div className="relative h-screen w-screen flex flex-col">
      <img src={background} alt="Background" className="absolute inset-0 w-full h-full object-cover z-[-1]" />
      <Header />
      <Main />
    </div>
  );
};

const TrophyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#filter0_d_922_4065)">
      <path d="M20.385 6.87571C20.3083 6.55725 20.022 6.33324 19.6944 6.33324H16.7193C16.7265 5.96579 16.7225 5.63375 16.7147 5.35868C16.7016 4.84661 16.2855 4.44434 15.7719 4.44434H8.22813C7.71458 4.44434 7.29843 4.84661 7.28368 5.35868C7.25121 5.63375 7.27187 5.96579 7.28073 6.33324H4.30452C3.97692 6.33324 3.6929 6.55725 3.61543 6.87571C3.59146 6.97606 3.0363 9.3791 4.59406 11.7019C5.69906 13.3493 7.56318 14.5066 10.128 15.1668C10.6799 15.3086 11.2914 15.8229 11.2914 16.3928L11.2917 18.1389H8.93057C8.5395 18.1389 8.24879 18.4562 8.24879 18.8472C8.24879 19.2383 8.54098 19.5556 8.93057 19.5556H15.0429C15.434 19.5556 15.7247 19.2383 15.7247 18.8472C15.7247 18.4562 15.4074 18.1389 15.0429 18.1389H12.7084V16.3905C12.7093 15.8211 13.3199 15.3079 13.8715 15.1662C16.4381 14.5069 18.3016 13.3496 19.4054 11.7013C20.9635 9.3791 20.4086 6.97606 20.385 6.87571ZM5.78466 10.9315C4.96003 9.71556 4.88743 8.4494 4.92786 7.74992H7.3005C7.45867 9.50955 7.90111 11.6192 9.00258 13.331C7.55521 12.7555 6.47794 11.9527 5.78466 10.9315ZM18.2157 10.9315C17.5239 11.9527 16.4466 12.754 14.9987 13.3287C16.0995 11.6192 16.5423 9.50896 16.6987 7.74992H19.0713C19.0864 8.4494 19.0392 9.71851 18.2157 10.9315Z" fill="white"/>
    </g>
    <defs>
      <filter id="filter0_d_922_4065" x="3.5" y="4.44434" width="19" height="17.1113" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dx="2" dy="2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.95 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_922_4065"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_922_4065" result="shape"/>
      </filter>
    </defs>
  </svg>
);

const LiveIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="6" cy="6" r="4" fill="#48F095"/>
    <circle cx="6" cy="6" r="5" stroke="#48F095" stroke-opacity="0.48" stroke-width="2"/>
  </svg>
);


export const Main = () => {
  const { tournaments } = useTournaments();
  const [selectedTournament, setSelectedTournament] = useState<number | undefined>();
  const [openModal, setOpenModal] = useState<boolean>(false);

  useEffect(() => {
    if (!tournaments || tournaments.length === 0 || selectedTournament !== undefined) return;
    setSelectedTournament(tournaments[0].id);
  }, [tournaments, selectedTournament]);

  const handleSelect = (value: string) => {
    setSelectedTournament(Number(value));
  };

  return (
    <div className="relative grow w-full bg-[linear-gradient(180deg,rgba(0,0,0,0.32)_0%,rgba(0,0,0,0.12)_100%)] px-16 py-12">
      <div className={cn("absolute top-0 left-0 w-full h-full z-10", !openModal && "invisible")}>
        <div className={cn("p-6 w-full h-full flex justify-center items-center")}>
          {openModal && <Inventory close={() => setOpenModal(false)} />}
        </div>
      </div>
      <div className="h-full max-w-[784px] mx-auto flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <JackpotSelector tournaments={tournaments || []} selected={selectedTournament} handleSelect={handleSelect} />
          <div className="flex gap-3">
            <BuyGameButton />
            <Play onClick={() => setOpenModal(true)} />
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

export const Play = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button variant="default" className="h-12 px-4 py-2 text-2xl tracking-wider cursor-pointer" onClick={onClick}>
      <p className="translate-y-0.5" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.25)' }}>Play!</p>
    </Button>
  );
};

export const BuyGameButton = () => {
  const { buyGame } = useBuyGame();
  return (
    <Button variant="default" className="h-12 px-4 py-2 text-2xl tracking-wider" onClick={() => buyGame()}>
      <p className="translate-y-0.5" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.25)' }}>Buy</p>
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

export const JackpotDetails = ({ tournament }: { tournament: TournamentModel }) => {
  const started = useMemo(() => {
    return tournament.hasStarted();
  }, [tournament]);

  const ended = useMemo(() => {
    return tournament.hasEnded();
  }, [tournament]);

  const [remainingTime, setRemainingTime] = useState<string | undefined>();

  useEffect(() => {
    if (ended) return;
    setRemainingTime(Formatter.time(tournament.end_time.getTime() - new Date().getTime()));
    const interval = setInterval(() => {
      const remainingTime = tournament.end_time.getTime() - new Date().getTime();
      setRemainingTime(Formatter.time(remainingTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [tournament, ended, started]);

  return (
    <div className="select-none flex flex-col gap-6 w-full rounded-lg p-6 bg-[rgba(0,0,0,0.04)]" style={{ boxShadow: '1px 1px 0px 0px rgba(255, 255, 255, 0.12) inset, 1px 1px 0px 0px rgba(0, 0, 0, 0.12)' }}>
      <div className="flex gap-2 justify-between items-center">
        <h2 className="text-4xl leading-[24px] uppercase" style={{ textShadow: '3px 3px 0px rgba(0, 0, 0, 0.25)' }}>Jackpot #{tournament.id}</h2>
        <span className="text-4xl leading-[24px] uppercase" style={{ textShadow: '3px 3px 0px rgba(0, 0, 0, 0.25)' }}>$521.15</span>
      </div>
      <div className="flex flex-row-reverse gap-2 justify-between items-center max-h-3">
        {ended ?
          <div className="text-purple-300 leading-[12px]">
            <span className="text-lg" style={{ textShadow: '3px 3px 0px rgba(0, 0, 0, 0.25)' }}>Tournament completed</span>
          </div>
          : !started ?
          <div className="flex gap-2 justify-between text-purple-300 leading-[12px]">
            <span className="text-lg" style={{ textShadow: '3px 3px 0px rgba(0, 0, 0, 0.25)' }}>Tournament starts in:</span>
            <span className="text-lg" style={{ textShadow: '3px 3px 0px rgba(0, 0, 0, 0.25)' }}>{Formatter.time(tournament.start_time.getTime() - new Date().getTime())}</span>
          </div>
          :
          <div className="flex gap-2 justify-between text-purple-300 leading-[12px]">
            <span className="text-lg" style={{ textShadow: '3px 3px 0px rgba(0, 0, 0, 0.25)' }}>Tournament ends in:</span>
            <span className="text-lg" style={{ textShadow: '3px 3px 0px rgba(0, 0, 0, 0.25)' }}>{remainingTime}</span>
          </div>
        }
        <div className={cn("flex gap-2 items-center", (!started || ended) && "hidden")}>
          <div className="animate-pulse">
            <LiveIcon />
          </div>
          <p className="text-lg leading-[12px] uppercase text-green-100 translate-y-0.5" style={{ textShadow: '3px 3px 0px rgba(0, 0, 0, 0.25)' }}>Active</p>
        </div>
      </div>
    </div>
  )
}
