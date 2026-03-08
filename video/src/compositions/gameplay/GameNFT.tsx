import {
	useCurrentFrame,
	useVideoConfig,
	spring,
	interpolate,
	Sequence,
} from "remotion";
import { z } from "zod";
import { SquareLayout } from "@video/components/layouts/SquareLayout";
import { GridFillSequence } from "@video/components/patterns/GridFillSequence";
import { EmotionText } from "@video/components/enhanced/EmotionText";
import { SceneTransition } from "@video/components/patterns/SceneTransition";
import { seconds } from "@video/lib/timing";
import { dramatic, breathe } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

export const gameNFTSchema = z.object({
	slots: z.array(z.number()).length(18),
	playerName: z.string(),
	reward: z.number(),
});

type GameNFTProps = z.infer<typeof gameNFTSchema>;

const defaultProps: GameNFTProps = {
	slots: [
		23, 67, 89, 124, 201, 278, 334, 389, 445, 512, 567, 623, 678, 734, 789, 845,
		901, 956,
	],
	playerName: "Player1",
	reward: 12000,
};

export { defaultProps as gameNFTDefaultProps };

export const GameNFT: React.FC<GameNFTProps> = ({
	slots,
	playerName,
	reward,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const crystallizeStart = seconds(2);
	const cardStart = seconds(3.5);
	const textStart = seconds(4.5);

	// Crystallize: grid shrinks into card
	const crystallizeProgress = spring({
		frame: Math.max(0, frame - crystallizeStart),
		fps,
		config: dramatic,
	});
	const gridScale = interpolate(crystallizeProgress, [0, 1], [1, 0.6]);
	const gridBorderRadius = interpolate(crystallizeProgress, [0, 1], [0, 16]);

	// Card border glow
	const cardProgress = spring({
		frame: Math.max(0, frame - cardStart),
		fps,
		config: breathe,
	});
	const borderOpacity = interpolate(cardProgress, [0, 1], [0, 1]);

	// Shimmer effect
	const shimmerAngle = frame * 2;

	// Text fade
	const textOpacity = interpolate(frame, [textStart, textStart + 20], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	return (
		<SquareLayout>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					gap: 24,
					width: "100%",
					height: "100%",
				}}
			>
				{/* Grid crystallizing into card */}
				<div
					style={{
						transform: `scale(${gridScale})`,
						borderRadius: gridBorderRadius,
						overflow: "hidden",
						position: "relative",
						padding: frame >= cardStart ? 24 : 0,
						background:
							frame >= cardStart
								? `linear-gradient(135deg, ${colors.purple}30, ${colors.mauve}20, ${colors.purple}30)`
								: "transparent",
						border:
							frame >= cardStart
								? `2px solid rgba(133, 129, 255, ${borderOpacity * 0.8})`
								: "none",
						boxShadow:
							frame >= cardStart
								? `0 0 40px ${colors.purple}40, inset 0 0 20px ${colors.purple}10`
								: "none",
					}}
				>
					<GridFillSequence slots={slots} />

					{/* Shimmer overlay on card */}
					{frame >= cardStart && (
						<div
							style={{
								position: "absolute",
								inset: 0,
								background: `linear-gradient(${shimmerAngle}deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)`,
								pointerEvents: "none",
							}}
						/>
					)}

					{/* Player name on card */}
					{frame >= cardStart && (
						<div
							style={{
								position: "absolute",
								bottom: 8,
								left: 0,
								right: 0,
								textAlign: "center",
								fontFamily: "Circular-LL, sans-serif",
								fontSize: 14,
								color: colors.mauve,
								opacity: borderOpacity * 0.8,
							}}
						>
							{playerName}
						</div>
					)}
				</div>

				{/* Flash on crystallize */}
				<SceneTransition
					type="flash"
					triggerFrame={crystallizeStart}
					duration={8}
					color={colors.purple}
				/>

				{/* Reward */}
				{frame >= cardStart && (
					<Sequence from={cardStart + 10}>
						<div
							style={{
								fontFamily: "PPNeueBit, sans-serif",
								fontSize: 36,
								color: colors.yellow,
								opacity: interpolate(frame - cardStart - 10, [0, 15], [0, 1], {
									extrapolateRight: "clamp",
								}),
							}}
						>
							+{reward} LORDS
						</div>
					</Sequence>
				)}

				{/* Tagline */}
				<Sequence from={textStart}>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: 8,
							opacity: textOpacity,
						}}
					>
						<EmotionText text="MINTED" color={colors.purple} fontSize={56} />
						<div
							style={{
								fontFamily: "Circular-LL, sans-serif",
								fontSize: 18,
								color: colors.mauve,
								letterSpacing: 4,
								opacity: 0.7,
							}}
						>
							Permanent. Onchain. Yours.
						</div>
					</div>
				</Sequence>
			</div>
		</SquareLayout>
	);
};
