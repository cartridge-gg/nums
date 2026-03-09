import {
	useCurrentFrame,
	useVideoConfig,
	spring,
	interpolate,
	Sequence,
} from "remotion";
import { z } from "zod";
import { SquareLayout } from "@video/components/layouts/SquareLayout";
import { BurnDissolve } from "@video/components/patterns/BurnDissolve";
import { CounterRollUp } from "@video/components/patterns/CounterRollUp";
import { EmotionText } from "@video/components/enhanced/EmotionText";
import { MilestoneReveal } from "@video/components/patterns/MilestoneReveal";
import { seconds } from "@video/lib/timing";
import { dramatic } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

export const numsBurnMilestoneSchema = z.object({
	totalBurned: z.number(),
	milestoneNumber: z.number(),
});

type NumsBurnMilestoneProps = z.infer<typeof numsBurnMilestoneSchema>;

const defaultProps: NumsBurnMilestoneProps = {
	totalBurned: 1000000,
	milestoneNumber: 5,
};

export { defaultProps as numsBurnMilestoneDefaultProps };

export const NumsBurnMilestone: React.FC<NumsBurnMilestoneProps> = ({
	totalBurned,
	milestoneNumber,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const burnStart = seconds(1);
	const counterStart = seconds(2);
	const textStart = seconds(3.5);
	const milestoneStart = seconds(4.5);

	const pulseProgress = spring({
		frame: Math.max(0, frame - textStart),
		fps,
		config: dramatic,
	});
	const glowOpacity = interpolate(pulseProgress, [0, 0.5, 1], [0, 0.6, 0.3]);

	return (
		<SquareLayout>
			{/* Background fire glow */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					background: `radial-gradient(circle at 50% 60%, rgba(247, 114, 114, ${glowOpacity * 0.3}) 0%, transparent 60%)`,
					pointerEvents: "none",
				}}
			/>

			{/* Burn dissolve center */}
			<Sequence from={burnStart}>
				<BurnDissolve
					startFrame={0}
					duration={seconds(2)}
					width={300}
					height={300}
				>
					<div
						style={{
							width: 300,
							height: 300,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							borderRadius: "50%",
							background: `radial-gradient(circle, ${colors.red} 0%, ${colors.bg} 80%)`,
						}}
					>
						<div
							style={{
								fontFamily: "PPNeueBit, sans-serif",
								fontSize: 72,
								color: colors.yellow,
								textShadow: `0 0 20px ${colors.red}`,
							}}
						>
							#{milestoneNumber}
						</div>
					</div>
				</BurnDissolve>
			</Sequence>

			{/* Total burned counter */}
			<Sequence from={counterStart}>
				<CounterRollUp
					value={totalBurned}
					duration={seconds(2)}
					fontSize={72}
					color={colors.yellow}
				/>
			</Sequence>

			{/* Label text */}
			<Sequence from={textStart}>
				<EmotionText text="BURNED FOREVER" color={colors.red} fontSize={36} />
			</Sequence>

			{/* Milestone badge */}
			<Sequence from={milestoneStart}>
				<MilestoneReveal enterFrame={0}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 28,
							color: colors.mauve,
							textAlign: "center",
							marginTop: 16,
						}}
					>
						BURN MILESTONE #{milestoneNumber}
					</div>
				</MilestoneReveal>
			</Sequence>
		</SquareLayout>
	);
};
