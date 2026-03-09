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
import { SceneTransition } from "@video/components/patterns/SceneTransition";
import { CounterRollUp } from "@video/components/patterns/CounterRollUp";
import { seconds } from "@video/lib/timing";
import { punch } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

export const shareToClaimSchema = z.object({
	rewardAmount: z.number(),
});

type ShareToClaimProps = z.infer<typeof shareToClaimSchema>;

const defaultProps: ShareToClaimProps = {
	rewardAmount: 250,
};

export { defaultProps as shareToClaimDefaultProps };

const loopSteps = [
	{ label: "SHARE", color: colors.blue },
	{ label: "PLAY", color: colors.purple },
	{ label: "EARN", color: colors.green },
	{ label: "SHARE", color: colors.blue },
];

export const ShareToClaim: React.FC<ShareToClaimProps> = ({ rewardAmount }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const loopStart = seconds(0.5);
	const stepInterval = seconds(0.6);
	const outroStart = seconds(3);

	// Circular loop layout
	const radius = 100;

	return (
		<SquareLayout>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 40,
					width: "100%",
				}}
			>
				{/* Circular loop */}
				<Sequence from={loopStart}>
					<div
						style={{
							position: "relative",
							width: 280,
							height: 280,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						{/* Connecting arc */}
						<svg
							style={{ position: "absolute", inset: 0 }}
							width={280}
							height={280}
							viewBox="-140 -140 280 280"
							role="img"
							aria-label="connecting arc"
						>
							{[...loopSteps.slice(0, -1).entries()].map(([i]) => {
								const arcDelay = loopStart + (i + 0.5) * stepInterval;
								const arcProgress = interpolate(
									Math.max(0, frame - arcDelay),
									[0, seconds(0.3)],
									[0, 1],
									{ extrapolateRight: "clamp" },
								);

								const angle1 =
									(i / (loopSteps.length - 1)) * Math.PI * 2 - Math.PI / 2;
								const angle2 =
									((i + 1) / (loopSteps.length - 1)) * Math.PI * 2 -
									Math.PI / 2;
								const x1 = Math.cos(angle1) * radius;
								const y1 = Math.sin(angle1) * radius;
								const x2 = Math.cos(angle2) * radius;
								const y2 = Math.sin(angle2) * radius;

								return (
									<line
										key={i}
										x1={x1}
										y1={y1}
										x2={x1 + (x2 - x1) * arcProgress}
										y2={y1 + (y2 - y1) * arcProgress}
										stroke={colors.mauve}
										strokeWidth={2}
										opacity={0.4}
									/>
								);
							})}
						</svg>

						{/* Step nodes */}
						{[...loopSteps.entries()].map(([i, step]) => {
							const angle =
								(i / (loopSteps.length - 1)) * Math.PI * 2 - Math.PI / 2;
							const x = 140 + Math.cos(angle) * radius - 32;
							const y = 140 + Math.sin(angle) * radius - 32;

							const stepDelay = loopStart + i * stepInterval;
							const stepProgress = spring({
								frame: Math.max(0, frame - stepDelay),
								fps,
								config: punch,
							});
							const stepScale = interpolate(
								stepProgress,
								[0, 0.5, 1],
								[0, 1.2, 1],
							);

							return (
								<div
									key={i}
									style={{
										position: "absolute",
										left: x,
										top: y,
										width: 64,
										height: 64,
										borderRadius: "50%",
										backgroundColor: `${step.color}22`,
										border: `2px solid ${step.color}`,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										transform: `scale(${stepScale})`,
										boxShadow: `0 0 16px ${step.color}33`,
									}}
								>
									<div
										style={{
											fontFamily: "PPNeueBit, sans-serif",
											fontSize: 12,
											color: step.color,
										}}
									>
										{step.label}
									</div>
								</div>
							);
						})}

						{/* Center reward */}
						<div
							style={{
								fontFamily: "PPNeueBit, sans-serif",
								fontSize: 14,
								color: colors.yellow,
								opacity: interpolate(
									Math.max(0, frame - loopStart - seconds(1.5)),
									[0, 15],
									[0, 0.8],
									{ extrapolateRight: "clamp" },
								),
							}}
						>
							+{rewardAmount}
						</div>
					</div>
				</Sequence>

				<SceneTransition
					type="flash"
					triggerFrame={outroStart}
					duration={6}
					color={colors.green}
				/>

				{/* SHARE TO CLAIM: LIVE */}
				<Sequence from={outroStart + 5}>
					<EmotionText
						text="SHARE TO CLAIM: LIVE"
						color={colors.green}
						fontSize={48}
					/>
				</Sequence>

				<Sequence from={outroStart + 20}>
					<CounterRollUp
						value={rewardAmount}
						duration={seconds(0.6)}
						fontSize={48}
						color={colors.yellow}
						prefix="+"
						suffix=" TOKENS"
					/>
				</Sequence>
			</div>
		</SquareLayout>
	);
};
