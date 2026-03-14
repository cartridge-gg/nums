import { DEFAULT_SLOT_COUNT } from "@/constants";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { useMemo, useCallback, useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Customized,
  Tooltip,
  Text,
  usePlotArea,
  useYAxisDomain,
  useActiveTooltipDataPoints,
  useChartWidth,
  useChartHeight,
} from "recharts";

export interface ChartProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chartVariants> {
  values: number[];
  abscissa: number;
}

const chartVariants = cva(
  "select-none relative rounded-lg flex items-center justify-center outline-none focus-visible:outline-none [&_svg]:outline-none [&_svg]:focus:outline-none [&_svg]:focus-visible:outline-none [&_*]:outline-none [&_*]:focus:outline-none [&_*]:focus-visible:outline-none",
  {
    variants: {
      variant: {
        default: "",
      },
      size: {
        md: "w-full h-full min-h-[240px] min-w-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

const TRANSITION = "250ms ease";

// ─── Crosshair + tooltip overlay ─────────────────────────────────────────────
// Rendered inside the chart via <Customized>; uses recharts v3 hooks to obtain
// the plot area dimensions and the currently active data point.

interface CrosshairOverlayProps {
  breakEvenPoint: { x: number; y: number };
  /** When set, overrides recharts hover — used for container-wide tracking */
  containerActivePoint?: { x: number; y: number } | null;
  /** Ref to chart container — tooltips are portaled here to appear above axes */
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const CrosshairOverlay = ({
  breakEvenPoint,
  containerActivePoint,
  containerRef,
}: CrosshairOverlayProps) => {
  const plotArea = usePlotArea();
  const yDomain = useYAxisDomain();
  const chartW = useChartWidth() ?? 0;
  const chartH = useChartHeight() ?? 0;
  const activeDataPoints = useActiveTooltipDataPoints<{ x: number; y: number }>();

  if (!plotArea || !yDomain) return null;

  const maxDataY = yDomain[1] as number;
  if (maxDataY === 0 || plotArea.width === 0 || plotArea.height === 0) return null;

  // Prefer container tracking (full ResponsiveContainer) over chart-internal hover
  const isHovering =
    containerActivePoint != null ||
    (activeDataPoints != null && activeDataPoints.length > 0);
  const active = containerActivePoint ?? activeDataPoints?.[0] ?? breakEvenPoint;
  const isBreakEven = !isHovering;

  const { x: plotLeft, y: plotTop, width: plotWidth, height: plotHeight } = plotArea;

  // Data → pixel
  const px = plotLeft + (active.x / DEFAULT_SLOT_COUNT) * plotWidth;
  const py = plotTop + (1 - active.y / maxDataY) * plotHeight;

  // ── Top tooltip: 8px padding L/R, 24px height, text centered
  const topLabel = isBreakEven ? "Break Even" : `Level ${active.x}`;
  const topW = topLabel.length * 9 + 16; // 8px padding each side
  const topH = 24;
  const topX = Math.max(0, Math.min(chartW - topW, px - topW / 2));
  const topY = Math.max(0, Math.min(chartH - topH, plotTop - topH - 8));

  // ── Left tooltip: 8px padding L/R, 24px height, text centered
  const leftLabel = `${active.y.toFixed(0)} NUMS`;
  const leftW = leftLabel.length * 8 + 16; // 8px padding each side
  const leftH = 24;
  const xAxisHeight = 36; // Reserve space so tooltip stays above xTicks
  const leftX = Math.max(0, Math.min(chartW - leftW, plotLeft - leftW + 2));
  const leftY = Math.max(
    0,
    Math.min(chartH - leftH - xAxisHeight, py - leftH / 2),
  );

  return (
    <g>
      {/* Vertical dashed line: plotTop → py */}
      <line
        x1={px}
        y1={plotTop}
        x2={px}
        y2={py}
        stroke="rgba(255,255,255,0.25)"
        strokeWidth={1.5}
        strokeDasharray="4 3"
        style={{ transition: `x1 ${TRANSITION}, x2 ${TRANSITION}, y2 ${TRANSITION}` }}
      />
      {/* Horizontal dashed line: plotLeft → px */}
      <line
        x1={plotLeft}
        y1={py}
        x2={px}
        y2={py}
        stroke="rgba(255,255,255,0.25)"
        strokeWidth={1.5}
        strokeDasharray="4 3"
        style={{ transition: `y1 ${TRANSITION}, y2 ${TRANSITION}, x2 ${TRANSITION}` }}
      />
      {/* Dot */}
      <circle
        cx={px}
        cy={py}
        r={4}
        fill="var(--white-100)"
        stroke="var(--black-400)"
        strokeWidth={1}
        style={{ transition: `cx ${TRANSITION}, cy ${TRANSITION}` }}
      />
      {/* Tooltips portaled to container — ensures they render above Y-axis ticks */}
      {containerRef.current &&
        createPortal(
          <>
            <div
              role="tooltip"
              aria-hidden
              className="absolute rounded flex items-center justify-center pointer-events-none"
              style={{
                left: topX,
                top: topY,
                width: topW,
                height: topH,
                backgroundColor: "var(--mauve-700)",
                color: "var(--white-100)",
                fontSize: 18,
                letterSpacing: "0.06em",
                transition: `left ${TRANSITION}, top ${TRANSITION}`,
              }}
            >
              <span style={{ display: "block", transform: "translateY(1px)" }}>
                {topLabel}
              </span>
            </div>
            <div
              role="tooltip"
              aria-hidden
              className="absolute rounded flex items-center justify-center pointer-events-none"
              style={{
                left: leftX,
                top: leftY,
                width: leftW,
                height: leftH,
                backgroundColor: "#2C255B",
                color: "var(--white-100)",
                fontSize: 18,
                letterSpacing: "0.05em",
                transition: `left ${TRANSITION}, top ${TRANSITION}`,
              }}
            >
              <span style={{ display: "block", transform: "translateY(1px)" }}>
                {leftLabel}
              </span>
            </div>
          </>,
          containerRef.current,
        )}
    </g>
  );
};

// ─── Axis ticks ───────────────────────────────────────────────────────────────

const XAxisTick = ({ x, y, payload, showLabel }: any) => {
  if (!showLabel) return null;
  return (
    <Text
      x={x}
      y={y}
      textAnchor="middle"
      fill="var(--white-100)"
      fontSize={18}
      dy={14}
      letterSpacing="0.05em"
    >
      {payload.value}
    </Text>
  );
};

const YAxisTick = ({ x, y, payload, showLabel, tickFormatter }: any) => {
  if (!showLabel) return null;
  const formatted = tickFormatter ? tickFormatter(payload.value) : payload.value;
  if (!formatted) return null;
  return (
    <Text
      x={x - 72}
      y={y}
      textAnchor="start"
      fill="var(--white-100)"
      fontSize={18}
      letterSpacing="0.05em"
      dominantBaseline="middle"
    >
      {formatted}
    </Text>
  );
};

// ─── Chart ────────────────────────────────────────────────────────────────────

export const Chart = ({
  values,
  abscissa,
  variant,
  size,
  className,
  ...props
}: ChartProps) => {
  if (values.length !== DEFAULT_SLOT_COUNT) {
    throw new Error(`Chart requires exactly ${DEFAULT_SLOT_COUNT} values`);
  }
  if (abscissa < 0 || abscissa > DEFAULT_SLOT_COUNT) {
    throw new Error(`Abscissa must be between 0 and ${DEFAULT_SLOT_COUNT}`);
  }

  const abscissaY = useMemo(() => {
    if (abscissa === 0) return 0;
    if (abscissa === DEFAULT_SLOT_COUNT) return values[DEFAULT_SLOT_COUNT - 1];
    const index = Math.floor(abscissa);
    if (index < 1) return values[0];
    if (index >= DEFAULT_SLOT_COUNT) return values[DEFAULT_SLOT_COUNT - 1];
    return values[index - 1];
  }, [abscissa, values]);

  const data = useMemo(() => {
    const points: Array<{ x: number; y: number }> = [{ x: 0, y: 0 }];
    for (let i = 0; i < values.length; i++) {
      points.push({ x: i + 1, y: values[i] });
    }
    const abscissaIndex = points.findIndex(
      (p) => Math.abs(p.x - abscissa) < 0.001,
    );
    if (
      abscissaIndex === -1 &&
      abscissa > 0 &&
      abscissa < DEFAULT_SLOT_COUNT
    ) {
      const insertIndex = points.findIndex((p) => p.x > abscissa);
      if (insertIndex === -1) {
        points.push({ x: abscissa, y: abscissaY });
      } else {
        points.splice(insertIndex, 0, { x: abscissa, y: abscissaY });
      }
    }
    return points;
  }, [values, abscissa, abscissaY]);

  const maxY = Math.max(...values, 0);

  const breakEvenPoint = useMemo(
    () => ({ x: abscissa, y: abscissaY }),
    [abscissa, abscissaY],
  );

  // Container-wide tracking: mouse over the whole ResponsiveContainer updates the crosshair
  const [containerActive, setContainerActive] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleContainerMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = containerRef.current;
      if (!el || data.length === 0) return;
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      // Plot area: margin left 50 + Y-axis ~55, so plotLeft ≈ 105
      const plotLeft = 105;
      const plotWidth = rect.width - plotLeft - 12; // margin right 12
      if (plotWidth <= 0) return;
      const dataX = Math.max(
        0,
        Math.min(DEFAULT_SLOT_COUNT, ((relX - plotLeft) / plotWidth) * DEFAULT_SLOT_COUNT),
      );
      // stepAfter: y at dataX = y of rightmost point with p.x <= dataX
      const idx = data.findIndex((p) => p.x > dataX);
      const point =
        idx === -1 ? data[data.length - 1]! : idx <= 0 ? data[0]! : data[idx - 1]!;
      setContainerActive({ x: point.x, y: point.y });
    },
    [data],
  );

  const handleContainerMouseLeave = useCallback(() => {
    setContainerActive(null);
  }, []);

  const renderOverlay = useCallback(
    () => (
      <CrosshairOverlay
        breakEvenPoint={breakEvenPoint}
        containerActivePoint={containerActive}
        containerRef={containerRef}
      />
    ),
    [breakEvenPoint, containerActive, containerRef],
  );

  const xTicks = [1, DEFAULT_SLOT_COUNT];

  const yTicks = useMemo(() => [maxY], [maxY]);

  const yTickFormatter = useCallback(
    (value: number) =>
      yTicks.some((t) => Math.abs(t - value) < 0.001)
        ? `${value.toFixed(0)} NUMS`
        : "",
    [yTicks],
  );

  return (
    <div
      ref={containerRef}
      className={cn(chartVariants({ variant, size, className }))}
      {...props}
      tabIndex={-1}
      style={{ outline: "none", minHeight: 0, minWidth: 0, ...props.style }}
      onFocus={(e) => e.currentTarget.blur()}
      onMouseMove={handleContainerMouseMove}
      onMouseLeave={handleContainerMouseLeave}
    >
      <ResponsiveContainer
        initialDimension={{ width: 240, height: 240 }}
        width="100%"
        height="100%"
        className="chart-container"
        minHeight={240}
      >
        <LineChart
          data={data}
          margin={{ top: 48, right: 12, bottom: 5, left: 50 }}
          style={{ outline: "none" }}
        >
          <defs>
            <filter
              id="ticker-shadow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feDropShadow
                dx="1"
                dy="1"
                stdDeviation="0"
                floodColor="rgba(0, 0, 0, 0.12)"
              />
            </filter>
          </defs>

          {/* Hidden tooltip — required so recharts tracks mouse interaction
              and feeds useActiveTooltipDataPoints() inside CrosshairOverlay */}
          <Tooltip
            content={() => null}
            cursor={false}
            animationDuration={0}
            wrapperStyle={{ display: "none" }}
          />

          {/* Line first so axes and overlay render on top */}
          <Line
            type="stepAfter"
            dataKey="y"
            stroke="var(--green-100)"
            strokeWidth={2}
            dot={false}
            activeDot={false}
            connectNulls={false}
          />

          {/* X-axis (renders above line) */}
          <XAxis
            type="number"
            dataKey="x"
            domain={[0, DEFAULT_SLOT_COUNT]}
            axisLine={false}
            tickLine={false}
            ticks={xTicks}
            tick={<XAxisTick showLabel={true} />}
          />

          {/* Y-axis */}
          <YAxis
            type="number"
            domain={[0, maxY]}
            axisLine={false}
            tickLine={false}
            ticks={yTicks}
            tickFormatter={yTickFormatter}
            interval={0}
            allowDecimals={false}
            tick={
              <YAxisTick showLabel={true} tickFormatter={yTickFormatter} />
            }
          />

          {/* Step line */}
          <Line
            type="stepAfter"
            dataKey="y"
            stroke="var(--green-100)"
            strokeWidth={2}
            dot={false}
            activeDot={false}
            connectNulls={false}
          />

          {/* Crosshair + tooltip overlay — rendered above the line */}
          <Customized component={renderOverlay} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
