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
import { punch } from "@video/lib/springs";
import { colors } from "@video/lib/colors";
import { shake, cameraToTransform } from "@video/lib/camera";

export const dailyDominatorSchema = z.object({
	tasks: z.array(z.string()),
	completedCount: z.number(),
});

type DailyDominatorProps = z.infer<typeof dailyDominatorSchema>;

const defaultProps: DailyDominatorProps = {
	tasks: [
		"Play 5 games",
		"Win 3 games",
		"Use a power-up",
		"Get a streak of 2",
		"Earn 1000 NUMS",
		"Place all 18",
		"Trigger a trap",
		"Score 500+",
		"Use reroll",
		"Complete daily",
	],
	completedCount: 10,
};

export { defaultProps as dailyDominatorDefaultProps };

export const DailyDominator: React.FC<DailyDominatorProps> = ({
	tasks,
	completedCount,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// Act timings (5s = 150 frames)
	const tickInterval = seconds(0.3); // 9 frames per tick
	const allDoneFrame = tickInterval * Math.min(completedCount, tasks.length);
	const shatterStart = allDoneFrame + seconds(0.3);
	const textStart = shatterStart + seconds(0.3);

	const isPerfect = completedCount >= tasks.length;

	// Shatter effect
	const shatterProgress = isPerfect
		? spring({
				frame: Math.max(0, frame - shatterStart),
				fps,
				config: punch,
			})
		: 0;

	// Camera shake on shatter
	const shatterCamera = isPerfect
		? shake(frame, shatterStart, 15, 12)
		: { x: 0, y: 0, scale: 1, rotation: 0 };

	// Confetti for perfect completion
	const particles = confettiBurst(60, 540, 540, 55);

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
				{/* Header */}
				<Sequence from={0}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 20,
							color: colors.mauve,
							letterSpacing: 4,
							opacity: 0.7,
						}}
					>
						DAILY CHALLENGES
					</div>
				</Sequence>

				{/* Checklist */}
				<Sequence from={0}>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: 6,
							width: 400,
							opacity: isPerfect
								? interpolate(shatterProgress, [0, 0.3, 0.8], [1, 1, 0], {
										extrapolateRight: "clamp",
									})
								: 1,
							transform:
								isPerfect && shatterProgress > 0.3
									? `scale(${interpolate(shatterProgress, [0.3, 1], [1, 0.5], { extrapolateRight: "clamp" })}) rotate(${interpolate(shatterProgress, [0.3, 1], [0, 5], { extrapolateRight: "clamp" })}deg)`
									: undefined,
						}}
					>
						{[...tasks.entries()].map(([i, task]) => {
							const tickFrame = i * tickInterval;
							const isChecked = i < completedCount && frame >= tickFrame;

							const checkProgress = spring({
								frame: Math.max(0, frame - tickFrame),
								fps,
								config: punch,
							});
							const checkScale = interpolate(
								checkProgress,
								[0, 0.5, 1],
								[0, 1.3, 1],
							);

							return (
								<div
									key={i}
									style={{
										display: "flex",
										alignItems: "center",
										gap: 12,
										fontFamily: "PPNeueBit, sans-serif",
										fontSize: 18,
										color: isChecked ? colors.green : colors.mauve,
										opacity: isChecked ? 1 : 0.4,
									}}
								>
									{/* Checkbox */}
									<div
										style={{
											width: 22,
											height: 22,
											borderRadius: 4,
											border: `2px solid ${isChecked ? colors.green : colors.mauve}44`,
											backgroundColor: isChecked
												? `${colors.green}22`
												: "transparent",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											transform: `scale(${isChecked ? checkScale : 1})`,
											flexShrink: 0,
										}}
									>
										{isChecked && (
											<span style={{ fontSize: 14, color: colors.green }}>
												✓
											</span>
										)}
									</div>
									<span
										style={{
											textDecoration: isChecked ? "line-through" : "none",
										}}
									>
										{task}
									</span>
								</div>
							);
						})}
					</div>
				</Sequence>

				{/* Counter */}
				<Sequence from={0}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 28,
							color:
								isPerfect && frame >= allDoneFrame
									? colors.yellow
									: colors.white,
							textShadow: "2px 2px 0px rgba(0, 0, 0, 0.5)",
						}}
					>
						{Math.min(
							completedCount,
							Math.floor(
								interpolate(frame, [0, allDoneFrame], [0, completedCount], {
									extrapolateLeft: "clamp",
									extrapolateRight: "clamp",
								}),
							),
						)}
						/{tasks.length}
					</div>
				</Sequence>

				{/* DOMINATOR text */}
				{isPerfect && frame >= textStart && (
					<Sequence from={textStart}>
						<EmotionText text="DOMINATOR" color={colors.yellow} fontSize={80} />
					</Sequence>
				)}
			</div>

			{/* Confetti on shatter */}
			{isPerfect &&
				frame >= shatterStart &&
				particles.map((p) => {
					const state = getParticleAtFrame(p, frame, shatterStart, 60);
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
