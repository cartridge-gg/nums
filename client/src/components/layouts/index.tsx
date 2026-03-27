import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { usePreserveSearchNavigate } from "@/lib/router";
import { Header } from "@/components/containers/header";
import { QuestScene } from "@/components/scenes/quest";
import { AchievementScene } from "@/components/scenes/achievement";
import { LeaderboardScene } from "@/components/scenes/leaderboard";
import { PurchaseScene } from "@/components/scenes/purchase";
import { ReferralScene } from "@/components/scenes/referral";
import { StakingScene } from "@/components/scenes/staking";
import { Airdrop } from "@/components/containers/airdrop";
import { useHeader } from "@/hooks/header";
import { useAccount, useDisconnect, useNetwork } from "@starknet-react/core";
import { useControllers } from "@/context/controllers";
import { useActions } from "@/hooks/actions";
import { useReferral } from "@/hooks/referral";
import { useStaking } from "@/hooks/staking";
import { useVault } from "@/context/vault";
import { useMultiplier } from "@/hooks/multiplier";
import { useLeaderboard } from "@/hooks/leaderboard";
import { useQuestScene } from "@/hooks/quests";
import { useAchievementScene } from "@/hooks/achievements";
import { usePrices } from "@/context/prices";
import { useGames } from "@/context/games";
import { useEntities } from "@/context/entities";
import type ControllerConnector from "@cartridge/connector/controller";
import { PurchaseModalProvider } from "@/context/purchase-modal";
import { useToasters } from "@/hooks/toasters";
import { useNotifications } from "@/hooks/notifications";
import { useWelcome } from "@/context/welcome";
import { Toaster } from "@/components/elements";
import { Settings } from "@/components/containers/settings";
import { Events } from "../containers/events";
import { WelcomeScene } from "@/components/scenes";
import { useAudio } from "@/context/audio";
import { useSound } from "@/context/sound";
import { useTheme } from "@/context/theme";
import { useTutorial } from "@/context/tutorial";
import { Tutorial, TutorialAnchorPortal } from "@/components/containers";
import { useBundles } from "@/context/bundles";
import { useAirdrop } from "@/hooks/airdrop";
import { shortAddress } from "@/helpers";
import { usePostHog } from "@/context/posthog";
import { getSetupAddress } from "@/config";

const background = "/assets/tunnel-background.svg";

export interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { chain } = useNetwork();
  const { pathname } = useLocation();
  const [initialPathname] = useState(() => pathname);
  const { isDismissed, isDismissing, dismiss } = useWelcome();
  const { account, connector } = useAccount();
  const { find, loading } = useControllers();
  const headerData = useHeader();
  const { mint } = useActions();
  const questsProps = useQuestScene();
  const { data: leaderboardData, refetch: refetchLeaderboard } =
    useLeaderboard();
  const { config, claimeds, starteds } = useEntities();
  const { paidBundles: bundles } = useBundles();
  const { getNumsPrice } = usePrices();
  const { playerGames: games, loading: gamesLoading } = useGames();
  const navigate = usePreserveSearchNavigate();
  const [showQuestScene, setShowQuestScene] = useState(false);
  const [showAchievementScene, setShowAchievementScene] = useState(false);
  const [showLeaderboardScene, setShowLeaderboardScene] = useState(false);
  const [showPurchaseScene, setShowPurchaseScene] = useState(false);
  const [showStakingScene, setShowStakingScene] = useState(false);
  const [showReferralScene, setShowReferralScene] = useState(false);
  const [showSettingsScene, setShowSettingsScene] = useState(false);
  const [showAirdropModal, setShowAirdropModal] = useState(false);
  const [bundleIndex, setBundleIndex] = useState<number>(1);
  const previousGamesLengthRef = useRef<number | null>(null);

  // Toaster hook to display toast notifications for social and player events
  useToasters();

  // PostHog analytics
  const { capture, identify } = usePostHog();
  const prevAddressRef = useRef<string | undefined>(undefined);

  // Track wallet connect/disconnect and identify user
  useEffect(() => {
    const address = account?.address;
    const prev = prevAddressRef.current;

    if (!prev && address) {
      const controller = find(address);
      const refParam = new URLSearchParams(window.location.search).get("ref");
      identify(address, {
        $set: {
          username: controller?.username ?? null,
          wallet_address: address,
        },
        $set_once: { referrer: refParam || null },
      });
      capture("wallet_connected", {
        address,
        username: controller?.username ?? null,
      });
    } else if (prev && !address) {
      capture("wallet_disconnected", {});
    }

    prevAddressRef.current = address;
  }, [account?.address, find, capture, identify]);

  const { disconnect } = useDisconnect();
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
  const { theme, setTheme } = useTheme();

  const { data: referralData, refetch: refetchReferral } = useReferral();
  const achievementsProps = useAchievementScene();

  // Get username from controllers if account is connected
  const username = useMemo(() => {
    if (!account?.address) return undefined;
    const controller = find(account.address);
    return controller?.username;
  }, [account?.address, find]);

  const notifications = useNotifications(referralData);

  const numsPrice = useMemo(() => {
    return parseFloat(getNumsPrice() || "0.0");
  }, [getNumsPrice]);

  const referralLink = useMemo(() => {
    if (!username) return "";
    return `${window.location.origin}/?ref=${encodeURIComponent(username)}`;
  }, [username]);

  const {
    hasMerkledrop,
    count: airdropCount,
    loading: airdropLoading,
    claim: claimAirdrop,
  } = useAirdrop();

  useEffect(() => {
    if (showAirdropModal && !airdropLoading && airdropCount === 0) {
      setShowAirdropModal(false);
    }
  }, [airdropLoading, airdropCount, showAirdropModal]);

  const { vaultInfo, vaultClaimed } = useVault();
  const stakingLocked = vaultInfo ? !vaultInfo.open : false;

  const { refetch: refetchStaking, ...stakingSceneProps } = useStaking({
    balance: headerData.balance,
    shares: headerData.shares,
    totalShares: headerData.total,
    totalAssets: headerData.assets,
    numsPrice,
  });

  const bundle = useMemo(() => {
    if (bundles.length === 0 || bundleIndex < 1 || bundleIndex > bundles.length)
      return undefined;
    return bundles[bundleIndex - 1];
  }, [bundles, bundleIndex]);

  const packMultiplier = useMemo(() => {
    if (!bundle || !config?.base_price || config.base_price === 0n) return 1;
    return Number(bundle.price / config.base_price) + 1;
  }, [bundle, config]);

  const basePrice = useMemo(() => {
    return (
      (Number(config?.base_price || 2_000_000n) * packMultiplier) / 10 ** 6
    );
  }, [config, packMultiplier]);

  const playPrice = useMemo(() => {
    return Number(bundle?.price || 0n) / 10 ** 6;
  }, [bundle]);

  const { multiplier, isLoading: multiplierLoading } = useMultiplier({
    basePrice: config?.base_price ?? 0n,
    packMultiplier: BigInt(packMultiplier),
    burnPercentage: BigInt(config?.burn_percentage ?? 0),
    slotCount: BigInt(config?.slot_count ?? 18),
    averageScore: BigInt(config?.average_score ?? 0),
    averageWeight: BigInt(config?.average_weigth ?? 0),
    currentSupply: headerData.supply,
    targetSupply: config?.target_supply ?? 0n,
    quoteAddress: config?.quote ?? "",
  });

  const handlePurchase = useCallback(async () => {
    if (!bundle || !chain) return;
    const onPurchaseComplete = () => {
      setShowQuestScene(false);
      setShowAchievementScene(false);
      setShowLeaderboardScene(false);
      setShowPurchaseScene(false);
      setShowStakingScene(false);
      setShowReferralScene(false);
      setShowSettingsScene(false);
      navigate("/game");
    };

    const socialClaimOptions = {
      shareMessage: `Check out @numsgg!\n${referralLink}`,
    };

    const controller = connector as ControllerConnector;
    const registry = getSetupAddress(chain.id);
    await controller.controller.openBundle(bundle.id, registry, {
      onPurchaseComplete,
      socialClaimOptions: bundle.price === 0n ? socialClaimOptions : undefined,
    });
  }, [bundle, navigate, chain.id, referralLink]);

  // Detect new game and navigate to it
  useEffect(() => {
    // Don't compare or navigate while games are still loading
    if (gamesLoading) {
      return;
    }

    const currentLength = games.length;
    const previousLength = previousGamesLengthRef.current;

    // Set initial length when loading completes for the first time
    if (previousLength === null) {
      previousGamesLengthRef.current = currentLength;
      return;
    }

    // Only trigger when length increases (new game added)
    if (currentLength > previousLength) {
      // Close all modals
      setShowQuestScene(false);
      setShowAchievementScene(false);
      setShowLeaderboardScene(false);
      setShowPurchaseScene(false);
      setShowStakingScene(false);
      setShowReferralScene(false);
      setShowSettingsScene(false);
      setShowAirdropModal(false);

      const newestGame = games[0];
      if (!newestGame) return;

      const controllerIframe = document.getElementById("controller");
      const isControllerOpen =
        controllerIframe && getComputedStyle(controllerIframe).opacity === "1";

      if (pathname === "/game" || (pathname === "/" && isControllerOpen)) {
        navigate(`/game/${newestGame.id}`);
        (connector as ControllerConnector)?.controller?.close?.();
      }
    }

    // Update ref for next comparison
    previousGamesLengthRef.current = currentLength;
  }, [games.length, games, gamesLoading, navigate, pathname]);

  useEffect(() => {
    setBundleIndex(1);
  }, [showPurchaseScene]);

  // Refetch leaderboard data when modal opens
  useEffect(() => {
    if (showLeaderboardScene) {
      refetchLeaderboard();
    }
  }, [showLeaderboardScene, refetchLeaderboard]);

  // Refetch referral data when modal opens
  useEffect(() => {
    if (showReferralScene) {
      refetchReferral();
    }
  }, [showReferralScene, refetchReferral]);

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

  const {
    data: tutorialData,
    isActive: tutorialActive,
    next: tutorialNext,
    skip: tutorialSkip,
    restart: tutorialRestart,
  } = useTutorial();

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
        hasQuestNotification={notifications.hasQuestNotification}
        hasAchievementNotification={notifications.hasAchievementNotification}
        hasSettingsNotification={notifications.hasSettingsNotification}
        onQuests={() => {
          setShowQuestScene(!showQuestScene);
          setShowAchievementScene(false);
          setShowLeaderboardScene(false);
          setShowPurchaseScene(false);
          setShowStakingScene(false);
          setShowReferralScene(false);
          setShowSettingsScene(false);
          setShowAirdropModal(false);
        }}
        onAchievements={() => {
          setShowAchievementScene(!showAchievementScene);
          setShowQuestScene(false);
          setShowLeaderboardScene(false);
          setShowPurchaseScene(false);
          setShowStakingScene(false);
          setShowReferralScene(false);
          setShowSettingsScene(false);
          setShowAirdropModal(false);
        }}
        onLeaderboard={() => {
          setShowLeaderboardScene(!showLeaderboardScene);
          setShowQuestScene(false);
          setShowAchievementScene(false);
          setShowPurchaseScene(false);
          setShowStakingScene(false);
          setShowReferralScene(false);
          setShowSettingsScene(false);
          setShowAirdropModal(false);
        }}
        onBalance={() => {
          if (!showStakingScene) refetchStaking();
          setShowStakingScene(!showStakingScene);
          setShowQuestScene(false);
          setShowAchievementScene(false);
          setShowLeaderboardScene(false);
          setShowPurchaseScene(false);
          setShowReferralScene(false);
          setShowSettingsScene(false);
          setShowAirdropModal(false);
        }}
        onSettings={() => {
          setShowSettingsScene(!showSettingsScene);
          setShowQuestScene(false);
          setShowAchievementScene(false);
          setShowLeaderboardScene(false);
          setShowPurchaseScene(false);
          setShowStakingScene(false);
          setShowReferralScene(false);
          setShowAirdropModal(false);
        }}
        faucetBalance={headerData.faucetBalance}
        onFaucet={() => mint()}
        hasMerkledrop={hasMerkledrop}
        onMerkledrop={() => {
          setShowAirdropModal(!showAirdropModal);
          setShowQuestScene(false);
          setShowAchievementScene(false);
          setShowLeaderboardScene(false);
          setShowPurchaseScene(false);
          setShowStakingScene(false);
          setShowReferralScene(false);
          setShowSettingsScene(false);
        }}
      />
      <div
        className="relative flex-1 min-h-0 flex flex-col justify-between"
        style={{
          background:
            "linear-gradient(180deg, rgba(0, 0, 0, 0.32) 0%, rgba(0, 0, 0, 0.12) 100%)",
        }}
      >
        <Events events={events} className="hidden md:block" />
        <PurchaseModalProvider
          openPurchaseScene={() => {
            setShowPurchaseScene(true);
            setShowQuestScene(false);
            setShowAchievementScene(false);
            setShowLeaderboardScene(false);
            setShowStakingScene(false);
            setShowReferralScene(false);
            setShowSettingsScene(false);
            setShowAirdropModal(false);
            capture("purchase_modal_opened", {});
          }}
        >
          {children}
        </PurchaseModalProvider>
        {showQuestScene && (
          <div className="absolute inset-0 z-50 flex-1 bg-black-700 backdrop-blur-[4px]">
            <div className="absolute inset-0 z-50 m-2 md:m-6 flex-1">
              <QuestScene
                questsProps={{
                  ...questsProps,
                  newQuestIds: notifications.newQuestIds,
                }}
                onClose={() => {
                  setShowQuestScene(false);
                  notifications.clearQuestNotifications();
                }}
                className="h-full"
              />
            </div>
          </div>
        )}
        {showAchievementScene && (
          <div className="absolute inset-0 z-50 flex-1 bg-black-700 backdrop-blur-[4px]">
            <div className="absolute inset-0 z-50 m-2 md:m-6 flex-1">
              <AchievementScene
                achievementsProps={{
                  ...achievementsProps,
                  newAchievementIds: notifications.newAchievementIds,
                }}
                onClose={() => {
                  setShowAchievementScene(false);
                  notifications.clearAchievementNotifications();
                }}
                className="h-full"
              />
            </div>
          </div>
        )}
        {showLeaderboardScene && (
          <div className="absolute inset-0 z-50 flex-1 bg-black-700 backdrop-blur-[4px]">
            <div className="absolute inset-0 z-50 m-2 md:m-6 flex-1">
              <LeaderboardScene
                rows={leaderboardData ?? []}
                currentUserAddress={account?.address}
                onClose={() => setShowLeaderboardScene(false)}
                className="h-full"
              />
            </div>
          </div>
        )}
        {showPurchaseScene && (
          <div className="absolute inset-0 z-50 flex-1 bg-black-700 backdrop-blur-[4px]">
            <div className="absolute inset-0 z-50 m-2 md:m-6 flex-1">
              <PurchaseScene
                slotCount={config?.slot_count || 18}
                basePrice={basePrice}
                playPrice={playPrice}
                numsPrice={numsPrice}
                multiplier={multiplier}
                loading={multiplierLoading}
                targetSupply={config?.target_supply || 0n}
                currentSupply={headerData.supply}
                stakesProps={{
                  total: bundles.length,
                  index: bundleIndex,
                  setIndex: setBundleIndex,
                }}
                onConnect={
                  account?.address ? undefined : headerData.handleConnect
                }
                onPurchase={handlePurchase}
                onClose={() => {
                  setShowPurchaseScene(false);
                  capture("purchase_modal_closed", {});
                }}
                className="h-full"
              />
            </div>
          </div>
        )}
        {showStakingScene && (
          <div className="absolute inset-0 z-50 flex-1 bg-black-700 backdrop-blur-[4px]">
            <div className="absolute inset-0 z-50 m-2 md:m-6 flex-1">
              <StakingScene
                {...stakingSceneProps}
                locked={stakingLocked}
                claimedProps={
                  vaultClaimed
                    ? {
                        amount: vaultClaimed.claimedAmount(),
                        timestamp: vaultClaimed.claimedAt(),
                      }
                    : undefined
                }
                onClose={() => setShowStakingScene(false)}
                className="h-full"
              />
            </div>
          </div>
        )}
        {showReferralScene && (
          <div className="absolute inset-0 z-50 flex-1 bg-black-700 backdrop-blur-[4px]">
            <div className="absolute inset-0 z-50 m-2 md:m-6 flex-1">
              <ReferralScene
                payments={referralData ?? []}
                link={referralLink}
                newPaymentCount={notifications.newReferralCount}
                onClose={() => {
                  setShowReferralScene(false);
                  notifications.clearReferralNotifications();
                }}
                className="h-full"
              />
            </div>
          </div>
        )}
        {showAirdropModal && (
          <div className="absolute inset-0 z-50 flex-1 bg-black-700 backdrop-blur-[4px]">
            <div className="absolute inset-0 z-50 m-2 md:m-6 flex-1 flex items-center justify-center">
              <Airdrop
                count={airdropCount}
                loading={airdropLoading}
                onClaim={claimAirdrop}
                onClose={() => setShowAirdropModal(false)}
                className="w-full md:max-w-[416px]"
              />
            </div>
          </div>
        )}
        {showSettingsScene && (
          <div className="absolute inset-0 z-50 flex-1 bg-black-700 backdrop-blur-[4px]">
            <div className="absolute inset-0 z-50 m-2 md:m-6 flex-1 flex items-center justify-center">
              <Settings
                onClose={() => {
                  setShowSettingsScene(false);
                  notifications.clearReferralNotifications();
                }}
                username={username}
                hasReferralNotification={notifications.hasSettingsNotification}
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
                onLeaderboard={() => {
                  setShowSettingsScene(false);
                  setShowLeaderboardScene(true);
                }}
                onReferrals={() => {
                  setShowSettingsScene(false);
                  setShowReferralScene(true);
                }}
                onAchievements={() => {
                  setShowSettingsScene(false);
                  setShowAchievementScene(true);
                }}
                onQuests={() => {
                  setShowSettingsScene(false);
                  setShowQuestScene(true);
                }}
                onStaking={() => {
                  setShowSettingsScene(false);
                  setShowStakingScene(true);
                }}
                onTutorial={() => {
                  setShowSettingsScene(false);
                  tutorialRestart();
                }}
                onLogOut={() => {
                  setShowSettingsScene(false);
                  disconnect();
                }}
                className="md:max-w-[768px]"
              />
            </div>
          </div>
        )}

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
      </div>
      <TutorialAnchorPortal />
      <Toaster expand />
    </div>
  );
};
