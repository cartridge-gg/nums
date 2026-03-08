import type React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { punch } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

interface PowerActivationProps {
	activateFrame?: number;
	color?: string;
	label?: string;
}

export const PowerActivation: React.FC<PowerActivationProps> = ({
	activateFrame = 0,
	color = colors.mauve,
	label = "POWER",
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const elapsed = Math.max(0, frame - activateFrame);

	// Charge phase (0-20 frames)
	const chargeProgress = interpolate(elapsed, [0, 20], [0, 1], {
		extrapolateRight: "clamp",
	});

	// Fire phase (20-30 frames)
	const fireProgress = spring({
		frame: Math.max(0, elapsed - 20),
		fps,
		config: punch,
	});

	// Ripple phase (30+ frames)
	const rippleProgress = interpolate(elapsed, [25, 50], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	const ringScale = chargeProgress * 1.5 + fireProgress * 3;
	const ringOpacity =
		elapsed < 20
			? chargeProgress * 0.8
			: interpolate(fireProgress, [0, 0.3, 1], [0.8, 1, 0]);

	const flashOpacity = interpolate(elapsed, [18, 22, 30], [0, 1, 0], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	const rippleScale = 1 + rippleProgress * 8;
	const rippleOpacity = interpolate(rippleProgress, [0, 0.3, 1], [0, 0.5, 0]);

	return (
		<div
			style={{
				position: "relative",
				width: 200,
				height: 200,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			{/* Charge ring */}
			<div
				style={{
					position: "absolute",
					width: 80,
					height: 80,
					borderRadius: "50%",
					border: `3px solid ${color}`,
					transform: `scale(${ringScale})`,
					opacity: ringOpacity,
				}}
			/>
			{/* Flash */}
			<div
				style={{
					position: "absolute",
					inset: -40,
					borderRadius: "50%",
					background: `radial-gradient(circle, ${color} 0%, transparent 60%)`,
					opacity: flashOpacity,
				}}
			/>
			{/* Ripple */}
			<div
				style={{
					position: "absolute",
					width: 60,
					height: 60,
					borderRadius: "50%",
					border: `2px solid ${color}`,
					transform: `scale(${rippleScale})`,
					opacity: rippleOpacity,
				}}
			/>
			{/* Label */}
			<div
				style={{
					position: "relative",
					fontFamily: "PPNeueBit, sans-serif",
					fontWeight: 700,
					fontSize: 24,
					color,
					textShadow: "2px 2px 0px rgba(0,0,0,0.5)",
					opacity: chargeProgress,
				}}
			>
				{label}
			</div>
		</div>
	);
};
