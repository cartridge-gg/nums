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
import { punch, dramatic } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

export const referralChainSchema = z.object({
	chainLength: z.number(),
	names: z.array(z.string()),
});

type ReferralChainProps = z.infer<typeof referralChainSchema>;

const defaultProps: ReferralChainProps = {
	chainLength: 4,
	names: ["Alice", "Bob", "Charlie", "Diana"],
};

export { defaultProps as referralChainDefaultProps };

export const ReferralChain: React.FC<ReferralChainProps> = ({
	chainLength,
	names,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const outroStart = seconds(4.5);
	const displayNames = names.slice(0, chainLength);
	const nodeSpacing = 140;
	const startX = 540 - ((displayNames.length - 1) * nodeSpacing) / 2;

	return (
		<SquareLayout>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 48,
					width: "100%",
				}}
			>
				{/* Network graph */}
				<Sequence from={0}>
					<div
						style={{
							position: "relative",
							width: "100%",
							height: 260,
						}}
					>
						{displayNames.map((name, i) => {
							const nodeDelay = i * seconds(0.8);
							const nodeProgress = spring({
								frame: Math.max(0, frame - nodeDelay),
								fps,
								config: punch,
							});
							const nodeScale = interpolate(
								nodeProgress,
								[0, 0.5, 1],
								[0, 1.2, 1],
							);
							const nodeOpacity = interpolate(nodeProgress, [0, 0.2], [0, 1], {
								extrapolateRight: "clamp",
							});

							const cx = startX + i * nodeSpacing;
							const cy = 130;

							// Connection line to next node
							const lineProgress =
								i < displayNames.length - 1
									? spring({
											frame: Math.max(0, frame - nodeDelay - seconds(0.4)),
											fps,
											config: dramatic,
										})
									: 0;

							return (
								<div key={name}>
									{/* Line to next */}
									{i < displayNames.length - 1 && (
										<svg
											style={{ position: "absolute", inset: 0 }}
											width="100%"
											height={260}
											role="img"
											aria-label="connection line"
										>
											<line
												x1={cx + 24}
												y1={cy}
												x2={cx + nodeSpacing - 24}
												y2={cy}
												stroke={colors.purple}
												strokeWidth={3}
												opacity={lineProgress * 0.8}
												strokeDasharray={nodeSpacing - 48}
												strokeDashoffset={
													(nodeSpacing - 48) * (1 - lineProgress)
												}
											/>
											{/* Arrow head */}
											<polygon
												points={`${cx + nodeSpacing - 30},${cy - 6} ${cx + nodeSpacing - 24},${cy} ${cx + nodeSpacing - 30},${cy + 6}`}
												fill={colors.purple}
												opacity={lineProgress * 0.8}
											/>
										</svg>
									)}
									{/* Node circle */}
									<div
										style={{
											position: "absolute",
											left: cx - 24,
											top: cy - 24,
											width: 48,
											height: 48,
											borderRadius: "50%",
											backgroundColor: i === 0 ? colors.yellow : colors.purple,
											transform: `scale(${nodeScale})`,
											opacity: nodeOpacity,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											boxShadow: `0 0 20px ${i === 0 ? colors.yellow : colors.purple}66`,
										}}
									>
										<span
											style={{
												fontFamily: "Circular-LL, sans-serif",
												fontSize: 16,
												color: colors.white,
												fontWeight: 700,
											}}
										>
											{name.charAt(0)}
										</span>
									</div>
									{/* Name label */}
									<div
										style={{
											position: "absolute",
											left: cx - 40,
											top: cy + 32,
											width: 80,
											textAlign: "center",
											fontFamily: "Circular-LL, sans-serif",
											fontSize: 14,
											color: colors.mauve,
											opacity: nodeOpacity * 0.8,
										}}
									>
										{name}
									</div>
								</div>
							);
						})}
					</div>
				</Sequence>

				{/* COMMUNITY GROWS */}
				<Sequence from={outroStart}>
					<EmotionText
						text="COMMUNITY GROWS"
						color={colors.green}
						fontSize={64}
					/>
				</Sequence>
			</div>
		</SquareLayout>
	);
};
