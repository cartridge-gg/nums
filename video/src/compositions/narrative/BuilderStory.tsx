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
import { seconds } from "@video/lib/timing";
import { punch } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

export const builderStorySchema = z.object({
	techStack: z.array(z.string()),
});

type BuilderStoryProps = z.infer<typeof builderStorySchema>;

const defaultProps: BuilderStoryProps = {
	techStack: ["Starknet", "Cairo", "Dojo", "Cartridge"],
};

export { defaultProps as builderStoryDefaultProps };

const techColors = [
	colors.purple,
	colors.blue,
	colors.green,
	colors.yellow,
	colors.pink,
	colors.reroll,
];

export const BuilderStory: React.FC<BuilderStoryProps> = ({ techStack }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const sequenceInterval = seconds(0.8);
	const outroStart = seconds(3.5);

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
				{/* Tech logos sequence */}
				<Sequence from={seconds(0.5)}>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: 20,
						}}
					>
						{[...techStack.entries()].map(([i, tech]) => {
							const techDelay = seconds(0.5) + i * sequenceInterval;
							const techProgress = spring({
								frame: Math.max(0, frame - techDelay),
								fps,
								config: punch,
							});
							const techScale = interpolate(
								techProgress,
								[0, 0.5, 1],
								[0, 1.15, 1],
							);
							const techOpacity = interpolate(techProgress, [0, 0.2], [0, 1], {
								extrapolateRight: "clamp",
							});

							const accentColor = techColors[i % techColors.length];

							// Connection line to next
							const lineProgress =
								i < techStack.length - 1
									? interpolate(
											Math.max(0, frame - techDelay - sequenceInterval * 0.5),
											[0, seconds(0.3)],
											[0, 1],
											{ extrapolateRight: "clamp" },
										)
									: 0;

							return (
								<div
									key={i}
									style={{
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
									}}
								>
									{/* Tech badge */}
									<div
										style={{
											transform: `scale(${techScale})`,
											opacity: techOpacity,
											background: `${accentColor}15`,
											border: `2px solid ${accentColor}`,
											borderRadius: 12,
											padding: "12px 36px",
											fontFamily: "PPNeueBit, sans-serif",
											fontSize: 28,
											color: accentColor,
											boxShadow: `0 0 20px ${accentColor}33`,
											letterSpacing: 2,
										}}
									>
										{tech.toUpperCase()}
									</div>
									{/* Connecting line */}
									{i < techStack.length - 1 && (
										<div
											style={{
												width: 2,
												height: 20 * lineProgress,
												backgroundColor: colors.mauve,
												opacity: 0.3,
											}}
										/>
									)}
								</div>
							);
						})}
					</div>
				</Sequence>

				<SceneTransition type="flash" triggerFrame={outroStart} duration={6} />

				{/* BUILT DIFFERENT */}
				<Sequence from={outroStart + 5}>
					<EmotionText
						text="BUILT DIFFERENT"
						color={colors.yellow}
						fontSize={72}
					/>
				</Sequence>
			</div>
		</SquareLayout>
	);
};
