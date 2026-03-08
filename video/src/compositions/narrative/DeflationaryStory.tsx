import { useCurrentFrame, interpolate, Sequence } from "remotion";
import { z } from "zod";
import { SquareLayout } from "@video/components/layouts/SquareLayout";
import { EmotionText } from "@video/components/enhanced/EmotionText";
import { ChartDraw } from "@video/components/patterns/ChartDraw";
import { BurnDissolve } from "@video/components/patterns/BurnDissolve";
import { CounterRollUp } from "@video/components/patterns/CounterRollUp";
import { seconds } from "@video/lib/timing";
import { colors } from "@video/lib/colors";

export const deflationaryStorySchema = z.object({
	totalBurned: z.number(),
	supplyReduction: z.number(),
});

type DeflationaryStoryProps = z.infer<typeof deflationaryStorySchema>;

const defaultProps: DeflationaryStoryProps = {
	totalBurned: 2500000,
	supplyReduction: 12,
};

export { defaultProps as deflationaryStoryDefaultProps };

export const DeflationaryStory: React.FC<DeflationaryStoryProps> = ({
	totalBurned,
	supplyReduction,
}) => {
	const frame = useCurrentFrame();

	const chartStart = seconds(1);
	const burnStart = seconds(3);
	const outroStart = seconds(4.5);

	// Decreasing supply chart data
	const chartData = Array.from({ length: 12 }).map((_, i) => ({
		x: i,
		y: 100 - (supplyReduction / 12) * (i + 1) * (1 + Math.random() * 0.1),
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
				{/* Supply chart going down */}
				<Sequence from={chartStart}>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: 8,
						}}
					>
						<div
							style={{
								fontFamily: "PPNeueBit, sans-serif",
								fontSize: 16,
								color: colors.mauve,
								opacity: 0.6,
							}}
						>
							TOKEN SUPPLY
						</div>
						<ChartDraw
							data={chartData}
							startFrame={0}
							duration={seconds(2)}
							width={450}
							height={200}
							color={colors.red}
						/>
					</div>
				</Sequence>

				{/* Burn counter */}
				<Sequence from={burnStart}>
					<BurnDissolve
						startFrame={0}
						duration={seconds(2)}
						width={300}
						height={80}
					>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								gap: 4,
							}}
						>
							<div
								style={{
									fontFamily: "PPNeueBit, sans-serif",
									fontSize: 14,
									color: colors.mauve,
									opacity: 0.6,
								}}
							>
								TOTAL BURNED
							</div>
							<CounterRollUp
								value={totalBurned}
								duration={seconds(1.5)}
								fontSize={48}
								color={colors.red}
							/>
						</div>
					</BurnDissolve>
				</Sequence>

				{/* Supply reduction badge */}
				<Sequence from={burnStart + seconds(1)}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 32,
							color: colors.red,
							opacity: interpolate(
								Math.max(0, frame - burnStart - seconds(1)),
								[0, 15],
								[0, 1],
								{ extrapolateRight: "clamp" },
							),
						}}
					>
						-{supplyReduction}% SUPPLY
					</div>
				</Sequence>

				{/* EVERY GAME BURNS TOKENS */}
				<Sequence from={outroStart}>
					<EmotionText
						text="EVERY GAME BURNS TOKENS"
						color={colors.yellow}
						fontSize={44}
					/>
				</Sequence>
			</div>
		</SquareLayout>
	);
};
