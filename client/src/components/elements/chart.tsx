import { DEFAULT_SLOT_COUNT } from "@/constants";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Text,
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

// Custom tick component for X-axis
const CustomXAxisTick = ({
  x,
  y,
  payload,
  showLabel,
  abscissa,
  orientation,
}: any) => {
  if (!showLabel) return null;
  const isTop = orientation === "top";
  const isAbscissaValue = Math.abs(payload.value - abscissa) < 0.001;

  // For top axis, show "Break Even" label at abscissa position with mauve-700 background
  if (isTop && isAbscissaValue) {
    const text = "Break Even";
    const textWidth = text.length * 18 * 0.55;
    const rectWidth = textWidth;
    const rectHeight = 24; // Approximate height for fontSize 18
    const rectX = x - rectWidth / 2; // Center the rectangle
    const rectY = y - rectHeight - 8; // Position above the axis line
    const borderRadius = 4; // rounded = 0.25rem = 4px

    return (
      <g transform={"translate(0, 0)"}>
        <rect
          x={rectX}
          y={rectY - 0.5}
          width={rectWidth}
          height={rectHeight}
          rx={borderRadius}
          ry={borderRadius}
          fill="#332673"
        />
        <Text
          x={x}
          y={rectY + rectHeight / 2}
          textAnchor="middle"
          fill="var(--white-100)"
          fontSize={18}
          letterSpacing="0.05em"
          dominantBaseline="middle"
          filter="url(#ticker-shadow)"
        >
          {text}
        </Text>
      </g>
    );
  }

  // For top axis (non-abscissa values), don't show anything
  if (isTop) return null;

  // For bottom axis, show numeric values
  return (
    <Text
      x={x}
      y={y}
      textAnchor="middle"
      fill="var(--white-100)"
      fontSize={18}
      dy={10 + 4}
      letterSpacing="0.05em"
    >
      {payload.value}
    </Text>
  );
};

// Custom tick component for Y-axis
const CustomYAxisTick = ({
  x,
  y,
  payload,
  showLabel,
  tickFormatter,
  abscissaY,
}: any) => {
  if (!showLabel) return null;
  const formattedValue = tickFormatter
    ? tickFormatter(payload.value)
    : payload.value;

  // Don't render if formatted value is empty
  if (!formattedValue || formattedValue === "") return null;

  const isAbscissaValue = Math.abs(payload.value - abscissaY) < 0.001; // Compare with small epsilon for float comparison

  // Estimate text width (approximate: fontSize * characterCount * 0.55)
  const textWidth = formattedValue.length * 18 * 0.55;
  const rectWidth = textWidth;
  const rectHeight = 24; // Approximate height for fontSize 18
  const offsetLeft = 72; // Offset 72px to the left
  const textX = x - offsetLeft; // Text position shifted 72px to the left (starting point for left alignment)
  const rectX = textX - 7; // Rectangle position aligned with the start of the text
  const rectY = y - rectHeight / 2;
  const textY = rectY + rectHeight / 2;
  const borderRadius = 4; // rounded = 0.25rem = 4px

  return (
    <g transform={"translate(0, 0)"}>
      {isAbscissaValue && (
        <rect
          x={rectX}
          y={rectY - 0.5}
          width={rectWidth}
          height={rectHeight}
          rx={borderRadius}
          ry={borderRadius}
          fill="#332673"
        />
      )}
      <Text
        x={textX}
        y={textY}
        textAnchor="start"
        fill="var(--white-100)"
        fontSize={18}
        letterSpacing="0.05em"
        dominantBaseline="middle"
        filter={isAbscissaValue ? "url(#ticker-shadow)" : undefined}
      >
        {formattedValue}
      </Text>
    </g>
  );
};

export const Chart = ({
  values,
  abscissa,
  variant,
  size,
  className,
  ...props
}: ChartProps) => {
  // Ensure we have exactly 18 values
  if (values.length !== DEFAULT_SLOT_COUNT) {
    throw new Error(`Chart requires exactly ${DEFAULT_SLOT_COUNT} values`);
  }

  // Ensure abscissa is between 0 and 18
  if (abscissa < 0 || abscissa > DEFAULT_SLOT_COUNT) {
    throw new Error(`Abscissa must be between 0 and ${DEFAULT_SLOT_COUNT}`);
  }

  // Get the y value for the given abscissa
  const abscissaY = useMemo(() => {
    if (abscissa === 0) return 0;
    if (abscissa === DEFAULT_SLOT_COUNT) return values[DEFAULT_SLOT_COUNT - 1];
    const index = Math.floor(abscissa);
    if (index < 1) return values[0];
    if (index >= DEFAULT_SLOT_COUNT) return values[DEFAULT_SLOT_COUNT - 1];
    return values[index - 1];
  }, [abscissa, values]);

  // Create data points: (0,0), (1, values[0]), ..., (18, values[17])
  // Also add the abscissa point if it's not already in the data
  const data = useMemo(() => {
    const points: Array<{ x: number; y: number }> = [{ x: 0, y: 0 }];

    // Add points for each value
    for (let i = 0; i < values.length; i++) {
      points.push({ x: i + 1, y: values[i] });
    }

    // Add abscissa point if it's not already in the data
    // For stepAfter, the point at abscissa should have y = abscissaY
    const abscissaIndex = points.findIndex(
      (p) => Math.abs(p.x - abscissa) < 0.001,
    );
    if (abscissaIndex === -1 && abscissa > 0 && abscissa < DEFAULT_SLOT_COUNT) {
      // Insert abscissa point in the correct position (sorted by x)
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

  // Prepare X-axis ticks and labels
  const xTicks = useMemo(() => {
    const ticks = [1, DEFAULT_SLOT_COUNT];
    if (
      abscissa !== 1 &&
      abscissa !== DEFAULT_SLOT_COUNT &&
      abscissa > 0 &&
      abscissa < DEFAULT_SLOT_COUNT
    ) {
      ticks.splice(1, 0, abscissa);
    }
    return ticks;
  }, [abscissa]);

  // Prepare Y-axis ticks and labels
  const yTicks = useMemo(() => {
    const ticks = abscissa < 13 ? [maxY] : [0, maxY];
    if (abscissaY !== 0 && abscissaY !== maxY) {
      ticks.splice(1, 0, abscissaY);
    }
    // Remove duplicates to avoid React key warnings
    return Array.from(new Set(ticks));
  }, [abscissaY, maxY]);

  // Custom tick formatter for X-axis
  const xTickFormatter = (value: number) => {
    if (xTicks.includes(value)) return value.toString();
    return "";
  };

  // Custom tick formatter for Y-axis
  const yTickFormatter = (value: number) => {
    // Use epsilon comparison for floating point numbers to handle Y=0 correctly
    const isInTicks = yTicks.some((tick) => Math.abs(tick - value) < 0.001);
    if (isInTicks) {
      return `${value.toFixed(0)} NUMS`;
    }
    return "";
  };

  // Custom dot component that only shows at the abscissa point
  const AbscissaDot = (props: any) => {
    const { cx, cy, payload } = props;
    // Only show dot if this point corresponds to the abscissa
    if (Math.abs(payload.x - abscissa) < 0.001) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={3}
          fill="var(--white-100)"
          stroke="var(--black-400)"
          strokeWidth={1}
        />
      );
    }
    return null;
  };

  return (
    <div
      className={cn(chartVariants({ variant, size, className }))}
      {...props}
      tabIndex={-1}
      style={{ outline: "none", minHeight: 0, minWidth: 0, ...props.style }}
      onFocus={(e) => e.currentTarget.blur()}
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
          margin={{ top: 20, right: 12, bottom: 5, left: 32 }}
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

          {/* X-axis (top) - same as bottom */}
          <XAxis
            xAxisId="top"
            type="number"
            dataKey="x"
            domain={[0, 18]}
            orientation="top"
            axisLine={false}
            tickLine={false}
            ticks={xTicks}
            tickFormatter={xTickFormatter}
            tick={
              <CustomXAxisTick
                showLabel={true}
                abscissa={abscissa}
                orientation="top"
              />
            }
          />

          {/* X-axis (bottom) - shows numeric values */}
          <XAxis
            xAxisId="bottom"
            type="number"
            dataKey="x"
            domain={[0, 18]}
            axisLine={false}
            tickLine={false}
            ticks={xTicks}
            tickFormatter={xTickFormatter}
            tick={
              <CustomXAxisTick
                showLabel={true}
                abscissa={abscissa}
                orientation="bottom"
              />
            }
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
              <CustomYAxisTick
                showLabel={true}
                tickFormatter={yTickFormatter}
                abscissaY={abscissaY}
              />
            }
          />

          {/* Reference lines for abscissa - vertical line (from top to abscissaY) */}
          <ReferenceLine
            stroke="var(--white-700)"
            strokeDasharray="3 3"
            strokeWidth={2}
            segment={[
              { x: abscissa, y: maxY },
              { x: abscissa, y: abscissaY },
            ]}
          />

          {/* Reference lines for abscissa - horizontal line (from left to abscissa) */}
          <ReferenceLine
            stroke="var(--white-700)"
            strokeDasharray="3 3"
            strokeWidth={2}
            segment={[
              { x: 0, y: abscissaY },
              { x: abscissa, y: abscissaY },
            ]}
          />

          {/* Step line chart (integer part) */}
          <Line
            type="stepAfter"
            dataKey="y"
            stroke="var(--green-100)"
            strokeWidth={2}
            dot={AbscissaDot}
            activeDot={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
