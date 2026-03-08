import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = join(import.meta.dirname, "..", "out");
mkdirSync(OUT_DIR, { recursive: true });

const compositions = [
  // Gameplay
  "PerfectGame",
  "PowerClutch",
  "TrapChaos",
  "NearMiss",
  "BreakEvenSweat",
  "TheDisaster",
  "MirrorFlip",
  "GreedyPlacement",
  "MultiplierRun",
  "GameNFT",
  "LateGameSqueeze",
  "DoublePowerTurn",
  "TheSkip",
  "TrapIntoSave",
  // Progression
  "HiddenAchievement",
  "GrinderMilestones",
  "ProfitStreak",
  "FirstProfitableGame",
  "LifetimeEarnings",
  "DailyDominator",
  "WorstGameEver",
  "NewPersonalBest",
  // Economy
  "NumsBurnMilestone",
  "BurnVsMintRatio",
  "GamesPlayedMilestone",
  "TotalNumsPaidOut",
  "NewPlayerSurge",
  "StarterPackSales",
  "RewardRateShift",
  "StakingMilestones",
  "EkuboPoolStats",
  "RevenueToggleChange",
  "SupplyCrossesTarget",
  // Competitive
  "NewChampion",
  "LeaderboardUpset",
  "ReferralMilestones",
  "ReferralChain",
  "GuildPerformance",
  "TournamentResults",
  "SeasonOpenClose",
  "Rivalry",
  // Social
  "ConcurrentPlayers",
  "ToastFeed",
  "SharedGameNFT",
  "PracticeToPaid",
  // Narrative
  "ProbabilityStory",
  "FairnessStory",
  "NFTTrophyStory",
  "OneMoreGame",
  "PlayerSpotlight",
  "DeflationaryStory",
  "BuilderStory",
  "DAOStory",
  // Config
  "ReferralActivation",
  "StakingOpens",
  "NewPackTier",
  "ShareToClaim",
  "AppStoreLaunch",
];

const target = process.argv[2];
const toRender = target
  ? compositions.filter((c) => c.toLowerCase().includes(target.toLowerCase()))
  : compositions;

console.log(`Rendering ${toRender.length} compositions...`);

for (const comp of toRender) {
  const outPath = join(OUT_DIR, `${comp}.mp4`);
  console.log(`\nRendering ${comp}...`);
  try {
    execSync(`npx remotion render ${comp} ${outPath}`, {
      stdio: "inherit",
      cwd: join(import.meta.dirname, ".."),
    });
    console.log(`Done: ${outPath}`);
  } catch (e) {
    console.error(`Failed to render ${comp}:`, e);
  }
}

console.log("\nAll done!");
