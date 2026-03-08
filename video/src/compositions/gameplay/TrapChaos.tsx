import { useCurrentFrame, interpolate, Sequence } from "remotion";
import { z } from "zod";
import { SquareLayout } from "@video/components/layouts/SquareLayout";
import { GridFillSequence } from "@video/components/patterns/GridFillSequence";
import { TrapTrigger } from "@video/components/patterns/TrapTrigger";
import { EmotionText } from "@video/components/enhanced/EmotionText";
import { seconds } from "@video/lib/timing";
import { colors } from "@video/lib/colors";

export const trapChaosSchema = z.object({
	slotsBefore: z.array(z.number()),
	slotsAfter: z.array(z.number()),
	trapType: z.string(),
	trapSlot: z.number(),
	outcome: z.enum(["saved", "destroyed"]),
});

type TrapChaosProps = z.infer<typeof trapChaosSchema>;

const defaultProps: TrapChaosProps = {
	slotsBefore: [
		23, 67, 89, 124, 201, 278, 334, 389, 445, 512, 567, 623, 678, 734, 789, 845,
		0, 0,
	],
	slotsAfter: [
		23, 67, 201, 124, 89, 278, 445, 389, 334, 512, 678, 623, 567, 734, 845, 789,
		0, 0,
	],
	trapType: "Bomb",
	trapSlot: 5,
	outcome: "saved",
};

export { defaultProps as trapChaosDefaultProps };

const trapColors: Record<string, string> = {
	Bomb: colors.bomb,
	Lucky: colors.lucky,
	Magnet: colors.magnet,
	UFO: colors.ufo,
	Windy: colors.windy,
};

export const TrapChaos: React.FC<TrapChaosProps> = ({
	slotsBefore,
	slotsAfter,
	trapType,
	outcome,
}) => {
	const frame = useCurrentFrame();

	const act2Start = seconds(1.5);
	const act3Start = seconds(3.5);
	const outroStart = seconds(5);

	const showAfter = frame >= act3Start;
	const trapColor = trapColors[trapType] || colors.red;

	const resultText = outcome === "saved" ? "SAVED BY CHAOS" : "DESTROYED";
	const resultColor = outcome === "saved" ? colors.green : colors.red;

	// Dust settles opacity
	const dustProgress = interpolate(frame, [act3Start, act3Start + 20], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
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
					position: "relative",
				}}
			>
				{/* Act 1: Calm placement */}
				<Sequence from={0} durationInFrames={act3Start}>
					<GridFillSequence slots={slotsBefore} />
				</Sequence>

				{/* Act 2: Trap trigger effects */}
				<TrapTrigger triggerFrame={act2Start} trapColor={trapColor} />

				{/* Act 3: New grid revealed */}
				{showAfter && (
					<Sequence from={act3Start}>
						<div style={{ opacity: dustProgress }}>
							<GridFillSequence slots={slotsAfter} />
						</div>
					</Sequence>
				)}

				{/* Trap type label */}
				<Sequence from={act2Start + 5} durationInFrames={seconds(1.5)}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 32,
							color: trapColor,
							textShadow: "2px 2px 0px rgba(0,0,0,0.5)",
							opacity: interpolate(
								frame - act2Start - 5,
								[0, 5, seconds(1.5) - 5, seconds(1.5)],
								[0, 1, 1, 0],
								{ extrapolateRight: "clamp" },
							),
						}}
					>
						{trapType.toUpperCase()} TRAP!
					</div>
				</Sequence>

				{/* Outro */}
				<Sequence from={outroStart}>
					<EmotionText text={resultText} color={resultColor} fontSize={64} />
				</Sequence>
			</div>
		</SquareLayout>
	);
};
