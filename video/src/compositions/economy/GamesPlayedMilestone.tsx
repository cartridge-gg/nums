import {
	useCurrentFrame,
	useVideoConfig,
	spring,
	interpolate,
	Sequence,
} from "remotion";
import { z } from "zod";
import { SquareLayout } from "@video/components/layouts/SquareLayout";
import { CounterRollUp } from "@video/components/patterns/CounterRollUp";
import { ChartDraw } from "@video/components/patterns/ChartDraw";
import { MilestoneReveal } from "@video/components/patterns/MilestoneReveal";
import { seconds } from "@video/lib/timing";
import { dramatic } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

export const gamesPlayedMilestoneSchema = z.object({
	milestone: z.number(),
	chartData: z.array(z.object({ x: z.number(), y: z.number() })),
});

type GamesPlayedMilestoneProps = z.infer<typeof gamesPlayedMilestoneSchema>;

const defaultProps: GamesPlayedMilestoneProps = {
	milestone: 100000,
	chartData: [
		{ x: 0, y: 10000 },
		{ x: 1, y: 25000 },
		{ x: 2, y: 45000 },
		{ x: 3, y: 70000 },
		{ x: 4, y: 100000 },
	],
};

export { defaultProps as gamesPlayedMilestoneDefaultProps };

export const GamesPlayedMilestone: React.FC<GamesPlayedMilestoneProps> = ({
	milestone,
	chartData,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const odometerStart = seconds(0.5);
	const lockFrame = seconds(2.5);
	const chartStart = seconds(2.8);

	// Odometer lock effect
	const lockProgress = spring({
		frame: Math.max(0, frame - lockFrame),
		fps,
		config: dramatic,
	});
	const lockScale = interpolate(lockProgress, [0, 0.5, 1], [1, 1.08, 1]);
	const lockGlow = interpolate(lockProgress, [0, 0.5, 1], [0, 1, 0.4]);

	return (
		<SquareLayout>
			{/* Milestone reveal wrapper */}
			<MilestoneReveal enterFrame={seconds(0.3)}>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: 24,
					}}
				>
					{/* Label */}
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 24,
							color: colors.mauve,
							opacity: interpolate(frame, [0, 15], [0, 0.8], {
								extrapolateRight: "clamp",
							}),
							letterSpacing: 4,
						}}
					>
						GAMES PLAYED
					</div>

					{/* Odometer counter */}
					<Sequence from={odometerStart}>
						<div
							style={{
								transform: `scale(${lockScale})`,
								filter: `drop-shadow(0 0 ${lockGlow * 20}px ${colors.yellow})`,
							}}
						>
							<CounterRollUp
								value={milestone}
								duration={seconds(2)}
								fontSize={80}
								color={colors.yellow}
							/>
						</div>
					</Sequence>

					{/* Growth chart below */}
					<Sequence from={chartStart}>
						<div style={{ marginTop: 24 }}>
							<ChartDraw
								data={chartData}
								duration={seconds(1.5)}
								width={380}
								height={160}
								color={colors.green}
							/>
						</div>
					</Sequence>
				</div>
			</MilestoneReveal>
		</SquareLayout>
	);
};
