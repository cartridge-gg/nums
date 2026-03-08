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

export const newChampionSchema = z.object({
	playerName: z.string(),
	score: z.number(),
	previousChampion: z.string(),
});

type NewChampionProps = z.infer<typeof newChampionSchema>;

const defaultProps: NewChampionProps = {
	playerName: "Player1",
	score: 98500,
	previousChampion: "OldChamp",
};

export { defaultProps as newChampionDefaultProps };

export const NewChampion: React.FC<NewChampionProps> = ({
	playerName,
	score,
	previousChampion,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const act2Start = seconds(2);
	const act3Start = seconds(3.5);
	const outroStart = seconds(5);

	// Rocket rise
	const riseProgress = spring({
		frame,
		fps,
		config: dramatic,
	});
	const riseY = interpolate(riseProgress, [0, 1], [400, 0]);

	// Crown materialize
	const crownProgress = spring({
		frame: Math.max(0, frame - act2Start),
		fps,
		config: punch,
	});
	const crownScale = interpolate(crownProgress, [0, 0.5, 1], [0, 1.3, 1]);
	const crownOpacity = interpolate(crownProgress, [0, 0.3], [0, 1], {
		extrapolateRight: "clamp",
	});

	// Previous champion fade
	const prevOpacity = interpolate(frame, [0, seconds(1)], [0.6, 0.2], {
		extrapolateRight: "clamp",
	});

	return (
		<SquareLayout>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 24,
					width: "100%",
				}}
			>
				{/* Previous champion fading */}
				<Sequence from={0} durationInFrames={act2Start}>
					<div
						style={{
							fontFamily: "Circular-LL, sans-serif",
							fontSize: 18,
							color: colors.mauve,
							opacity: prevOpacity,
							textDecoration: "line-through",
						}}
					>
						#{1} {previousChampion}
					</div>
				</Sequence>

				{/* Player rockets up */}
				<Sequence from={0}>
					<div
						style={{
							transform: `translateY(${riseY}px)`,
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: 12,
						}}
					>
						{/* Crown */}
						<div
							style={{
								fontSize: 64,
								transform: `scale(${crownScale})`,
								opacity: crownOpacity,
							}}
						>
							👑
						</div>

						{/* Player card */}
						<div
							style={{
								background: `linear-gradient(135deg, ${colors.yellow}22, ${colors.purple}33)`,
								border: `2px solid ${colors.yellow}`,
								borderRadius: 16,
								padding: "24px 48px",
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								gap: 8,
								boxShadow: `0 0 40px ${colors.yellow}44`,
							}}
						>
							<div
								style={{
									fontFamily: "PPNeueBit, sans-serif",
									fontSize: 20,
									color: colors.yellow,
								}}
							>
								#1
							</div>
							<div
								style={{
									fontFamily: "Circular-LL, sans-serif",
									fontSize: 32,
									color: colors.white,
									fontWeight: 700,
								}}
							>
								{playerName}
							</div>
						</div>
					</div>
				</Sequence>

				{/* Flash */}
				<SceneTransition type="flash" triggerFrame={act3Start} duration={8} />

				{/* NEW CHAMPION text */}
				<Sequence from={act3Start + 5}>
					<EmotionText
						text="NEW CHAMPION"
						color={colors.yellow}
						fontSize={72}
					/>
				</Sequence>

				{/* Score counter */}
				<Sequence from={outroStart}>
					<CounterRollUp
						value={score}
						duration={seconds(1)}
						fontSize={48}
						color={colors.yellow}
					/>
				</Sequence>
			</div>
		</SquareLayout>
	);
};
