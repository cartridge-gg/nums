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
import { punch, dramatic } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

export const referralActivationSchema = z.object({
	referralPct: z.number(),
});

type ReferralActivationProps = z.infer<typeof referralActivationSchema>;

const defaultProps: ReferralActivationProps = {
	referralPct: 10,
};

export { defaultProps as referralActivationDefaultProps };

export const ReferralActivation: React.FC<ReferralActivationProps> = ({
	referralPct,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const slamStart = seconds(0.5);
	const networkStart = seconds(1.5);
	const outroStart = seconds(3);

	// LIVE slam entrance
	const slamProgress = spring({
		frame: Math.max(0, frame - slamStart),
		fps,
		config: punch,
	});
	const slamScale = interpolate(
		slamProgress,
		[0, 0.3, 0.6, 1],
		[3, 0.9, 1.05, 1],
	);

	// Network nodes growing
	const nodeCount = 8;
	const networkProgress = interpolate(
		Math.max(0, frame - networkStart),
		[0, seconds(1.5)],
		[0, 1],
		{ extrapolateRight: "clamp" },
	);

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
				{/* REFERRALS: LIVE slam */}
				<Sequence from={slamStart}>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 16,
							transform: `scale(${slamScale})`,
						}}
					>
						<div
							style={{
								fontFamily: "PPNeueBit, sans-serif",
								fontSize: 56,
								fontWeight: 700,
								color: colors.white,
								textShadow: `4px 4px 0px rgba(0, 0, 0, 0.5)`,
							}}
						>
							REFERRALS:
						</div>
						<div
							style={{
								fontFamily: "PPNeueBit, sans-serif",
								fontSize: 56,
								fontWeight: 700,
								color: colors.green,
								textShadow: `0 0 20px ${colors.green}66`,
							}}
						>
							LIVE
						</div>
					</div>
				</Sequence>

				<SceneTransition
					type="flash"
					triggerFrame={slamStart}
					duration={4}
					color={colors.green}
				/>

				{/* Referral percentage */}
				<Sequence from={seconds(1)}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 80,
							color: colors.yellow,
							opacity: interpolate(
								spring({
									frame: Math.max(0, frame - seconds(1)),
									fps,
									config: dramatic,
								}),
								[0, 1],
								[0, 1],
							),
							textShadow: `0 0 20px ${colors.yellow}44`,
						}}
					>
						{referralPct}%
					</div>
				</Sequence>

				{/* Growing network visualization */}
				<Sequence from={networkStart}>
					<div style={{ position: "relative", width: 280, height: 180 }}>
						{Array.from(
							{ length: Math.ceil(nodeCount * networkProgress) },
							(_, i) => i,
						).map((i) => {
							const angle = (i / nodeCount) * Math.PI * 2;
							const radius = 70;
							const cx = 140 + Math.cos(angle) * radius;
							const cy = 90 + Math.sin(angle) * radius;

							const nodeProgress = spring({
								frame: Math.max(0, frame - networkStart - i * 4),
								fps,
								config: punch,
							});

							return (
								<div key={i}>
									<svg
										style={{ position: "absolute", inset: 0 }}
										width={280}
										height={180}
										role="img"
										aria-label="connection line"
									>
										<line
											x1={140}
											y1={90}
											x2={cx}
											y2={cy}
											stroke={colors.green}
											strokeWidth={2}
											opacity={nodeProgress * 0.4}
										/>
									</svg>
									<div
										style={{
											position: "absolute",
											left: cx - 6,
											top: cy - 6,
											width: 12,
											height: 12,
											borderRadius: "50%",
											backgroundColor: colors.green,
											transform: `scale(${nodeProgress})`,
											boxShadow: `0 0 8px ${colors.green}88`,
										}}
									/>
								</div>
							);
						})}
						<div
							style={{
								position: "absolute",
								left: 134,
								top: 84,
								width: 12,
								height: 12,
								borderRadius: "50%",
								backgroundColor: colors.yellow,
								boxShadow: `0 0 16px ${colors.yellow}88`,
							}}
						/>
					</div>
				</Sequence>

				{/* SHARE. EARN. GROW. */}
				<Sequence from={outroStart}>
					<div style={{ display: "flex", gap: 16 }}>
						<EmotionText text="SHARE." color={colors.green} fontSize={48} />
					</div>
				</Sequence>
				<Sequence from={outroStart + 8}>
					<EmotionText text="EARN." color={colors.yellow} fontSize={48} />
				</Sequence>
				<Sequence from={outroStart + 16}>
					<EmotionText text="GROW." color={colors.green} fontSize={48} />
				</Sequence>
			</div>
		</SquareLayout>
	);
};
