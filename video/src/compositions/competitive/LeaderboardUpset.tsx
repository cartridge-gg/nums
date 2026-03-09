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
import { dramatic } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

export const leaderboardUpsetSchema = z.object({
	playerName: z.string(),
	oldRank: z.number(),
	newRank: z.number(),
});

type LeaderboardUpsetProps = z.infer<typeof leaderboardUpsetSchema>;

const defaultProps: LeaderboardUpsetProps = {
	playerName: "Player1",
	oldRank: 47,
	newRank: 8,
};

export { defaultProps as leaderboardUpsetDefaultProps };

export const LeaderboardUpset: React.FC<LeaderboardUpsetProps> = ({
	playerName,
	oldRank,
	newRank,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const rankDiff = oldRank - newRank;
	const act2Start = seconds(1.5);
	const act3Start = seconds(3);
	const outroStart = seconds(4);

	// Rank number accelerating upward
	const climbDuration = seconds(2);
	const climbElapsed = Math.max(0, frame - act2Start);
	const climbProgress = interpolate(climbElapsed, [0, climbDuration], [0, 1], {
		extrapolateRight: "clamp",
	});
	const eased = 1 - (1 - climbProgress) ** 4;
	const currentRank = Math.round(oldRank - eased * rankDiff);

	// Starting rank reveal
	const enterProgress = spring({
		frame,
		fps,
		config: dramatic,
	});
	const enterScale = interpolate(enterProgress, [0, 1], [0.5, 1]);

	// Shake on landing
	const landShake =
		frame >= act3Start + climbDuration && frame < act3Start + climbDuration + 10
			? Math.sin(frame * 8) * 4 * (1 - (frame - act3Start - climbDuration) / 10)
			: 0;

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
							fontSize: 20,
							color: colors.mauve,
							opacity: interpolate(enterProgress, [0, 1], [0, 0.7]),
						}}
					>
						{playerName}
					</div>
				</Sequence>

				{/* Big rank number */}
				<Sequence from={0}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 160,
							fontWeight: 700,
							color: climbProgress > 0.9 ? colors.yellow : colors.white,
							transform: `scale(${enterScale}) translateX(${landShake}px)`,
							textShadow: `4px 4px 0px rgba(0, 0, 0, 0.5)`,
							transition: "color 0.2s",
						}}
					>
						#{frame >= act2Start ? currentRank : oldRank}
					</div>
				</Sequence>

				{/* +N RANKS badge */}
				<Sequence from={act3Start}>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 8,
						}}
					>
						<EmotionText
							text={`+${rankDiff} RANKS`}
							color={colors.green}
							fontSize={56}
						/>
					</div>
				</Sequence>

				<SceneTransition type="flash" triggerFrame={act3Start} duration={6} />

				{/* UPSET text */}
				<Sequence from={outroStart}>
					<EmotionText text="UPSET" color={colors.yellow} fontSize={96} />
				</Sequence>
			</div>
		</SquareLayout>
	);
};
