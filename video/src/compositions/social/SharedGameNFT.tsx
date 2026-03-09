import {
	useCurrentFrame,
	useVideoConfig,
	spring,
	interpolate,
	Sequence,
} from "remotion";
import { z } from "zod";
import { SquareLayout } from "@video/components/layouts/SquareLayout";
import { CounterRollUp } from "@video/components/patterns/CounterRollUp";
import { seconds } from "@video/lib/timing";
import { dramatic } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

export const sharedGameNFTSchema = z.object({
	playerName: z.string(),
	score: z.number(),
	reward: z.number(),
});

type SharedGameNFTProps = z.infer<typeof sharedGameNFTSchema>;

const defaultProps: SharedGameNFTProps = {
	playerName: "Player1",
	score: 12500,
	reward: 3200,
};

export { defaultProps as sharedGameNFTDefaultProps };

export const SharedGameNFT: React.FC<SharedGameNFTProps> = ({
	playerName,
	score,
	reward,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const act2Start = seconds(1);
	const act3Start = seconds(2.5);

	// Card frame entrance
	const cardProgress = spring({ frame, fps, config: dramatic });
	const cardScale = interpolate(cardProgress, [0, 1], [0.8, 1]);
	const cardOpacity = interpolate(cardProgress, [0, 0.5], [0, 1], {
		extrapolateRight: "clamp",
	});

	// Shimmer effect on card border
	const shimmerPos = interpolate(frame, [0, 120], [-100, 200], {
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
					width: "100%",
				}}
			>
				{/* Social card frame */}
				<Sequence from={0}>
					<div
						style={{
							transform: `scale(${cardScale})`,
							opacity: cardOpacity,
							background: `linear-gradient(135deg, ${colors.bgLight} 0%, ${colors.bg} 100%)`,
							border: `2px solid ${colors.purple}`,
							borderRadius: 24,
							padding: 48,
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: 24,
							position: "relative",
							overflow: "hidden",
							minWidth: 400,
						}}
					>
						{/* Shimmer overlay */}
						<div
							style={{
								position: "absolute",
								inset: 0,
								background: `linear-gradient(105deg, transparent ${shimmerPos - 20}%, rgba(255,255,255,0.06) ${shimmerPos}%, transparent ${shimmerPos + 20}%)`,
								pointerEvents: "none",
							}}
						/>

						{/* NUMS logo area */}
						<div
							style={{
								fontFamily: "PPNeueBit, sans-serif",
								fontSize: 20,
								color: colors.mauve,
								opacity: 0.6,
								letterSpacing: 4,
							}}
						>
							NUMS
						</div>

						{/* Player name */}
						<div
							style={{
								fontFamily: "Circular-LL, sans-serif",
								fontSize: 28,
								color: colors.white,
								fontWeight: 700,
							}}
						>
							{playerName}
						</div>

						{/* Score */}
						<Sequence from={act2Start}>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									gap: 4,
								}}
							>
								<div
									style={{
										fontFamily: "PPNeueBit, sans-serif",
										fontSize: 14,
										color: colors.mauve,
										opacity: 0.6,
									}}
								>
									SCORE
								</div>
								<CounterRollUp
									value={score}
									duration={seconds(1)}
									fontSize={56}
									color={colors.yellow}
								/>
							</div>
						</Sequence>

						{/* Reward */}
						<Sequence from={act3Start}>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									gap: 4,
								}}
							>
								<div
									style={{
										fontFamily: "PPNeueBit, sans-serif",
										fontSize: 14,
										color: colors.mauve,
										opacity: 0.6,
									}}
								>
									REWARD
								</div>
								<CounterRollUp
									value={reward}
									duration={seconds(0.8)}
									fontSize={40}
									color={colors.green}
									prefix="+"
								/>
							</div>
						</Sequence>

						{/* Divider */}
						<div
							style={{
								width: "80%",
								height: 1,
								backgroundColor: `${colors.mauve}33`,
							}}
						/>

						{/* Share badge */}
						<div
							style={{
								fontFamily: "PPNeueBit, sans-serif",
								fontSize: 14,
								color: colors.mauve,
								opacity: 0.5,
								letterSpacing: 2,
							}}
						>
							PLAY ON NUMS.GG
						</div>
					</div>
				</Sequence>
			</div>
		</SquareLayout>
	);
};
