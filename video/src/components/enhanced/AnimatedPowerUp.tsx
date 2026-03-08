import type React from "react";
import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { PowerUp, type PowerUpProps } from "@/components/elements/power-up";
import { punch } from "@video/lib/springs";

interface AnimatedPowerUpProps extends PowerUpProps {
	activateFrame?: number;
	glowColor?: string;
}

export const AnimatedPowerUp: React.FC<AnimatedPowerUpProps> = ({
	activateFrame,
	glowColor,
	style,
	...props
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	let ringScale = 0;
	let ringOpacity = 0;
	let flashOpacity = 0;
	let buttonScale = 1;

	if (activateFrame !== undefined && frame >= activateFrame) {
		const elapsed = frame - activateFrame;

		// Charge ring grows
		const chargeProgress = spring({
			frame: elapsed,
			fps,
			config: { damping: 12, stiffness: 60 },
		});
		ringScale = chargeProgress * 1.8;
		ringOpacity = interpolate(chargeProgress, [0, 0.5, 1], [0, 0.8, 0]);

		// Flash at activation
		flashOpacity = interpolate(elapsed, [8, 12, 18], [0, 1, 0], {
			extrapolateLeft: "clamp",
			extrapolateRight: "clamp",
		});

		// Button punch
		const punchProgress = spring({
			frame: Math.max(0, elapsed - 8),
			fps,
			config: punch,
		});
		buttonScale = 1 + punchProgress * 0.15;
	}

	const resolvedGlow = glowColor || "#8581FF";

	return (
		<div style={{ position: "relative", display: "inline-block" }}>
			{/* Charge ring */}
			<div
				style={{
					position: "absolute",
					inset: -10,
					borderRadius: "50%",
					border: `2px solid ${resolvedGlow}`,
					transform: `scale(${ringScale})`,
					opacity: ringOpacity,
					pointerEvents: "none",
				}}
			/>
			{/* Flash */}
			<div
				style={{
					position: "absolute",
					inset: -20,
					borderRadius: "50%",
					background: `radial-gradient(circle, ${resolvedGlow} 0%, transparent 70%)`,
					opacity: flashOpacity,
					pointerEvents: "none",
				}}
			/>
			<div
				style={{
					transform: `scale(${buttonScale})`,
					...style,
				}}
			>
				<PowerUp {...props} />
			</div>
		</div>
	);
};
