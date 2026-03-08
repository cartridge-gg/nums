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
import { SceneTransition } from "@video/components/patterns/SceneTransition";
import { seconds } from "@video/lib/timing";
import { whip, dramatic } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

export const mirrorFlipSchema = z.object({
	originalNumber: z.number(),
	flippedNumber: z.number(),
	slotIndex: z.number(),
});

type MirrorFlipProps = z.infer<typeof mirrorFlipSchema>;

const defaultProps: MirrorFlipProps = {
	originalNumber: 186,
	flippedNumber: 681,
	slotIndex: 7,
};

export { defaultProps as mirrorFlipDefaultProps };

export const MirrorFlip: React.FC<MirrorFlipProps> = ({
	originalNumber,
	flippedNumber,
	slotIndex,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const flipStart = seconds(1.5);
	const revealStart = seconds(3);
	const outroStart = seconds(4);

	// Flip rotation on Y axis (0 -> 180 degrees)
	const flipProgress = spring({
		frame: Math.max(0, frame - flipStart),
		fps,
		config: whip,
	});
	const rotateY = interpolate(flipProgress, [0, 1], [0, 180]);

	// Show original or flipped based on rotation
	const showFlipped = rotateY > 90;

	// Scale punch on reveal
	const revealScale = spring({
		frame: Math.max(0, frame - revealStart),
		fps,
		config: dramatic,
	});
	const scale = interpolate(revealScale, [0, 1], [1, 1.1]);

	// Glow after flip
	const glowOpacity = interpolate(
		frame,
		[revealStart, revealStart + 20],
		[0, 0.8],
		{ extrapolateLeft: "clamp", extrapolateRight: "clamp" },
	);

	return (
		<SquareLayout>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					gap: 32,
					width: "100%",
					height: "100%",
				}}
			>
				{/* Slot label */}
				<Sequence from={0}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 20,
							color: colors.mauve,
							opacity: 0.7,
						}}
					>
						SLOT {slotIndex + 1}
					</div>
				</Sequence>

				{/* Flipping number card */}
				<div
					style={{
						perspective: 800,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<div
						style={{
							transform: `rotateY(${rotateY}deg) scale(${frame >= revealStart ? scale : 1})`,
							transformStyle: "preserve-3d",
							backfaceVisibility: "hidden",
							fontFamily: "PPNeueBit, sans-serif",
							fontWeight: 700,
							fontSize: 136,
							color: showFlipped ? colors.yellow : colors.white,
							textShadow: showFlipped
								? `0 0 40px ${colors.yellow}, 4px 4px 0px rgba(0,0,0,0.5)`
								: "4px 4px 0px rgba(0,0,0,0.5)",
							padding: "24px 48px",
							background: showFlipped
								? "rgba(255, 200, 0, 0.1)"
								: "rgba(133, 129, 255, 0.1)",
							borderRadius: 16,
							border: `2px solid ${showFlipped ? colors.yellow : colors.mauve}`,
						}}
					>
						{showFlipped
							? flippedNumber.toString().padStart(3, "0")
							: originalNumber.toString().padStart(3, "0")}
					</div>
				</div>

				{/* Flash on flip complete */}
				<SceneTransition
					type="flash"
					triggerFrame={flipStart + 10}
					duration={6}
				/>

				{/* Mirror line */}
				{frame >= flipStart && (
					<div
						style={{
							width: 2,
							height: 200,
							position: "absolute",
							left: "50%",
							background: `linear-gradient(transparent, ${colors.mauve}, transparent)`,
							opacity: interpolate(flipProgress, [0, 0.5, 1], [0, 0.6, 0.2]),
						}}
					/>
				)}

				{/* Outro text */}
				<Sequence from={outroStart}>
					<EmotionText text="MIRROR" color={colors.pink} fontSize={64} />
				</Sequence>

				{/* Before/After label */}
				<Sequence from={outroStart + 10}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 24,
							color: colors.mauve,
							opacity: interpolate(frame - outroStart - 10, [0, 10], [0, 0.7], {
								extrapolateRight: "clamp",
							}),
						}}
					>
						{originalNumber} → {flippedNumber}
					</div>
				</Sequence>
			</div>

			{/* Glow overlay */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					background: `radial-gradient(circle at 50% 50%, ${colors.yellow}20 0%, transparent 60%)`,
					opacity: glowOpacity,
					pointerEvents: "none",
				}}
			/>
		</SquareLayout>
	);
};
