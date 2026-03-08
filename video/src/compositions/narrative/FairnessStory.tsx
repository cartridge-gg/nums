import { Sequence } from "remotion";
import { z } from "zod";
import { SquareLayout } from "@video/components/layouts/SquareLayout";
import { SplitCompare } from "@video/components/patterns/SplitCompare";
import { EmotionText } from "@video/components/enhanced/EmotionText";
import { seconds } from "@video/lib/timing";
import { colors } from "@video/lib/colors";

export const fairnessStorySchema = z.object({
	houseEdge: z.number(),
});

type FairnessStoryProps = z.infer<typeof fairnessStorySchema>;

const defaultProps: FairnessStoryProps = {
	houseEdge: 5,
};

export { defaultProps as fairnessStoryDefaultProps };

export const FairnessStory: React.FC<FairnessStoryProps> = ({ houseEdge }) => {
	const splitStart = seconds(1);
	const outroStart = seconds(4);

	// Casino side content
	const casinoSide = (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: 16,
			}}
		>
			<div
				style={{
					fontFamily: "PPNeueBit, sans-serif",
					fontSize: 48,
					color: colors.red,
				}}
			>
				{houseEdge}%
			</div>
			<div
				style={{
					fontFamily: "Circular-LL, sans-serif",
					fontSize: 16,
					color: colors.mauve,
					textAlign: "center",
				}}
			>
				HOUSE EDGE
			</div>
			<div
				style={{
					fontFamily: "Circular-LL, sans-serif",
					fontSize: 14,
					color: colors.mauve,
					opacity: 0.5,
					textAlign: "center",
				}}
			>
				HIDDEN ODDS
				<br />
				OPAQUE LOGIC
				<br />
				TRUST US
			</div>
		</div>
	);

	// Nums side content
	const numsSide = (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: 16,
			}}
		>
			<div
				style={{
					fontFamily: "PPNeueBit, sans-serif",
					fontSize: 48,
					color: colors.green,
				}}
			>
				0%
			</div>
			<div
				style={{
					fontFamily: "Circular-LL, sans-serif",
					fontSize: 16,
					color: colors.green,
					textAlign: "center",
				}}
			>
				FAIR GAME
			</div>
			<div
				style={{
					fontFamily: "Circular-LL, sans-serif",
					fontSize: 14,
					color: colors.mauve,
					opacity: 0.8,
					textAlign: "center",
				}}
			>
				VERIFIABLE
				<br />
				ONCHAIN
				<br />
				TRANSPARENT
			</div>
		</div>
	);

	return (
		<SquareLayout>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					width: "100%",
					height: "100%",
					position: "relative",
				}}
			>
				{/* Split compare */}
				<Sequence from={0}>
					<SplitCompare
						left={casinoSide}
						right={numsSide}
						leftLabel="CASINO"
						rightLabel="NUMS"
						splitFrame={splitStart}
					/>
				</Sequence>

				{/* Tagline */}
				<div
					style={{
						position: "absolute",
						bottom: 120,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: 8,
					}}
				>
					<Sequence from={outroStart}>
						<EmotionText
							text="TRANSPARENT."
							color={colors.green}
							fontSize={48}
						/>
					</Sequence>
					<Sequence from={outroStart + 10}>
						<EmotionText text="ONCHAIN." color={colors.green} fontSize={48} />
					</Sequence>
					<Sequence from={outroStart + 20}>
						<EmotionText text="FAIR." color={colors.yellow} fontSize={56} />
					</Sequence>
				</div>
			</div>
		</SquareLayout>
	);
};
