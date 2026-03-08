import type React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { colors } from "@video/lib/colors";

type TransitionType = "flash" | "fade" | "wipe";

interface SceneTransitionProps {
	type?: TransitionType;
	triggerFrame?: number;
	duration?: number;
	color?: string;
}

export const SceneTransition: React.FC<SceneTransitionProps> = ({
	type = "flash",
	triggerFrame = 0,
	duration = 10,
	color = colors.white,
}) => {
	const frame = useCurrentFrame();
	const elapsed = Math.max(0, frame - triggerFrame);

	if (frame < triggerFrame || elapsed > duration) return null;

	const progress = elapsed / duration;

	if (type === "flash") {
		const opacity = interpolate(progress, [0, 0.2, 1], [0, 1, 0]);
		return (
			<div
				style={{
					position: "absolute",
					inset: 0,
					backgroundColor: color,
					opacity,
					pointerEvents: "none",
					zIndex: 200,
				}}
			/>
		);
	}

	if (type === "fade") {
		const opacity = interpolate(progress, [0, 0.5, 1], [0, 1, 0]);
		return (
			<div
				style={{
					position: "absolute",
					inset: 0,
					backgroundColor: colors.black,
					opacity,
					pointerEvents: "none",
					zIndex: 200,
				}}
			/>
		);
	}

	// wipe
	const wipePosition = interpolate(progress, [0, 1], [0, 120]);
	return (
		<div
			style={{
				position: "absolute",
				inset: 0,
				background: color,
				clipPath: `inset(0 ${100 - wipePosition}% 0 0)`,
				opacity: interpolate(progress, [0.8, 1], [1, 0]),
				pointerEvents: "none",
				zIndex: 200,
			}}
		/>
	);
};
