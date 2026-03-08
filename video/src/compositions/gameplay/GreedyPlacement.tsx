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
import { NumberReveal } from "@video/components/patterns/NumberReveal";
import { EmotionText } from "@video/components/enhanced/EmotionText";
import { seconds } from "@video/lib/timing";
import { dramatic } from "@video/lib/springs";
import { colors } from "@video/lib/colors";
import { shake, cameraToTransform } from "@video/lib/camera";

export const greedyPlacementSchema = z.object({
	slots: z.array(z.number()),
	greedyNumber: z.number(),
	slotIndex: z.number(),
});

type GreedyPlacementProps = z.infer<typeof greedyPlacementSchema>;

const defaultProps: GreedyPlacementProps = {
	slots: [
		23, 67, 89, 124, 201, 278, 334, 389, 445, 512, 567, 623, 678, 0, 0, 0, 0, 0,
	],
	greedyNumber: 680,
	slotIndex: 13,
};

export { defaultProps as greedyPlacementDefaultProps };

export const GreedyPlacement: React.FC<GreedyPlacementProps> = ({
	slots,
	greedyNumber,
	slotIndex,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const placeStart = seconds(1.5);
	const wallsStart = seconds(2.5);
	const outroStart = seconds(4);

	// Camera shake when walls close
	const camera = shake(frame, wallsStart, 15, 4);

	// Walls closing from sides
	const wallProgress = spring({
		frame: Math.max(0, frame - wallsStart),
		fps,
		config: dramatic,
	});
	const wallInset = interpolate(wallProgress, [0, 1], [0, 15]);

	// Grid squeeze
	const squeezeScale = interpolate(wallProgress, [0, 1], [1, 0.92]);

	// Danger pulse
	const dangerPulse =
		frame >= wallsStart ? Math.sin((frame - wallsStart) * 0.4) * 0.3 + 0.3 : 0;

	return (
		<SquareLayout>
			<div
				style={{
					transform: cameraToTransform(camera),
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 24,
					width: "100%",
				}}
			>
				{/* Grid with squeeze */}
				<Sequence from={0}>
					<div style={{ transform: `scale(${squeezeScale})` }}>
						<GridFillSequence slots={slots} />
					</div>
				</Sequence>

				{/* Greedy number placement */}
				<Sequence from={placeStart}>
					<NumberReveal value={greedyNumber} enterFrame={0} emotion="bad" />
				</Sequence>

				{/* Slot label */}
				<Sequence from={placeStart + 10}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 18,
							color: colors.red,
							opacity: interpolate(frame - placeStart - 10, [0, 10], [0, 0.7], {
								extrapolateRight: "clamp",
							}),
						}}
					>
						SLOT {slotIndex + 1} — NO ROOM LEFT
					</div>
				</Sequence>

				{/* GREED text */}
				<Sequence from={outroStart}>
					<EmotionText text="GREED" color={colors.red} fontSize={80} />
				</Sequence>
			</div>

			{/* Closing walls (left) */}
			<div
				style={{
					position: "absolute",
					top: 0,
					bottom: 0,
					left: 0,
					width: `${wallInset}%`,
					background: `linear-gradient(to right, ${colors.red}40, transparent)`,
					pointerEvents: "none",
					zIndex: 50,
				}}
			/>
			{/* Closing walls (right) */}
			<div
				style={{
					position: "absolute",
					top: 0,
					bottom: 0,
					right: 0,
					width: `${wallInset}%`,
					background: `linear-gradient(to left, ${colors.red}40, transparent)`,
					pointerEvents: "none",
					zIndex: 50,
				}}
			/>

			{/* Danger vignette pulse */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					border: `4px solid ${colors.red}`,
					borderRadius: 8,
					opacity: dangerPulse,
					pointerEvents: "none",
					zIndex: 60,
				}}
			/>
		</SquareLayout>
	);
};
