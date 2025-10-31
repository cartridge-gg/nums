import { useAccount, useConnect } from "@starknet-react/core";
import { useEffect, useMemo, useState } from "react";
import background from "@/assets/tunnel-background.svg";
import { Header } from "@/components/header";
import { CircleInfoIcon } from "@/components/icons/CircleInfo";
import { LiveIcon } from "@/components/icons/Live";
import { TrophyIcon } from "@/components/icons/Trophy";
import { Inventory } from "@/components/inventory";
import { JackpotDetails, PrizePoolModal } from "@/components/jackpot-details";
import { Leaderboard } from "@/components/leaderboard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useModal } from "@/context/modal";
import { useTournaments } from "@/context/tournaments";
import { usePrizesWithUsd } from "@/hooks/usePrizes";
import { cn } from "@/lib/utils";
import type { TournamentModel } from "@/models/tournament";

export const Home = () => {
  const { isInventoryOpen, closeInventory } = useModal();
  const [prizePoolModal, setPrizePoolModal] = useState(false);

  return (
    <div
      className="relative h-screen w-screen flex flex-col"
      onClick={() => {
        if (isInventoryOpen) closeInventory();
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
  const { tournaments } = useTournaments();
  const { prizes } = usePrizesWithUsd();
  const { isInventoryOpen, openInventory, closeInventory } = useModal();
  const [selectedTournament, setSelectedTournament] = useState<
    number | undefined
  >();

  useEffect(() => {
    if (
      !tournaments ||
      tournaments.length === 0 ||
      selectedTournament !== undefined
    )
      return;
    const activeTournament = tournaments.find((tournament) =>
      tournament.isActive(),
    );
    setSelectedTournament(activeTournament?.id || tournaments[0].id);
  }, [tournaments, selectedTournament]);

  const handleSelect = (value: string) => {
    setSelectedTournament(Number(value));
  };

  const selectedTournamentPrizes = useMemo(() => {
    return prizes.filter((p) => p.tournament_id === selectedTournament);
  }, [prizes, selectedTournament]);

  return (
    <div className="relative grow w-full bg-[linear-gradient(180deg,rgba(0,0,0,0.32)_0%,rgba(0,0,0,0.12)_100%)] px-16 py-12">
      {isInventoryOpen && (
        <div className="absolute inset-0 z-50 p-6" onClick={closeInventory}>
          <Inventory />
        </div>
      )}
      {prizePoolModal && (
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/4 z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <PrizePoolModal
            prizes={selectedTournamentPrizes}
            setModal={setPrizePoolModal}
          />
        </div>
      )}
      <div className="h-full max-w-[784px] mx-auto flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <JackpotSelector
            tournaments={tournaments || []}
            selected={selectedTournament}
            handleSelect={handleSelect}
          />
          <div className="flex gap-3">
            <Info onClick={() => {}} />
            <Play onClick={openInventory} />
          </div>
        </div>
        {!!selectedTournament && (
          <JackpotDetails
            tournament={
              tournaments?.find(
                (tournament) => tournament.id === selectedTournament,
              ) as TournamentModel
            }
            onOpenPrizeModal={() => setPrizePoolModal(true)}
          />
        )}
        <div className="flex-1 min-h-0">
          {selectedTournament && (
            <Leaderboard
              tournament={
                tournaments?.find(
                  (tournament) => tournament.id === selectedTournament,
                ) as TournamentModel
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export const Info = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button
      disabled
      variant="muted"
      className="p-2 cursor-pointer"
      onClick={onClick}
    >
      <div className="[&_svg]:size-6 flex items-center justify-center">
        <CircleInfoIcon />
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
    <Button
      variant={!account ? "muted" : "default"}
      className="h-10 px-6 py-2 tracking-wide cursor-pointer"
      onClick={handleClick}
    >
      <p
        className="text-[28px]/[19px] translate-y-0.5"
        style={{ textShadow: "2px 2px 0px rgba(0,0,0,0.24)" }}
      >
        Play!
      </p>
    </Button>
  );
};

export const JackpotSelector = ({
  tournaments,
  selected,
  handleSelect,
}: {
  tournaments: TournamentModel[];
  selected: number | undefined;
  handleSelect: (value: string) => void;
}) => {
  const { prizes } = usePrizesWithUsd();

  const getTournamentPrizeTotal = (tournamentId: number) => {
    const tournamentPrizes = prizes.filter(
      (p) => p.tournament_id === tournamentId,
    );
    const total = tournamentPrizes.reduce((sum, prize) => {
      if (prize.totalUsd) {
        return sum + parseFloat(prize.totalUsd);
      }
      return sum;
    }, 0);
    return total > 0 ? `$${total.toFixed(2)}` : "$0.00";
  };

  const selectedTournament = tournaments.find(
    (tournament) => tournament.id === selected,
  );

  return (
    <Select value={selected?.toString()} onValueChange={handleSelect}>
      <SelectTrigger className="w-[218px] h-10 rounded-lg gap-2 px-3 py-2 tracking-wide bg-purple-600 border-0 focus:ring-0 focus:outline-none shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12),inset_1px_1px_0px_0px_rgba(255,255,255,0.12)]">
        {selectedTournament ? (
          <div className="flex items-center gap-2">
            <TrophyIcon />
            <span
              className="text-white text-2xl translate-y-0.5"
              style={{ textShadow: "2px 2px 0px rgba(0,0,0,1)" }}
            >{`Jackpot #${selectedTournament.id}`}</span>
          </div>
        ) : (
          <SelectValue placeholder="Coming soon" />
        )}
      </SelectTrigger>
      <SelectContent className="w-[400px] max-h-[360px] rounded-lg border-2 border-black-300 px-3 py-0 bg-black-300 backdrop-blur-xl tracking-wide shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
        <div className="flex flex-col gap-2 py-3">
          {tournaments?.map((tournament) => (
            <SelectItem
              key={tournament.id}
              value={tournament.id.toString()}
              className={cn(
                "w-full h-10 rounded px-3 py-2 bg-purple-600 focus:bg-purple-500 cursor-pointer justify-between",
                selected === tournament.id &&
                  "bg-purple-500 hover:bg-purple-500 pointer-events-none cursor-default",
              )}
            >
              <div className="w-[340px] flex gap-2 justify-between items-center">
                <div className="flex items-center gap-2">
                  {tournament.hasStarted() && !tournament.hasEnded() ? (
                    <div className="animate-pulse p-1.5 flex justify-center items-center">
                      <LiveIcon />
                    </div>
                  ) : (
                    <TrophyIcon />
                  )}
                  <span
                    className="text-white text-2xl translate-y-0.5"
                    style={{ textShadow: "2px 2px 0px rgba(0,0,0,1)" }}
                  >{`Jackpot #${tournament.id}`}</span>
                </div>
                <div className="leading-[12px] translate-y-0.5 text-lg uppercase">
                  {tournament.hasEnded() ? (
                    <span
                      className="text-purple-300"
                      style={{ textShadow: "2px 2px 0px rgba(0,0,0,0.25)" }}
                    >
                      Completed
                    </span>
                  ) : !tournament.hasStarted() ? (
                    <span
                      className="text-white-200"
                      style={{ textShadow: "2px 2px 0px rgba(0,0,0,0.25)" }}
                    >
                      Upcoming
                    </span>
                  ) : (
                    <span
                      style={{ textShadow: "2px 2px 0px rgba(0,0,0,0.25)" }}
                    >
                      {getTournamentPrizeTotal(tournament.id)}
                    </span>
                  )}
                </div>
              </div>
            </SelectItem>
          ))}
        </div>
      </SelectContent>
    </Select>
  );
};
