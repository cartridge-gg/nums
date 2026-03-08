import { useCurrentFrame, useVideoConfig, spring, Sequence } from "remotion";
import { z } from "zod";
import { SquareLayout } from "@video/components/layouts/SquareLayout";
import { GridFillSequence } from "@video/components/patterns/GridFillSequence";
import { CounterRollUp } from "@video/components/patterns/CounterRollUp";
import { EmotionText } from "@video/components/enhanced/EmotionText";
import { SceneTransition } from "@video/components/patterns/SceneTransition";
import { confettiBurst, getParticleAtFrame } from "@video/lib/particles";
import { seconds } from "@video/lib/timing";
import { punch, dramatic } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

export const multiplierRunSchema = z.object({
	slots: z.array(z.number()),
	multiplier: z.number(),
	baseReward: z.number(),
});

type MultiplierRunProps = z.infer<typeof multiplierRunSchema>;

const defaultProps: MultiplierRunProps = {
	slots: [
		23, 67, 89, 124, 201, 278, 334, 389, 445, 512, 567, 623, 678, 734, 789, 845,
		901, 956,
	],
	multiplier: 5,
	baseReward: 3000,
};

export { defaultProps as multiplierRunDefaultProps };

export const MultiplierRun: React.FC<MultiplierRunProps> = ({
	slots,
	multiplier,
	baseReward,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const badgeStart = seconds(2.5);
	const splitStart = seconds(4);
	const outroStart = seconds(6);

	const multipliedReward = baseReward * multiplier;

	// Badge pulse
	const badgePulse =
		frame >= badgeStart ? 1 + Math.sin((frame - badgeStart) * 0.5) * 0.08 : 0;

	const badgeProgress = spring({
		frame: Math.max(0, frame - badgeStart),
		fps,
		config: punch,
	});

	// Split reveal
	const splitProgress = spring({
		frame: Math.max(0, frame - splitStart),
		fps,
		config: dramatic,
	});

	// Confetti on final
	const particles = confettiBurst(40, 540, 540, 77);

	return (
		<SquareLayout>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 24,
					width: "100%",
				}}
			>
				{/* Grid */}
				<Sequence from={0}>
					<GridFillSequence slots={slots} />
				</Sequence>

				{/* Multiplier badge */}
				<Sequence from={badgeStart}>
					<div
						style={{
							transform: `scale(${badgeProgress * badgePulse})`,
							fontFamily: "PPNeueBit, sans-serif",
							fontWeight: 700,
							fontSize: 64,
							color: colors.yellow,
							textShadow: `0 0 30px ${colors.yellow}, 4px 4px 0px rgba(0,0,0,0.5)`,
							padding: "12px 32px",
							background: "rgba(255, 200, 0, 0.15)",
							borderRadius: 12,
							border: `3px solid ${colors.yellow}`,
						}}
					>
						{multiplier}x
					</div>
				</Sequence>

				{/* Split comparison: base vs multiplied */}
				<Sequence from={splitStart}>
					<div
						style={{
							display: "flex",
							gap: 48,
							alignItems: "center",
							opacity: splitProgress,
						}}
					>
						{/* Base reward */}
						<div style={{ textAlign: "center" }}>
							<div
								style={{
									fontFamily: "PPNeueBit, sans-serif",
									fontSize: 16,
									color: colors.mauve,
									marginBottom: 8,
								}}
							>
								BASE
							</div>
							<div
								style={{
									fontFamily: "PPNeueBit, sans-serif",
									fontSize: 36,
									color: colors.white,
									opacity: 0.5,
									textDecoration: "line-through",
								}}
							>
								+{baseReward}
							</div>
						</div>

						{/* Arrow */}
						<div
							style={{
								fontFamily: "PPNeueBit, sans-serif",
								fontSize: 36,
								color: colors.yellow,
							}}
						>
							→
						</div>

						{/* Multiplied reward */}
						<div style={{ textAlign: "center" }}>
							<div
								style={{
									fontFamily: "PPNeueBit, sans-serif",
									fontSize: 16,
									color: colors.yellow,
									marginBottom: 8,
								}}
							>
								{multiplier}x MULTIPLIED
							</div>
							<CounterRollUp
								value={multipliedReward}
								duration={seconds(1.5)}
								fontSize={48}
								color={colors.yellow}
								prefix="+"
							/>
						</div>
					</div>
				</Sequence>

				{/* Flash on multiplier */}
				<SceneTransition
					type="flash"
					triggerFrame={badgeStart}
					duration={8}
					color={colors.yellow}
				/>

				{/* Outro */}
				<Sequence from={outroStart}>
					<EmotionText text="AMPLIFIED" color={colors.yellow} fontSize={72} />
				</Sequence>
			</div>

			{/* Confetti */}
			{frame >= outroStart &&
				particles.map((p) => {
					const state = getParticleAtFrame(p, frame, outroStart, 40);
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
