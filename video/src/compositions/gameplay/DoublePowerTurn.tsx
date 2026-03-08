import { useCurrentFrame, useVideoConfig, spring, Sequence } from "remotion";
import { z } from "zod";
import { SquareLayout } from "@video/components/layouts/SquareLayout";
import { GridFillSequence } from "@video/components/patterns/GridFillSequence";
import { PowerActivation } from "@video/components/patterns/PowerActivation";
import { EmotionText } from "@video/components/enhanced/EmotionText";
import { SceneTransition } from "@video/components/patterns/SceneTransition";
import { seconds } from "@video/lib/timing";
import { punch } from "@video/lib/springs";
import { colors } from "@video/lib/colors";
import {
	shake,
	slam,
	combineCameras,
	cameraToTransform,
} from "@video/lib/camera";

export const doublePowerTurnSchema = z.object({
	power1: z.string(),
	power2: z.string(),
	slots: z.array(z.number()),
});

type DoublePowerTurnProps = z.infer<typeof doublePowerTurnSchema>;

const defaultProps: DoublePowerTurnProps = {
	power1: "Reroll",
	power2: "Wildcard",
	slots: [
		23, 67, 89, 124, 201, 278, 334, 389, 445, 512, 567, 623, 0, 0, 0, 0, 0, 0,
	],
};

export { defaultProps as doublePowerTurnDefaultProps };

const powerColorMap: Record<string, string> = {
	Reroll: colors.reroll,
	Wildcard: colors.wildcard,
	Double: colors.double,
	Down: colors.down,
	Swap: colors.swap,
	Halve: colors.halve,
	Up: colors.up,
	Low: colors.low,
	Foresight: colors.foresight,
	High: colors.high,
};

export const DoublePowerTurn: React.FC<DoublePowerTurnProps> = ({
	power1,
	power2,
	slots,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const power1Start = seconds(1);
	const power2Start = seconds(2.5);
	const outroStart = seconds(4);

	const color1 = powerColorMap[power1] || colors.mauve;
	const color2 = powerColorMap[power2] || colors.pink;

	// Camera: slam on each power
	const cam1 = slam(frame, power1Start + 20, 12, 1.1);
	const cam2 = slam(frame, power2Start + 20, 12, 1.15);
	const camShake = shake(frame, power2Start + 20, 15, 3);
	const camera = combineCameras(cam1, cam2, camShake);

	// Double power text entrance
	const doubleProgress = spring({
		frame: Math.max(0, frame - outroStart),
		fps,
		config: punch,
	});

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
				{/* Grid */}
				<Sequence from={0}>
					<GridFillSequence slots={slots} />
				</Sequence>

				{/* Power 1 activation */}
				<Sequence from={power1Start} durationInFrames={seconds(1.5)}>
					<PowerActivation
						activateFrame={0}
						color={color1}
						label={power1.toUpperCase()}
					/>
				</Sequence>

				{/* Flash between powers */}
				<SceneTransition
					type="flash"
					triggerFrame={power1Start + 20}
					duration={6}
					color={color1}
				/>

				{/* Power 2 activation */}
				<Sequence from={power2Start} durationInFrames={seconds(1.5)}>
					<PowerActivation
						activateFrame={0}
						color={color2}
						label={power2.toUpperCase()}
					/>
				</Sequence>

				{/* Flash on second power */}
				<SceneTransition
					type="flash"
					triggerFrame={power2Start + 20}
					duration={6}
					color={color2}
				/>

				{/* DOUBLE POWER text */}
				<Sequence from={outroStart}>
					<div
						style={{
							transform: `scale(${doubleProgress})`,
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: 8,
						}}
					>
						<EmotionText
							text="DOUBLE POWER"
							color={colors.yellow}
							fontSize={72}
						/>
						<div
							style={{
								display: "flex",
								gap: 16,
								fontFamily: "PPNeueBit, sans-serif",
								fontSize: 24,
							}}
						>
							<span style={{ color: color1 }}>{power1.toUpperCase()}</span>
							<span style={{ color: colors.mauve }}>+</span>
							<span style={{ color: color2 }}>{power2.toUpperCase()}</span>
						</div>
					</div>
				</Sequence>
			</div>
		</SquareLayout>
	);
};
