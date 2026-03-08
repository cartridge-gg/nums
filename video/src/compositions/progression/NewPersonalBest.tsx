import {
	useCurrentFrame,
	useVideoConfig,
	spring,
	interpolate,
	Sequence,
} from "remotion";
import { z } from "zod";
import { SquareLayout } from "@video/components/layouts/SquareLayout";
import { SplitCompare } from "@video/components/patterns/SplitCompare";
import { EmotionText } from "@video/components/enhanced/EmotionText";
import { confettiBurst, getParticleAtFrame } from "@video/lib/particles";
import { seconds } from "@video/lib/timing";
import { punch } from "@video/lib/springs";
import { colors } from "@video/lib/colors";
import { shake, cameraToTransform } from "@video/lib/camera";

export const newPersonalBestSchema = z.object({
	oldBest: z.number(),
	newBest: z.number(),
	category: z.string(),
});

type NewPersonalBestProps = z.infer<typeof newPersonalBestSchema>;

const defaultProps: NewPersonalBestProps = {
	oldBest: 12500,
	newBest: 18700,
	category: "High Score",
};

export { defaultProps as newPersonalBestDefaultProps };

export const NewPersonalBest: React.FC<NewPersonalBestProps> = ({
	oldBest,
	newBest,
	category,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// Act timings (5s = 150 frames)
	const splitStart = seconds(0.5);
	const shatterStart = seconds(2.5);
	const textStart = seconds(3);
	const confettiStart = seconds(3.2);

	// Old side shatter effect
	const shatterProgress = spring({
		frame: Math.max(0, frame - shatterStart),
		fps,
		config: punch,
	});

	// Camera shake on shatter
	const shatterCamera = shake(frame, shatterStart, 12, 10);

	// Old value fades/shatters, new value takes over
	const oldOpacity = interpolate(shatterProgress, [0, 0.5], [1, 0], {
		extrapolateRight: "clamp",
	});
	const newScale = interpolate(shatterProgress, [0.3, 0.7, 1], [1, 1.15, 1], {
		extrapolateLeft: "clamp",
	});

	// Confetti
	const particles = confettiBurst(60, 540, 540, 21);

	// Old value display (muted)
	const oldDisplay = (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: 12,
				opacity: frame >= shatterStart ? oldOpacity : 1,
				transform:
					frame >= shatterStart
						? `scale(${interpolate(shatterProgress, [0, 0.5], [1, 0.7], { extrapolateRight: "clamp" })}) rotate(${interpolate(shatterProgress, [0, 0.5], [0, -5], { extrapolateRight: "clamp" })}deg)`
						: undefined,
			}}
		>
			<div
				style={{
					fontFamily: "PPNeueBit, sans-serif",
					fontWeight: 700,
					fontSize: 72,
					color: colors.red,
					textShadow: "4px 4px 0px rgba(0, 0, 0, 0.5)",
					filter: "saturate(0.5)",
				}}
			>
				{oldBest.toLocaleString()}
			</div>
		</div>
	);

	// New value display (vibrant)
	const newDisplay = (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: 12,
				transform: frame >= shatterStart ? `scale(${newScale})` : undefined,
			}}
		>
			<div
				style={{
					fontFamily: "PPNeueBit, sans-serif",
					fontWeight: 700,
					fontSize: 72,
					color: colors.green,
					textShadow: `0 0 20px ${colors.green}44, 4px 4px 0px rgba(0, 0, 0, 0.5)`,
				}}
			>
				{newBest.toLocaleString()}
			</div>
		</div>
	);

	return (
		<SquareLayout>
			<div
				style={{
					transform: cameraToTransform(shatterCamera),
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					gap: 24,
					width: "100%",
					height: "100%",
					position: "relative",
				}}
			>
				{/* Category label */}
				<Sequence from={0}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 22,
							color: colors.mauve,
							letterSpacing: 4,
							opacity: interpolate(frame, [0, 15], [0, 0.7], {
								extrapolateRight: "clamp",
							}),
							textTransform: "uppercase",
						}}
					>
						{category}
					</div>
				</Sequence>

				{/* Split comparison */}
				<Sequence from={splitStart}>
					<div style={{ width: 800, height: 300 }}>
						<SplitCompare
							left={oldDisplay}
							right={newDisplay}
							leftLabel="OLD BEST"
							rightLabel="NEW BEST"
							splitFrame={0}
						/>
					</div>
				</Sequence>

				{/* NEW BEST text */}
				<Sequence from={textStart}>
					<EmotionText text="NEW BEST" color={colors.green} fontSize={88} />
				</Sequence>

				{/* Improvement delta */}
				<Sequence from={textStart + 15}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 32,
							color: colors.green,
							opacity: interpolate(frame - textStart - 15, [0, 15], [0, 0.8], {
								extrapolateRight: "clamp",
							}),
							textShadow: "2px 2px 0px rgba(0, 0, 0, 0.5)",
						}}
					>
						+{(newBest - oldBest).toLocaleString()}
					</div>
				</Sequence>
			</div>

			{/* Confetti */}
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
