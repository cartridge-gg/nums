import type React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { dramatic } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

interface RankEntry {
	rank: number;
	username: string;
	score: number;
}

interface RankShiftProps {
	before: RankEntry[];
	after: RankEntry[];
	highlightUsername: string;
	startFrame?: number;
}

export const RankShift: React.FC<RankShiftProps> = ({
	before,
	after,
	highlightUsername,
	startFrame = 0,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const progress = spring({
		frame: frame - startFrame,
		fps,
		config: dramatic,
	});

	const ROW_HEIGHT = 48;

	return (
		<div style={{ width: 400 }}>
			{after.map((entry, afterIdx) => {
				const beforeIdx = before.findIndex(
					(b) => b.username === entry.username,
				);
				const startY =
					beforeIdx >= 0
						? beforeIdx * ROW_HEIGHT
						: (before.length + 1) * ROW_HEIGHT;
				const endY = afterIdx * ROW_HEIGHT;
				const currentY = interpolate(progress, [0, 1], [startY, endY]);

				const isHighlighted = entry.username === highlightUsername;
				const glowOpacity = isHighlighted ? progress * 0.6 : 0;

				return (
					<div
						key={entry.username}
						style={{
							position: "absolute",
							width: 400,
							height: ROW_HEIGHT - 4,
							transform: `translateY(${currentY}px)`,
							display: "flex",
							alignItems: "center",
							gap: 16,
							padding: "0 16px",
							borderRadius: 8,
							backgroundColor: isHighlighted
								? "rgba(255, 200, 0, 0.1)"
								: "rgba(255,255,255,0.03)",
							boxShadow: isHighlighted
								? `0 0 20px rgba(255, 200, 0, ${glowOpacity})`
								: "none",
						}}
					>
						<span
							style={{
								fontFamily: "Circular-LL, sans-serif",
								fontSize: 16,
								color: isHighlighted ? colors.yellow : colors.white,
								width: 30,
							}}
						>
							{entry.rank}
						</span>
						<span
							style={{
								fontFamily: "Circular-LL, sans-serif",
								fontSize: 16,
								color: isHighlighted ? colors.yellow : colors.white,
								flex: 1,
							}}
						>
							{entry.username}
						</span>
						<span
							style={{
								fontFamily: "Circular-LL, sans-serif",
								fontSize: 16,
								color: isHighlighted ? colors.yellow : colors.white,
							}}
						>
							{entry.score.toLocaleString()}
						</span>
					</div>
				);
			})}
		</div>
	);
};
