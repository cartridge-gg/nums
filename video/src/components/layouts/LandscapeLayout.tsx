import type React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors } from "@video/lib/colors";
import { drift, cameraToTransform } from "@video/lib/camera";

export const LandscapeLayout: React.FC<{ children: React.ReactNode }> = ({
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
			<div
				style={{
					position: "absolute",
					inset: 0,
					background: `radial-gradient(ellipse at 40% 50%, ${colors.bgLight} 0%, ${colors.bg} 70%)`,
					transform: cameraToTransform(bgDrift),
				}}
			/>
			<div
				style={{
					position: "relative",
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "center",
					gap: 60,
					padding: "60px 80px",
				}}
			>
				{children}
			</div>
		</AbsoluteFill>
	);
};

export const LANDSCAPE_WIDTH = 1920;
export const LANDSCAPE_HEIGHT = 1080;
