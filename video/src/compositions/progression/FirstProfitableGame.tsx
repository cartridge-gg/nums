import { useCurrentFrame, interpolate, Sequence } from "remotion";
import { z } from "zod";
import { SquareLayout } from "@video/components/layouts/SquareLayout";
import { CounterRollUp } from "@video/components/patterns/CounterRollUp";
import { EmotionText } from "@video/components/enhanced/EmotionText";
import { confettiBurst, getParticleAtFrame } from "@video/lib/particles";
import { seconds } from "@video/lib/timing";
import { colors } from "@video/lib/colors";

export const firstProfitableGameSchema = z.object({
	reward: z.number(),
	playerName: z.string(),
});

type FirstProfitableGameProps = z.infer<typeof firstProfitableGameSchema>;

const defaultProps: FirstProfitableGameProps = {
	reward: 2500,
	playerName: "Player1",
};

export { defaultProps as firstProfitableGameDefaultProps };

export const FirstProfitableGame: React.FC<FirstProfitableGameProps> = ({
	reward,
	playerName,
}) => {
	const frame = useCurrentFrame();

	// Act timings (5s = 150 frames)
	const bloomStart = seconds(1);
	const confettiStart = seconds(2);
	const textStart = seconds(2.5);
	const rewardStart = seconds(3.5);

	// Gray to color bloom
	const saturation = interpolate(
		frame,
		[0, bloomStart, bloomStart + seconds(1)],
		[0, 0, 1],
		{ extrapolateLeft: "clamp", extrapolateRight: "clamp" },
	);

	// Golden glow intensity
	const glowIntensity = interpolate(
		frame,
		[bloomStart, bloomStart + seconds(1.5)],
		[0, 1],
		{ extrapolateLeft: "clamp", extrapolateRight: "clamp" },
	);
	const glowPulse = Math.sin(frame * 0.1) * 0.15 + 0.85;

	// Confetti
	const particles = confettiBurst(50, 540, 540, 33);

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
					filter: `saturate(${saturation})`,
				}}
			>
				{/* Golden glow overlay */}
				<div
					style={{
						position: "absolute",
						inset: 0,
						background: `radial-gradient(circle at 50% 50%, ${colors.yellow}${Math.round(
							glowIntensity * glowPulse * 20,
						)
							.toString(16)
							.padStart(2, "0")} 0%, transparent 70%)`,
						pointerEvents: "none",
					}}
				/>

				{/* Player name */}
				<Sequence from={0}>
					<div
						style={{
							fontFamily: "Circular-LL, sans-serif",
							fontSize: 18,
							color: colors.mauve,
							opacity: 0.7,
						}}
					>
						{playerName}
					</div>
				</Sequence>

				{/* Reward amount reveal */}
				<Sequence from={rewardStart}>
					<CounterRollUp
						value={reward}
						duration={seconds(1)}
						fontSize={80}
						color={colors.yellow}
						prefix="+"
					/>
				</Sequence>

				{/* FIRST WIN text */}
				<Sequence from={textStart}>
					<EmotionText text="FIRST WIN" color={colors.yellow} fontSize={88} />
				</Sequence>

				{/* Warm sub-label */}
				<Sequence from={textStart + 15}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 24,
							color: colors.yellow,
							opacity: interpolate(frame - textStart - 15, [0, 15], [0, 0.7], {
								extrapolateRight: "clamp",
							}),
							textAlign: "center",
							letterSpacing: 2,
						}}
					>
						THE FIRST OF MANY
					</div>
				</Sequence>
			</div>

			{/* First confetti */}
			{frame >= confettiStart &&
				particles.map((p) => {
					const state = getParticleAtFrame(p, frame, confettiStart, 60);
					return (
						<div
							key={p.id}
							style={{
								position: "absolute",
								left: state.x,
								top: state.y,
								width: state.size,
								height: state.size * 0.6,
								backgroundColor: p.color,
								opacity: state.opacity,
								transform: `rotate(${state.rotation}deg)`,
								borderRadius: 1,
							}}
						/>
					);
				})}
		</SquareLayout>
	);
};
