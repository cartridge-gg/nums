import {
	useCurrentFrame,
	useVideoConfig,
	spring,
	interpolate,
	Sequence,
} from "remotion";
import { z } from "zod";
import { SquareLayout } from "@video/components/layouts/SquareLayout";
import { SplitCompare } from "@video/components/patterns/SplitCompare";
import { CounterRollUp } from "@video/components/patterns/CounterRollUp";
import { EmotionText } from "@video/components/enhanced/EmotionText";
import { seconds } from "@video/lib/timing";
import { dramatic } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

export const revenueToggleChangeSchema = z.object({
	oldBurnPct: z.number(),
	newBurnPct: z.number(),
	voteCount: z.number(),
});

type RevenueToggleChangeProps = z.infer<typeof revenueToggleChangeSchema>;

const defaultProps: RevenueToggleChangeProps = {
	oldBurnPct: 50,
	newBurnPct: 70,
	voteCount: 342,
};

export { defaultProps as revenueToggleChangeDefaultProps };

export const RevenueToggleChange: React.FC<RevenueToggleChangeProps> = ({
	oldBurnPct,
	newBurnPct,
	voteCount,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const headerStart = seconds(0.3);
	const splitStart = seconds(0.8);
	const voteStart = seconds(2.5);
	const barStart = seconds(3);

	// Bar transition animation
	const barProgress = spring({
		frame: Math.max(0, frame - barStart),
		fps,
		config: dramatic,
	});
	const burnWidth = interpolate(barProgress, [0, 1], [oldBurnPct, newBurnPct]);

	return (
		<SquareLayout>
			{/* Header */}
			<Sequence from={headerStart}>
				<div
					style={{
						position: "absolute",
						top: 80,
						width: "100%",
						textAlign: "center",
					}}
				>
					<EmotionText text="DAO VOTED" color={colors.purple} fontSize={40} />
				</div>
			</Sequence>

			{/* Old vs new split */}
			<div style={{ position: "absolute", inset: 0, top: 160, bottom: 350 }}>
				<SplitCompare
					splitFrame={splitStart}
					leftLabel={`OLD: ${oldBurnPct}% BURN`}
					rightLabel={`NEW: ${newBurnPct}% BURN`}
					left={
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								gap: 12,
							}}
						>
							<div
								style={{
									fontFamily: "PPNeueBit, sans-serif",
									fontSize: 64,
									color: colors.red,
									opacity: 0.5,
								}}
							>
								{oldBurnPct}%
							</div>
							<div
								style={{
									fontFamily: "PPNeueBit, sans-serif",
									fontSize: 18,
									color: colors.mauve,
								}}
							>
								BURN / {100 - oldBurnPct}% REVENUE
							</div>
						</div>
					}
					right={
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								gap: 12,
							}}
						>
							<div
								style={{
									fontFamily: "PPNeueBit, sans-serif",
									fontSize: 64,
									color: colors.green,
									textShadow: `0 0 15px ${colors.green}`,
								}}
							>
								{newBurnPct}%
							</div>
							<div
								style={{
									fontFamily: "PPNeueBit, sans-serif",
									fontSize: 18,
									color: colors.mauve,
								}}
							>
								BURN / {100 - newBurnPct}% REVENUE
							</div>
						</div>
					}
				/>
			</div>

			{/* Animated burn/revenue bar */}
			<Sequence from={barStart}>
				<div
					style={{
						position: "absolute",
						bottom: 200,
						left: "50%",
						transform: "translateX(-50%)",
						width: 400,
					}}
				>
					<div
						style={{
							width: "100%",
							height: 24,
							borderRadius: 12,
							backgroundColor: colors.bgLight,
							overflow: "hidden",
							border: `1px solid ${colors.gray}`,
						}}
					>
						<div
							style={{
								width: `${burnWidth}%`,
								height: "100%",
								background: `linear-gradient(90deg, ${colors.red}, ${colors.yellow})`,
								borderRadius: 12,
								transition: "none",
							}}
						/>
					</div>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							marginTop: 8,
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 14,
						}}
					>
						<span style={{ color: colors.red }}>
							BURN {Math.round(burnWidth)}%
						</span>
						<span style={{ color: colors.green }}>
							REVENUE {Math.round(100 - burnWidth)}%
						</span>
					</div>
				</div>
			</Sequence>

			{/* Vote count visualization */}
			<Sequence from={voteStart}>
				<div
					style={{
						position: "absolute",
						bottom: 100,
						width: "100%",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: 8,
					}}
				>
					<CounterRollUp
						value={voteCount}
						duration={seconds(1)}
						fontSize={32}
						color={colors.purple}
						suffix=" VOTES"
					/>
				</div>
			</Sequence>
		</SquareLayout>
	);
};
