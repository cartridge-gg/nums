import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { z } from "zod";
import { SquareLayout } from "@video/components/layouts/SquareLayout";
import { seconds } from "@video/lib/timing";
import { punch } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

export const toastFeedSchema = z.object({
	events: z.array(
		z.object({
			type: z.string(),
			message: z.string(),
		}),
	),
});

type ToastFeedProps = z.infer<typeof toastFeedSchema>;

const defaultProps: ToastFeedProps = {
	events: [
		{ type: "win", message: "Player1 won 5,000!" },
		{ type: "streak", message: "HotHand hit 10 streak!" },
		{ type: "power", message: "Reroll saved the day!" },
		{ type: "join", message: "NewPlayer just joined!" },
		{ type: "win", message: "BigWin scored 15,000!" },
		{ type: "perfect", message: "GodRun got PERFECT!" },
	],
};

export { defaultProps as toastFeedDefaultProps };

const typeColors: Record<string, string> = {
	win: colors.green,
	streak: colors.yellow,
	power: colors.reroll,
	join: colors.blue,
	perfect: colors.yellow,
};

export const ToastFeed: React.FC<ToastFeedProps> = ({ events }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// Accelerating timing: each toast appears faster
	const getToastDelay = (i: number) => {
		const baseDelay = seconds(0.8);
		const acceleration = 0.8;
		let total = 0;
		for (let j = 0; j < i; j++) {
			total += baseDelay * acceleration ** j;
		}
		return Math.round(total);
	};

	return (
		<SquareLayout>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "flex-end",
					justifyContent: "center",
					gap: 12,
					width: "100%",
					paddingRight: 60,
					paddingLeft: 60,
				}}
			>
				{[...events.entries()].map(([i, event]) => {
					const delay = getToastDelay(i);
					const toastProgress = spring({
						frame: Math.max(0, frame - delay),
						fps,
						config: punch,
					});
					const slideX = interpolate(toastProgress, [0, 1], [400, 0]);
					const opacity = interpolate(toastProgress, [0, 0.3], [0, 1], {
						extrapolateRight: "clamp",
					});

					// Fade out older toasts
					const age = frame - delay;
					const fadeOut =
						age > seconds(3)
							? interpolate(age, [seconds(3), seconds(4)], [1, 0], {
									extrapolateRight: "clamp",
								})
							: 1;

					const accentColor = typeColors[event.type] || colors.mauve;

					return (
						<div
							key={i}
							style={{
								transform: `translateX(${slideX}px)`,
								opacity: opacity * fadeOut,
								background: `${colors.bgLight}ee`,
								borderLeft: `3px solid ${accentColor}`,
								borderRadius: 8,
								padding: "10px 20px",
								display: "flex",
								alignItems: "center",
								gap: 12,
								maxWidth: 400,
							}}
						>
							{/* Type indicator dot */}
							<div
								style={{
									width: 8,
									height: 8,
									borderRadius: "50%",
									backgroundColor: accentColor,
									boxShadow: `0 0 8px ${accentColor}88`,
									flexShrink: 0,
								}}
							/>
							<div
								style={{
									fontFamily: "Circular-LL, sans-serif",
									fontSize: 16,
									color: colors.white,
								}}
							>
								{event.message}
							</div>
						</div>
					);
				})}
			</div>
		</SquareLayout>
	);
};
