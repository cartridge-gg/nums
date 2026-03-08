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

export const newPackTierSchema = z.object({
	tierName: z.string(),
	multiplier: z.number(),
	price: z.number(),
});

type NewPackTierProps = z.infer<typeof newPackTierSchema>;

const defaultProps: NewPackTierProps = {
	tierName: "Diamond",
	multiplier: 5,
	price: 1000,
};

export { defaultProps as newPackTierDefaultProps };

export const NewPackTier: React.FC<NewPackTierProps> = ({
	tierName,
	multiplier,
	price,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const dealStart = seconds(0.5);
	const revealStart = seconds(2);
	const compareStart = seconds(3);
	const outroStart = seconds(4);

	// Card dealing from deck
	const dealProgress = spring({
		frame: Math.max(0, frame - dealStart),
		fps,
		config: dramatic,
	});
	const cardY = interpolate(dealProgress, [0, 1], [-200, 0]);
	const cardRotation = interpolate(dealProgress, [0, 1], [-15, 0]);

	// Stats reveal
	const statsReveal = spring({
		frame: Math.max(0, frame - revealStart),
		fps,
		config: punch,
	});

	// Shimmer on card
	const shimmerPos = interpolate(frame, [0, 150], [-50, 150], {
		extrapolateRight: "clamp",
	});

	// Comparison tiers
	const tiers = [
		{ name: "Bronze", mult: 1, col: colors.reroll },
		{ name: "Silver", mult: 2, col: colors.mauve },
		{ name: "Gold", mult: 3, col: colors.yellow },
		{ name: tierName, mult: multiplier, col: colors.purple },
	];

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
				{/* Card dealing */}
				<Sequence from={dealStart}>
					<div
						style={{
							width: 220,
							height: 300,
							borderRadius: 16,
							background: `linear-gradient(135deg, ${colors.purple}33, ${colors.yellow}22)`,
							border: `2px solid ${colors.purple}`,
							transform: `translateY(${cardY}px) rotate(${cardRotation}deg)`,
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							gap: 16,
							position: "relative",
							overflow: "hidden",
							boxShadow: `0 0 30px ${colors.purple}44`,
						}}
					>
						{/* Shimmer */}
						<div
							style={{
								position: "absolute",
								inset: 0,
								background: `linear-gradient(105deg, transparent ${shimmerPos - 15}%, rgba(255,255,255,0.08) ${shimmerPos}%, transparent ${shimmerPos + 15}%)`,
								pointerEvents: "none",
							}}
						/>

						{/* Tier name */}
						<div
							style={{
								fontFamily: "PPNeueBit, sans-serif",
								fontSize: 32,
								color: colors.purple,
								letterSpacing: 3,
							}}
						>
							{tierName.toUpperCase()}
						</div>

						{/* Stats */}
						{frame >= revealStart && (
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									gap: 8,
									opacity: statsReveal,
									transform: `scale(${interpolate(statsReveal, [0, 1], [0.8, 1])})`,
								}}
							>
								<div
									style={{
										fontFamily: "PPNeueBit, sans-serif",
										fontSize: 48,
										color: colors.yellow,
									}}
								>
									{multiplier}x
								</div>
								<div
									style={{
										fontFamily: "Circular-LL, sans-serif",
										fontSize: 14,
										color: colors.mauve,
										opacity: 0.7,
									}}
								>
									MULTIPLIER
								</div>
								<div
									style={{
										fontFamily: "PPNeueBit, sans-serif",
										fontSize: 24,
										color: colors.green,
									}}
								>
									{price.toLocaleString()} TOKENS
								</div>
							</div>
						)}
					</div>
				</Sequence>

				{/* Tier comparison bar */}
				<Sequence from={compareStart}>
					<div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
						{[...tiers.entries()].map(([i, tier]) => {
							const barDelay = compareStart + i * 6;
							const barProgress = spring({
								frame: Math.max(0, frame - barDelay),
								fps,
								config: dramatic,
							});
							const isNew = tier.name === tierName;
							const barHeight = (tier.mult / multiplier) * 80 * barProgress;

							return (
								<div
									key={i}
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
											fontSize: 12,
											color: tier.col,
											opacity: barProgress,
										}}
									>
										{tier.mult}x
									</div>
									<div
										style={{
											width: 48,
											height: barHeight,
											backgroundColor: `${tier.col}${isNew ? "66" : "33"}`,
											border: isNew ? `2px solid ${tier.col}` : "none",
											borderRadius: "4px 4px 0 0",
											boxShadow: isNew ? `0 0 12px ${tier.col}44` : "none",
										}}
									/>
									<div
										style={{
											fontFamily: "PPNeueBit, sans-serif",
											fontSize: 10,
											color: colors.mauve,
											opacity: barProgress * 0.6,
										}}
									>
										{tier.name}
									</div>
								</div>
							);
						})}
					</div>
				</Sequence>

				<SceneTransition
					type="flash"
					triggerFrame={outroStart}
					duration={6}
					color={colors.purple}
				/>

				<Sequence from={outroStart + 5}>
					<EmotionText text="NEW TIER" color={colors.purple} fontSize={72} />
				</Sequence>
			</div>
		</SquareLayout>
	);
};
