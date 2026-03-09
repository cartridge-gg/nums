import {
	useCurrentFrame,
	useVideoConfig,
	spring,
	interpolate,
	Sequence,
} from "remotion";
import { z } from "zod";
import { SquareLayout } from "@video/components/layouts/SquareLayout";
import { ChartDraw } from "@video/components/patterns/ChartDraw";
import { EmotionText } from "@video/components/enhanced/EmotionText";
import { MilestoneReveal } from "@video/components/patterns/MilestoneReveal";
import { seconds } from "@video/lib/timing";
import { punch } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

export const supplyCrossesTargetSchema = z.object({
	currentSupply: z.number(),
	targetSupply: z.number(),
	chartData: z.array(z.object({ x: z.number(), y: z.number() })),
});

type SupplyCrossesTargetProps = z.infer<typeof supplyCrossesTargetSchema>;

const defaultProps: SupplyCrossesTargetProps = {
	currentSupply: 21000000,
	targetSupply: 20000000,
	chartData: [
		{ x: 0, y: 18000000 },
		{ x: 1, y: 19000000 },
		{ x: 2, y: 19500000 },
		{ x: 3, y: 20000000 },
		{ x: 4, y: 21000000 },
	],
};

export { defaultProps as supplyCrossesTargetDefaultProps };

export const SupplyCrossesTarget: React.FC<SupplyCrossesTargetProps> = ({
	currentSupply,
	targetSupply,
	chartData,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const chartStart = seconds(0.5);
	const crossFrame = seconds(3);
	const flashStart = seconds(3.5);
	const labelStart = seconds(4);

	// Flash on intersection
	const flashProgress = spring({
		frame: Math.max(0, frame - flashStart),
		fps,
		config: punch,
	});
	const flashOpacity = interpolate(flashProgress, [0, 0.3, 1], [0, 0.8, 0]);
	const flashScale = interpolate(flashProgress, [0, 1], [0.5, 2]);

	// Chart data bounds for target line positioning
	const yMin = Math.min(...chartData.map((d) => d.y));
	const yMax = Math.max(...chartData.map((d) => d.y));
	const targetNorm = (targetSupply - yMin) / (yMax - yMin || 1);
	const targetY = 20 + (1 - targetNorm) * 260; // mapped to chart area

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
				{/* Supply label */}
				<Sequence from={0}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 20,
							color: colors.mauve,
							letterSpacing: 3,
							opacity: interpolate(frame, [0, 15], [0, 0.8], {
								extrapolateRight: "clamp",
							}),
							marginBottom: 16,
						}}
					>
						CIRCULATING SUPPLY
					</div>
				</Sequence>

				{/* Chart with target line overlay */}
				<div style={{ position: "relative" }}>
					<Sequence from={chartStart}>
						<ChartDraw
							data={chartData}
							duration={seconds(3)}
							width={500}
							height={300}
							color={colors.green}
						/>
					</Sequence>

					{/* Dashed target line */}
					<Sequence from={chartStart}>
						<svg
							width={500}
							height={300}
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								pointerEvents: "none",
							}}
							role="img"
							aria-label="target line"
						>
							<line
								x1={20}
								y1={targetY}
								x2={480}
								y2={targetY}
								stroke={colors.yellow}
								strokeWidth={2}
								strokeDasharray="8 6"
								opacity={interpolate(
									Math.max(0, frame - chartStart),
									[0, 20],
									[0, 0.7],
									{ extrapolateRight: "clamp" },
								)}
							/>
							<text
								x={485}
								y={targetY - 6}
								fill={colors.yellow}
								fontSize={12}
								fontFamily="PPNeueBit, sans-serif"
								opacity={0.7}
							>
								TARGET
							</text>
						</svg>
					</Sequence>

					{/* Intersection flash */}
					{frame >= flashStart && (
						<div
							style={{
								position: "absolute",
								top: targetY - 30,
								left: "60%",
								width: 60 * flashScale,
								height: 60 * flashScale,
								borderRadius: "50%",
								background: `radial-gradient(circle, ${colors.yellow} 0%, transparent 70%)`,
								opacity: flashOpacity,
								transform: "translate(-50%, -50%)",
								pointerEvents: "none",
							}}
						/>
					)}
				</div>

				{/* Current supply display */}
				<Sequence from={crossFrame}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 48,
							color: colors.yellow,
							textShadow: `0 0 20px ${colors.yellow}`,
							marginTop: 24,
						}}
					>
						{currentSupply.toLocaleString()}
					</div>
				</Sequence>

				{/* TARGET REACHED text */}
				<Sequence from={labelStart}>
					<MilestoneReveal enterFrame={0}>
						<EmotionText
							text="TARGET REACHED"
							color={colors.green}
							fontSize={40}
						/>
					</MilestoneReveal>
				</Sequence>
			</div>

			{/* Full screen flash */}
			{frame >= flashStart && (
				<div
					style={{
						position: "absolute",
						inset: 0,
						backgroundColor: colors.yellow,
						opacity: flashOpacity * 0.15,
						pointerEvents: "none",
					}}
				/>
			)}
		</SquareLayout>
	);
};
