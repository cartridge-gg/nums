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
import { SceneTransition } from "@video/components/patterns/SceneTransition";
import { BurnDissolve } from "@video/components/patterns/BurnDissolve";
import { seconds } from "@video/lib/timing";
import { punch } from "@video/lib/springs";
import { colors } from "@video/lib/colors";
import { slam, cameraToTransform } from "@video/lib/camera";

export const theDisasterSchema = z.object({
	slots: z.array(z.number()),
	reward: z.number(),
});

type TheDisasterProps = z.infer<typeof theDisasterSchema>;

const defaultProps: TheDisasterProps = {
	slots: [23, 67, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	reward: 50,
};

export { defaultProps as theDisasterDefaultProps };

export const TheDisaster: React.FC<TheDisasterProps> = ({ slots, reward }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const bustFrame = seconds(1.5);
	const outroStart = seconds(2.5);

	// Camera slam on bust
	const camera = slam(frame, bustFrame, 15, 1.2);

	// Grid tilt for comic effect
	const tiltProgress = spring({
		frame: Math.max(0, frame - bustFrame),
		fps,
		config: punch,
	});
	const tilt = interpolate(tiltProgress, [0, 1], [0, -3]);

	// Grid fade
	const gridOpacity = interpolate(
		frame,
		[bustFrame + 10, bustFrame + 30],
		[1, 0.3],
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
				{/* Grid fills fast then stops */}
				<Sequence from={0}>
					<div
						style={{
							transform: `rotate(${tilt}deg)`,
							opacity: gridOpacity,
						}}
					>
						<BurnDissolve
							startFrame={bustFrame}
							duration={seconds(1)}
							width={400}
							height={300}
						>
							<GridFillSequence slots={slots} />
						</BurnDissolve>
					</div>
				</Sequence>

				{/* Bust flash */}
				<SceneTransition
					type="flash"
					triggerFrame={bustFrame}
					duration={6}
					color={colors.red}
				/>

				{/* DISASTER text */}
				<Sequence from={bustFrame + 8}>
					<EmotionText text="DISASTER" color={colors.red} fontSize={88} />
				</Sequence>

				{/* Tiny reward for comic effect */}
				<Sequence from={outroStart}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 28,
							color: colors.mauve,
							opacity: interpolate(frame - outroStart, [0, 10], [0, 0.7], {
								extrapolateRight: "clamp",
							}),
							textAlign: "center",
						}}
					>
						+{reward} LORDS
					</div>
				</Sequence>

				{/* Comic "oof" stat */}
				<Sequence from={outroStart + 15}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 20,
							color: colors.red,
							opacity: interpolate(frame - outroStart - 15, [0, 10], [0, 0.5], {
								extrapolateRight: "clamp",
							}),
						}}
					>
						{slots.filter((s) => s > 0).length} / 18 slots filled
					</div>
				</Sequence>
			</div>
		</SquareLayout>
	);
};
