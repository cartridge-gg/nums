import { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "@/components/containers/header";
import { QuestScene } from "@/components/scenes/quest";
import { LeaderboardScene } from "@/components/scenes/leaderboard";
import { useHeader } from "@/hooks/header";
import { useAccount } from "@starknet-react/core";
import { useControllers } from "@/context/controllers";
import { useActions } from "@/hooks/actions";
import { useQuestScene } from "@/hooks/quests";
import { useLeaderboard } from "@/hooks/leaderboard";
import { useEntities } from "@/context/entities";
import { PurchaseModalProvider } from "@/context/purchase-modal";
import { useToasters } from "@/hooks/toasters";
import { useWelcome } from "@/context/welcome";
import { Toaster } from "@/components/elements";
import { Events } from "../containers/events";
import { WelcomeScene } from "@/components/scenes";
import { shortAddress } from "@/helpers";

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
  const { mint } = useActions();
  const questsProps = useQuestScene();
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
        username:
          find(event.username)?.username || shortAddress(event.username),
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
        balance={headerData.balance}
        username={username}
        onConnect={headerData.handleConnect}
        onQuests={() => {
          setShowQuestScene(!showQuestScene);
          setShowLeaderboardScene(false);
        }}
        onLeaderboard={() => {
          setShowLeaderboardScene(!showLeaderboardScene);
          setShowQuestScene(false);
        }}
        faucetBalance={headerData.faucetBalance}
        onFaucet={headerData.isMainnet ? undefined : () => mint()}
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
