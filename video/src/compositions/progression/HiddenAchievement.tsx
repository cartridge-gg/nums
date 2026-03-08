import {
	useCurrentFrame,
	useVideoConfig,
	spring,
	interpolate,
	Sequence,
} from "remotion";
import { z } from "zod";
import { SquareLayout } from "@video/components/layouts/SquareLayout";
import { MilestoneReveal } from "@video/components/patterns/MilestoneReveal";
import { confettiBurst, getParticleAtFrame } from "@video/lib/particles";
import { seconds } from "@video/lib/timing";
import { punch } from "@video/lib/springs";
import { colors } from "@video/lib/colors";
import {
	zoomTo,
	cameraToTransform,
	shake,
	combineCameras,
} from "@video/lib/camera";

export const hiddenAchievementSchema = z.object({
	number: z.number(),
	achievementName: z.string(),
});

type HiddenAchievementProps = z.infer<typeof hiddenAchievementSchema>;

const defaultProps: HiddenAchievementProps = {
	number: 420,
	achievementName: "BLAZE IT",
};

export { defaultProps as hiddenAchievementDefaultProps };

const RAINBOW_COLORS = [
	colors.red,
	colors.yellow,
	colors.green,
	colors.blue,
	colors.purple,
	colors.pink,
];

export const HiddenAchievement: React.FC<HiddenAchievementProps> = ({
	number,
	achievementName,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// Act timings (5s = 150 frames)
	const freezeStart = seconds(0.5);
	const zoomStart = seconds(1);
	const bannerStart = seconds(2);
	const confettiStart = seconds(2.5);

	// Camera: freeze then zoom
	const camera = combineCameras(
		zoomTo(frame, zoomStart, seconds(1), 1.3),
		shake(frame, bannerStart, 10, 8),
	);

	// Rainbow border rotation
	const rainbowAngle = (frame * 4) % 360;
	const showRainbow = frame >= freezeStart;
	const rainbowOpacity = interpolate(
		frame,
		[freezeStart, freezeStart + 15],
		[0, 1],
		{ extrapolateLeft: "clamp", extrapolateRight: "clamp" },
	);

	// Banner slam
	const bannerProgress = spring({
		frame: Math.max(0, frame - bannerStart),
		fps,
		config: punch,
	});
	const bannerScale = interpolate(
		bannerProgress,
		[0, 0.5, 0.85, 1],
		[0, 1.4, 0.95, 1],
	);
	const bannerY = interpolate(bannerProgress, [0, 0.3, 1], [-200, 10, 0]);

	// Confetti
	const particles = confettiBurst(80, 540, 540, 69);

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
				}}
			>
				{/* Rainbow border */}
				{showRainbow && (
					<div
						style={{
							position: "absolute",
							inset: 20,
							borderRadius: 24,
							border: "6px solid transparent",
							backgroundImage: `conic-gradient(from ${rainbowAngle}deg, ${RAINBOW_COLORS.join(", ")}, ${RAINBOW_COLORS[0]})`,
							backgroundOrigin: "border-box",
							backgroundClip: "border-box",
							opacity: rainbowOpacity,
							WebkitMask:
								"linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
							WebkitMaskComposite: "xor",
							maskComposite: "exclude",
							padding: 6,
							pointerEvents: "none",
						}}
					/>
				)}

				{/* Number display */}
				<Sequence from={0}>
					<MilestoneReveal enterFrame={freezeStart}>
						<div
							style={{
								fontFamily: "PPNeueBit, sans-serif",
								fontWeight: 700,
								fontSize: 160,
								color: colors.yellow,
								textShadow: `0 0 40px ${colors.yellow}44, 4px 4px 0px rgba(0, 0, 0, 0.5)`,
								textAlign: "center",
							}}
						>
							{number}
						</div>
					</MilestoneReveal>
				</Sequence>

				{/* Achievement banner */}
				{frame >= bannerStart && (
					<div
						style={{
							transform: `scale(${bannerScale}) translateY(${bannerY}px)`,
							backgroundColor: colors.purple,
							padding: "16px 48px",
							borderRadius: 8,
							border: `3px solid ${colors.yellow}`,
							boxShadow: `0 0 30px ${colors.purple}88`,
						}}
					>
						<div
							style={{
								fontFamily: "PPNeueBit, sans-serif",
								fontSize: 14,
								color: colors.mauve,
								textAlign: "center",
								letterSpacing: 4,
							}}
						>
							ACHIEVEMENT UNLOCKED
						</div>
						<div
							style={{
								fontFamily: "PPNeueBit, sans-serif",
								fontWeight: 700,
								fontSize: 48,
								color: colors.yellow,
								textAlign: "center",
								textShadow: "3px 3px 0px rgba(0, 0, 0, 0.5)",
							}}
						>
							{achievementName}
						</div>
					</div>
				)}
			</div>

			{/* Confetti particles */}
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
