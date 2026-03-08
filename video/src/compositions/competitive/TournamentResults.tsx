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
import { dramatic, punch } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

export const tournamentResultsSchema = z.object({
	season: z.number(),
	first: z.string(),
	second: z.string(),
	third: z.string(),
});

type TournamentResultsProps = z.infer<typeof tournamentResultsSchema>;

const defaultProps: TournamentResultsProps = {
	season: 1,
	first: "Champion1",
	second: "Runner2",
	third: "Bronze3",
};

export { defaultProps as tournamentResultsDefaultProps };

const podiumData = [
	{ place: "3RD", heightPct: 0.5, color: colors.reroll },
	{ place: "1ST", heightPct: 1, color: colors.yellow },
	{ place: "2ND", heightPct: 0.7, color: colors.mauve },
];

export const TournamentResults: React.FC<TournamentResultsProps> = ({
	season,
	first,
	second,
	third,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const names = [third, first, second];
	const podiumStart = seconds(1);
	const spotlightStart = seconds(4);
	const outroStart = seconds(5.5);

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
				{/* Season label */}
				<Sequence from={0}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 24,
							color: colors.mauve,
							opacity: interpolate(frame, [0, 20], [0, 0.7], {
								extrapolateRight: "clamp",
							}),
						}}
					>
						SEASON {season}
					</div>
				</Sequence>

				{/* Podium builds */}
				<Sequence from={podiumStart}>
					<div
						style={{
							display: "flex",
							alignItems: "flex-end",
							gap: 16,
							height: 300,
						}}
					>
						{[...podiumData.entries()].map(([i, pod]) => {
							const podDelay = podiumStart + i * seconds(0.6);
							const podProgress = spring({
								frame: Math.max(0, frame - podDelay),
								fps,
								config: dramatic,
							});
							const maxHeight = 200 * pod.heightPct;
							const podHeight = podProgress * maxHeight;

							const nameOpacity = interpolate(podProgress, [0.8, 1], [0, 1], {
								extrapolateRight: "clamp",
							});

							return (
								<div
									key={i}
									style={{
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										gap: 8,
									}}
								>
									{/* Name */}
									<div
										style={{
											fontFamily: "Circular-LL, sans-serif",
											fontSize: 16,
											color: colors.white,
											opacity: nameOpacity,
										}}
									>
										{names[i]}
									</div>
									{/* Place label */}
									<div
										style={{
											fontFamily: "PPNeueBit, sans-serif",
											fontSize: 20,
											color: pod.color,
											opacity: nameOpacity,
										}}
									>
										{pod.place}
									</div>
									{/* Podium bar */}
									<div
										style={{
											width: 120,
											height: podHeight,
											backgroundColor: `${pod.color}33`,
											border: `2px solid ${pod.color}`,
											borderRadius: "8px 8px 0 0",
											boxShadow: `0 0 20px ${pod.color}44`,
										}}
									/>
								</div>
							);
						})}
					</div>
				</Sequence>

				{/* Winner spotlight */}
				<SceneTransition
					type="flash"
					triggerFrame={spotlightStart}
					duration={8}
				/>

				<Sequence from={spotlightStart + 5}>
					<div
						style={{
							fontFamily: "Circular-LL, sans-serif",
							fontSize: 36,
							color: colors.yellow,
							fontWeight: 700,
							textShadow: `0 0 30px ${colors.yellow}66`,
							opacity: interpolate(
								spring({
									frame: Math.max(0, frame - spotlightStart - 5),
									fps,
									config: punch,
								}),
								[0, 1],
								[0, 1],
							),
						}}
					>
						{first}
					</div>
				</Sequence>

				{/* SEASON X CHAMPIONS */}
				<Sequence from={outroStart}>
					<EmotionText
						text={`SEASON ${season} CHAMPIONS`}
						color={colors.yellow}
						fontSize={56}
					/>
				</Sequence>
			</div>
		</SquareLayout>
	);
};
