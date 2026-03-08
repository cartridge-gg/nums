import type React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { whip } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

interface SplitCompareProps {
	left: React.ReactNode;
	right: React.ReactNode;
	leftLabel?: string;
	rightLabel?: string;
	splitFrame?: number;
}

export const SplitCompare: React.FC<SplitCompareProps> = ({
	left,
	right,
	leftLabel = "BEFORE",
	rightLabel = "AFTER",
	splitFrame = 0,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const splitProgress = spring({
		frame: frame - splitFrame,
		fps,
		config: whip,
	});

	const wipePosition = interpolate(splitProgress, [0, 1], [100, 50]);

	return (
		<div
			style={{
				position: "relative",
				width: "100%",
				height: "100%",
				overflow: "hidden",
			}}
		>
			{/* Left side */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					clipPath: `inset(0 ${100 - wipePosition}% 0 0)`,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					filter: "saturate(0.5)",
				}}
			>
				<div
					style={{
						fontFamily: "PPNeueBit, sans-serif",
						fontSize: 20,
						color: colors.red,
						marginBottom: 16,
						opacity: 0.7,
					}}
				>
					{leftLabel}
				</div>
				{left}
			</div>

			{/* Right side */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					clipPath: `inset(0 0 0 ${wipePosition}%)`,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<div
					style={{
						fontFamily: "PPNeueBit, sans-serif",
						fontSize: 20,
						color: colors.green,
						marginBottom: 16,
						opacity: 0.7,
					}}
				>
					{rightLabel}
				</div>
				{right}
			</div>

			{/* Divider line */}
			<div
				style={{
					position: "absolute",
					top: 0,
					bottom: 0,
					left: `${wipePosition}%`,
					width: 2,
					backgroundColor: colors.white,
					opacity: splitProgress * 0.5,
					boxShadow: `0 0 20px ${colors.white}`,
				}}
			/>
		</div>
	);
};
