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
import { seconds } from "@video/lib/timing";
import { dramatic, breathe } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

export const concurrentPlayersSchema = z.object({
	playerCount: z.number(),
});

type ConcurrentPlayersProps = z.infer<typeof concurrentPlayersSchema>;

const defaultProps: ConcurrentPlayersProps = {
	playerCount: 47,
};

export { defaultProps as concurrentPlayersDefaultProps };

export const ConcurrentPlayers: React.FC<ConcurrentPlayersProps> = ({
	playerCount,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// Breathing pulse effect
	const breathCycle = Math.sin(frame * 0.08) * 0.04 + 1;

	// Counter reveal
	const enterProgress = spring({ frame, fps, config: dramatic });
	const enterScale = interpolate(enterProgress, [0, 1], [0.5, 1]);

	// Pulsing glow ring
	const glowPhase = Math.sin(frame * 0.1);
	const glowSize = 60 + glowPhase * 15;
	const glowOpacity = 0.15 + glowPhase * 0.1;

	// Dot grid representing players
	const dotCount = Math.min(playerCount, 36);
	const cols = 6;

	return (
		<SquareLayout>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 40,
					width: "100%",
				}}
			>
				{/* Pulsing glow behind number */}
				<Sequence from={0}>
					<div
						style={{
							position: "relative",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<div
							style={{
								position: "absolute",
								width: 200,
								height: 200,
								borderRadius: "50%",
								background: `radial-gradient(circle, ${colors.green}${Math.round(
									glowOpacity * 255,
								)
									.toString(16)
									.padStart(2, "0")} 0%, transparent ${glowSize}%)`,
							}}
						/>
						{/* Big player count */}
						<div
							style={{
								fontFamily: "PPNeueBit, sans-serif",
								fontSize: 160,
								fontWeight: 700,
								color: colors.green,
								transform: `scale(${enterScale * breathCycle})`,
								textShadow: `0 0 30px ${colors.green}66`,
								position: "relative",
							}}
						>
							{playerCount}
						</div>
					</div>
				</Sequence>

				{/* PLAYING NOW label */}
				<Sequence from={seconds(0.5)}>
					<EmotionText text="PLAYING NOW" color={colors.green} fontSize={48} />
				</Sequence>

				{/* Active player dot grid */}
				<Sequence from={seconds(1)}>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: `repeat(${cols}, 16px)`,
							gap: 8,
						}}
					>
						{Array.from({ length: dotCount }, (_, i) => i).map((i) => {
							const dotDelay = seconds(1) + i * 1;
							const dotProgress = spring({
								frame: Math.max(0, frame - dotDelay),
								fps,
								config: breathe,
							});
							const dotPulse = Math.sin(frame * 0.12 + i * 0.5) * 0.3 + 0.7;

							return (
								<div
									key={i}
									style={{
										width: 10,
										height: 10,
										borderRadius: "50%",
										backgroundColor: colors.green,
										opacity: dotProgress * dotPulse,
										transform: `scale(${dotProgress})`,
									}}
								/>
							);
						})}
					</div>
				</Sequence>
			</div>
		</SquareLayout>
	);
};
