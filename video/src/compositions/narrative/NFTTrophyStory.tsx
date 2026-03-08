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
import { MilestoneReveal } from "@video/components/patterns/MilestoneReveal";
import { seconds } from "@video/lib/timing";
import { dramatic, punch } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

export const nftTrophyStorySchema = z.object({
	playerName: z.string(),
});

type NFTTrophyStoryProps = z.infer<typeof nftTrophyStorySchema>;

const defaultProps: NFTTrophyStoryProps = {
	playerName: "Player1",
};

export { defaultProps as nftTrophyStoryDefaultProps };

const stages = [
	{ label: "PLAY", icon: "GAME", color: colors.blue },
	{ label: "COMPLETE", icon: "CHECK", color: colors.green },
	{ label: "TRANSFORM", icon: "NFT", color: colors.purple },
	{ label: "MINT", icon: "CHAIN", color: colors.yellow },
];

export const NFTTrophyStory: React.FC<NFTTrophyStoryProps> = ({
	playerName,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const stageInterval = seconds(1.2);
	const outroStart = seconds(5);

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
				{/* Player name */}
				<Sequence from={0}>
					<div
						style={{
							fontFamily: "Circular-LL, sans-serif",
							fontSize: 18,
							color: colors.mauve,
							opacity: interpolate(frame, [0, 15], [0, 0.7], {
								extrapolateRight: "clamp",
							}),
						}}
					>
						{playerName}&apos;s journey
					</div>
				</Sequence>

				{/* Journey stages */}
				<Sequence from={seconds(0.5)}>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 8,
						}}
					>
						{[...stages.entries()].map(([i, stage]) => {
							const stageStart = seconds(0.5) + i * stageInterval;
							const stageProgress = spring({
								frame: Math.max(0, frame - stageStart),
								fps,
								config: punch,
							});
							const stageScale = interpolate(
								stageProgress,
								[0, 0.5, 1],
								[0, 1.2, 1],
							);
							const stageOpacity = interpolate(
								stageProgress,
								[0, 0.3],
								[0, 1],
								{
									extrapolateRight: "clamp",
								},
							);

							// Arrow between stages
							const arrowProgress =
								i > 0
									? spring({
											frame: Math.max(0, frame - stageStart + seconds(0.3)),
											fps,
											config: dramatic,
										})
									: 0;

							return (
								<div
									key={i}
									style={{ display: "flex", alignItems: "center", gap: 8 }}
								>
									{i > 0 && (
										<div
											style={{
												fontFamily: "PPNeueBit, sans-serif",
												fontSize: 24,
												color: colors.mauve,
												opacity: arrowProgress * 0.5,
											}}
										>
											→
										</div>
									)}
									<div
										style={{
											display: "flex",
											flexDirection: "column",
											alignItems: "center",
											gap: 8,
											transform: `scale(${stageScale})`,
											opacity: stageOpacity,
										}}
									>
										<div
											style={{
												width: 64,
												height: 64,
												borderRadius: 12,
												backgroundColor: `${stage.color}22`,
												border: `2px solid ${stage.color}`,
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												fontFamily: "PPNeueBit, sans-serif",
												fontSize: 14,
												color: stage.color,
												boxShadow: `0 0 16px ${stage.color}33`,
											}}
										>
											{stage.icon}
										</div>
										<div
											style={{
												fontFamily: "PPNeueBit, sans-serif",
												fontSize: 12,
												color: colors.mauve,
												opacity: 0.7,
											}}
										>
											{stage.label}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</Sequence>

				<SceneTransition
					type="flash"
					triggerFrame={outroStart - seconds(0.5)}
					duration={8}
					color={colors.yellow}
				/>

				{/* YOURS FOREVER */}
				<Sequence from={outroStart}>
					<MilestoneReveal enterFrame={0}>
						<EmotionText
							text="YOURS FOREVER"
							color={colors.yellow}
							fontSize={72}
						/>
					</MilestoneReveal>
				</Sequence>
			</div>
		</SquareLayout>
	);
};
