import { useCurrentFrame, interpolate, Sequence } from "remotion";
import { z } from "zod";
import { SquareLayout } from "@video/components/layouts/SquareLayout";
import { GridFillSequence } from "@video/components/patterns/GridFillSequence";
import { NumberReveal } from "@video/components/patterns/NumberReveal";
import { EmotionText } from "@video/components/enhanced/EmotionText";
import { MilestoneReveal } from "@video/components/patterns/MilestoneReveal";
import { seconds } from "@video/lib/timing";
import { colors } from "@video/lib/colors";
import { zoomTo, cameraToTransform } from "@video/lib/camera";

export const lateGameSqueezeSchema = z.object({
	slots: z.array(z.number()),
	lateNumbers: z.array(z.number()),
});

type LateGameSqueezeProps = z.infer<typeof lateGameSqueezeSchema>;

const defaultProps: LateGameSqueezeProps = {
	slots: [
		23, 67, 89, 124, 201, 278, 334, 389, 445, 512, 567, 623, 678, 734, 0, 0, 0,
		0,
	],
	lateNumbers: [790, 850, 910, 960],
};

export { defaultProps as lateGameSqueezeDefaultProps };

export const LateGameSqueeze: React.FC<LateGameSqueezeProps> = ({
	slots,
	lateNumbers,
}) => {
	const frame = useCurrentFrame();

	const squeezeStart = seconds(1);
	const revealsStart = seconds(2);
	const outroStart = seconds(5);

	// Camera zooms tight
	const camera = zoomTo(frame, squeezeStart, seconds(1), 1.3);

	// Slow-mo factor for reveals
	const revealInterval = seconds(0.7);

	// Vignette tightens
	const vignetteSize = interpolate(
		frame,
		[squeezeStart, revealsStart + seconds(2)],
		[80, 40],
		{ extrapolateLeft: "clamp", extrapolateRight: "clamp" },
	);

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
				{/* Grid */}
				<Sequence from={0}>
					<GridFillSequence slots={slots} />
				</Sequence>

				{/* Late number reveals one by one */}
				{[...lateNumbers.entries()].map(([i, num]) => (
					<Sequence key={num} from={revealsStart + i * revealInterval}>
						<MilestoneReveal enterFrame={0}>
							<NumberReveal
								value={num}
								enterFrame={0}
								emotion={i === lateNumbers.length - 1 ? "great" : "good"}
							/>
						</MilestoneReveal>
					</Sequence>
				))}

				{/* Slot count */}
				{[...lateNumbers.entries()].map(([i, num]) => {
					const revealFrame = revealsStart + i * revealInterval;
					const filledCount = slots.filter((s) => s > 0).length + i + 1;
					return (
						frame >= revealFrame && (
							<Sequence key={`label-${num}`} from={revealFrame + 10}>
								<div
									style={{
										fontFamily: "PPNeueBit, sans-serif",
										fontSize: 18,
										color: colors.mauve,
										opacity: interpolate(
											frame - revealFrame - 10,
											[0, 8, revealInterval - 5, revealInterval],
											[0, 0.7, 0.7, 0],
											{ extrapolateRight: "clamp" },
										),
									}}
								>
									{filledCount} / 18
								</div>
							</Sequence>
						)
					);
				})}

				{/* Outro */}
				<Sequence from={outroStart}>
					<EmotionText text="SQUEEZED IN" color={colors.green} fontSize={64} />
				</Sequence>
			</div>

			{/* Tightening vignette */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					background: `radial-gradient(ellipse ${vignetteSize}% ${vignetteSize}% at 50% 50%, transparent 0%, ${colors.black} 100%)`,
					pointerEvents: "none",
					zIndex: 50,
				}}
			/>
		</SquareLayout>
	);
};
