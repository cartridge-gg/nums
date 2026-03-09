import { useCurrentFrame, interpolate, Sequence } from "remotion";
import { z } from "zod";
import { SquareLayout } from "@video/components/layouts/SquareLayout";
import { GridFillSequence } from "@video/components/patterns/GridFillSequence";
import { TrapTrigger } from "@video/components/patterns/TrapTrigger";
import { SplitCompare } from "@video/components/patterns/SplitCompare";
import { EmotionText } from "@video/components/enhanced/EmotionText";
import { SceneTransition } from "@video/components/patterns/SceneTransition";
import { confettiBurst, getParticleAtFrame } from "@video/lib/particles";
import { seconds } from "@video/lib/timing";
import { colors } from "@video/lib/colors";
import { shake, cameraToTransform } from "@video/lib/camera";

export const trapIntoSaveSchema = z.object({
	slotsBefore: z.array(z.number()),
	slotsAfter: z.array(z.number()),
	trapType: z.string(),
});

type TrapIntoSaveProps = z.infer<typeof trapIntoSaveSchema>;

const defaultProps: TrapIntoSaveProps = {
	slotsBefore: [
		23, 67, 89, 124, 201, 278, 334, 389, 445, 512, 567, 623, 678, 734, 789, 845,
		0, 0,
	],
	slotsAfter: [
		23, 67, 89, 124, 201, 278, 334, 389, 445, 500, 567, 623, 678, 734, 789, 845,
		0, 0,
	],
	trapType: "Bomb",
};

export { defaultProps as trapIntoSaveDefaultProps };

const trapColors: Record<string, string> = {
	Bomb: colors.bomb,
	Lucky: colors.lucky,
	Magnet: colors.magnet,
	UFO: colors.ufo,
	Windy: colors.windy,
};

export const TrapIntoSave: React.FC<TrapIntoSaveProps> = ({
	slotsBefore,
	slotsAfter,
	trapType,
}) => {
	const frame = useCurrentFrame();

	const trapStart = seconds(1.5);
	const compareStart = seconds(3);
	const outroStart = seconds(4.5);

	const trapColor = trapColors[trapType] || colors.red;

	// Camera shake on trap
	const camera = shake(frame, trapStart, 20, 6);

	// Confetti on "CALCULATED"
	const particles = confettiBurst(50, 540, 540, 33);

	return (
		<SquareLayout>
			<div
				style={{
					transform: cameraToTransform(camera),
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 24,
					width: "100%",
				}}
			>
				{/* Act 1: Board before trap */}
				<Sequence from={0} durationInFrames={compareStart}>
					<GridFillSequence slots={slotsBefore} />
				</Sequence>

				{/* Trap trigger */}
				<TrapTrigger triggerFrame={trapStart} trapColor={trapColor} />

				{/* Trap label */}
				<Sequence from={trapStart + 5} durationInFrames={seconds(1.5)}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 32,
							color: trapColor,
							textShadow: "2px 2px 0px rgba(0,0,0,0.5)",
							opacity: interpolate(
								frame - trapStart - 5,
								[0, 5, seconds(1.5) - 5, seconds(1.5)],
								[0, 1, 1, 0],
								{ extrapolateRight: "clamp" },
							),
						}}
					>
						{trapType.toUpperCase()} TRAP!
					</div>
				</Sequence>

				{/* Flash on trap */}
				<SceneTransition
					type="flash"
					triggerFrame={trapStart}
					duration={8}
					color={trapColor}
				/>

				{/* Before/After comparison */}
				{frame >= compareStart && (
					<Sequence from={compareStart}>
						<div style={{ width: 500, height: 400 }}>
							<SplitCompare
								left={<GridFillSequence slots={slotsBefore} />}
								right={<GridFillSequence slots={slotsAfter} />}
								leftLabel="BEFORE"
								rightLabel="AFTER"
								splitFrame={0}
							/>
						</div>
					</Sequence>
				)}

				{/* Flash on reveal — it's BETTER */}
				<SceneTransition
					type="flash"
					triggerFrame={compareStart + 15}
					duration={6}
					color={colors.green}
				/>

				{/* CALCULATED text */}
				<Sequence from={outroStart}>
					<EmotionText text="CALCULATED" color={colors.green} fontSize={72} />
				</Sequence>

				<Sequence from={outroStart + 15}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 20,
							color: colors.mauve,
							opacity: interpolate(frame - outroStart - 15, [0, 10], [0, 0.7], {
								extrapolateRight: "clamp",
							}),
						}}
					>
						Trap made it better
					</div>
				</Sequence>
			</div>

			{/* Confetti */}
			{frame >= outroStart &&
				particles.map((p) => {
					const state = getParticleAtFrame(p, frame, outroStart, 45);
					return (
						<div
							key={p.id}
							style={{
								position: "absolute",
								left: state.x,
								top: state.y,
								width: state.size,
								height: state.size * 0.6,
								backgroundColor: p.color,
								opacity: state.opacity,
								transform: `rotate(${state.rotation}deg)`,
								borderRadius: 1,
							}}
						/>
					);
				})}
		</SquareLayout>
	);
};
