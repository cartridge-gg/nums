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

export const stakingOpensSchema = z.object({
	initialYield: z.number(),
});

type StakingOpensProps = z.infer<typeof stakingOpensSchema>;

const defaultProps: StakingOpensProps = {
	initialYield: 12,
};

export { defaultProps as stakingOpensDefaultProps };

export const StakingOpens: React.FC<StakingOpensProps> = ({ initialYield }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const unlockStart = seconds(1.5);
	const doorStart = seconds(2.5);
	const outroStart = seconds(3.5);

	// Vault lock rotation
	const lockProgress = spring({
		frame: Math.max(0, frame - seconds(0.5)),
		fps,
		config: dramatic,
	});
	const lockRotation = interpolate(lockProgress, [0, 1], [0, 180]);

	// Door opening
	const doorProgress = spring({
		frame: Math.max(0, frame - doorStart),
		fps,
		config: dramatic,
	});
	const doorAngle = interpolate(doorProgress, [0, 1], [0, -70]);

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
				{/* Vault visualization */}
				<Sequence from={seconds(0.5)}>
					<div
						style={{
							position: "relative",
							width: 240,
							height: 240,
						}}
					>
						{/* Vault door */}
						<div
							style={{
								width: 240,
								height: 240,
								borderRadius: 24,
								backgroundColor: `${colors.mauve}22`,
								border: `3px solid ${colors.mauve}`,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								transform: `perspective(800px) rotateY(${doorAngle}deg)`,
								transformOrigin: "left center",
								boxShadow:
									doorProgress > 0.5
										? `inset 0 0 40px ${colors.yellow}22`
										: "none",
							}}
						>
							{/* Lock dial */}
							<div
								style={{
									width: 80,
									height: 80,
									borderRadius: "50%",
									border: `3px solid ${frame >= unlockStart ? colors.green : colors.mauve}`,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									transform: `rotate(${lockRotation}deg)`,
									transition: "border-color 0.2s",
								}}
							>
								<div
									style={{
										width: 4,
										height: 30,
										backgroundColor:
											frame >= unlockStart ? colors.green : colors.mauve,
										borderRadius: 2,
									}}
								/>
							</div>
						</div>

						{/* Glow behind open door */}
						{doorProgress > 0.3 && (
							<div
								style={{
									position: "absolute",
									inset: 20,
									borderRadius: 16,
									background: `radial-gradient(circle, ${colors.yellow}${Math.round(
										doorProgress * 40,
									)
										.toString(16)
										.padStart(2, "0")} 0%, transparent 70%)`,
									zIndex: -1,
								}}
							/>
						)}
					</div>
				</Sequence>

				<SceneTransition
					type="flash"
					triggerFrame={unlockStart}
					duration={6}
					color={colors.green}
				/>

				{/* STAKING IS LIVE */}
				<Sequence from={outroStart}>
					<EmotionText
						text="STAKING IS LIVE"
						color={colors.green}
						fontSize={64}
					/>
				</Sequence>

				{/* Yield preview */}
				<Sequence from={outroStart + 15}>
					<div
						style={{
							display: "flex",
							alignItems: "baseline",
							gap: 8,
							opacity: interpolate(
								spring({
									frame: Math.max(0, frame - outroStart - 15),
									fps,
									config: punch,
								}),
								[0, 1],
								[0, 1],
							),
						}}
					>
						<div
							style={{
								fontFamily: "PPNeueBit, sans-serif",
								fontSize: 64,
								color: colors.yellow,
								textShadow: `0 0 20px ${colors.yellow}44`,
							}}
						>
							{initialYield}%
						</div>
						<div
							style={{
								fontFamily: "Circular-LL, sans-serif",
								fontSize: 20,
								color: colors.mauve,
							}}
						>
							APY
						</div>
					</div>
				</Sequence>
			</div>
		</SquareLayout>
	);
};
