import type React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors } from "@video/lib/colors";
import { drift, cameraToTransform } from "@video/lib/camera";

export const SquareLayout: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const frame = useCurrentFrame();
	const bgDrift = drift(frame, 0.1, 2);

	return (
		<AbsoluteFill
			style={{
				backgroundColor: colors.bg,
				fontFamily: "PixelGame, monospace",
				color: colors.white,
				overflow: "hidden",
			}}
		>
			{/* Subtle noise texture overlay */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					background: `radial-gradient(ellipse at 50% 40%, ${colors.bgLight} 0%, ${colors.bg} 70%)`,
					transform: cameraToTransform(bgDrift),
				}}
			/>
			<div
				style={{
					position: "relative",
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				{children}
			</div>
		</AbsoluteFill>
	);
};

export const SQUARE_WIDTH = 1080;
export const SQUARE_HEIGHT = 1080;
