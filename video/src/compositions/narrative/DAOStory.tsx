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
import { CounterRollUp } from "@video/components/patterns/CounterRollUp";
import { SceneTransition } from "@video/components/patterns/SceneTransition";
import { seconds } from "@video/lib/timing";
import { dramatic, punch } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

export const daoStorySchema = z.object({
	proposalName: z.string(),
	voteCount: z.number(),
});

type DAOStoryProps = z.infer<typeof daoStorySchema>;

const defaultProps: DAOStoryProps = {
	proposalName: "Increase Rewards Pool",
	voteCount: 1247,
};

export { defaultProps as daoStoryDefaultProps };

const stages = [
	{ label: "PROPOSE", color: colors.blue },
	{ label: "VOTE", color: colors.purple },
	{ label: "PASS", color: colors.green },
	{ label: "EFFECT", color: colors.yellow },
];

export const DAOStory: React.FC<DAOStoryProps> = ({
	proposalName,
	voteCount,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const stageInterval = seconds(1);
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
				{/* Proposal name */}
				<Sequence from={0}>
					<div
						style={{
							fontFamily: "Circular-LL, sans-serif",
							fontSize: 20,
							color: colors.mauve,
							opacity: interpolate(frame, [0, 20], [0, 0.8], {
								extrapolateRight: "clamp",
							}),
							textAlign: "center",
							maxWidth: 400,
						}}
					>
						&ldquo;{proposalName}&rdquo;
					</div>
				</Sequence>

				{/* Governance flow stages */}
				<Sequence from={seconds(0.8)}>
					<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
						{[...stages.entries()].map(([i, stage]) => {
							const stageStart = seconds(0.8) + i * stageInterval;
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

							// Arrow
							const arrowOpacity =
								i > 0
									? interpolate(
											spring({
												frame: Math.max(0, frame - stageStart + seconds(0.3)),
												fps,
												config: dramatic,
											}),
											[0, 1],
											[0, 0.5],
										)
									: 0;

							// Vote count appears on VOTE stage
							const showVotes = i === 1 && frame >= stageStart + seconds(0.5);

							return (
								<div
									key={i}
									style={{ display: "flex", alignItems: "center", gap: 12 }}
								>
									{i > 0 && (
										<div
											style={{
												fontFamily: "PPNeueBit, sans-serif",
												fontSize: 20,
												color: colors.mauve,
												opacity: arrowOpacity,
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
											gap: 6,
										}}
									>
										<div
											style={{
												width: 72,
												height: 72,
												borderRadius: 16,
												backgroundColor: `${stage.color}22`,
												border: `2px solid ${stage.color}`,
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												transform: `scale(${stageScale})`,
												opacity: stageProgress,
												boxShadow: `0 0 16px ${stage.color}33`,
											}}
										>
											<div
												style={{
													fontFamily: "PPNeueBit, sans-serif",
													fontSize: 11,
													color: stage.color,
													textAlign: "center",
												}}
											>
												{stage.label}
											</div>
										</div>
										{showVotes && (
											<div
												style={{
													fontFamily: "PPNeueBit, sans-serif",
													fontSize: 14,
													color: colors.purple,
												}}
											>
												<CounterRollUp
													value={voteCount}
													duration={seconds(0.8)}
													fontSize={16}
													color={colors.purple}
													suffix=" votes"
												/>
											</div>
										)}
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

				{/* YOU DECIDE */}
				<Sequence from={outroStart}>
					<EmotionText text="YOU DECIDE" color={colors.yellow} fontSize={80} />
				</Sequence>
			</div>
		</SquareLayout>
	);
};
