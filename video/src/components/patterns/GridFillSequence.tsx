import type React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { Slot } from "@/components/elements/slot";
import { whip } from "@video/lib/springs";
import { seconds } from "@video/lib/timing";

interface GridFillSequenceProps {
	slots: number[];
	min?: number;
	max?: number;
}

export const GridFillSequence: React.FC<GridFillSequenceProps> = ({
	slots,
	min = 1,
	max = 1000,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const totalSlots = slots.length;

	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(4, 1fr)",
				gap: 12,
				width: 460,
			}}
		>
			{/* Min boundary */}
			<div style={{ display: "flex", justifyContent: "center" }}>
				<Slot variant="locked" label={min} />
			</div>

			{[...slots.entries()].map(([i, value]) => {
				// Accelerating tempo: early slots slow, late slots fast
				const progress = i / totalSlots;
				const delay =
					progress < 0.5
						? i * seconds(0.8)
						: progress < 0.8
							? seconds(totalSlots * 0.4 * 0.8) +
								(i - Math.floor(totalSlots * 0.5)) * seconds(0.4)
							: seconds(totalSlots * 0.4 * 0.8) +
								seconds(totalSlots * 0.3 * 0.4) +
								(i - Math.floor(totalSlots * 0.8)) * seconds(0.15);

				const enterProgress = spring({
					frame: frame - delay,
					fps,
					config: whip,
				});

				const scale = interpolate(enterProgress, [0, 1], [0.6, 1]);
				const opacity = Math.min(1, enterProgress);
				const isRevealed = frame >= delay;

				return (
					<div
						key={i}
						style={{
							display: "flex",
							justifyContent: "center",
							transform: `scale(${scale})`,
							opacity,
						}}
					>
						<Slot label={i + 2} value={isRevealed ? value : 0} />
					</div>
				);
			})}

			{/* Max boundary */}
			<div style={{ display: "flex", justifyContent: "center" }}>
				<Slot variant="locked" label={max} />
			</div>
		</div>
	);
};
