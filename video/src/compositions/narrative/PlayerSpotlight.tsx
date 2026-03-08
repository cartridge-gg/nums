import {
	useCurrentFrame,
	useVideoConfig,
	spring,
	interpolate,
	Sequence,
} from "remotion";
import { z } from "zod";
import { SquareLayout } from "@video/components/layouts/SquareLayout";
import { EmotionText } from "@video/components/enhanced/EmotionText";
import { MilestoneReveal } from "@video/components/patterns/MilestoneReveal";
import { CounterRollUp } from "@video/components/patterns/CounterRollUp";
import { seconds } from "@video/lib/timing";
import { dramatic, punch } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

export const playerSpotlightSchema = z.object({
	playerName: z.string(),
	achievements: z.array(z.string()),
	bestScore: z.number(),
});

type PlayerSpotlightProps = z.infer<typeof playerSpotlightSchema>;

const defaultProps: PlayerSpotlightProps = {
	playerName: "Legend99",
	achievements: ["Perfect Game", "10 Win Streak", "Power Master"],
	bestScore: 25000,
};

export { defaultProps as playerSpotlightDefaultProps };

export const PlayerSpotlight: React.FC<PlayerSpotlightProps> = ({
	playerName,
	achievements,
	bestScore,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const profileStart = seconds(0.5);
	const achieveStart = seconds(2);
	const scoreStart = seconds(4);
	const outroStart = seconds(5.5);

	// Profile entrance
	const profileProgress = spring({
		frame: Math.max(0, frame - profileStart),
		fps,
		config: dramatic,
	});
	const profileScale = interpolate(profileProgress, [0, 1], [0.6, 1]);

	return (
		<SquareLayout>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 28,
					width: "100%",
				}}
			>
				{/* Player profile */}
				<Sequence from={profileStart}>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: 12,
							transform: `scale(${profileScale})`,
							opacity: profileProgress,
						}}
					>
						{/* Avatar circle */}
						<div
							style={{
								width: 80,
								height: 80,
								borderRadius: "50%",
								backgroundColor: `${colors.purple}33`,
								border: `3px solid ${colors.purple}`,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontFamily: "Circular-LL, sans-serif",
								fontSize: 32,
								color: colors.purple,
								fontWeight: 700,
								boxShadow: `0 0 30px ${colors.purple}44`,
							}}
						>
							{playerName.charAt(0).toUpperCase()}
						</div>
						<div
							style={{
								fontFamily: "Circular-LL, sans-serif",
								fontSize: 28,
								color: colors.white,
								fontWeight: 700,
							}}
						>
							{playerName}
						</div>
					</div>
				</Sequence>

				{/* Achievement badges */}
				<Sequence from={achieveStart}>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: 10,
						}}
					>
						{[...achievements.entries()].map(([i, achievement]) => {
							const badgeDelay = achieveStart + i * seconds(0.4);
							const badgeProgress = spring({
								frame: Math.max(0, frame - badgeDelay),
								fps,
								config: punch,
							});
							const badgeScale = interpolate(
								badgeProgress,
								[0, 0.5, 1],
								[0, 1.1, 1],
							);

							return (
								<div
									key={i}
									style={{
										transform: `scale(${badgeScale})`,
										opacity: badgeProgress,
										background: `${colors.yellow}11`,
										border: `1px solid ${colors.yellow}44`,
										borderRadius: 8,
										padding: "6px 20px",
										fontFamily: "PPNeueBit, sans-serif",
										fontSize: 18,
										color: colors.yellow,
									}}
								>
									{achievement}
								</div>
							);
						})}
					</div>
				</Sequence>

				{/* Best score */}
				<Sequence from={scoreStart}>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: 4,
						}}
					>
						<div
							style={{
								fontFamily: "PPNeueBit, sans-serif",
								fontSize: 14,
								color: colors.mauve,
								opacity: 0.6,
							}}
						>
							BEST SCORE
						</div>
						<CounterRollUp
							value={bestScore}
							duration={seconds(1.2)}
							fontSize={56}
							color={colors.green}
						/>
					</div>
				</Sequence>

				{/* PLAYER SPOTLIGHT */}
				<Sequence from={outroStart}>
					<MilestoneReveal enterFrame={0}>
						<EmotionText
							text="PLAYER SPOTLIGHT"
							color={colors.yellow}
							fontSize={56}
						/>
					</MilestoneReveal>
				</Sequence>
			</div>
		</SquareLayout>
	);
};
