import {
	useCurrentFrame,
	useVideoConfig,
	spring,
	interpolate,
	Sequence,
} from "remotion";
import { z } from "zod";
import { SquareLayout } from "@video/components/layouts/SquareLayout";
import { GridFillSequence } from "@video/components/patterns/GridFillSequence";
import { PowerActivation } from "@video/components/patterns/PowerActivation";
import { TensionBar } from "@video/components/patterns/TensionBar";
import { EmotionText } from "@video/components/enhanced/EmotionText";
import { CounterRollUp } from "@video/components/patterns/CounterRollUp";
import { seconds } from "@video/lib/timing";
import { dramatic } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

export const powerClutchSchema = z.object({
	slotsBefore: z.array(z.number()),
	slotsAfter: z.array(z.number()),
	powerUsed: z.string(),
	level: z.number(),
	reward: z.number(),
});

type PowerClutchProps = z.infer<typeof powerClutchSchema>;

const defaultProps: PowerClutchProps = {
	slotsBefore: [
		23, 67, 89, 124, 201, 278, 334, 389, 445, 512, 567, 623, 678, 734, 0, 0, 0,
		0,
	],
	slotsAfter: [
		23, 67, 89, 124, 201, 278, 334, 389, 445, 512, 567, 623, 678, 734, 789, 0,
		0, 0,
	],
	powerUsed: "Reroll",
	level: 14,
	reward: 8500,
};

export { defaultProps as powerClutchDefaultProps };

export const PowerClutch: React.FC<PowerClutchProps> = ({
	slotsBefore,
	slotsAfter,
	powerUsed,
	reward,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const act2Start = seconds(2);
	const act3Start = seconds(4);
	const outroStart = seconds(5.5);

	const showAfter = frame >= act3Start;

	// Relief camera pullback
	const reliefProgress = spring({
		frame: Math.max(0, frame - act3Start),
		fps,
		config: dramatic,
	});

	return (
		<SquareLayout>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 24,
					width: "100%",
				}}
			>
				{/* Act 1: Stuck grid + tension */}
				<Sequence from={0} durationInFrames={act3Start}>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: 16,
						}}
					>
						<GridFillSequence slots={slotsBefore} />
						<TensionBar
							progress={0.85}
							duration={seconds(1.5)}
							label="OPTIONS REMAINING"
						/>
					</div>
				</Sequence>

				{/* Act 2: Power activation */}
				<Sequence from={act2Start} durationInFrames={seconds(2)}>
					<PowerActivation
						activateFrame={0}
						color={colors.reroll}
						label={powerUsed.toUpperCase()}
					/>
				</Sequence>

				{/* Act 3: Rescued — show updated grid */}
				{showAfter && (
					<Sequence from={act3Start}>
						<div
							style={{
								transform: `scale(${interpolate(reliefProgress, [0, 1], [1.05, 1])})`,
							}}
						>
							<GridFillSequence slots={slotsAfter} />
						</div>
					</Sequence>
				)}

				{/* Outro */}
				<Sequence from={outroStart}>
					<EmotionText text="CLUTCH" color={colors.green} fontSize={80} />
				</Sequence>

				<Sequence from={outroStart + 15}>
					<CounterRollUp
						value={reward}
						duration={seconds(0.8)}
						fontSize={40}
						color={colors.green}
						prefix="+"
					/>
				</Sequence>
			</div>
		</SquareLayout>
	);
};
