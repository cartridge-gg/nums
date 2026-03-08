import {
	useCurrentFrame,
	useVideoConfig,
	spring,
	interpolate,
	Sequence,
} from "remotion";
import { z } from "zod";
import { SquareLayout } from "@video/components/layouts/SquareLayout";
import { CounterRollUp } from "@video/components/patterns/CounterRollUp";
import { MilestoneReveal } from "@video/components/patterns/MilestoneReveal";
import { EmotionText } from "@video/components/enhanced/EmotionText";
import { seconds } from "@video/lib/timing";
import { dramatic, punch } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

export const grinderMilestonesSchema = z.object({
	milestone: z.number(),
	tier: z.enum(["bronze", "silver", "gold", "diamond"]),
});

type GrinderMilestonesProps = z.infer<typeof grinderMilestonesSchema>;

const defaultProps: GrinderMilestonesProps = {
	milestone: 100,
	tier: "gold",
};

export { defaultProps as grinderMilestonesDefaultProps };

const TIER_COLORS: Record<string, string> = {
	bronze: "#CD7F32",
	silver: "#C0C0C0",
	gold: colors.yellow,
	diamond: colors.blue,
};

const TIER_GLOWS: Record<string, string> = {
	bronze: "#CD7F3244",
	silver: "#C0C0C044",
	gold: `${colors.yellow}44`,
	diamond: `${colors.blue}44`,
};

export const GrinderMilestones: React.FC<GrinderMilestonesProps> = ({
	milestone,
	tier,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// Act timings (5s = 150 frames)
	const countStart = seconds(0.5);
	const lockStart = seconds(2.5);
	const badgeStart = seconds(3);
	const textStart = seconds(3.8);

	const tierColor = TIER_COLORS[tier] || colors.yellow;
	const tierGlow = TIER_GLOWS[tier] || `${colors.yellow}44`;

	// Digit lock weight effect
	const lockProgress = spring({
		frame: Math.max(0, frame - lockStart),
		fps,
		config: dramatic,
	});
	const lockScale = interpolate(lockProgress, [0, 0.5, 1], [1, 1.08, 1]);
	const lockY = interpolate(lockProgress, [0, 0.3, 0.6, 1], [0, -8, 4, 0]);

	// Badge materialization
	const badgeProgress = spring({
		frame: Math.max(0, frame - badgeStart),
		fps,
		config: punch,
	});
	const badgeScale = interpolate(
		badgeProgress,
		[0, 0.5, 0.85, 1],
		[0, 1.3, 0.95, 1],
	);
	const badgeOpacity = interpolate(badgeProgress, [0, 0.2], [0, 1], {
		extrapolateRight: "clamp",
	});
	const badgeGlow = interpolate(badgeProgress, [0.4, 0.8, 1], [0, 40, 20], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	return (
		<SquareLayout>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					gap: 32,
					width: "100%",
				}}
			>
				{/* Counter rolling up to milestone */}
				<Sequence from={countStart}>
					<div
						style={{
							transform:
								frame >= lockStart
									? `scale(${lockScale}) translateY(${lockY}px)`
									: undefined,
						}}
					>
						<CounterRollUp
							value={milestone}
							duration={seconds(2)}
							fontSize={120}
							color={colors.white}
						/>
					</div>
				</Sequence>

				{/* Games label */}
				<Sequence from={countStart}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 24,
							color: colors.mauve,
							opacity: 0.7,
							letterSpacing: 4,
						}}
					>
						GAMES PLAYED
					</div>
				</Sequence>

				{/* Badge materialization */}
				{frame >= badgeStart && (
					<MilestoneReveal enterFrame={badgeStart}>
						<div
							style={{
								transform: `scale(${badgeScale})`,
								opacity: badgeOpacity,
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								gap: 8,
							}}
						>
							{/* Badge shape */}
							<div
								style={{
									width: 100,
									height: 100,
									borderRadius: tier === "diamond" ? 0 : "50%",
									transform: tier === "diamond" ? "rotate(45deg)" : undefined,
									backgroundColor: `${tierColor}22`,
									border: `4px solid ${tierColor}`,
									boxShadow: `0 0 ${badgeGlow}px ${tierColor}, inset 0 0 20px ${tierGlow}`,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<div
									style={{
										transform:
											tier === "diamond" ? "rotate(-45deg)" : undefined,
										fontFamily: "PPNeueBit, sans-serif",
										fontWeight: 700,
										fontSize: 36,
										color: tierColor,
									}}
								>
									{tier === "diamond"
										? "D"
										: tier === "gold"
											? "G"
											: tier === "silver"
												? "S"
												: "B"}
								</div>
							</div>
							<div
								style={{
									fontFamily: "PPNeueBit, sans-serif",
									fontSize: 28,
									color: tierColor,
									textShadow: "2px 2px 0px rgba(0, 0, 0, 0.5)",
									textTransform: "uppercase",
									letterSpacing: 4,
								}}
							>
								{tier}
							</div>
						</div>
					</MilestoneReveal>
				)}

				{/* Milestone text */}
				<Sequence from={textStart}>
					<EmotionText text="MILESTONE" color={tierColor} fontSize={72} />
				</Sequence>
			</div>
		</SquareLayout>
	);
};
