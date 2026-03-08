import { Sequence } from "remotion";
import { z } from "zod";
import { SquareLayout } from "@video/components/layouts/SquareLayout";
import { ChartDraw } from "@video/components/patterns/ChartDraw";
import { CounterRollUp } from "@video/components/patterns/CounterRollUp";
import { EmotionText } from "@video/components/enhanced/EmotionText";
import { seconds } from "@video/lib/timing";
import { colors } from "@video/lib/colors";

export const ekuboPoolStatsSchema = z.object({
	liquidity: z.number(),
	price: z.number(),
	volume: z.number(),
	chartData: z.array(z.object({ x: z.number(), y: z.number() })),
});

type EkuboPoolStatsProps = z.infer<typeof ekuboPoolStatsSchema>;

const defaultProps: EkuboPoolStatsProps = {
	liquidity: 1500000,
	price: 0.042,
	volume: 350000,
	chartData: [
		{ x: 0, y: 200000 },
		{ x: 1, y: 280000 },
		{ x: 2, y: 250000 },
		{ x: 3, y: 400000 },
		{ x: 4, y: 350000 },
	],
};

export { defaultProps as ekuboPoolStatsDefaultProps };

export const EkuboPoolStats: React.FC<EkuboPoolStatsProps> = ({
	liquidity,
	price,
	volume,
	chartData,
}) => {
	const headerStart = seconds(0.3);
	const chart1Start = seconds(0.8);
	const chart2Start = seconds(1.5);
	const chart3Start = seconds(2.2);
	const statsStart = seconds(3);

	return (
		<SquareLayout>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					width: "100%",
					height: "100%",
					padding: 60,
					gap: 24,
				}}
			>
				{/* Header */}
				<Sequence from={headerStart}>
					<EmotionText
						text="MARKET UPDATE"
						color={colors.purple}
						fontSize={36}
					/>
				</Sequence>

				{/* Triple chart row */}
				<div
					style={{
						display: "flex",
						justifyContent: "center",
						gap: 24,
						width: "100%",
						marginTop: 32,
					}}
				>
					{/* Liquidity chart */}
					<Sequence from={chart1Start}>
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
									fontSize: 14,
									color: colors.blue,
									letterSpacing: 2,
								}}
							>
								LIQUIDITY
							</div>
							<ChartDraw
								data={chartData}
								duration={seconds(1.5)}
								width={280}
								height={140}
								color={colors.blue}
							/>
						</div>
					</Sequence>

					{/* Price chart */}
					<Sequence from={chart2Start}>
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
									fontSize: 14,
									color: colors.green,
									letterSpacing: 2,
								}}
							>
								PRICE
							</div>
							<ChartDraw
								data={chartData.map((d, i) => ({
									x: d.x,
									y: price * (0.8 + (i / chartData.length) * 0.4),
								}))}
								duration={seconds(1.5)}
								width={280}
								height={140}
								color={colors.green}
							/>
						</div>
					</Sequence>

					{/* Volume chart */}
					<Sequence from={chart3Start}>
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
									fontSize: 14,
									color: colors.yellow,
									letterSpacing: 2,
								}}
							>
								VOLUME
							</div>
							<ChartDraw
								data={chartData}
								duration={seconds(1.5)}
								width={280}
								height={140}
								color={colors.yellow}
							/>
						</div>
					</Sequence>
				</div>

				{/* Stats row */}
				<Sequence from={statsStart}>
					<div
						style={{
							display: "flex",
							justifyContent: "center",
							gap: 64,
							marginTop: 24,
						}}
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
								}}
							>
								TVL
							</div>
							<CounterRollUp
								value={liquidity}
								duration={seconds(1.5)}
								fontSize={36}
								color={colors.blue}
								prefix="$"
							/>
						</div>
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
								}}
							>
								PRICE
							</div>
							<div
								style={{
									fontFamily: "PPNeueBit, sans-serif",
									fontSize: 36,
									color: colors.green,
									textShadow: "4px 4px 0px rgba(0,0,0,0.5)",
								}}
							>
								${price.toFixed(4)}
							</div>
						</div>
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
								}}
							>
								24H VOL
							</div>
							<CounterRollUp
								value={volume}
								duration={seconds(1.5)}
								fontSize={36}
								color={colors.yellow}
								prefix="$"
							/>
						</div>
					</div>
				</Sequence>
			</div>
		</SquareLayout>
	);
};
