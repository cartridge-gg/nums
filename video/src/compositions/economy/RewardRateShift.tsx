import {
	useCurrentFrame,
	useVideoConfig,
	spring,
	interpolate,
	Sequence,
} from "remotion";
import { z } from "zod";
import { SquareLayout } from "@video/components/layouts/SquareLayout";
import { SplitCompare } from "@video/components/patterns/SplitCompare";
import { EmotionText } from "@video/components/enhanced/EmotionText";
import { seconds } from "@video/lib/timing";
import { whip } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

export const rewardRateShiftSchema = z.object({
	oldRate: z.number(),
	newRate: z.number(),
});

type RewardRateShiftProps = z.infer<typeof rewardRateShiftSchema>;

const defaultProps: RewardRateShiftProps = {
	oldRate: 100,
	newRate: 150,
};

export { defaultProps as rewardRateShiftDefaultProps };

export const RewardRateShift: React.FC<RewardRateShiftProps> = ({
	oldRate,
	newRate,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const splitStart = seconds(0.5);
	const arrowStart = seconds(2);
	const labelStart = seconds(3);

	// Arrow indicator animation
	const arrowProgress = spring({
		frame: Math.max(0, frame - arrowStart),
		fps,
		config: whip,
	});
	const arrowScale = interpolate(arrowProgress, [0, 1], [0, 1]);
	const isIncrease = newRate > oldRate;

	return (
		<SquareLayout>
			{/* Old rate -> new rate split */}
			<div style={{ position: "absolute", inset: 0 }}>
				<SplitCompare
					splitFrame={splitStart}
					leftLabel="OLD RATE"
					rightLabel="NEW RATE"
					left={
						<div
							style={{
								fontFamily: "PPNeueBit, sans-serif",
								fontSize: 72,
								color: colors.red,
								textDecoration: "line-through",
								textDecorationColor: colors.red,
								opacity: 0.6,
							}}
						>
							{oldRate.toLocaleString()}
						</div>
					}
					right={
						<div
							style={{
								fontFamily: "PPNeueBit, sans-serif",
								fontSize: 72,
								color: colors.green,
								textShadow: `0 0 20px ${colors.green}`,
							}}
						>
							{newRate.toLocaleString()}
						</div>
					}
				/>
			</div>

			{/* Arrow indicator */}
			<Sequence from={arrowStart}>
				<div
					style={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: `translate(-50%, -50%) scale(${arrowScale})`,
						zIndex: 10,
					}}
				>
					<div
						style={{
							width: 80,
							height: 80,
							borderRadius: "50%",
							backgroundColor: isIncrease ? colors.green : colors.red,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							boxShadow: `0 0 30px ${isIncrease ? colors.green : colors.red}`,
						}}
					>
						<div
							style={{
								fontFamily: "PPNeueBit, sans-serif",
								fontSize: 48,
								color: colors.black,
								transform: isIncrease ? "rotate(-90deg)" : "rotate(90deg)",
							}}
						>
							{"\u2192"}
						</div>
					</div>
				</div>
			</Sequence>

			{/* Bottom label */}
			<Sequence from={labelStart}>
				<div
					style={{
						position: "absolute",
						bottom: 100,
						width: "100%",
						textAlign: "center",
					}}
				>
					<EmotionText
						text={`EACH SLOT NOW WORTH ${newRate.toLocaleString()}`}
						color={colors.yellow}
						fontSize={28}
					/>
				</div>
			</Sequence>
		</SquareLayout>
	);
};
