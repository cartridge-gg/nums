import { useCurrentFrame, interpolate, Sequence } from "remotion";
import { z } from "zod";
import { SquareLayout } from "@video/components/layouts/SquareLayout";
import { EmotionText } from "@video/components/enhanced/EmotionText";
import { CounterRollUp } from "@video/components/patterns/CounterRollUp";
import { SceneTransition } from "@video/components/patterns/SceneTransition";
import { seconds } from "@video/lib/timing";
import { colors } from "@video/lib/colors";

export const practiceToPaidSchema = z.object({
	firstReward: z.number(),
});

type PracticeToPaidProps = z.infer<typeof practiceToPaidSchema>;

const defaultProps: PracticeToPaidProps = {
	firstReward: 500,
};

export { defaultProps as practiceToPaidDefaultProps };

export const PracticeToPaid: React.FC<PracticeToPaidProps> = ({
	firstReward,
}) => {
	const frame = useCurrentFrame();
	const wipeStart = seconds(1.5);
	const act3Start = seconds(3);
	const outroStart = seconds(4);

	// Grayscale to color wipe
	const wipeDuration = seconds(1.5);
	const wipeProgress = interpolate(
		Math.max(0, frame - wipeStart),
		[0, wipeDuration],
		[0, 100],
		{ extrapolateRight: "clamp" },
	);

	// Practice label fade
	const practiceOpacity = interpolate(frame, [0, wipeStart], [0.8, 0.3], {
		extrapolateRight: "clamp",
	});

	return (
		<SquareLayout>
			{/* Grayscale layer */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					filter: "grayscale(1)",
					clipPath: `inset(0 0 0 ${wipeProgress}%)`,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					gap: 32,
				}}
			>
				<div
					style={{
						fontFamily: "PPNeueBit, sans-serif",
						fontSize: 24,
						color: colors.mauve,
						opacity: practiceOpacity,
					}}
				>
					PRACTICE MODE
				</div>
				<div
					style={{
						width: 200,
						height: 200,
						border: `3px solid ${colors.mauve}`,
						borderRadius: 16,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						fontFamily: "PPNeueBit, sans-serif",
						fontSize: 48,
						color: colors.mauve,
					}}
				>
					FREE
				</div>
			</div>

			{/* Full color layer */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					clipPath: `inset(0 ${100 - wipeProgress}% 0 0)`,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					gap: 32,
				}}
			>
				<div
					style={{
						fontFamily: "PPNeueBit, sans-serif",
						fontSize: 24,
						color: colors.green,
					}}
				>
					PAID MODE
				</div>
				<div
					style={{
						width: 200,
						height: 200,
						border: `3px solid ${colors.green}`,
						borderRadius: 16,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						background: `${colors.green}11`,
						boxShadow: `0 0 30px ${colors.green}22`,
					}}
				>
					<CounterRollUp
						value={firstReward}
						duration={seconds(1)}
						fontSize={48}
						color={colors.green}
						prefix="+"
					/>
				</div>
			</div>

			{/* Color wipe edge glow */}
			<div
				style={{
					position: "absolute",
					top: 0,
					bottom: 0,
					left: `${wipeProgress}%`,
					width: 4,
					backgroundColor: colors.green,
					boxShadow: `0 0 30px ${colors.green}`,
					opacity: wipeProgress > 0 && wipeProgress < 100 ? 0.8 : 0,
					zIndex: 10,
				}}
			/>

			<SceneTransition
				type="flash"
				triggerFrame={act3Start}
				duration={6}
				color={colors.green}
			/>

			{/* LEVEL UP */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "flex-end",
					paddingBottom: 120,
					pointerEvents: "none",
				}}
			>
				<Sequence from={outroStart}>
					<EmotionText text="LEVEL UP" color={colors.yellow} fontSize={80} />
				</Sequence>
			</div>
		</SquareLayout>
	);
};
