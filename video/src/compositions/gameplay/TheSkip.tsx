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
import { EmotionText } from "@video/components/enhanced/EmotionText";
import { seconds } from "@video/lib/timing";
import { breathe, float } from "@video/lib/springs";
import { colors } from "@video/lib/colors";
import { drift, cameraToTransform } from "@video/lib/camera";

export const theSkipSchema = z.object({
	number: z.number(),
	slots: z.array(z.number()),
});

type TheSkipProps = z.infer<typeof theSkipSchema>;

const defaultProps: TheSkipProps = {
	number: 456,
	slots: [
		23, 67, 89, 124, 201, 278, 334, 450, 460, 512, 567, 623, 678, 0, 0, 0, 0, 0,
	],
};

export { defaultProps as theSkipDefaultProps };

export const TheSkip: React.FC<TheSkipProps> = ({ number, slots }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const revealStart = seconds(0.5);
	const floatStart = seconds(1.5);
	const outroStart = seconds(3);

	// Gentle camera drift for melancholy
	const camera = drift(frame, 0.2, 2);

	// Number floats upward like a balloon
	const floatProgress = spring({
		frame: Math.max(0, frame - floatStart),
		fps,
		config: float,
	});
	const floatY = interpolate(floatProgress, [0, 1], [0, -300]);
	const floatScale = interpolate(floatProgress, [0, 1], [1, 0.4]);
	const floatOpacity = interpolate(floatProgress, [0, 0.6, 1], [1, 0.6, 0]);

	// Number entrance
	const enterProgress = spring({
		frame: Math.max(0, frame - revealStart),
		fps,
		config: breathe,
	});

	return (
		<SquareLayout>
			<div
				style={{
					transform: cameraToTransform(camera),
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 32,
					width: "100%",
				}}
			>
				{/* Grid */}
				<Sequence from={0}>
					<GridFillSequence slots={slots} />
				</Sequence>

				{/* The number that can't fit — floats away */}
				<Sequence from={revealStart}>
					<div
						style={{
							transform: `translateY(${floatY}px) scale(${floatScale})`,
							opacity: frame >= floatStart ? floatOpacity : enterProgress,
							fontFamily: "PPNeueBit, sans-serif",
							fontWeight: 700,
							fontSize: 120,
							color: colors.blue,
							textShadow: `0 0 20px ${colors.blue}40, 4px 4px 0px rgba(0,0,0,0.3)`,
							padding: "16px 40px",
							background: "rgba(127, 200, 248, 0.08)",
							borderRadius: 16,
							border: `2px solid ${colors.blue}40`,
						}}
					>
						{number.toString().padStart(3, "0")}
					</div>
				</Sequence>

				{/* "No valid slot" label */}
				<Sequence from={floatStart}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 20,
							color: colors.red,
							opacity: interpolate(frame - floatStart, [0, 15], [0, 0.6], {
								extrapolateRight: "clamp",
							}),
						}}
					>
						NO VALID SLOT
					</div>
				</Sequence>

				{/* Melancholy outro */}
				<Sequence from={outroStart}>
					<EmotionText text="SKIPPED" color={colors.blue} fontSize={64} />
				</Sequence>

				<Sequence from={outroStart + 15}>
					<div
						style={{
							fontFamily: "Circular-LL, sans-serif",
							fontSize: 16,
							color: colors.mauve,
							opacity: interpolate(frame - outroStart - 15, [0, 15], [0, 0.6], {
								extrapolateRight: "clamp",
							}),
							fontStyle: "italic",
						}}
					>
						Gone forever
					</div>
				</Sequence>
			</div>
		</SquareLayout>
	);
};
