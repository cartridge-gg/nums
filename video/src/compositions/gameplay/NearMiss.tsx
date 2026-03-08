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
import { SceneTransition } from "@video/components/patterns/SceneTransition";
import { seconds } from "@video/lib/timing";
import { punch } from "@video/lib/springs";
import { colors } from "@video/lib/colors";
import { shake, cameraToTransform } from "@video/lib/camera";

export const nearMissSchema = z.object({
	slots: z.array(z.number()).length(18),
	lastNumber: z.number(),
	reward: z.number(),
});

type NearMissProps = z.infer<typeof nearMissSchema>;

const defaultProps: NearMissProps = {
	slots: [
		23, 67, 89, 124, 201, 278, 334, 389, 445, 512, 567, 623, 678, 734, 789, 845,
		901, 0,
	],
	lastNumber: 870,
	reward: 500,
};

export { defaultProps as nearMissDefaultProps };

export const NearMiss: React.FC<NearMissProps> = ({
	slots,
	lastNumber,
	reward,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const act2Start = seconds(2.5);
	const act3Start = seconds(4);
	const outroStart = seconds(5);

	// Camera shake on rejection
	const camera = shake(frame, act3Start, 20, 8);

	// Crack effect progress
	const crackProgress = spring({
		frame: Math.max(0, frame - act3Start),
		fps,
		config: punch,
	});

	// Red vignette
	const vignetteOpacity = interpolate(
		frame,
		[act3Start, act3Start + 15],
		[0, 0.6],
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
				{/* Act 1: Grid fills to 17/18 */}
				<Sequence from={0}>
					<GridFillSequence slots={slots} />
				</Sequence>

				{/* Act 2: Last number reveal */}
				<Sequence from={act2Start}>
					<NumberReveal value={lastNumber} enterFrame={0} emotion="bad" />
				</Sequence>

				{/* Act 3: Rejection flash */}
				<SceneTransition
					type="flash"
					triggerFrame={act3Start}
					duration={10}
					color={colors.red}
				/>

				{/* Crack overlay */}
				{frame >= act3Start && (
					<div
						style={{
							position: "absolute",
							inset: 0,
							opacity: crackProgress * 0.4,
							background: `repeating-linear-gradient(
                ${45 + crackProgress * 10}deg,
                transparent,
                transparent 48%,
                ${colors.red} 48%,
                ${colors.red} 52%,
                transparent 52%
              )`,
							pointerEvents: "none",
							zIndex: 100,
						}}
					/>
				)}

				{/* SO CLOSE text */}
				<Sequence from={act3Start + 10}>
					<EmotionText text="SO CLOSE" color={colors.red} fontSize={80} />
				</Sequence>

				{/* Reward (small consolation) */}
				<Sequence from={outroStart}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 32,
							color: colors.mauve,
							opacity: interpolate(frame - outroStart, [0, 15], [0, 0.8], {
								extrapolateRight: "clamp",
							}),
							textAlign: "center",
						}}
					>
						+{reward} LORDS
					</div>
				</Sequence>
			</div>

			{/* Red vignette overlay */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					background: `radial-gradient(ellipse at 50% 50%, transparent 30%, ${colors.red} 100%)`,
					opacity: vignetteOpacity,
					pointerEvents: "none",
					zIndex: 50,
				}}
			/>
		</SquareLayout>
	);
};
