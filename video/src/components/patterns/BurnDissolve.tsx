import type React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { colors } from "@video/lib/colors";
import { embers, getParticleAtFrame } from "@video/lib/particles";

interface BurnDissolveProps {
	startFrame?: number;
	duration?: number;
	width?: number;
	height?: number;
	children?: React.ReactNode;
}

export const BurnDissolve: React.FC<BurnDissolveProps> = ({
	startFrame = 0,
	duration = 60,
	width = 200,
	height = 200,
	children,
}) => {
	const frame = useCurrentFrame();
	const elapsed = Math.max(0, frame - startFrame);
	const progress = interpolate(elapsed, [0, duration], [0, 1], {
		extrapolateRight: "clamp",
	});

	const particles = embers(30, width, height);

	const contentOpacity = interpolate(progress, [0, 0.5, 1], [1, 0.5, 0]);
	const contentScale = interpolate(progress, [0, 1], [1, 0.8]);
	const colorShift = interpolate(progress, [0, 1], [0, 1]);

	return (
		<div style={{ position: "relative", width, height }}>
			{/* Content dissolving */}
			<div
				style={{
					opacity: contentOpacity,
					transform: `scale(${contentScale})`,
					filter: `sepia(${colorShift}) hue-rotate(-10deg) saturate(${1 + colorShift})`,
					transformOrigin: "center center",
				}}
			>
				{children}
			</div>

			{/* Ember particles */}
			{progress > 0.1 &&
				particles.map((p) => {
					const state = getParticleAtFrame(
						p,
						frame,
						startFrame + 5,
						duration,
						-0.05,
					);
					return (
						<div
							key={p.id}
							style={{
								position: "absolute",
								left: state.x,
								top: state.y,
								width: state.size,
								height: state.size,
								borderRadius: "50%",
								backgroundColor:
									p.color === colors.yellow ? colors.yellow : colors.red,
								opacity: state.opacity * progress,
								transform: `rotate(${state.rotation}deg)`,
								boxShadow: `0 0 4px ${p.color}`,
							}}
						/>
					);
				})}
		</div>
	);
};
