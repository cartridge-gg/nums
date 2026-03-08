import type React from "react";
import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { punch } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

interface EmotionTextProps {
	text: string;
	enterFrame?: number;
	color?: string;
	fontSize?: number;
}

export const EmotionText: React.FC<EmotionTextProps> = ({
	text,
	enterFrame = 0,
	color = colors.white,
	fontSize = 72,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const chars = text.split("");

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				gap: 2,
			}}
		>
			{chars.map((char, i) => {
				const charDelay = enterFrame + i * 2;
				const progress = spring({
					frame: frame - charDelay,
					fps,
					config: punch,
				});

				const scale = interpolate(
					progress,
					[0, 0.6, 0.85, 1],
					[0, 1.3, 0.95, 1],
				);
				const opacity = interpolate(progress, [0, 0.2], [0, 1], {
					extrapolateRight: "clamp",
				});
				const y = interpolate(progress, [0, 0.5, 1], [30, -5, 0]);

				return (
					<span
						key={`${i}-${char}`}
						style={{
							display: "inline-block",
							fontFamily: "PPNeueBit, sans-serif",
							fontWeight: 700,
							fontSize,
							color,
							transform: `scale(${scale}) translateY(${y}px)`,
							opacity,
							textShadow: "4px 4px 0px rgba(0, 0, 0, 0.5)",
							minWidth: char === " " ? "0.3em" : undefined,
						}}
					>
						{char}
					</span>
				);
			})}
		</div>
	);
};
