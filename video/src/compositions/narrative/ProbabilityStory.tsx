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
import { dramatic, breathe } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

export const probabilityStorySchema = z.object({
	odds: z.number(),
});

type ProbabilityStoryProps = z.infer<typeof probabilityStorySchema>;

const defaultProps: ProbabilityStoryProps = {
	odds: 5500,
};

export { defaultProps as probabilityStoryDefaultProps };

export const ProbabilityStory: React.FC<ProbabilityStoryProps> = ({ odds }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const act2Start = seconds(2.5);
	const outroStart = seconds(5);

	// Big odds number entrance
	const oddsEnter = spring({ frame, fps, config: dramatic });
	const oddsScale = interpolate(oddsEnter, [0, 1], [2, 1]);
	const oddsOpacity = interpolate(oddsEnter, [0, 0.5], [0, 1], {
		extrapolateRight: "clamp",
	});

	// Pull back to reveal grid
	const pullback = spring({
		frame: Math.max(0, frame - act2Start),
		fps,
		config: breathe,
	});
	const gridScale = interpolate(pullback, [0, 1], [3, 1]);
	const gridOpacity = interpolate(pullback, [0, 0.3], [0, 1], {
		extrapolateRight: "clamp",
	});

	// Grid of tiny squares representing odds
	const gridSize = 20;
	const totalCells = gridSize * gridSize;
	const highlightIndex = Math.floor(totalCells / 2);

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
				{/* Big odds text */}
				<Sequence from={0} durationInFrames={act2Start + seconds(1)}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 96,
							fontWeight: 700,
							color: colors.yellow,
							transform: `scale(${oddsScale})`,
							opacity:
								frame >= act2Start
									? interpolate(pullback, [0, 1], [1, 0])
									: oddsOpacity,
							textShadow: `0 0 30px ${colors.yellow}44`,
							textAlign: "center",
						}}
					>
						1 in {odds.toLocaleString()}
					</div>
				</Sequence>

				{/* Tiny grid pullback */}
				<Sequence from={act2Start}>
					<div
						style={{
							transform: `scale(${gridScale})`,
							opacity: gridOpacity,
							display: "grid",
							gridTemplateColumns: `repeat(${gridSize}, 12px)`,
							gap: 2,
						}}
					>
						{Array.from({ length: totalCells }, (_, i) => i).map((i) => {
							const isHighlighted = i === highlightIndex;
							const cellDelay = act2Start + Math.abs(i - highlightIndex) * 0.3;
							const cellOpacity = interpolate(
								Math.max(0, frame - cellDelay),
								[0, 10],
								[0, isHighlighted ? 1 : 0.2],
								{ extrapolateRight: "clamp" },
							);

							return (
								<div
									key={i}
									style={{
										width: 10,
										height: 10,
										borderRadius: 2,
										backgroundColor: isHighlighted
											? colors.yellow
											: colors.mauve,
										opacity: cellOpacity,
										boxShadow: isHighlighted
											? `0 0 8px ${colors.yellow}`
											: "none",
									}}
								/>
							);
						})}
					</div>
				</Sequence>

				{/* That was you */}
				<Sequence from={outroStart}>
					<EmotionText
						text="THAT WAS YOU"
						color={colors.yellow}
						fontSize={72}
					/>
				</Sequence>
			</div>
		</SquareLayout>
	);
};
