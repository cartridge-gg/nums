import type React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { colors } from "@video/lib/colors";

interface TrapTriggerProps {
	triggerFrame?: number;
	trapColor?: string;
}

export const TrapTrigger: React.FC<TrapTriggerProps> = ({
	triggerFrame = 0,
	trapColor = colors.red,
}) => {
	const frame = useCurrentFrame();
	const elapsed = Math.max(0, frame - triggerFrame);

	// Freeze frame effect (0-9 frames = 0.3s at 30fps)
	const freezeOpacity = interpolate(elapsed, [0, 2, 7, 9], [0, 0.3, 0.3, 0], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	// Edge flood
	const floodOpacity = interpolate(elapsed, [8, 14, 30], [0, 0.6, 0], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	// Screen shake
	const shakeDecay = Math.max(0, 1 - elapsed / 25);
	const shakeX = Math.sin(elapsed * 2.3) * 8 * shakeDecay;
	const shakeY = Math.cos(elapsed * 2.7) * 6 * shakeDecay;

	if (frame < triggerFrame) return null;

	return (
		<>
			{/* Freeze frame overlay */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					backgroundColor: colors.white,
					opacity: freezeOpacity,
					pointerEvents: "none",
					zIndex: 100,
				}}
			/>
			{/* Edge color flood */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					boxShadow: `inset 0 0 100px 40px ${trapColor}`,
					opacity: floodOpacity,
					pointerEvents: "none",
					zIndex: 99,
				}}
			/>
			{/* Shake container - wraps content via CSS */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					transform: `translate(${shakeX}px, ${shakeY}px)`,
					pointerEvents: "none",
					zIndex: 98,
				}}
			/>
		</>
	);
};
