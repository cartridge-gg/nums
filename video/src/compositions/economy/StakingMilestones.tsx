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
import { MilestoneReveal } from "@video/components/patterns/MilestoneReveal";
import { EmotionText } from "@video/components/enhanced/EmotionText";
import { seconds } from "@video/lib/timing";
import { dramatic } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

export const stakingMilestonesSchema = z.object({
	tvl: z.number(),
	stakers: z.number(),
	yield: z.number(),
});

type StakingMilestonesProps = z.infer<typeof stakingMilestonesSchema>;

const defaultProps: StakingMilestonesProps = {
	tvl: 2000000,
	stakers: 1200,
	yield: 12.5,
};

export { defaultProps as stakingMilestonesDefaultProps };

export const StakingMilestones: React.FC<StakingMilestonesProps> = ({
	tvl,
	stakers,
	yield: yieldPct,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const doorStart = seconds(0.3);
	const tvlStart = seconds(1.5);
	const statsStart = seconds(3);
	const yieldStart = seconds(4);

	// Vault door opening animation
	const doorProgress = spring({
		frame: Math.max(0, frame - doorStart),
		fps,
		config: dramatic,
	});
	const leftDoor = interpolate(doorProgress, [0, 1], [0, -50]);
	const rightDoor = interpolate(doorProgress, [0, 1], [0, 50]);
	const doorGlow = interpolate(doorProgress, [0.5, 1], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	return (
		<SquareLayout>
			{/* Vault door */}
			<div
				style={{
					position: "absolute",
					top: 120,
					left: "50%",
					transform: "translateX(-50%)",
					width: 300,
					height: 200,
					overflow: "hidden",
				}}
			>
				{/* Left door */}
				<div
					style={{
						position: "absolute",
						left: 0,
						top: 0,
						width: "50%",
						height: "100%",
						backgroundColor: colors.gray,
						border: `2px solid ${colors.mauve}`,
						borderRadius: "8px 0 0 8px",
						transform: `translateX(${leftDoor}%)`,
						display: "flex",
						alignItems: "center",
						justifyContent: "flex-end",
						paddingRight: 16,
					}}
				>
					<div
						style={{
							width: 16,
							height: 16,
							borderRadius: "50%",
							backgroundColor: colors.mauve,
						}}
					/>
				</div>
				{/* Right door */}
				<div
					style={{
						position: "absolute",
						right: 0,
						top: 0,
						width: "50%",
						height: "100%",
						backgroundColor: colors.gray,
						border: `2px solid ${colors.mauve}`,
						borderRadius: "0 8px 8px 0",
						transform: `translateX(${rightDoor}%)`,
						display: "flex",
						alignItems: "center",
						justifyContent: "flex-start",
						paddingLeft: 16,
					}}
				>
					<div
						style={{
							width: 16,
							height: 16,
							borderRadius: "50%",
							backgroundColor: colors.mauve,
						}}
					/>
				</div>
				{/* Inner glow */}
				<div
					style={{
						position: "absolute",
						inset: 0,
						background: `radial-gradient(circle, ${colors.yellow} 0%, transparent 70%)`,
						opacity: doorGlow * 0.4,
					}}
				/>
			</div>

			{/* TVL counter */}
			<Sequence from={tvlStart}>
				<MilestoneReveal enterFrame={0}>
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
								fontSize: 20,
								color: colors.mauve,
								letterSpacing: 3,
							}}
						>
							TOTAL VALUE LOCKED
						</div>
						<CounterRollUp
							value={tvl}
							duration={seconds(2)}
							fontSize={72}
							color={colors.yellow}
							prefix="$"
						/>
					</div>
				</MilestoneReveal>
			</Sequence>

			{/* Staker count and yield */}
			<Sequence from={statsStart}>
				<div
					style={{
						position: "absolute",
						bottom: 200,
						width: "100%",
						display: "flex",
						justifyContent: "center",
						gap: 80,
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
								fontSize: 16,
								color: colors.mauve,
							}}
						>
							STAKERS
						</div>
						<CounterRollUp
							value={stakers}
							duration={seconds(1.5)}
							fontSize={40}
							color={colors.blue}
						/>
					</div>
				</div>
			</Sequence>

			<Sequence from={yieldStart}>
				<div
					style={{
						position: "absolute",
						bottom: 100,
						width: "100%",
						textAlign: "center",
					}}
				>
					<EmotionText
						text={`${yieldPct.toFixed(1)}% APY`}
						color={colors.green}
						fontSize={40}
					/>
				</div>
			</Sequence>
		</SquareLayout>
	);
};
