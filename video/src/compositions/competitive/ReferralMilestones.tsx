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
import { CounterRollUp } from "@video/components/patterns/CounterRollUp";
import { seconds } from "@video/lib/timing";
import { punch } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

export const referralMilestonesSchema = z.object({
	referralCount: z.number(),
	earnings: z.number(),
});

type ReferralMilestonesProps = z.infer<typeof referralMilestonesSchema>;

const defaultProps: ReferralMilestonesProps = {
	referralCount: 50,
	earnings: 12500,
};

export { defaultProps as referralMilestonesDefaultProps };

export const ReferralMilestones: React.FC<ReferralMilestonesProps> = ({
	referralCount,
	earnings,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const act3Start = seconds(3);
	const outroStart = seconds(4);

	// Node connection animation
	const nodeCount = Math.min(referralCount, 12);
	const nodesPerSecond = 4;

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
				{/* Counter ticking up */}
				<Sequence from={0}>
					<CounterRollUp
						value={referralCount}
						duration={seconds(2.5)}
						fontSize={120}
						color={colors.green}
					/>
				</Sequence>

				{/* Network nodes visualization */}
				<Sequence from={seconds(0.5)}>
					<div
						style={{
							position: "relative",
							width: 300,
							height: 200,
						}}
					>
						{Array.from({ length: nodeCount }, (_, i) => i).map((i) => {
							const angle = (i / nodeCount) * Math.PI * 2;
							const radius = 80;
							const cx = 150 + Math.cos(angle) * radius;
							const cy = 100 + Math.sin(angle) * radius;
							const nodeDelay = seconds(0.5) + i * (fps / nodesPerSecond);

							const nodeProgress = spring({
								frame: Math.max(0, frame - nodeDelay),
								fps,
								config: punch,
							});

							// Line from center to node
							const lineOpacity = interpolate(
								nodeProgress,
								[0, 0.5],
								[0, 0.4],
								{
									extrapolateRight: "clamp",
								},
							);

							return (
								<div key={i}>
									{/* Connection line */}
									<svg
										style={{ position: "absolute", inset: 0 }}
										width={300}
										height={200}
										role="img"
										aria-label="connection line"
									>
										<line
											x1={150}
											y1={100}
											x2={cx}
											y2={cy}
											stroke={colors.green}
											strokeWidth={2}
											opacity={lineOpacity}
										/>
									</svg>
									{/* Node dot */}
									<div
										style={{
											position: "absolute",
											left: cx - 8,
											top: cy - 8,
											width: 16,
											height: 16,
											borderRadius: "50%",
											backgroundColor: colors.green,
											transform: `scale(${nodeProgress})`,
											boxShadow: `0 0 12px ${colors.green}88`,
										}}
									/>
								</div>
							);
						})}
						{/* Center node */}
						<div
							style={{
								position: "absolute",
								left: 142,
								top: 92,
								width: 16,
								height: 16,
								borderRadius: "50%",
								backgroundColor: colors.yellow,
								boxShadow: `0 0 20px ${colors.yellow}88`,
							}}
						/>
					</div>
				</Sequence>

				{/* Referral count label */}
				<Sequence from={act3Start}>
					<EmotionText
						text={`${referralCount} REFERRALS`}
						color={colors.green}
						fontSize={64}
					/>
				</Sequence>

				{/* Earnings */}
				<Sequence from={outroStart}>
					<CounterRollUp
						value={earnings}
						duration={seconds(0.8)}
						fontSize={40}
						color={colors.yellow}
						prefix="+"
					/>
				</Sequence>
			</div>
		</SquareLayout>
	);
};
