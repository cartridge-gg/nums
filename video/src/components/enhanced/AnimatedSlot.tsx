import type React from "react";
import { useCurrentFrame, spring, useVideoConfig } from "remotion";
import { Slot, type SlotProps } from "@/components/elements/slot";
import { punch, whip } from "@video/lib/springs";

interface AnimatedSlotProps extends SlotProps {
	enterFrame?: number;
	shakeFrame?: number;
	glowColor?: string;
}

export const AnimatedSlot: React.FC<AnimatedSlotProps> = ({
	enterFrame = 0,
	shakeFrame,
	glowColor,
	style,
	...props
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const enterProgress = spring({
		frame: frame - enterFrame,
		fps,
		config: whip,
	});

	const scale = 0.5 + enterProgress * 0.5;
	const opacity = enterProgress;

	let shakeX = 0;
	let shakeY = 0;
	if (shakeFrame !== undefined && frame >= shakeFrame) {
		const elapsed = frame - shakeFrame;
		const decay = Math.max(0, 1 - elapsed / 10);
		const shakeProgress = spring({
			frame: elapsed,
			fps,
			config: punch,
		});
		shakeX = Math.sin(elapsed * 2.5) * 4 * decay * shakeProgress;
		shakeY = Math.cos(elapsed * 3.1) * 3 * decay * shakeProgress;
	}

	const glowStyle = glowColor ? { boxShadow: `0 0 12px 2px ${glowColor}` } : {};

	return (
		<div
			style={{
				transform: `scale(${scale}) translate(${shakeX}px, ${shakeY}px)`,
				opacity,
				...glowStyle,
				borderRadius: 8,
				...style,
			}}
		>
			<Slot {...props} />
		</div>
	);
};
