import {
	useCurrentFrame,
	useVideoConfig,
	spring,
	interpolate,
	Sequence,
} from "remotion";
import { z } from "zod";
import { SquareLayout } from "@video/components/layouts/SquareLayout";
import { EmotionText } from "@video/components/enhanced/EmotionText";
import { confettiBurst, getParticleAtFrame } from "@video/lib/particles";
import { seconds } from "@video/lib/timing";
import { dramatic } from "@video/lib/springs";
import { colors } from "@video/lib/colors";
import { zoomTo, cameraToTransform } from "@video/lib/camera";

export const worstGameEverSchema = z.object({
	slots: z.array(z.number()),
	score: z.number(),
});

type WorstGameEverProps = z.infer<typeof worstGameEverSchema>;

const defaultProps: WorstGameEverProps = {
	slots: [500, 23, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	score: 2,
};

export { defaultProps as worstGameEverDefaultProps };

export const WorstGameEver: React.FC<WorstGameEverProps> = ({
	slots,
	score,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// Act timings (4s = 120 frames)
	const zoomStart = seconds(0.5);
	const textStart = seconds(1.5);
	const confettiStart = seconds(2);
	const scoreStart = seconds(2.8);

	// Dramatic slow zoom
	const camera = zoomTo(frame, zoomStart, seconds(2), 1.15);

	// Sad gray confetti
	const grayConfetti = confettiBurst(30, 540, 200, 13).map((p) => ({
		...p,
		color: Math.random() > 0.5 ? colors.mauve : `${colors.white}44`,
		vy: p.vy * 0.3 + 2, // Slow, droopy fall
		vx: p.vx * 0.3,
	}));

	// Score wobble for comedy
	const scoreProgress = spring({
		frame: Math.max(0, frame - scoreStart),
		fps,
		config: dramatic,
	});
	const scoreScale = interpolate(
		scoreProgress,
		[0, 0.3, 0.6, 1],
		[0, 1.2, 0.9, 1],
	);

	// Slots placed count
	const slotsPlaced = slots.filter((s) => s > 0).length;

	return (
		<SquareLayout>
			<div
				style={{
					transform: cameraToTransform(camera),
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					gap: 32,
					width: "100%",
					height: "100%",
					position: "relative",
					filter: "saturate(0.3)",
				}}
			>
				{/* Slots placed indicator */}
				<Sequence from={0}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 20,
							color: colors.mauve,
							letterSpacing: 4,
							opacity: 0.5,
						}}
					>
						{slotsPlaced} / {slots.length} PLACED
					</div>
				</Sequence>

				{/* Tiny score display */}
				<Sequence from={scoreStart}>
					<div
						style={{
							transform: `scale(${scoreScale})`,
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: 8,
						}}
					>
						<div
							style={{
								fontFamily: "PPNeueBit, sans-serif",
								fontWeight: 700,
								fontSize: 140,
								color: colors.red,
								textShadow: "4px 4px 0px rgba(0, 0, 0, 0.5)",
							}}
						>
							{score}
						</div>
						<div
							style={{
								fontFamily: "PPNeueBit, sans-serif",
								fontSize: 18,
								color: colors.mauve,
								opacity: 0.5,
							}}
						>
							points
						</div>
					</div>
				</Sequence>

				{/* PERSONAL WORST text */}
				<Sequence from={textStart}>
					<EmotionText text="PERSONAL WORST" color={colors.red} fontSize={64} />
				</Sequence>

				{/* Comedy sub-label */}
				<Sequence from={textStart + 20}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 22,
							color: colors.mauve,
							opacity: interpolate(frame - textStart - 20, [0, 15], [0, 0.6], {
								extrapolateRight: "clamp",
							}),
							textAlign: "center",
						}}
					>
						it can only go up from here
					</div>
				</Sequence>
			</div>

			{/* Sad gray confetti (falls slowly) */}
			{frame >= confettiStart &&
				grayConfetti.map((p) => {
					const state = getParticleAtFrame(p, frame, confettiStart, 50, 0.1);
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
								opacity: state.opacity * 0.4,
								transform: `rotate(${state.rotation}deg)`,
								borderRadius: 1,
							}}
						/>
					);
				})}
		</SquareLayout>
	);
};
