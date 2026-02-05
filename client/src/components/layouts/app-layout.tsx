import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layouts/header";
import { QuestScene } from "@/components/layouts/quest-scene";
import { LeaderboardScene } from "@/components/layouts/leaderboard-scene";
import { PurchaseScene } from "@/components/layouts/purchase-scene";
import { useHeader } from "@/hooks/header";
import { useAccount } from "@starknet-react/core";
import { useControllers } from "@/context/controllers";
import { useActions } from "@/hooks/actions";
import { useQuests } from "@/context/quests";
import { useLeaderboard } from "@/hooks/leaderboard";
import { usePrices } from "@/context/prices";
import { useAssets } from "@/hooks/assets";
import { useGames } from "@/hooks/games";
import { useEntities } from "@/context/entities";
import type ControllerConnector from "@cartridge/connector/controller";
import { PurchaseModalProvider } from "@/context/purchase-modal";
import { ChartHelper } from "@/helpers/chart";
import { DEFAULT_EXPIRATION } from "@/constants";

const background = "/assets/tunnel-background.svg";

export interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { account, connector } = useAccount();
  const { find } = useControllers();
  const headerData = useHeader();
  const {
    mint,
    quest: { claims, claim },
  } = useActions();
  const { quests } = useQuests();
  const { data: leaderboardData } = useLeaderboard();
  const { starterpack, config } = useEntities();
  const { getNumsPrice } = usePrices();
  const { supply: currentSupply } = useHeader();
  const { gameIds } = useAssets();
  const { games } = useGames(gameIds);
  const navigate = useNavigate();
  const [showQuestScene, setShowQuestScene] = useState(false);
  const [showLeaderboardScene, setShowLeaderboardScene] = useState(false);
  const [showPurchaseScene, setShowPurchaseScene] = useState(false);
  const previousGamesLengthRef = useRef<number>(games.length);

  // Get username from controllers if account is connected
  const username = useMemo(() => {
    if (!account?.address) return undefined;
    const controller = find(account.address);
    return controller?.username;
  }, [account?.address, find]);

  const numsPrice = useMemo(() => {
    return parseFloat(getNumsPrice() || "0.0");
  }, [getNumsPrice]);

  const playPrice = useMemo(() => {
    return Number(starterpack?.price || 0n) / 10 ** 6;
  }, [starterpack]);

  // Calculate chart data using ChartHelper
  const { chartValues, chartAbscissa, maxPayoutNums, maxPayout } =
    useMemo(() => {
      return ChartHelper.calculate({
        slotCount: config?.slot_count || 18,
        currentSupply,
        targetSupply: config?.target_supply || 0n,
        numsPrice: numsPrice,
        playPrice,
      });
    }, [config, currentSupply, getNumsPrice, numsPrice, playPrice]);

  const detailsProps = useMemo(() => {
    return {
      entryFee: `$${playPrice.toFixed(2).toLocaleString()}`,
      multiplier: `1.0x`,
      breakEven: chartAbscissa.toString(),
      expiration: `${DEFAULT_EXPIRATION / 60 / 60}hrs`,
      maxPayout: `${maxPayoutNums.toFixed(0).toLocaleString()} NUMS ~ $${maxPayout.toFixed(2).toLocaleString()}`,
    };
  }, [playPrice, chartAbscissa, maxPayoutNums, maxPayout]);

  const purchaseProps = useMemo(() => {
    return {
      chartValues,
      chartAbscissa,
      numsPrice,
    };
  }, [chartValues, chartAbscissa, numsPrice]);

  const handlePurchase = useCallback(() => {
    if (starterpack) {
      (connector as ControllerConnector)?.controller.openStarterPack(
        starterpack.id.toString(),
      );
    }
  }, [connector, starterpack]);

  // Detect new game and navigate to it
  useEffect(() => {
    const currentLength = games.length;
    const previousLength = previousGamesLengthRef.current;

    // Only trigger when length increases (new game added) and we're not initializing (previousLength > 0)
    if (currentLength > previousLength && previousLength > 0) {
      // Close all modals
      setShowQuestScene(false);
      setShowLeaderboardScene(false);
      setShowPurchaseScene(false);

      // Find the newest game (last in the array)
      const newestGame = games[0];
      if (newestGame) {
        navigate(`/game?id=${newestGame.id}`);
      }
    }

    // Update ref for next comparison
    previousGamesLengthRef.current = currentLength;
  }, [games.length, games, navigate]);

  // Prepare quests props for QuestScene
  const questsProps = useMemo(() => {
    const questProps = quests
      .filter((quest) => !quest.locked)
      .map((quest) => {
        // Get the first task for now (or combine all tasks)
        const firstTask = quest.tasks[0];
        const totalCount = quest.tasks.reduce(
          (acc, task) => acc + Number(task.count),
          0,
        );
        const totalTotal = quest.tasks.reduce(
          (acc, task) => acc + Number(task.total),
          0,
        );

        return {
          title: quest.name,
          task: firstTask?.description || "Complete quest",
          count: totalCount,
          total: totalTotal,
          expiration: quest.end,
          claimed: quest.claimed,
          rewards: quest.rewards,
          onClaim: () => {
            if (!account?.address) return;
            claim(account?.address, quest.id, quest.intervalId).then(
              (success) => {
                if (success) {
                  console.log("Quest claimed");
                }
              },
            );
          },
        };
      });
    const expiration = quests.length > 0 ? quests[0].end : 0;
    const params = quests
      .filter((quest) => !quest.claimed && quest.completed)
      .map((quest) => ({
        playerAddress: account?.address || "",
        questId: quest.id,
        intervalId: quest.intervalId,
      }));
    const onClaimAll =
      !account?.address || params.length === 0
        ? undefined
        : () => {
            claims(params).then((success) => {
              if (success) {
                console.log("Quests claimed all");
              }
            });
          };
    return {
      quests: questProps,
      expiration: expiration,
      onClaimAll: onClaimAll,
    };
  }, [quests, claim, claims, account?.address]);

  return (
    <div className="relative h-full w-screen flex flex-col overflow-hidden items-stretch">
      <img
        src={background}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover z-[-1]"
      />
      <Header
        isMainnet={headerData.isMainnet}
        isMuted={headerData.isMuted}
        onToggleMute={headerData.toggleMute}
        balance={headerData.balance}
        username={username}
        onConnect={headerData.handleConnect}
        onProfile={headerData.handleOpenProfile}
        onBalance={() => mint()}
        onQuests={() => {
          setShowQuestScene(!showQuestScene);
          setShowLeaderboardScene(false);
          setShowPurchaseScene(false);
        }}
        onLeaderboard={() => {
          setShowLeaderboardScene(!showLeaderboardScene);
          setShowQuestScene(false);
          setShowPurchaseScene(false);
        }}
      />
      <div
        className="relative flex-1 min-h-0 flex items-center justify-center p-0 md:px-16 md:py-12"
        style={{
          background:
            "linear-gradient(180deg, rgba(0, 0, 0, 0.32) 0%, rgba(0, 0, 0, 0.12) 100%)",
        }}
      >
        <PurchaseModalProvider
          openPurchaseScene={() => {
            setShowPurchaseScene(true);
            setShowQuestScene(false);
            setShowLeaderboardScene(false);
          }}
        >
          {children}
        </PurchaseModalProvider>
        {showQuestScene && (
          <div className="absolute inset-0 z-50 m-2 md:m-6 flex-1 overflow-hidden shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] rounded-xl">
            <QuestScene
              questsProps={questsProps}
              onClaimAll={questsProps.onClaimAll}
              onClose={() => setShowQuestScene(false)}
              className="h-full"
            />
          </div>
        )}
        {showLeaderboardScene && (
          <div className="absolute inset-0 z-50 m-2 md:m-6 flex-1 overflow-hidden shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] rounded-xl">
            <LeaderboardScene
              rows={leaderboardData ?? []}
              currentUserAddress={account?.address}
              onClose={() => setShowLeaderboardScene(false)}
              className="h-full"
            />
          </div>
        )}
        {showPurchaseScene && (
          <div className="absolute inset-0 z-50 m-2 md:m-6 flex-1 overflow-hidden shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] rounded-xl">
            <PurchaseScene
              detailsProps={detailsProps}
              purchaseProps={purchaseProps}
              onConnect={
                account?.address ? undefined : headerData.handleConnect
              }
              onPurchase={handlePurchase}
              onClose={() => setShowPurchaseScene(false)}
              className="h-full"
            />
          </div>
        )}
      </div>
    </div>
  );
};
