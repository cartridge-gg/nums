import {
	useCurrentFrame,
	useVideoConfig,
	spring,
	interpolate,
	Sequence,
} from "remotion";
import { z } from "zod";
import { SquareLayout } from "@video/components/layouts/SquareLayout";
import { GridFillSequence } from "@video/components/patterns/GridFillSequence";
import { TensionBar } from "@video/components/patterns/TensionBar";
import { EmotionText } from "@video/components/enhanced/EmotionText";
import { seconds } from "@video/lib/timing";
import { breathe } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

export const breakEvenSweatSchema = z.object({
	slots: z.array(z.number()),
	currentReward: z.number(),
	breakEvenPoint: z.number(),
});

type BreakEvenSweatProps = z.infer<typeof breakEvenSweatSchema>;

const defaultProps: BreakEvenSweatProps = {
	slots: [
		23, 67, 89, 124, 201, 278, 334, 389, 445, 512, 0, 0, 0, 0, 0, 0, 0, 0,
	],
	currentReward: 980,
	breakEvenPoint: 1000,
};

export { defaultProps as breakEvenSweatDefaultProps };

export const BreakEvenSweat: React.FC<BreakEvenSweatProps> = ({
	slots,
	currentReward,
	breakEvenPoint,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const tensionStart = seconds(1);
	const peakStart = seconds(3);
	const outroStart = seconds(4);

	// Heartbeat pulse
	const heartbeat = Math.sin(frame * 0.3) * 0.5 + 0.5;
	const pulseScale = 1 + heartbeat * 0.02;

	// Tension ratio
	const ratio = currentReward / breakEvenPoint;
	const tensionFill = interpolate(
		frame,
		[tensionStart, peakStart],
		[0, ratio],
		{ extrapolateLeft: "clamp", extrapolateRight: "clamp" },
	);

	// Heartbeat vignette
	const vignetteOpacity =
		interpolate(frame, [tensionStart, peakStart], [0, 0.3], {
			extrapolateLeft: "clamp",
			extrapolateRight: "clamp",
		}) *
		(0.7 + heartbeat * 0.3);

	// Result
	const survived = currentReward >= breakEvenPoint;
	const resultText = survived ? "BREAK EVEN" : "SO CLOSE";
	const resultColor = survived ? colors.green : colors.red;

	// Result entrance
	const resultProgress = spring({
		frame: Math.max(0, frame - outroStart),
		fps,
		config: breathe,
	});

	return (
		<SquareLayout>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 24,
					width: "100%",
					transform: `scale(${pulseScale})`,
				}}
			>
				{/* Grid */}
				<Sequence from={0}>
					<GridFillSequence slots={slots} />
				</Sequence>

				{/* Tension bar crawling toward break-even */}
				<Sequence from={tensionStart}>
					<TensionBar
						progress={tensionFill}
						duration={seconds(2)}
						label="BREAK-EVEN THRESHOLD"
					/>
				</Sequence>

				{/* Reward counter */}
				<Sequence from={tensionStart}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 48,
							color: tensionFill >= 0.95 ? colors.yellow : colors.white,
							textAlign: "center",
							opacity: interpolate(frame - tensionStart, [0, 10], [0, 1], {
								extrapolateRight: "clamp",
							}),
						}}
					>
						{Math.floor(tensionFill * breakEvenPoint)} / {breakEvenPoint}
					</div>
				</Sequence>

				{/* Result */}
				<Sequence from={outroStart}>
					<div style={{ opacity: resultProgress }}>
						<EmotionText text={resultText} color={resultColor} fontSize={72} />
					</div>
				</Sequence>
			</div>

			{/* Heartbeat vignette */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					background: `radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(247,114,114,${vignetteOpacity}) 100%)`,
					pointerEvents: "none",
				}}
			/>
		</SquareLayout>
	);
};
