import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Header } from "@/components/containers/header";
import { QuestScene } from "@/components/scenes/quest";
import { LeaderboardScene } from "@/components/scenes/leaderboard";
import { useHeader } from "@/hooks/header";
import { useAccount } from "@starknet-react/core";
import { useActions } from "@/hooks/actions";
import { useQuestScene } from "@/hooks/quests";
import { useLeaderboard } from "@/hooks/leaderboard";
import { PurchaseModalProvider } from "@/context/purchase-modal";
import { useToasters } from "@/hooks/toasters";
import { useTutorial } from "@/context/tutorial";
import { useSound } from "@/context/sound";
import { useAudio } from "@/context/audio";
import { useTheme } from "@/context/theme";
import { Toaster } from "@/components/elements";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Settings, Tutorial, TutorialAnchorPortal } from "../containers";

const background = "/assets/tunnel-background.svg";

export interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { account } = useAccount();
  const headerData = useHeader();
  const { mint } = useActions();
  const questsProps = useQuestScene();
  const { data: leaderboardData, refetch: refetchLeaderboard } =
    useLeaderboard();
  const [showQuestScene, setShowQuestScene] = useState(false);
  const [showLeaderboardScene, setShowLeaderboardScene] = useState(false);
  const [showSettingsScene, setShowSettingsScene] = useState(false);
  const {
    data: tutorialData,
    isActive: tutorialActive,
    next: tutorialNext,
    skip: tutorialSkip,
    restart: tutorialRestart,
  } = useTutorial();
  const {
    volume: musicVolume,
    isMuted: musicMuted,
    setVolume: setMusicVolume,
    toggleMute: toggleMusicMute,
  } = useSound();
  const {
    volume: sfxVolume,
    isMuted: sfxMuted,
    setVolume: setSfxVolume,
    toggleMute: toggleSfxMute,
  } = useAudio();
  const { theme, setTheme, hasVnums } = useTheme();

  // Toaster hook to display toast notifications for social and player events
  useToasters();

  useEffect(() => {
    if (showLeaderboardScene) {
      refetchLeaderboard();
    }
  }, [showLeaderboardScene, refetchLeaderboard]);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="relative h-full w-screen flex flex-col overflow-hidden items-stretch">
        <img
          src={background}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover z-[-1]"
        />
        <Header
          balance={headerData.balance}
          username={headerData.username ?? undefined}
          onConnect={headerData.handleConnect}
          onQuests={() => {
            setShowQuestScene(!showQuestScene);
            setShowLeaderboardScene(false);
          }}
          onLeaderboard={() => {
            setShowLeaderboardScene(!showLeaderboardScene);
            setShowQuestScene(false);
          }}
          onSettings={() => {
            setShowSettingsScene(!showSettingsScene);
            setShowQuestScene(false);
            setShowLeaderboardScene(false);
          }}
          faucetBalance={headerData.faucetBalance}
          onFaucet={headerData.isMainnet ? undefined : () => mint()}
        />
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
          {tutorialActive && tutorialData && !tutorialData.anchor && (
            <div
              className={cn(
                "absolute inset-0 z-50 flex items-end md:items-center justify-center p-4",
                tutorialData.foreground && "bg-black-700 backdrop-blur-[4px]",
                !tutorialData.foreground && "pointer-events-none",
              )}
            >
              <Tutorial
                title={tutorialData.title}
                instruction={tutorialData.instruction}
                primaryLabel={tutorialData.primaryLabel}
                secondaryLabel={tutorialData.secondaryLabel}
                direction={tutorialData.direction}
                onPrimary={tutorialNext}
                onSecondary={
                  tutorialData.secondaryLabel ? tutorialSkip : undefined
                }
                onClose={tutorialData.secondaryLabel ? tutorialSkip : undefined}
                className={cn(
                  "w-full md:max-w-[424px]",
                  !tutorialData.foreground && "pointer-events-auto",
                )}
              />
            </div>
          )}
          <TutorialAnchorPortal />
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
          {showSettingsScene && (
            <div className="absolute inset-0 z-50 flex-1 bg-black-700 backdrop-blur-[4px]">
              <div className="absolute inset-0 z-50 m-2 md:m-6 flex-1 flex items-center justify-center">
                <Settings
                  onClose={() => setShowSettingsScene(false)}
                  username={headerData.username ?? undefined}
                  onProfile={headerData.handleOpenProfile}
                  onConnect={headerData.handleConnect}
                  musicVolume={musicVolume}
                  musicMuted={musicMuted}
                  onMusicChange={setMusicVolume}
                  onMusicMute={toggleMusicMute}
                  sfxVolume={sfxVolume}
                  sfxMuted={sfxMuted}
                  onSfxChange={setSfxVolume}
                  onSfxMute={toggleSfxMute}
                  theme={theme}
                  onThemeChange={setTheme}
                  hasVnums={hasVnums}
                  onLeaderboard={() => {
                    setShowSettingsScene(false);
                    setShowLeaderboardScene(true);
                  }}
                  onQuests={() => {
                    setShowSettingsScene(false);
                    setShowQuestScene(true);
                  }}
                  onAchievements={() => setShowSettingsScene(false)}
                  onReferrals={() => setShowSettingsScene(false)}
                  onStaking={() => setShowSettingsScene(false)}
                  onGovernance={() => setShowSettingsScene(false)}
                  onTutorial={() => {
                    setShowSettingsScene(false);
                    tutorialRestart();
                  }}
                  onLogOut={() => {
                    setShowSettingsScene(false);
                    void headerData.handleLogout();
                  }}
                  className="md:max-w-[768px]"
                />
              </div>
            </div>
          )}
        </div>
        <Toaster expand />
      </div>
    </TooltipProvider>
  );
};
