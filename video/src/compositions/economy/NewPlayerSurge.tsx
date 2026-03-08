import { useCurrentFrame, useVideoConfig, spring, Sequence } from "remotion";
import { z } from "zod";
import { SquareLayout } from "@video/components/layouts/SquareLayout";
import { CounterRollUp } from "@video/components/patterns/CounterRollUp";
import { ChartDraw } from "@video/components/patterns/ChartDraw";
import { EmotionText } from "@video/components/enhanced/EmotionText";
import { seconds } from "@video/lib/timing";
import { dramatic } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

export const newPlayerSurgeSchema = z.object({
	newPlayers: z.number(),
	chartData: z.array(z.object({ x: z.number(), y: z.number() })),
});

type NewPlayerSurgeProps = z.infer<typeof newPlayerSurgeSchema>;

const defaultProps: NewPlayerSurgeProps = {
	newPlayers: 2500,
	chartData: [
		{ x: 0, y: 100 },
		{ x: 1, y: 150 },
		{ x: 2, y: 300 },
		{ x: 3, y: 800 },
		{ x: 4, y: 2500 },
	],
};

export { defaultProps as newPlayerSurgeDefaultProps };

// Dot particles representing new players
const DOT_COUNT = 40;
const dotSeeds = Array.from({ length: DOT_COUNT }, (_, i) => ({
	id: i,
	angle: (i / DOT_COUNT) * Math.PI * 2,
	distance: 80 + Math.sin(i * 5) * 60,
	delay: Math.floor(i * 0.8),
	size: 6 + (i % 3) * 3,
}));

export const NewPlayerSurge: React.FC<NewPlayerSurgeProps> = ({
	newPlayers,
	chartData,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const dotsStart = seconds(0.3);
	const counterStart = seconds(1.5);
	const chartStart = seconds(2.5);
	const labelStart = seconds(1.8);

	return (
		<SquareLayout>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					width: "100%",
					height: "100%",
					position: "relative",
				}}
			>
				{/* Dots appearing with acceleration */}
				{frame >= dotsStart &&
					dotSeeds.map((dot) => {
						const elapsed = Math.max(0, frame - dotsStart - dot.delay);
						if (elapsed <= 0) return null;
						const appearProgress = spring({
							frame: elapsed,
							fps,
							config: dramatic,
						});
						const x = 540 + Math.cos(dot.angle) * dot.distance * appearProgress;
						const y = 420 + Math.sin(dot.angle) * dot.distance * appearProgress;
						return (
							<div
								key={dot.id}
								style={{
									position: "absolute",
									left: x - dot.size / 2,
									top: y - dot.size / 2,
									width: dot.size,
									height: dot.size,
									borderRadius: "50%",
									backgroundColor: colors.blue,
									opacity: appearProgress * 0.8,
									boxShadow: `0 0 6px ${colors.blue}`,
									transform: `scale(${appearProgress})`,
								}}
							/>
						);
					})}

				{/* Counter */}
				<Sequence from={counterStart}>
					<CounterRollUp
						value={newPlayers}
						duration={seconds(1.5)}
						fontSize={80}
						color={colors.blue}
					/>
				</Sequence>

				{/* Label */}
				<Sequence from={labelStart}>
					<EmotionText text="NEW PLAYERS" color={colors.white} fontSize={36} />
				</Sequence>

				{/* Chart spike */}
				<Sequence from={chartStart}>
					<div style={{ marginTop: 32 }}>
						<ChartDraw
							data={chartData}
							duration={seconds(1.5)}
							width={380}
							height={160}
							color={colors.blue}
						/>
					</div>
				</Sequence>
			</div>
		</SquareLayout>
	);
};
