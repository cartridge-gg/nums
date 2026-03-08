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
import { EmotionText } from "@video/components/enhanced/EmotionText";
import { seconds } from "@video/lib/timing";
import { whip } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

export const starterPackSalesSchema = z.object({
	packsSold: z.number(),
	topTier: z.string(),
});

type StarterPackSalesProps = z.infer<typeof starterPackSalesSchema>;

const defaultProps: StarterPackSalesProps = {
	packsSold: 8000,
	topTier: "Gold",
};

export { defaultProps as starterPackSalesDefaultProps };

const CARD_COUNT = 5;
const cardColors = [
	colors.yellow,
	colors.purple,
	colors.blue,
	colors.green,
	colors.pink,
];

export const StarterPackSales: React.FC<StarterPackSalesProps> = ({
	packsSold,
	topTier,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const fanStart = seconds(0.3);
	const counterStart = seconds(2);
	const labelStart = seconds(3);

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
				{/* Pack cards fanning from deck */}
				<div
					style={{
						position: "relative",
						width: 400,
						height: 300,
						marginBottom: 32,
					}}
				>
					{Array.from({ length: CARD_COUNT }, (_, i) => i).map((i) => {
						const cardDelay = fanStart + i * 6;
						const fanProgress = spring({
							frame: Math.max(0, frame - cardDelay),
							fps,
							config: whip,
						});
						const angle = interpolate(
							fanProgress,
							[0, 1],
							[0, (i - (CARD_COUNT - 1) / 2) * 15],
						);
						const translateY = interpolate(fanProgress, [0, 1], [0, -20]);
						const translateX = interpolate(
							fanProgress,
							[0, 1],
							[0, (i - (CARD_COUNT - 1) / 2) * 40],
						);
						return (
							<div
								key={i}
								style={{
									position: "absolute",
									left: "50%",
									top: "50%",
									width: 100,
									height: 140,
									marginLeft: -50,
									marginTop: -70,
									borderRadius: 12,
									backgroundColor: colors.bgLight,
									border: `3px solid ${cardColors[i]}`,
									boxShadow: `0 4px 20px rgba(0,0,0,0.4), inset 0 0 20px rgba(255,255,255,0.05)`,
									transform: `translate(${translateX}px, ${translateY}px) rotate(${angle}deg)`,
									transformOrigin: "center bottom",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									zIndex: i,
								}}
							>
								<div
									style={{
										fontFamily: "PPNeueBit, sans-serif",
										fontSize: 24,
										color: cardColors[i],
									}}
								>
									PACK
								</div>
							</div>
						);
					})}
				</div>

				{/* Counter */}
				<Sequence from={counterStart}>
					<CounterRollUp
						value={packsSold}
						duration={seconds(1.5)}
						fontSize={64}
						color={colors.yellow}
					/>
				</Sequence>

				{/* Label */}
				<Sequence from={labelStart}>
					<EmotionText text="PACKS SOLD" color={colors.white} fontSize={36} />
				</Sequence>

				{/* Top tier badge */}
				<Sequence from={labelStart + 10}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 22,
							color: colors.mauve,
							marginTop: 12,
							opacity: interpolate(
								Math.max(0, frame - labelStart - 10),
								[0, 15],
								[0, 0.8],
								{ extrapolateRight: "clamp" },
							),
						}}
					>
						TOP TIER: {topTier.toUpperCase()}
					</div>
				</Sequence>
			</div>
		</SquareLayout>
	);
};
