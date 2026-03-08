import { useCurrentFrame, interpolate, Sequence } from "remotion";
import { z } from "zod";
import { SquareLayout } from "@video/components/layouts/SquareLayout";
import { EmotionText } from "@video/components/enhanced/EmotionText";
import { SceneTransition } from "@video/components/patterns/SceneTransition";
import { seconds } from "@video/lib/timing";
import { colors } from "@video/lib/colors";

export const oneMoreGameSchema = z.object({
	gamesPlayed: z.number(),
});

type OneMoreGameProps = z.infer<typeof oneMoreGameSchema>;

const defaultProps: OneMoreGameProps = {
	gamesPlayed: 142,
};

export { defaultProps as oneMoreGameDefaultProps };

export const OneMoreGame: React.FC<OneMoreGameProps> = ({ gamesPlayed }) => {
	const frame = useCurrentFrame();

	const act2Start = seconds(1.5);
	const hyperspeedStart = seconds(2);
	const resetStart = seconds(3.5);
	const outroStart = seconds(4);

	// Clock countdown 60→0
	const clockDuration = seconds(1.5);
	const clockElapsed = Math.max(0, frame - act2Start);
	const clockProgress = interpolate(clockElapsed, [0, clockDuration], [60, 0], {
		extrapolateRight: "clamp",
	});
	const clockDisplay = Math.ceil(clockProgress);

	// Hyperspeed blur effect
	const hyperProgress = interpolate(
		Math.max(0, frame - hyperspeedStart),
		[0, seconds(1)],
		[0, 1],
		{ extrapolateRight: "clamp" },
	);
	const blurAmount = hyperProgress * 8;

	// Games counter
	const gamesOpacity = interpolate(frame, [0, 20], [0, 0.7], {
		extrapolateRight: "clamp",
	});

	return (
		<SquareLayout>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 32,
					width: "100%",
				}}
			>
				{/* Games played counter */}
				<Sequence from={0}>
					<div
						style={{
							fontFamily: "Circular-LL, sans-serif",
							fontSize: 16,
							color: colors.mauve,
							opacity: gamesOpacity,
						}}
					>
						GAMES PLAYED: {gamesPlayed}
					</div>
				</Sequence>

				{/* Clock display */}
				<Sequence from={act2Start}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 140,
							fontWeight: 700,
							color: clockDisplay <= 10 ? colors.red : colors.white,
							filter: `blur(${blurAmount}px)`,
							textShadow: `4px 4px 0px rgba(0, 0, 0, 0.5)`,
							transition: "color 0.1s",
						}}
					>
						{clockDisplay}s
					</div>
				</Sequence>

				{/* Speed lines during hyperspeed */}
				{frame >= hyperspeedStart && frame < resetStart && (
					<div
						style={{
							position: "absolute",
							inset: 0,
							overflow: "hidden",
							pointerEvents: "none",
						}}
					>
						{Array.from({ length: 12 }, (_, i) => i).map((i) => {
							const y = 100 + i * 75;
							const lineProgress = interpolate(
								(frame - hyperspeedStart + i * 3) % 20,
								[0, 20],
								[0, 1],
							);
							return (
								<div
									key={i}
									style={{
										position: "absolute",
										left: `${lineProgress * 120 - 20}%`,
										top: y,
										width: 60,
										height: 2,
										backgroundColor: colors.mauve,
										opacity: 0.3 * hyperProgress,
									}}
								/>
							);
						})}
					</div>
				)}

				<SceneTransition type="flash" triggerFrame={resetStart} duration={6} />

				{/* ONE MORE. */}
				<Sequence from={outroStart}>
					<EmotionText text="ONE MORE." color={colors.yellow} fontSize={96} />
				</Sequence>
			</div>
		</SquareLayout>
	);
};
