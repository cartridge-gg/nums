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

export const seasonOpenCloseSchema = z.object({
	season: z.number(),
	type: z.enum(["open", "close"]),
});

type SeasonOpenCloseProps = z.infer<typeof seasonOpenCloseSchema>;

const defaultProps: SeasonOpenCloseProps = {
	season: 2,
	type: "open",
};

export { defaultProps as seasonOpenCloseDefaultProps };

export const SeasonOpenClose: React.FC<SeasonOpenCloseProps> = ({
	season,
	type,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const isClose = type === "close";
	const act2Start = seconds(2);
	const act3Start = seconds(3.5);
	const outroStart = seconds(4.5);

	if (isClose) {
		// Countdown to zero
		const countdownDuration = seconds(3);
		const countdownProgress = interpolate(
			frame,
			[0, countdownDuration],
			[10, 0],
			{
				extrapolateRight: "clamp",
			},
		);
		const displayCount = Math.ceil(countdownProgress);

		// Screen shatter effect
		const shatterStart = seconds(3);
		const shatterProgress = interpolate(
			Math.max(0, frame - shatterStart),
			[0, seconds(1)],
			[0, 1],
			{ extrapolateRight: "clamp" },
		);

		// Create shatter fragments
		const fragments = Array.from({ length: 16 }).map((_, i) => {
			const row = Math.floor(i / 4);
			const col = i % 4;
			const angle = Math.atan2(row - 1.5, col - 1.5);
			const dist = shatterProgress * 300;
			const x = Math.cos(angle) * dist;
			const y = Math.sin(angle) * dist;
			const rotation = shatterProgress * (i * 45);
			return { row, col, x, y, rotation, opacity: 1 - shatterProgress };
		});

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
					<Sequence from={0}>
						<div
							style={{
								fontFamily: "PPNeueBit, sans-serif",
								fontSize: 24,
								color: colors.mauve,
								opacity: 0.7,
							}}
						>
							SEASON {season} ENDS IN
						</div>
					</Sequence>

					{/* Countdown number */}
					<Sequence from={0} durationInFrames={shatterStart}>
						<div
							style={{
								fontFamily: "PPNeueBit, sans-serif",
								fontSize: 200,
								fontWeight: 700,
								color: displayCount <= 3 ? colors.red : colors.white,
								textShadow: `4px 4px 0px rgba(0, 0, 0, 0.5)`,
							}}
						>
							{displayCount}
						</div>
					</Sequence>

					{/* Shatter fragments */}
					{frame >= shatterStart && (
						<div style={{ position: "relative", width: 400, height: 400 }}>
							{fragments.map((f) => (
								<div
									key={`${f.row}-${f.col}`}
									style={{
										position: "absolute",
										left: f.col * 100,
										top: f.row * 100,
										width: 100,
										height: 100,
										backgroundColor: colors.bgLight,
										border: `1px solid ${colors.mauve}33`,
										transform: `translate(${f.x}px, ${f.y}px) rotate(${f.rotation}deg)`,
										opacity: f.opacity,
									}}
								/>
							))}
						</div>
					)}

					<SceneTransition
						type="flash"
						triggerFrame={shatterStart}
						duration={6}
						color={colors.red}
					/>

					<Sequence from={outroStart}>
						<EmotionText text="SEASON OVER" color={colors.red} fontSize={72} />
					</Sequence>
				</div>
			</SquareLayout>
		);
	}

	// Open: title builds
	const titleProgress = spring({
		frame: Math.max(0, frame - seconds(1)),
		fps,
		config: dramatic,
	});
	const titleScale = interpolate(titleProgress, [0, 1], [0.3, 1]);

	const numberReveal = spring({
		frame: Math.max(0, frame - act2Start),
		fps,
		config: punch,
	});
	const numberScale = interpolate(numberReveal, [0, 0.5, 1], [0, 1.4, 1]);

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
				{/* Season title builds */}
				<Sequence from={seconds(1)}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 28,
							color: colors.mauve,
							transform: `scale(${titleScale})`,
							opacity: titleProgress,
						}}
					>
						SEASON
					</div>
				</Sequence>

				{/* Big season number */}
				<Sequence from={act2Start}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 200,
							fontWeight: 700,
							color: colors.yellow,
							transform: `scale(${numberScale})`,
							textShadow: `0 0 40px ${colors.yellow}66`,
						}}
					>
						{season}
					</div>
				</Sequence>

				<SceneTransition
					type="flash"
					triggerFrame={act3Start}
					duration={8}
					color={colors.yellow}
				/>

				{/* IT'S GO TIME */}
				<Sequence from={outroStart}>
					<EmotionText text="IT'S GO TIME" color={colors.green} fontSize={80} />
				</Sequence>
			</div>
		</SquareLayout>
	);
};
