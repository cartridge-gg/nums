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
import { EmotionText } from "@video/components/enhanced/EmotionText";
import { getParticleAtFrame, embers } from "@video/lib/particles";
import { seconds } from "@video/lib/timing";
import { punch } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

export const profitStreakSchema = z.object({
	streakCount: z.number(),
	totalProfit: z.number(),
});

type ProfitStreakProps = z.infer<typeof profitStreakSchema>;

const defaultProps: ProfitStreakProps = {
	streakCount: 7,
	totalProfit: 42000,
};

export { defaultProps as profitStreakDefaultProps };

export const ProfitStreak: React.FC<ProfitStreakProps> = ({
	streakCount,
	totalProfit,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// Act timings (5s = 150 frames)
	const buildStart = seconds(0.3);
	const fireStart = seconds(2);
	const textStart = seconds(3);
	const profitStart = seconds(3.8);

	// Fire trail embers
	const fireParticles = embers(40, 1080, 1080, 77);

	// Flame bar progression
	const flameCount = Math.min(
		streakCount,
		Math.floor(
			interpolate(frame, [buildStart, fireStart], [0, streakCount], {
				extrapolateLeft: "clamp",
				extrapolateRight: "clamp",
			}),
		),
	);

	// Fire intensity ramp
	const fireIntensity = interpolate(
		frame,
		[buildStart, fireStart + seconds(0.5)],
		[0, 1],
		{ extrapolateLeft: "clamp", extrapolateRight: "clamp" },
	);

	// Counter bounce per flame
	const counterProgress = spring({
		frame: Math.max(0, frame - fireStart),
		fps,
		config: punch,
	});
	const counterScale = interpolate(counterProgress, [0, 0.5, 1], [1, 1.15, 1]);

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
					height: "100%",
					position: "relative",
				}}
			>
				{/* Streak counter */}
				<Sequence from={buildStart}>
					<div
						style={{
							transform: `scale(${counterScale})`,
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: 8,
						}}
					>
						<div
							style={{
								fontFamily: "PPNeueBit, sans-serif",
								fontSize: 16,
								color: colors.mauve,
								letterSpacing: 4,
								opacity: 0.7,
							}}
						>
							WIN STREAK
						</div>
						<div
							style={{
								fontFamily: "PPNeueBit, sans-serif",
								fontWeight: 700,
								fontSize: 140,
								color: colors.red,
								textShadow: `0 0 ${30 * fireIntensity}px ${colors.red}88, 4px 4px 0px rgba(0, 0, 0, 0.5)`,
							}}
						>
							{flameCount}
						</div>
					</div>
				</Sequence>

				{/* Flame bar */}
				<Sequence from={buildStart}>
					<div
						style={{
							display: "flex",
							gap: 8,
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						{Array.from({ length: streakCount }, (_, i) => i).map((i) => {
							const isLit = i < flameCount;
							const flickerOffset = Math.sin(frame * 0.3 + i * 1.5) * 0.15;
							return (
								<div
									key={i}
									style={{
										width: 32,
										height: 48,
										borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
										backgroundColor: isLit ? colors.red : `${colors.mauve}33`,
										opacity: isLit ? 0.8 + flickerOffset : 0.3,
										boxShadow: isLit ? `0 0 12px ${colors.red}88` : "none",
										transition: "all 0.1s",
										transform: isLit
											? `scaleY(${1 + flickerOffset * 0.3})`
											: "scaleY(1)",
									}}
								/>
							);
						})}
					</div>
				</Sequence>

				{/* ON FIRE text */}
				<Sequence from={textStart}>
					<EmotionText text="ON FIRE" color={colors.red} fontSize={88} />
				</Sequence>

				{/* Total profit counter */}
				<Sequence from={profitStart}>
					<CounterRollUp
						value={totalProfit}
						duration={seconds(1)}
						fontSize={48}
						color={colors.yellow}
						prefix="+"
					/>
				</Sequence>
			</div>

			{/* Fire embers */}
			{frame >= fireStart &&
				fireParticles.map((p) => {
					const state = getParticleAtFrame(p, frame, fireStart, 80, -0.15);
					return (
						<div
							key={p.id}
							style={{
								position: "absolute",
								left: state.x,
								top: state.y,
								width: state.size,
								height: state.size,
								borderRadius: "50%",
								backgroundColor: p.color,
								opacity: state.opacity * fireIntensity,
								boxShadow: `0 0 4px ${p.color}`,
							}}
						/>
					);
				})}
		</SquareLayout>
	);
};
