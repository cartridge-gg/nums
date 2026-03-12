import { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "@/components/containers/header";
import { QuestScene } from "@/components/scenes/quest";
import { LeaderboardScene } from "@/components/scenes/leaderboard";
import { useHeader } from "@/hooks/header";
import { useAccount } from "@starknet-react/core";
import { useControllers } from "@/context/controllers";
import { useActions } from "@/hooks/actions";
import { useQuests } from "@/context/quests";
import { useLeaderboard } from "@/hooks/leaderboard";
import { useEntities } from "@/context/entities";
import { PurchaseModalProvider } from "@/context/purchase-modal";
import { useToasters } from "@/hooks/toasters";
import { useWelcome } from "@/context/welcome";
import { Toaster } from "@/components/elements";
import { Events } from "../containers/events";
import { WelcomeScene } from "@/components/scenes";

const background = "/assets/tunnel-background.svg";

export interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { pathname } = useLocation();
  const [initialPathname] = useState(() => pathname);
  const { isDismissed, isDismissing, dismiss } = useWelcome();
  const { account } = useAccount();
  const { find, loading } = useControllers();
  const headerData = useHeader();
  const {
    mint,
    quest: { claims, claim },
  } = useActions();
  const { quests } = useQuests();
  const { data: leaderboardData, refetch: refetchLeaderboard } =
    useLeaderboard();
  const { claimeds, starteds } = useEntities();
  const [showQuestScene, setShowQuestScene] = useState(false);
  const [showLeaderboardScene, setShowLeaderboardScene] = useState(false);

  // Toaster hook to display toast notifications for social and player events
  useToasters();

  // Get username from controllers if account is connected
  const username = useMemo(() => {
    if (!account?.address) return undefined;
    const controller = find(account.address);
    return controller?.username;
  }, [account?.address, find]);

  // Prepare quests props for Quest
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

  // Refetch leaderboard data when modal opens
  useEffect(() => {
    if (showLeaderboardScene) {
      refetchLeaderboard();
    }
  }, [showLeaderboardScene, refetchLeaderboard]);

  const events = useMemo(() => {
    if (loading) return [];
    return [
      ...claimeds.map((claimed) => claimed.getEvent()),
      ...starteds.map((started) => started.getEvent()),
    ]
      .map((event) => ({
        ...event,
        username: find(event.username)?.username || event.username,
      }))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
  }, [claimeds, starteds, find, loading]);

  const showWelcomeOverlay =
    pathname === "/" &&
    initialPathname === "/" &&
    (!isDismissed || isDismissing);

  return (
    <div className="relative h-full w-screen flex flex-col overflow-hidden items-stretch">
      {showWelcomeOverlay && (
        <WelcomeScene
          close={dismiss}
          isDismissing={isDismissing}
          className="absolute inset-0 z-[100] w-full h-full"
        />
      )}
      <img
        src={background}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover z-[-1]"
      />
      <Header
        isMainnet={headerData.isMainnet}
        balance={headerData.balance}
        username={username}
        onConnect={headerData.handleConnect}
        onProfile={headerData.handleOpenProfile}
        onBalance={() => mint()}
        onQuests={() => {
          setShowQuestScene(!showQuestScene);
          setShowLeaderboardScene(false);
        }}
        onLeaderboard={() => {
          setShowLeaderboardScene(!showLeaderboardScene);
          setShowQuestScene(false);
        }}
      />
      <Events events={events} />
      <div
        className="relative flex-1 min-h-0 flex items-center justify-center"
        style={{
          background:
            "linear-gradient(180deg, rgba(0, 0, 0, 0.32) 0%, rgba(0, 0, 0, 0.12) 100%)",
        }}
      >
        <PurchaseModalProvider openPurchaseScene={() => {}}>
          {children}
        </PurchaseModalProvider>
        {showQuestScene && (
          <div className="absolute inset-0 z-50 m-2 md:m-6 flex-1">
            <QuestScene
              questsProps={questsProps}
              onClaimAll={questsProps.onClaimAll}
              onClose={() => setShowQuestScene(false)}
              className="h-full"
            />
          </div>
        )}
        {showLeaderboardScene && (
          <div className="absolute inset-0 z-50 m-2 md:m-6 flex-1">
            <LeaderboardScene
              rows={leaderboardData ?? []}
              currentUserAddress={account?.address}
              onClose={() => setShowLeaderboardScene(false)}
              className="h-full"
            />
          </div>
        )}
      </div>
      <Toaster expand />
    </div>
  );
};
