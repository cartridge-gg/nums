import type React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { colors } from "@video/lib/colors";

interface DataPoint {
	x: number;
	y: number;
	label?: string;
}

interface ChartDrawProps {
	data: DataPoint[];
	startFrame?: number;
	duration?: number;
	width?: number;
	height?: number;
	color?: string;
	showLabels?: boolean;
}

export const ChartDraw: React.FC<ChartDrawProps> = ({
	data,
	startFrame = 0,
	duration = 60,
	width = 400,
	height = 200,
	color = colors.green,
	showLabels = false,
}) => {
	const frame = useCurrentFrame();
	const elapsed = Math.max(0, frame - startFrame);
	const progress = interpolate(elapsed, [0, duration], [0, 1], {
		extrapolateRight: "clamp",
	});

	if (data.length < 2) return null;

	const xMin = Math.min(...data.map((d) => d.x));
	const xMax = Math.max(...data.map((d) => d.x));
	const yMin = Math.min(...data.map((d) => d.y));
	const yMax = Math.max(...data.map((d) => d.y));

	const padding = 20;
	const chartW = width - padding * 2;
	const chartH = height - padding * 2;

	const toSvgX = (x: number) =>
		padding + ((x - xMin) / (xMax - xMin || 1)) * chartW;
	const toSvgY = (y: number) =>
		padding + chartH - ((y - yMin) / (yMax - yMin || 1)) * chartH;

	const points = data.map((d) => `${toSvgX(d.x)},${toSvgY(d.y)}`);
	const pathD = `M ${points.join(" L ")}`;

	// Calculate total path length estimate
	let totalLength = 0;
	for (let i = 1; i < data.length; i++) {
		const dx = toSvgX(data[i].x) - toSvgX(data[i - 1].x);
		const dy = toSvgY(data[i].y) - toSvgY(data[i - 1].y);
		totalLength += Math.sqrt(dx * dx + dy * dy);
	}

	const visibleLength = totalLength * progress;

	return (
		<svg width={width} height={height} role="img" aria-label="chart">
			{/* Grid lines */}
			<line
				x1={padding}
				y1={height - padding}
				x2={width - padding}
				y2={height - padding}
				stroke="rgba(255,255,255,0.1)"
				strokeWidth={1}
			/>
			<line
				x1={padding}
				y1={padding}
				x2={padding}
				y2={height - padding}
				stroke="rgba(255,255,255,0.1)"
				strokeWidth={1}
			/>

			{/* Main line */}
			<path
				d={pathD}
				fill="none"
				stroke={color}
				strokeWidth={3}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeDasharray={totalLength}
				strokeDashoffset={totalLength - visibleLength}
			/>

			{/* Glow */}
			<path
				d={pathD}
				fill="none"
				stroke={color}
				strokeWidth={8}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeDasharray={totalLength}
				strokeDashoffset={totalLength - visibleLength}
				opacity={0.2}
			/>

			{/* Data point labels */}
			{showLabels &&
				data.map((d, i) => {
					const pointProgress = i / (data.length - 1);
					if (pointProgress > progress) return null;
					return (
						<text
							key={d.x}
							x={toSvgX(d.x)}
							y={toSvgY(d.y) - 10}
							fill={colors.white}
							fontSize={12}
							fontFamily="PPNeueBit, sans-serif"
							textAnchor="middle"
							opacity={0.7}
						>
							{d.label || d.y}
						</text>
					);
				})}
		</svg>
	);
};
