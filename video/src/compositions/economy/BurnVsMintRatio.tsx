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

export const burnVsMintRatioSchema = z.object({
	burned: z.number(),
	minted: z.number(),
	ratio: z.number(),
});

type BurnVsMintRatioProps = z.infer<typeof burnVsMintRatioSchema>;

const defaultProps: BurnVsMintRatioProps = {
	burned: 500000,
	minted: 750000,
	ratio: 0.67,
};

export { defaultProps as burnVsMintRatioDefaultProps };

export const BurnVsMintRatio: React.FC<BurnVsMintRatioProps> = ({
	burned,
	minted,
	ratio,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const splitStart = seconds(0.5);
	const beamStart = seconds(2.5);
	const ratioStart = seconds(3.5);

	// Balance beam animation
	const beamProgress = spring({
		frame: Math.max(0, frame - beamStart),
		fps,
		config: dramatic,
	});
	const beamTilt = interpolate(beamProgress, [0, 1], [0, (ratio - 0.5) * 30]);

	return (
		<SquareLayout>
			{/* Split compare: burn vs mint */}
			<div style={{ position: "absolute", inset: 0 }}>
				<SplitCompare
					splitFrame={splitStart}
					leftLabel="BURNED"
					rightLabel="MINTED"
					left={
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								gap: 16,
							}}
						>
							<div style={{ fontSize: 48, color: colors.red }}>🔥</div>
							<CounterRollUp
								value={burned}
								startFrame={splitStart}
								duration={seconds(1.5)}
								fontSize={48}
								color={colors.red}
							/>
						</div>
					}
					right={
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								gap: 16,
							}}
						>
							<div style={{ fontSize: 48, color: colors.green }}>+</div>
							<CounterRollUp
								value={minted}
								startFrame={splitStart}
								duration={seconds(1.5)}
								fontSize={48}
								color={colors.green}
							/>
						</div>
					}
				/>
			</div>

			{/* Balance beam */}
			<Sequence from={beamStart}>
				<div
					style={{
						position: "absolute",
						bottom: 180,
						left: "50%",
						transform: `translateX(-50%) rotate(${beamTilt}deg)`,
						transformOrigin: "center center",
					}}
				>
					<div
						style={{
							width: 400,
							height: 6,
							background: `linear-gradient(90deg, ${colors.red}, ${colors.mauve}, ${colors.green})`,
							borderRadius: 3,
							boxShadow: `0 0 12px ${colors.mauve}`,
						}}
					/>
					{/* Pivot */}
					<div
						style={{
							position: "absolute",
							bottom: -20,
							left: "50%",
							transform: "translateX(-50%)",
							width: 0,
							height: 0,
							borderLeft: "12px solid transparent",
							borderRight: "12px solid transparent",
							borderBottom: `20px solid ${colors.mauve}`,
						}}
					/>
				</div>
			</Sequence>

			{/* Ratio display */}
			<Sequence from={ratioStart}>
				<div
					style={{
						position: "absolute",
						bottom: 80,
						width: "100%",
						textAlign: "center",
					}}
				>
					<EmotionText
						text={`${ratio.toFixed(2)}x RATIO`}
						color={colors.yellow}
						fontSize={40}
					/>
				</div>
			</Sequence>
		</SquareLayout>
	);
};
