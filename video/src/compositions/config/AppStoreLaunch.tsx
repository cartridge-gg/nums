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

export const appStoreLaunchSchema = z.object({
	platform: z.enum(["ios", "android", "both"]),
});

type AppStoreLaunchProps = z.infer<typeof appStoreLaunchSchema>;

const defaultProps: AppStoreLaunchProps = {
	platform: "both",
};

export { defaultProps as appStoreLaunchDefaultProps };

const platformLabels: Record<string, string> = {
	ios: "APP STORE",
	android: "PLAY STORE",
	both: "APP STORE & PLAY STORE",
};

export const AppStoreLaunch: React.FC<AppStoreLaunchProps> = ({ platform }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const phoneStart = seconds(0.5);
	const iconStart = seconds(2);
	const outroStart = seconds(3.5);

	// Phone slides up from below
	const phoneProgress = spring({
		frame: Math.max(0, frame - phoneStart),
		fps,
		config: dramatic,
	});
	const phoneY = interpolate(phoneProgress, [0, 1], [600, 0]);

	// App icon bounce
	const iconProgress = spring({
		frame: Math.max(0, frame - iconStart),
		fps,
		config: punch,
	});
	const iconScale = interpolate(
		iconProgress,
		[0, 0.3, 0.6, 0.8, 1],
		[0, 1.3, 0.9, 1.05, 1],
	);

	// Glow pulse behind icon
	const glowPulse = Math.sin(frame * 0.1) * 0.15 + 0.85;

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
				{/* Phone frame sliding up */}
				<Sequence from={phoneStart}>
					<div
						style={{
							transform: `translateY(${phoneY}px)`,
							position: "relative",
						}}
					>
						{/* Phone outline */}
						<div
							style={{
								width: 200,
								height: 380,
								borderRadius: 32,
								border: `3px solid ${colors.mauve}`,
								backgroundColor: `${colors.bgLight}`,
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								justifyContent: "center",
								gap: 16,
								position: "relative",
								overflow: "hidden",
							}}
						>
							{/* Notch */}
							<div
								style={{
									position: "absolute",
									top: 8,
									width: 60,
									height: 6,
									borderRadius: 3,
									backgroundColor: `${colors.mauve}44`,
								}}
							/>

							{/* App icon */}
							{frame >= iconStart && (
								<div style={{ position: "relative" }}>
									{/* Glow ring */}
									<div
										style={{
											position: "absolute",
											inset: -12,
											borderRadius: 24,
											background: `radial-gradient(circle, ${colors.purple}${Math.round(
												glowPulse * 30,
											)
												.toString(16)
												.padStart(2, "0")} 0%, transparent 70%)`,
										}}
									/>
									<div
										style={{
											width: 80,
											height: 80,
											borderRadius: 20,
											background: `linear-gradient(135deg, ${colors.purple}, ${colors.blue})`,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											transform: `scale(${iconScale})`,
											boxShadow: `0 0 20px ${colors.purple}66`,
										}}
									>
										<div
											style={{
												fontFamily: "PPNeueBit, sans-serif",
												fontSize: 24,
												color: colors.white,
												fontWeight: 700,
											}}
										>
											N
										</div>
									</div>
								</div>
							)}

							{/* App name under icon */}
							{frame >= iconStart + 10 && (
								<div
									style={{
										fontFamily: "Circular-LL, sans-serif",
										fontSize: 14,
										color: colors.white,
										opacity: interpolate(
											Math.max(0, frame - iconStart - 10),
											[0, 10],
											[0, 1],
											{ extrapolateRight: "clamp" },
										),
									}}
								>
									Nums
								</div>
							)}
						</div>
					</div>
				</Sequence>

				<SceneTransition
					type="flash"
					triggerFrame={outroStart}
					duration={6}
					color={colors.purple}
				/>

				{/* NOW ON MOBILE */}
				<Sequence from={outroStart + 5}>
					<EmotionText
						text="NOW ON MOBILE"
						color={colors.yellow}
						fontSize={64}
					/>
				</Sequence>

				{/* Platform label */}
				<Sequence from={outroStart + 20}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 20,
							color: colors.mauve,
							opacity: interpolate(
								Math.max(0, frame - outroStart - 20),
								[0, 15],
								[0, 0.7],
								{ extrapolateRight: "clamp" },
							),
							letterSpacing: 2,
						}}
					>
						{platformLabels[platform]}
					</div>
				</Sequence>
			</div>
		</SquareLayout>
	);
};
