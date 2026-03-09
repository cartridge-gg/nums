import type React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { colors } from "@video/lib/colors";

interface TensionBarProps {
	progress: number;
	startFrame?: number;
	duration?: number;
	label?: string;
}

export const TensionBar: React.FC<TensionBarProps> = ({
	progress: targetProgress,
	startFrame = 0,
	duration = 90,
	label = "REMAINING",
}) => {
	const frame = useCurrentFrame();
	const elapsed = Math.max(0, frame - startFrame);

	// Uneven fill — stutters and lurches
	const rawProgress = interpolate(elapsed, [0, duration], [0, targetProgress], {
		extrapolateRight: "clamp",
	});
	// Add stutter
	const stutter =
		Math.sin(elapsed * 0.7) * 0.03 + Math.sin(elapsed * 1.3) * 0.02;
	const fillProgress = Math.min(1, Math.max(0, rawProgress + stutter));

	const barColor =
		fillProgress > 0.7
			? colors.red
			: fillProgress > 0.4
				? colors.yellow
				: colors.green;

	// Vignette darkens with progress
	const vignetteOpacity = fillProgress * 0.4;

	return (
		<div style={{ position: "relative", width: "100%" }}>
			{/* Vignette */}
			<div
				style={{
					position: "absolute",
					inset: -40,
					background: `radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,${vignetteOpacity}) 100%)`,
					pointerEvents: "none",
				}}
			/>
			{/* Bar container */}
			<div style={{ padding: "0 20px" }}>
				<div
					style={{
						fontFamily: "PPNeueBit, sans-serif",
						fontSize: 16,
						color: colors.white,
						marginBottom: 6,
						opacity: 0.6,
					}}
				>
					{label}
				</div>
				<div
					style={{
						width: "100%",
						height: 8,
						backgroundColor: "rgba(255,255,255,0.1)",
						borderRadius: 4,
						overflow: "hidden",
					}}
				>
					<div
						style={{
							width: `${fillProgress * 100}%`,
							height: "100%",
							backgroundColor: barColor,
							borderRadius: 4,
							transition: "background-color 0.3s",
							boxShadow: `0 0 10px ${barColor}`,
						}}
					/>
				</div>
			</div>
		</div>
	);
};
