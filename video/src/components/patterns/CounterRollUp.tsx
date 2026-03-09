import type React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { dramatic } from "@video/lib/springs";

interface CounterRollUpProps {
	value: number;
	startFrame?: number;
	duration?: number;
	fontSize?: number;
	color?: string;
	prefix?: string;
	suffix?: string;
}

export const CounterRollUp: React.FC<CounterRollUpProps> = ({
	value,
	startFrame = 0,
	duration = 60,
	fontSize = 64,
	color = "#FFFFFF",
	prefix = "",
	suffix = "",
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const elapsed = Math.max(0, frame - startFrame);
	// Ease-out curve for odometer feel
	const progress = interpolate(elapsed, [0, duration], [0, 1], {
		extrapolateRight: "clamp",
	});
	// Acceleration curve: slow start, fast middle, slow end
	const eased = 1 - (1 - progress) ** 3;
	const displayValue = Math.round(eased * value);

	// Landing weight effect
	const landProgress = spring({
		frame: Math.max(0, elapsed - duration + 5),
		fps,
		config: dramatic,
	});
	const scale =
		progress >= 0.95
			? interpolate(landProgress, [0, 0.5, 1], [1.05, 1.02, 1])
			: 1;

	return (
		<div
			style={{
				fontFamily: "PPNeueBit, sans-serif",
				fontWeight: 700,
				fontSize,
				color,
				textShadow: "4px 4px 0px rgba(0, 0, 0, 0.5)",
				transform: `scale(${scale})`,
				textAlign: "center",
			}}
		>
			{prefix}
			{displayValue.toLocaleString()}
			{suffix}
		</div>
	);
};
