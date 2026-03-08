import {
	useCurrentFrame,
	useVideoConfig,
	spring,
	interpolate,
	Sequence,
} from "remotion";
import { z } from "zod";
import { SquareLayout } from "@video/components/layouts/SquareLayout";
import { confettiBurst, getParticleAtFrame } from "@video/lib/particles";
import { seconds } from "@video/lib/timing";
import { dramatic } from "@video/lib/springs";
import { colors } from "@video/lib/colors";
import { zoomTo, cameraToTransform } from "@video/lib/camera";

export const lifetimeEarningsSchema = z.object({
	totalEarnings: z.number(),
	gamesPlayed: z.number(),
});

type LifetimeEarningsProps = z.infer<typeof lifetimeEarningsSchema>;

const defaultProps: LifetimeEarningsProps = {
	totalEarnings: 1234567,
	gamesPlayed: 500,
};

export { defaultProps as lifetimeEarningsDefaultProps };

export const LifetimeEarnings: React.FC<LifetimeEarningsProps> = ({
	totalEarnings,
	gamesPlayed,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// Act timings (6s = 180 frames)
	const digitStart = seconds(0.5);
	const revealDuration = seconds(3);
	const goldRainStart = seconds(3.5);
	const labelStart = seconds(4.5);

	// Camera slowly pulls back to reveal full number
	const camera = zoomTo(frame, 0, seconds(3), 1);
	const revealZoom = interpolate(
		frame,
		[digitStart, digitStart + revealDuration],
		[1.8, 1],
		{ extrapolateLeft: "clamp", extrapolateRight: "clamp" },
	);

	// Format earnings with commas for digit-by-digit reveal
	const earningsStr = totalEarnings.toLocaleString();
	const totalChars = earningsStr.length;

	// Gold rain particles (falling from top)
	const goldParticles = confettiBurst(50, 540, -50, 88);

	// Per-digit reveal
	const digitElements = [...earningsStr.split("").entries()].map(
		([i, char]) => {
			const charRevealFrame =
				digitStart + Math.floor((i / totalChars) * revealDuration);
			const charProgress = spring({
				frame: Math.max(0, frame - charRevealFrame),
				fps,
				config: dramatic,
			});
			const charOpacity = interpolate(charProgress, [0, 0.3], [0, 1], {
				extrapolateRight: "clamp",
			});
			const charY = interpolate(charProgress, [0, 1], [30, 0]);
			const charScale = interpolate(charProgress, [0, 0.5, 1], [0.5, 1.1, 1]);

			return (
				<span
					key={i}
					style={{
						display: "inline-block",
						fontFamily: "PPNeueBit, sans-serif",
						fontWeight: 700,
						fontSize: 100,
						color: colors.yellow,
						opacity: charOpacity,
						transform: `translateY(${charY}px) scale(${charScale})`,
						textShadow: `0 0 20px ${colors.yellow}44, 4px 4px 0px rgba(0, 0, 0, 0.5)`,
						minWidth: char === "," ? "0.3em" : undefined,
					}}
				>
					{char}
				</span>
			);
		},
	);

	return (
		<SquareLayout>
			<div
				style={{
					transform: `${cameraToTransform(camera)} scale(${revealZoom})`,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					gap: 24,
					width: "100%",
					height: "100%",
					position: "relative",
				}}
			>
				{/* LIFETIME EARNINGS label */}
				<Sequence from={0}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 20,
							color: colors.mauve,
							letterSpacing: 6,
							opacity: interpolate(frame, [0, 15], [0, 0.7], {
								extrapolateRight: "clamp",
							}),
						}}
					>
						LIFETIME EARNINGS
					</div>
				</Sequence>

				{/* Giant digit-by-digit reveal */}
				<Sequence from={digitStart}>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							flexWrap: "wrap",
						}}
					>
						{digitElements}
					</div>
				</Sequence>

				{/* NUMS suffix */}
				<Sequence from={digitStart + revealDuration - seconds(0.5)}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 32,
							color: colors.yellow,
							opacity: interpolate(
								frame - (digitStart + revealDuration - seconds(0.5)),
								[0, 15],
								[0, 0.8],
								{ extrapolateRight: "clamp" },
							),
							letterSpacing: 4,
						}}
					>
						NUMS
					</div>
				</Sequence>

				{/* Games played stat */}
				<Sequence from={labelStart}>
					<div
						style={{
							fontFamily: "PPNeueBit, sans-serif",
							fontSize: 24,
							color: colors.mauve,
							textAlign: "center",
							opacity: interpolate(frame - labelStart, [0, 15], [0, 0.7], {
								extrapolateRight: "clamp",
							}),
						}}
					>
						across {gamesPlayed.toLocaleString()} games
					</div>
				</Sequence>
			</div>

			{/* Gold rain */}
			{frame >= goldRainStart &&
				goldParticles.map((p) => {
					const state = getParticleAtFrame(p, frame, goldRainStart, 70, 0.4);
					return (
						<div
							key={p.id}
							style={{
								position: "absolute",
								left: state.x,
								top: state.y,
								width: state.size * 0.6,
								height: state.size,
								backgroundColor: colors.yellow,
								opacity: state.opacity * 0.8,
								transform: `rotate(${state.rotation}deg)`,
								borderRadius: 1,
								boxShadow: `0 0 4px ${colors.yellow}66`,
							}}
						/>
					);
				})}
		</SquareLayout>
	);
};
