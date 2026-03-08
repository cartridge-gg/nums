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
import { ChartDraw } from "@video/components/patterns/ChartDraw";
import { SceneTransition } from "@video/components/patterns/SceneTransition";
import { seconds } from "@video/lib/timing";
import { dramatic } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

export const rivalrySchema = z.object({
	player1: z.string(),
	player2: z.string(),
	score1: z.number(),
	score2: z.number(),
});

type RivalryProps = z.infer<typeof rivalrySchema>;

const defaultProps: RivalryProps = {
	player1: "Alpha",
	player2: "Omega",
	score1: 45200,
	score2: 43800,
};

export { defaultProps as rivalryDefaultProps };

export const Rivalry: React.FC<RivalryProps> = ({
	player1,
	player2,
	score1,
	score2,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const act2Start = seconds(2);
	const act3Start = seconds(4);
	const outroStart = seconds(5);

	// Player cards slide in from opposite sides
	const card1Enter = spring({ frame, fps, config: dramatic });
	const card2Enter = spring({
		frame: Math.max(0, frame - 5),
		fps,
		config: dramatic,
	});
	const card1X = interpolate(card1Enter, [0, 1], [-300, 0]);
	const card2X = interpolate(card2Enter, [0, 1], [300, 0]);

	// Generate interweaving score timeline
	const timelinePoints1 = Array.from({ length: 10 }).map((_, i) => ({
		x: i,
		y: (score1 / 10) * (i + 1) * (1 + Math.sin(i * 0.8) * 0.15),
	}));
	const timelinePoints2 = Array.from({ length: 10 }).map((_, i) => ({
		x: i,
		y: (score2 / 10) * (i + 1) * (1 + Math.cos(i * 0.8) * 0.15),
	}));

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
				{/* Player cards */}
				<Sequence from={0}>
					<div style={{ display: "flex", gap: 48, alignItems: "center" }}>
						<div
							style={{
								transform: `translateX(${card1X}px)`,
								background: `${colors.purple}22`,
								border: `2px solid ${colors.purple}`,
								borderRadius: 12,
								padding: "16px 28px",
								textAlign: "center",
							}}
						>
							<div
								style={{
									fontFamily: "Circular-LL, sans-serif",
									fontSize: 22,
									color: colors.white,
									fontWeight: 700,
								}}
							>
								{player1}
							</div>
							<div
								style={{
									fontFamily: "PPNeueBit, sans-serif",
									fontSize: 28,
									color: colors.purple,
									marginTop: 4,
								}}
							>
								{score1.toLocaleString()}
							</div>
						</div>

						<div
							style={{
								fontFamily: "PPNeueBit, sans-serif",
								fontSize: 24,
								color: colors.mauve,
								opacity: interpolate(frame, [10, 25], [0, 0.6], {
									extrapolateRight: "clamp",
								}),
							}}
						>
							VS
						</div>

						<div
							style={{
								transform: `translateX(${card2X}px)`,
								background: `${colors.red}22`,
								border: `2px solid ${colors.red}`,
								borderRadius: 12,
								padding: "16px 28px",
								textAlign: "center",
							}}
						>
							<div
								style={{
									fontFamily: "Circular-LL, sans-serif",
									fontSize: 22,
									color: colors.white,
									fontWeight: 700,
								}}
							>
								{player2}
							</div>
							<div
								style={{
									fontFamily: "PPNeueBit, sans-serif",
									fontSize: 28,
									color: colors.red,
									marginTop: 4,
								}}
							>
								{score2.toLocaleString()}
							</div>
						</div>
					</div>
				</Sequence>

				{/* Interweaving score timelines */}
				<Sequence from={act2Start}>
					<div style={{ position: "relative" }}>
						<ChartDraw
							data={timelinePoints1}
							startFrame={0}
							duration={seconds(2)}
							width={500}
							height={200}
							color={colors.purple}
						/>
						<div style={{ position: "absolute", inset: 0 }}>
							<ChartDraw
								data={timelinePoints2}
								startFrame={seconds(0.3)}
								duration={seconds(2)}
								width={500}
								height={200}
								color={colors.red}
							/>
						</div>
					</div>
				</Sequence>

				<SceneTransition type="flash" triggerFrame={act3Start} duration={6} />

				{/* THE RIVALRY */}
				<Sequence from={outroStart}>
					<EmotionText text="THE RIVALRY" color={colors.yellow} fontSize={80} />
				</Sequence>
			</div>
		</SquareLayout>
	);
};
