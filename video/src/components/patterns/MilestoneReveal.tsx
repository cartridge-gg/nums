import type React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { dramatic } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

interface MilestoneRevealProps {
	children: React.ReactNode;
	enterFrame?: number;
}

export const MilestoneReveal: React.FC<MilestoneRevealProps> = ({
	children,
	enterFrame = 0,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const elapsed = Math.max(0, frame - enterFrame);

	// Spotlight narrows
	const spotlightSize = interpolate(elapsed, [0, 30], [200, 60], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	// Content scale
	const scaleProgress = spring({
		frame: Math.max(0, elapsed - 15),
		fps,
		config: dramatic,
	});
	const scale = interpolate(scaleProgress, [0, 1], [0.5, 1]);
	const opacity = interpolate(elapsed, [10, 20], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	return (
		<div
			style={{
				position: "relative",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				width: "100%",
				height: "100%",
			}}
		>
			{/* Dark vignette with spotlight */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					background: `radial-gradient(circle ${spotlightSize}% at 50% 50%, transparent 0%, ${colors.black} 100%)`,
					pointerEvents: "none",
				}}
			/>
			{/* Content */}
			<div
				style={{
					transform: `scale(${scale})`,
					opacity,
					position: "relative",
					zIndex: 1,
				}}
			>
				{children}
			</div>
		</div>
	);
};
