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

export const guildPerformanceSchema = z.object({
	guild1: z.string(),
	guild2: z.string(),
	score1: z.number(),
	score2: z.number(),
});

type GuildPerformanceProps = z.infer<typeof guildPerformanceSchema>;

const defaultProps: GuildPerformanceProps = {
	guild1: "Alpha Guild",
	guild2: "Beta Squad",
	score1: 84500,
	score2: 72300,
};

export { defaultProps as guildPerformanceDefaultProps };

export const GuildPerformance: React.FC<GuildPerformanceProps> = ({
	guild1,
	guild2,
	score1,
	score2,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const act2Start = seconds(1.5);
	const act3Start = seconds(3);
	const outroStart = seconds(4);

	const maxScore = Math.max(score1, score2);
	const winner = score1 >= score2 ? guild1 : guild2;

	// Cards slide in
	const card1Enter = spring({ frame, fps, config: dramatic });
	const card2Enter = spring({
		frame: Math.max(0, frame - 8),
		fps,
		config: dramatic,
	});
	const card1X = interpolate(card1Enter, [0, 1], [-400, 0]);
	const card2X = interpolate(card2Enter, [0, 1], [400, 0]);

	// Stats bars race
	const barDuration = seconds(1.5);
	const barElapsed = Math.max(0, frame - act2Start);
	const barProgress = interpolate(barElapsed, [0, barDuration], [0, 1], {
		extrapolateRight: "clamp",
	});
	const barEased = 1 - (1 - barProgress) ** 3;

	const bar1Width = (score1 / maxScore) * 320 * barEased;
	const bar2Width = (score2 / maxScore) * 320 * barEased;

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
				{/* VS header */}
				<Sequence from={0}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 32,
							color: colors.mauve,
							opacity: interpolate(frame, [0, 15], [0, 0.6], {
								extrapolateRight: "clamp",
							}),
						}}
					>
						VS
					</div>
				</Sequence>

				{/* Team cards face off */}
				<Sequence from={0}>
					<div style={{ display: "flex", gap: 40, alignItems: "center" }}>
						{/* Guild 1 */}
						<div
							style={{
								transform: `translateX(${card1X}px)`,
								background: `${colors.purple}22`,
								border: `2px solid ${colors.purple}`,
								borderRadius: 16,
								padding: "24px 32px",
								minWidth: 180,
								textAlign: "center",
							}}
						>
							<div
								style={{
									fontFamily: "Circular-LL, sans-serif",
									fontSize: 20,
									color: colors.white,
									fontWeight: 700,
								}}
							>
								{guild1}
							</div>
							{frame >= act2Start && (
								<div
									style={{
										fontFamily: "PPNeueBit, sans-serif",
										fontSize: 36,
										color: colors.purple,
										marginTop: 8,
									}}
								>
									{Math.round(barEased * score1).toLocaleString()}
								</div>
							)}
						</div>

						{/* Guild 2 */}
						<div
							style={{
								transform: `translateX(${card2X}px)`,
								background: `${colors.red}22`,
								border: `2px solid ${colors.red}`,
								borderRadius: 16,
								padding: "24px 32px",
								minWidth: 180,
								textAlign: "center",
							}}
						>
							<div
								style={{
									fontFamily: "Circular-LL, sans-serif",
									fontSize: 20,
									color: colors.white,
									fontWeight: 700,
								}}
							>
								{guild2}
							</div>
							{frame >= act2Start && (
								<div
									style={{
										fontFamily: "PPNeueBit, sans-serif",
										fontSize: 36,
										color: colors.red,
										marginTop: 8,
									}}
								>
									{Math.round(barEased * score2).toLocaleString()}
								</div>
							)}
						</div>
					</div>
				</Sequence>

				{/* Stats bars */}
				<Sequence from={act2Start}>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: 12,
							width: 360,
						}}
					>
						<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
							<div
								style={{
									height: 24,
									width: bar1Width,
									backgroundColor: colors.purple,
									borderRadius: 4,
									boxShadow: `0 0 12px ${colors.purple}66`,
								}}
							/>
						</div>
						<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
							<div
								style={{
									height: 24,
									width: bar2Width,
									backgroundColor: colors.red,
									borderRadius: 4,
									boxShadow: `0 0 12px ${colors.red}66`,
								}}
							/>
						</div>
					</div>
				</Sequence>

				<SceneTransition type="flash" triggerFrame={act3Start} duration={6} />

				{/* GUILD CHAMPION */}
				<Sequence from={outroStart}>
					<EmotionText
						text="GUILD CHAMPION"
						color={colors.yellow}
						fontSize={64}
					/>
				</Sequence>

				<Sequence from={outroStart + 15}>
					<div
						style={{
							fontFamily: "Circular-LL, sans-serif",
							fontSize: 24,
							color: colors.mauve,
							opacity: interpolate(
								Math.max(0, frame - outroStart - 15),
								[0, 15],
								[0, 0.8],
								{
									extrapolateRight: "clamp",
								},
							),
						}}
					>
						{winner}
					</div>
				</Sequence>
			</div>
		</SquareLayout>
	);
};
