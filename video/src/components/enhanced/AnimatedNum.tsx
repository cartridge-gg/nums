import type React from "react";
import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { Num, type NumberProps } from "@/components/elements/number";
import { dramatic } from "@video/lib/springs";

type EmotionalContext = "neutral" | "good" | "great" | "bad";

interface AnimatedNumProps extends NumberProps {
	enterFrame?: number;
	emotion?: EmotionalContext;
}

export const AnimatedNum: React.FC<AnimatedNumProps> = ({
	enterFrame = 0,
	emotion = "neutral",
	style,
	...props
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const revealProgress = spring({
		frame: frame - enterFrame,
		fps,
		config: dramatic,
	});

	const blur = interpolate(revealProgress, [0, 0.6, 1], [20, 3, 0]);
	const scale = interpolate(
		revealProgress,
		[0, 0.7, 0.9, 1],
		[0.8, 1.05, 1.02, 1],
	);
	const opacity = interpolate(revealProgress, [0, 0.3], [0, 1], {
		extrapolateRight: "clamp",
	});

	const emotionGlow: Record<EmotionalContext, string> = {
		neutral: "none",
		good: "0 0 30px rgba(72, 240, 149, 0.4)",
		great: "0 0 50px rgba(255, 200, 0, 0.6)",
		bad: "0 0 30px rgba(247, 114, 114, 0.4)",
	};

	return (
		<div
			style={{
				transform: `scale(${scale})`,
				filter: `blur(${blur}px)`,
				opacity,
				boxShadow: emotionGlow[emotion],
				borderRadius: 16,
				...style,
			}}
		>
			<Num {...props} />
		</div>
	);
};
