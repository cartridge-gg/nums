import type React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { dramatic } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

type Emotion = "neutral" | "good" | "great" | "bad";

interface NumberRevealProps {
	value: number;
	enterFrame?: number;
	emotion?: Emotion;
}

const emotionColors: Record<Emotion, string> = {
	neutral: colors.white,
	good: colors.green,
	great: colors.yellow,
	bad: colors.red,
};

export const NumberReveal: React.FC<NumberRevealProps> = ({
	value,
	enterFrame = 0,
	emotion = "neutral",
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const progress = spring({
		frame: frame - enterFrame,
		fps,
		config: dramatic,
	});

	const blur = interpolate(progress, [0, 0.5, 1], [24, 4, 0]);
	const scale = interpolate(progress, [0, 0.7, 0.9, 1], [0.7, 1.1, 1.03, 1]);
	const opacity = interpolate(progress, [0, 0.3], [0, 1], {
		extrapolateRight: "clamp",
	});

	const glowIntensity = emotion === "great" ? 60 : emotion === "good" ? 30 : 0;
	const glowColor = emotionColors[emotion];

	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				transform: `scale(${scale})`,
				filter: `blur(${blur}px)`,
				opacity,
			}}
		>
			<div
				style={{
					fontFamily: "PPNeueBit, sans-serif",
					fontWeight: 700,
					fontSize: 136,
					color: emotionColors[emotion],
					textShadow: `4px 4px 0px rgba(0,0,0,0.5), 0 0 ${glowIntensity}px ${glowColor}`,
					padding: "16px 32px",
					background: "rgba(133, 129, 255, 0.1)",
					borderRadius: 16,
				}}
			>
				{value.toString().padStart(3, "0")}
			</div>
		</div>
	);
};
