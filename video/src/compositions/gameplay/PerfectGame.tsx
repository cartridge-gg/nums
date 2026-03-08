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
import { NumberReveal } from "@video/components/patterns/NumberReveal";
import { EmotionText } from "@video/components/enhanced/EmotionText";
import { CounterRollUp } from "@video/components/patterns/CounterRollUp";
import { SceneTransition } from "@video/components/patterns/SceneTransition";
import { confettiBurst, getParticleAtFrame } from "@video/lib/particles";
import { seconds } from "@video/lib/timing";
import { dramatic } from "@video/lib/springs";
import { colors } from "@video/lib/colors";
import { zoomTo, cameraToTransform } from "@video/lib/camera";

export const perfectGameSchema = z.object({
	slots: z.array(z.number()).length(18),
	reward: z.number(),
	multiplier: z.number(),
	playerName: z.string(),
});

type PerfectGameProps = z.infer<typeof perfectGameSchema>;

const defaultProps: PerfectGameProps = {
	slots: [
		23, 67, 89, 124, 201, 278, 334, 389, 445, 512, 567, 623, 678, 734, 789, 845,
		901, 956,
	],
	reward: 15000,
	multiplier: 3,
	playerName: "Player1",
};

export { defaultProps as perfectGameDefaultProps };

export const PerfectGame: React.FC<PerfectGameProps> = ({
	slots,
	reward,
	playerName,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// Act timings
	const act2Start = seconds(3);
	const act3Start = seconds(4);
	const outroStart = seconds(6);

	// Camera zoom
	const camera = zoomTo(frame, 0, act2Start, 1.05);

	// Confetti burst at act 3
	const particles = confettiBurst(60, 540, 540, 42);

	// Grid shrink for outro
	const outroProgress = spring({
		frame: Math.max(0, frame - outroStart),
		fps,
		config: dramatic,
	});
	const outroScale = interpolate(outroProgress, [0, 1], [1, 0.6]);

	return (
		<SquareLayout>
			<div
				style={{
					transform: cameraToTransform(camera),
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 32,
					width: "100%",
				}}
			>
				{/* Player name */}
				<Sequence from={0}>
					<div
						style={{
							fontFamily: "Circular-LL, sans-serif",
							fontSize: 18,
							color: colors.mauve,
							opacity: 0.7,
						}}
					>
						{playerName}
					</div>
				</Sequence>

				{/* Act 1: Grid fills */}
				<Sequence from={0}>
					<div
						style={{
							transform:
								frame > outroStart ? `scale(${outroScale})` : undefined,
						}}
					>
						<GridFillSequence slots={slots} />
					</div>
				</Sequence>

				{/* Act 2: Last number reveal */}
				<Sequence from={act2Start}>
					<NumberReveal value={slots[17]} enterFrame={0} emotion="great" />
				</Sequence>

				{/* Act 3: Flash + PERFECT text */}
				<SceneTransition type="flash" triggerFrame={act3Start} duration={8} />
				<Sequence from={act3Start + 5}>
					<EmotionText text="PERFECT" color={colors.yellow} fontSize={96} />
				</Sequence>

				{/* Reward counter */}
				<Sequence from={act3Start + 15}>
					<CounterRollUp
						value={reward}
						duration={seconds(1.5)}
						fontSize={48}
						color={colors.yellow}
						prefix="+"
					/>
				</Sequence>

				{/* Outro stat */}
				<Sequence from={outroStart + 10}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 24,
							color: colors.mauve,
							opacity: interpolate(frame - outroStart - 10, [0, 15], [0, 0.8], {
								extrapolateRight: "clamp",
							}),
							textAlign: "center",
						}}
					>
						1 in 5,500
					</div>
				</Sequence>
			</div>

			{/* Confetti particles */}
			{frame >= act3Start &&
				particles.map((p) => {
					const state = getParticleAtFrame(p, frame, act3Start, 50);
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
