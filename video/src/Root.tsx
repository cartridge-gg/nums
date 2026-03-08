import { Composition, Folder } from "remotion";
import { FPS, seconds } from "@video/lib/timing";
import {
	SQUARE_WIDTH,
	SQUARE_HEIGHT,
} from "@video/components/layouts/SquareLayout";
import { AudioProvider } from "@video/providers/audio";

// Gameplay compositions
import {
	PerfectGame,
	perfectGameSchema,
	perfectGameDefaultProps,
} from "./compositions/gameplay/PerfectGame";
import {
	PowerClutch,
	powerClutchSchema,
	powerClutchDefaultProps,
} from "./compositions/gameplay/PowerClutch";
import {
	TrapChaos,
	trapChaosSchema,
	trapChaosDefaultProps,
} from "./compositions/gameplay/TrapChaos";
import {
	NearMiss,
	nearMissSchema,
	nearMissDefaultProps,
} from "./compositions/gameplay/NearMiss";
import {
	BreakEvenSweat,
	breakEvenSweatSchema,
	breakEvenSweatDefaultProps,
} from "./compositions/gameplay/BreakEvenSweat";
import {
	TheDisaster,
	theDisasterSchema,
	theDisasterDefaultProps,
} from "./compositions/gameplay/TheDisaster";
import {
	MirrorFlip,
	mirrorFlipSchema,
	mirrorFlipDefaultProps,
} from "./compositions/gameplay/MirrorFlip";
import {
	GreedyPlacement,
	greedyPlacementSchema,
	greedyPlacementDefaultProps,
} from "./compositions/gameplay/GreedyPlacement";
import {
	MultiplierRun,
	multiplierRunSchema,
	multiplierRunDefaultProps,
} from "./compositions/gameplay/MultiplierRun";
import {
	GameNFT,
	gameNFTSchema,
	gameNFTDefaultProps,
} from "./compositions/gameplay/GameNFT";
import {
	LateGameSqueeze,
	lateGameSqueezeSchema,
	lateGameSqueezeDefaultProps,
} from "./compositions/gameplay/LateGameSqueeze";
import {
	DoublePowerTurn,
	doublePowerTurnSchema,
	doublePowerTurnDefaultProps,
} from "./compositions/gameplay/DoublePowerTurn";
import {
	TheSkip,
	theSkipSchema,
	theSkipDefaultProps,
} from "./compositions/gameplay/TheSkip";
import {
	TrapIntoSave,
	trapIntoSaveSchema,
	trapIntoSaveDefaultProps,
} from "./compositions/gameplay/TrapIntoSave";

// Progression compositions
import {
	HiddenAchievement,
	hiddenAchievementSchema,
	hiddenAchievementDefaultProps,
} from "./compositions/progression/HiddenAchievement";
import {
	GrinderMilestones,
	grinderMilestonesSchema,
	grinderMilestonesDefaultProps,
} from "./compositions/progression/GrinderMilestones";
import {
	ProfitStreak,
	profitStreakSchema,
	profitStreakDefaultProps,
} from "./compositions/progression/ProfitStreak";
import {
	FirstProfitableGame,
	firstProfitableGameSchema,
	firstProfitableGameDefaultProps,
} from "./compositions/progression/FirstProfitableGame";
import {
	LifetimeEarnings,
	lifetimeEarningsSchema,
	lifetimeEarningsDefaultProps,
} from "./compositions/progression/LifetimeEarnings";
import {
	DailyDominator,
	dailyDominatorSchema,
	dailyDominatorDefaultProps,
} from "./compositions/progression/DailyDominator";
import {
	WorstGameEver,
	worstGameEverSchema,
	worstGameEverDefaultProps,
} from "./compositions/progression/WorstGameEver";
import {
	NewPersonalBest,
	newPersonalBestSchema,
	newPersonalBestDefaultProps,
} from "./compositions/progression/NewPersonalBest";

// Economy compositions
import {
	NumsBurnMilestone,
	numsBurnMilestoneSchema,
	numsBurnMilestoneDefaultProps,
} from "./compositions/economy/NumsBurnMilestone";
import {
	BurnVsMintRatio,
	burnVsMintRatioSchema,
	burnVsMintRatioDefaultProps,
} from "./compositions/economy/BurnVsMintRatio";
import {
	GamesPlayedMilestone,
	gamesPlayedMilestoneSchema,
	gamesPlayedMilestoneDefaultProps,
} from "./compositions/economy/GamesPlayedMilestone";
import {
	TotalNumsPaidOut,
	totalNumsPaidOutSchema,
	totalNumsPaidOutDefaultProps,
} from "./compositions/economy/TotalNumsPaidOut";
import {
	NewPlayerSurge,
	newPlayerSurgeSchema,
	newPlayerSurgeDefaultProps,
} from "./compositions/economy/NewPlayerSurge";
import {
	StarterPackSales,
	starterPackSalesSchema,
	starterPackSalesDefaultProps,
} from "./compositions/economy/StarterPackSales";
import {
	RewardRateShift,
	rewardRateShiftSchema,
	rewardRateShiftDefaultProps,
} from "./compositions/economy/RewardRateShift";
import {
	StakingMilestones,
	stakingMilestonesSchema,
	stakingMilestonesDefaultProps,
} from "./compositions/economy/StakingMilestones";
import {
	EkuboPoolStats,
	ekuboPoolStatsSchema,
	ekuboPoolStatsDefaultProps,
} from "./compositions/economy/EkuboPoolStats";
import {
	RevenueToggleChange,
	revenueToggleChangeSchema,
	revenueToggleChangeDefaultProps,
} from "./compositions/economy/RevenueToggleChange";
import {
	SupplyCrossesTarget,
	supplyCrossesTargetSchema,
	supplyCrossesTargetDefaultProps,
} from "./compositions/economy/SupplyCrossesTarget";

// Competitive compositions
import {
	NewChampion,
	newChampionSchema,
	newChampionDefaultProps,
} from "./compositions/competitive/NewChampion";
import {
	LeaderboardUpset,
	leaderboardUpsetSchema,
	leaderboardUpsetDefaultProps,
} from "./compositions/competitive/LeaderboardUpset";
import {
	ReferralMilestones,
	referralMilestonesSchema,
	referralMilestonesDefaultProps,
} from "./compositions/competitive/ReferralMilestones";
import {
	ReferralChain,
	referralChainSchema,
	referralChainDefaultProps,
} from "./compositions/competitive/ReferralChain";
import {
	GuildPerformance,
	guildPerformanceSchema,
	guildPerformanceDefaultProps,
} from "./compositions/competitive/GuildPerformance";
import {
	TournamentResults,
	tournamentResultsSchema,
	tournamentResultsDefaultProps,
} from "./compositions/competitive/TournamentResults";
import {
	SeasonOpenClose,
	seasonOpenCloseSchema,
	seasonOpenCloseDefaultProps,
} from "./compositions/competitive/SeasonOpenClose";
import {
	Rivalry,
	rivalrySchema,
	rivalryDefaultProps,
} from "./compositions/competitive/Rivalry";

// Social compositions
import {
	ConcurrentPlayers,
	concurrentPlayersSchema,
	concurrentPlayersDefaultProps,
} from "./compositions/social/ConcurrentPlayers";
import {
	ToastFeed,
	toastFeedSchema,
	toastFeedDefaultProps,
} from "./compositions/social/ToastFeed";
import {
	SharedGameNFT,
	sharedGameNFTSchema,
	sharedGameNFTDefaultProps,
} from "./compositions/social/SharedGameNFT";
import {
	PracticeToPaid,
	practiceToPaidSchema,
	practiceToPaidDefaultProps,
} from "./compositions/social/PracticeToPaid";

// Narrative compositions
import {
	ProbabilityStory,
	probabilityStorySchema,
	probabilityStoryDefaultProps,
} from "./compositions/narrative/ProbabilityStory";
import {
	FairnessStory,
	fairnessStorySchema,
	fairnessStoryDefaultProps,
} from "./compositions/narrative/FairnessStory";
import {
	NFTTrophyStory,
	nftTrophyStorySchema,
	nftTrophyStoryDefaultProps,
} from "./compositions/narrative/NFTTrophyStory";
import {
	OneMoreGame,
	oneMoreGameSchema,
	oneMoreGameDefaultProps,
} from "./compositions/narrative/OneMoreGame";
import {
	PlayerSpotlight,
	playerSpotlightSchema,
	playerSpotlightDefaultProps,
} from "./compositions/narrative/PlayerSpotlight";
import {
	DeflationaryStory,
	deflationaryStorySchema,
	deflationaryStoryDefaultProps,
} from "./compositions/narrative/DeflationaryStory";
import {
	BuilderStory,
	builderStorySchema,
	builderStoryDefaultProps,
} from "./compositions/narrative/BuilderStory";
import {
	DAOStory,
	daoStorySchema,
	daoStoryDefaultProps,
} from "./compositions/narrative/DAOStory";

// Config compositions
import {
	ReferralActivation,
	referralActivationSchema,
	referralActivationDefaultProps,
} from "./compositions/config/ReferralActivation";
import {
	StakingOpens,
	stakingOpensSchema,
	stakingOpensDefaultProps,
} from "./compositions/config/StakingOpens";
import {
	NewPackTier,
	newPackTierSchema,
	newPackTierDefaultProps,
} from "./compositions/config/NewPackTier";
import {
	ShareToClaim,
	shareToClaimSchema,
	shareToClaimDefaultProps,
} from "./compositions/config/ShareToClaim";
import {
	AppStoreLaunch,
	appStoreLaunchSchema,
	appStoreLaunchDefaultProps,
} from "./compositions/config/AppStoreLaunch";

function Wrap({ children }: { children: React.ReactNode }) {
	return <AudioProvider>{children}</AudioProvider>;
}

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Folder name="Gameplay">
				<Composition
					id="PerfectGame"
					component={() => (
						<Wrap>
							<PerfectGame {...perfectGameDefaultProps} />
						</Wrap>
					)}
					schema={perfectGameSchema}
					defaultProps={perfectGameDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(7)}
				/>
				<Composition
					id="PowerClutch"
					component={() => (
						<Wrap>
							<PowerClutch {...powerClutchDefaultProps} />
						</Wrap>
					)}
					schema={powerClutchSchema}
					defaultProps={powerClutchDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(6.5)}
				/>
				<Composition
					id="TrapChaos"
					component={() => (
						<Wrap>
							<TrapChaos {...trapChaosDefaultProps} />
						</Wrap>
					)}
					schema={trapChaosSchema}
					defaultProps={trapChaosDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(6)}
				/>
				<Composition
					id="NearMiss"
					component={() => (
						<Wrap>
							<NearMiss {...nearMissDefaultProps} />
						</Wrap>
					)}
					schema={nearMissSchema}
					defaultProps={nearMissDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(6)}
				/>
				<Composition
					id="BreakEvenSweat"
					component={() => (
						<Wrap>
							<BreakEvenSweat {...breakEvenSweatDefaultProps} />
						</Wrap>
					)}
					schema={breakEvenSweatSchema}
					defaultProps={breakEvenSweatDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(5)}
				/>
				<Composition
					id="TheDisaster"
					component={() => (
						<Wrap>
							<TheDisaster {...theDisasterDefaultProps} />
						</Wrap>
					)}
					schema={theDisasterSchema}
					defaultProps={theDisasterDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(4)}
				/>
				<Composition
					id="MirrorFlip"
					component={() => (
						<Wrap>
							<MirrorFlip {...mirrorFlipDefaultProps} />
						</Wrap>
					)}
					schema={mirrorFlipSchema}
					defaultProps={mirrorFlipDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(5)}
				/>
				<Composition
					id="GreedyPlacement"
					component={() => (
						<Wrap>
							<GreedyPlacement {...greedyPlacementDefaultProps} />
						</Wrap>
					)}
					schema={greedyPlacementSchema}
					defaultProps={greedyPlacementDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(5)}
				/>
				<Composition
					id="MultiplierRun"
					component={() => (
						<Wrap>
							<MultiplierRun {...multiplierRunDefaultProps} />
						</Wrap>
					)}
					schema={multiplierRunSchema}
					defaultProps={multiplierRunDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(7)}
				/>
				<Composition
					id="GameNFT"
					component={() => (
						<Wrap>
							<GameNFT {...gameNFTDefaultProps} />
						</Wrap>
					)}
					schema={gameNFTSchema}
					defaultProps={gameNFTDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(6)}
				/>
				<Composition
					id="LateGameSqueeze"
					component={() => (
						<Wrap>
							<LateGameSqueeze {...lateGameSqueezeDefaultProps} />
						</Wrap>
					)}
					schema={lateGameSqueezeSchema}
					defaultProps={lateGameSqueezeDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(6)}
				/>
				<Composition
					id="DoublePowerTurn"
					component={() => (
						<Wrap>
							<DoublePowerTurn {...doublePowerTurnDefaultProps} />
						</Wrap>
					)}
					schema={doublePowerTurnSchema}
					defaultProps={doublePowerTurnDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(5)}
				/>
				<Composition
					id="TheSkip"
					component={() => (
						<Wrap>
							<TheSkip {...theSkipDefaultProps} />
						</Wrap>
					)}
					schema={theSkipSchema}
					defaultProps={theSkipDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(4)}
				/>
				<Composition
					id="TrapIntoSave"
					component={() => (
						<Wrap>
							<TrapIntoSave {...trapIntoSaveDefaultProps} />
						</Wrap>
					)}
					schema={trapIntoSaveSchema}
					defaultProps={trapIntoSaveDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(6)}
				/>
			</Folder>

			<Folder name="Progression">
				<Composition
					id="HiddenAchievement"
					component={() => (
						<Wrap>
							<HiddenAchievement {...hiddenAchievementDefaultProps} />
						</Wrap>
					)}
					schema={hiddenAchievementSchema}
					defaultProps={hiddenAchievementDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(5)}
				/>
				<Composition
					id="GrinderMilestones"
					component={() => (
						<Wrap>
							<GrinderMilestones {...grinderMilestonesDefaultProps} />
						</Wrap>
					)}
					schema={grinderMilestonesSchema}
					defaultProps={grinderMilestonesDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(5)}
				/>
				<Composition
					id="ProfitStreak"
					component={() => (
						<Wrap>
							<ProfitStreak {...profitStreakDefaultProps} />
						</Wrap>
					)}
					schema={profitStreakSchema}
					defaultProps={profitStreakDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(5)}
				/>
				<Composition
					id="FirstProfitableGame"
					component={() => (
						<Wrap>
							<FirstProfitableGame {...firstProfitableGameDefaultProps} />
						</Wrap>
					)}
					schema={firstProfitableGameSchema}
					defaultProps={firstProfitableGameDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(5)}
				/>
				<Composition
					id="LifetimeEarnings"
					component={() => (
						<Wrap>
							<LifetimeEarnings {...lifetimeEarningsDefaultProps} />
						</Wrap>
					)}
					schema={lifetimeEarningsSchema}
					defaultProps={lifetimeEarningsDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(6)}
				/>
				<Composition
					id="DailyDominator"
					component={() => (
						<Wrap>
							<DailyDominator {...dailyDominatorDefaultProps} />
						</Wrap>
					)}
					schema={dailyDominatorSchema}
					defaultProps={dailyDominatorDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(5)}
				/>
				<Composition
					id="WorstGameEver"
					component={() => (
						<Wrap>
							<WorstGameEver {...worstGameEverDefaultProps} />
						</Wrap>
					)}
					schema={worstGameEverSchema}
					defaultProps={worstGameEverDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(4)}
				/>
				<Composition
					id="NewPersonalBest"
					component={() => (
						<Wrap>
							<NewPersonalBest {...newPersonalBestDefaultProps} />
						</Wrap>
					)}
					schema={newPersonalBestSchema}
					defaultProps={newPersonalBestDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(5)}
				/>
			</Folder>

			<Folder name="Economy">
				<Composition
					id="NumsBurnMilestone"
					component={() => (
						<Wrap>
							<NumsBurnMilestone {...numsBurnMilestoneDefaultProps} />
						</Wrap>
					)}
					schema={numsBurnMilestoneSchema}
					defaultProps={numsBurnMilestoneDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(6)}
				/>
				<Composition
					id="BurnVsMintRatio"
					component={() => (
						<Wrap>
							<BurnVsMintRatio {...burnVsMintRatioDefaultProps} />
						</Wrap>
					)}
					schema={burnVsMintRatioSchema}
					defaultProps={burnVsMintRatioDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(5)}
				/>
				<Composition
					id="GamesPlayedMilestone"
					component={() => (
						<Wrap>
							<GamesPlayedMilestone {...gamesPlayedMilestoneDefaultProps} />
						</Wrap>
					)}
					schema={gamesPlayedMilestoneSchema}
					defaultProps={gamesPlayedMilestoneDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(5)}
				/>
				<Composition
					id="TotalNumsPaidOut"
					component={() => (
						<Wrap>
							<TotalNumsPaidOut {...totalNumsPaidOutDefaultProps} />
						</Wrap>
					)}
					schema={totalNumsPaidOutSchema}
					defaultProps={totalNumsPaidOutDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(5)}
				/>
				<Composition
					id="NewPlayerSurge"
					component={() => (
						<Wrap>
							<NewPlayerSurge {...newPlayerSurgeDefaultProps} />
						</Wrap>
					)}
					schema={newPlayerSurgeSchema}
					defaultProps={newPlayerSurgeDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(5)}
				/>
				<Composition
					id="StarterPackSales"
					component={() => (
						<Wrap>
							<StarterPackSales {...starterPackSalesDefaultProps} />
						</Wrap>
					)}
					schema={starterPackSalesSchema}
					defaultProps={starterPackSalesDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(5)}
				/>
				<Composition
					id="RewardRateShift"
					component={() => (
						<Wrap>
							<RewardRateShift {...rewardRateShiftDefaultProps} />
						</Wrap>
					)}
					schema={rewardRateShiftSchema}
					defaultProps={rewardRateShiftDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(5)}
				/>
				<Composition
					id="StakingMilestones"
					component={() => (
						<Wrap>
							<StakingMilestones {...stakingMilestonesDefaultProps} />
						</Wrap>
					)}
					schema={stakingMilestonesSchema}
					defaultProps={stakingMilestonesDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(6)}
				/>
				<Composition
					id="EkuboPoolStats"
					component={() => (
						<Wrap>
							<EkuboPoolStats {...ekuboPoolStatsDefaultProps} />
						</Wrap>
					)}
					schema={ekuboPoolStatsSchema}
					defaultProps={ekuboPoolStatsDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(6)}
				/>
				<Composition
					id="RevenueToggleChange"
					component={() => (
						<Wrap>
							<RevenueToggleChange {...revenueToggleChangeDefaultProps} />
						</Wrap>
					)}
					schema={revenueToggleChangeSchema}
					defaultProps={revenueToggleChangeDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(5)}
				/>
				<Composition
					id="SupplyCrossesTarget"
					component={() => (
						<Wrap>
							<SupplyCrossesTarget {...supplyCrossesTargetDefaultProps} />
						</Wrap>
					)}
					schema={supplyCrossesTargetSchema}
					defaultProps={supplyCrossesTargetDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(6)}
				/>
			</Folder>

			<Folder name="Competitive">
				<Composition
					id="NewChampion"
					component={() => (
						<Wrap>
							<NewChampion {...newChampionDefaultProps} />
						</Wrap>
					)}
					schema={newChampionSchema}
					defaultProps={newChampionDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(6)}
				/>
				<Composition
					id="LeaderboardUpset"
					component={() => (
						<Wrap>
							<LeaderboardUpset {...leaderboardUpsetDefaultProps} />
						</Wrap>
					)}
					schema={leaderboardUpsetSchema}
					defaultProps={leaderboardUpsetDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(5)}
				/>
				<Composition
					id="ReferralMilestones"
					component={() => (
						<Wrap>
							<ReferralMilestones {...referralMilestonesDefaultProps} />
						</Wrap>
					)}
					schema={referralMilestonesSchema}
					defaultProps={referralMilestonesDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(5)}
				/>
				<Composition
					id="ReferralChain"
					component={() => (
						<Wrap>
							<ReferralChain {...referralChainDefaultProps} />
						</Wrap>
					)}
					schema={referralChainSchema}
					defaultProps={referralChainDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(6)}
				/>
				<Composition
					id="GuildPerformance"
					component={() => (
						<Wrap>
							<GuildPerformance {...guildPerformanceDefaultProps} />
						</Wrap>
					)}
					schema={guildPerformanceSchema}
					defaultProps={guildPerformanceDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(5)}
				/>
				<Composition
					id="TournamentResults"
					component={() => (
						<Wrap>
							<TournamentResults {...tournamentResultsDefaultProps} />
						</Wrap>
					)}
					schema={tournamentResultsSchema}
					defaultProps={tournamentResultsDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(7)}
				/>
				<Composition
					id="SeasonOpenClose"
					component={() => (
						<Wrap>
							<SeasonOpenClose {...seasonOpenCloseDefaultProps} />
						</Wrap>
					)}
					schema={seasonOpenCloseSchema}
					defaultProps={seasonOpenCloseDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(6)}
				/>
				<Composition
					id="Rivalry"
					component={() => (
						<Wrap>
							<Rivalry {...rivalryDefaultProps} />
						</Wrap>
					)}
					schema={rivalrySchema}
					defaultProps={rivalryDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(6)}
				/>
			</Folder>

			<Folder name="Social">
				<Composition
					id="ConcurrentPlayers"
					component={() => (
						<Wrap>
							<ConcurrentPlayers {...concurrentPlayersDefaultProps} />
						</Wrap>
					)}
					schema={concurrentPlayersSchema}
					defaultProps={concurrentPlayersDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(4)}
				/>
				<Composition
					id="ToastFeed"
					component={() => (
						<Wrap>
							<ToastFeed {...toastFeedDefaultProps} />
						</Wrap>
					)}
					schema={toastFeedSchema}
					defaultProps={toastFeedDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(5)}
				/>
				<Composition
					id="SharedGameNFT"
					component={() => (
						<Wrap>
							<SharedGameNFT {...sharedGameNFTDefaultProps} />
						</Wrap>
					)}
					schema={sharedGameNFTSchema}
					defaultProps={sharedGameNFTDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(4)}
				/>
				<Composition
					id="PracticeToPaid"
					component={() => (
						<Wrap>
							<PracticeToPaid {...practiceToPaidDefaultProps} />
						</Wrap>
					)}
					schema={practiceToPaidSchema}
					defaultProps={practiceToPaidDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(5)}
				/>
			</Folder>

			<Folder name="Narrative">
				<Composition
					id="ProbabilityStory"
					component={() => (
						<Wrap>
							<ProbabilityStory {...probabilityStoryDefaultProps} />
						</Wrap>
					)}
					schema={probabilityStorySchema}
					defaultProps={probabilityStoryDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(6)}
				/>
				<Composition
					id="FairnessStory"
					component={() => (
						<Wrap>
							<FairnessStory {...fairnessStoryDefaultProps} />
						</Wrap>
					)}
					schema={fairnessStorySchema}
					defaultProps={fairnessStoryDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(5)}
				/>
				<Composition
					id="NFTTrophyStory"
					component={() => (
						<Wrap>
							<NFTTrophyStory {...nftTrophyStoryDefaultProps} />
						</Wrap>
					)}
					schema={nftTrophyStorySchema}
					defaultProps={nftTrophyStoryDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(6)}
				/>
				<Composition
					id="OneMoreGame"
					component={() => (
						<Wrap>
							<OneMoreGame {...oneMoreGameDefaultProps} />
						</Wrap>
					)}
					schema={oneMoreGameSchema}
					defaultProps={oneMoreGameDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(5)}
				/>
				<Composition
					id="PlayerSpotlight"
					component={() => (
						<Wrap>
							<PlayerSpotlight {...playerSpotlightDefaultProps} />
						</Wrap>
					)}
					schema={playerSpotlightSchema}
					defaultProps={playerSpotlightDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(7)}
				/>
				<Composition
					id="DeflationaryStory"
					component={() => (
						<Wrap>
							<DeflationaryStory {...deflationaryStoryDefaultProps} />
						</Wrap>
					)}
					schema={deflationaryStorySchema}
					defaultProps={deflationaryStoryDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(6)}
				/>
				<Composition
					id="BuilderStory"
					component={() => (
						<Wrap>
							<BuilderStory {...builderStoryDefaultProps} />
						</Wrap>
					)}
					schema={builderStorySchema}
					defaultProps={builderStoryDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(5)}
				/>
				<Composition
					id="DAOStory"
					component={() => (
						<Wrap>
							<DAOStory {...daoStoryDefaultProps} />
						</Wrap>
					)}
					schema={daoStorySchema}
					defaultProps={daoStoryDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(6)}
				/>
			</Folder>

			<Folder name="Config">
				<Composition
					id="ReferralActivation"
					component={() => (
						<Wrap>
							<ReferralActivation {...referralActivationDefaultProps} />
						</Wrap>
					)}
					schema={referralActivationSchema}
					defaultProps={referralActivationDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(4)}
				/>
				<Composition
					id="StakingOpens"
					component={() => (
						<Wrap>
							<StakingOpens {...stakingOpensDefaultProps} />
						</Wrap>
					)}
					schema={stakingOpensSchema}
					defaultProps={stakingOpensDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(5)}
				/>
				<Composition
					id="NewPackTier"
					component={() => (
						<Wrap>
							<NewPackTier {...newPackTierDefaultProps} />
						</Wrap>
					)}
					schema={newPackTierSchema}
					defaultProps={newPackTierDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(5)}
				/>
				<Composition
					id="ShareToClaim"
					component={() => (
						<Wrap>
							<ShareToClaim {...shareToClaimDefaultProps} />
						</Wrap>
					)}
					schema={shareToClaimSchema}
					defaultProps={shareToClaimDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(4)}
				/>
				<Composition
					id="AppStoreLaunch"
					component={() => (
						<Wrap>
							<AppStoreLaunch {...appStoreLaunchDefaultProps} />
						</Wrap>
					)}
					schema={appStoreLaunchSchema}
					defaultProps={appStoreLaunchDefaultProps}
					width={SQUARE_WIDTH}
					height={SQUARE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(5)}
				/>
			</Folder>
		</>
	);
};
