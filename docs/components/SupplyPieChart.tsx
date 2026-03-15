import React, { useState } from "react";

const data = [
  {
    label: "Liquidity pool",
    value: 1_000_000,
    color: "rgba(133, 129, 255, 0.64)",
    colorHover: "rgba(133, 129, 255, 1)",
  },
  {
    label: "Cartridge",
    value: 200_000,
    color: "rgba(133, 129, 255, 0.32)",
    colorHover: "rgba(133, 129, 255, 1)",
  },
];

const total = data.reduce((sum, d) => sum + d.value, 0);

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = polarToCartesian(cx, cy, r, startDeg);
  const end = polarToCartesian(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y} Z`;
}

export function SupplyPieChart() {
  const [hovered, setHovered] = useState<number | null>(null);
  const cx = 100;
  const cy = 100;
  const r = 85;

  let currentAngle = 0;

  return (
    <div className="docs-pie-chart">
      <div className="docs-pie-chart__svg-wrap">
        <svg
          viewBox="0 0 200 200"
          preserveAspectRatio="xMidYMid meet"
          className="docs-pie-chart__svg"
          aria-label="Initial token distribution: 1M liquidity, 200K team"
        >
        {data.map((item, i) => {
          const pct = (item.value / total) * 100;
          const startAngle = currentAngle;
          const endAngle = currentAngle + (pct / 100) * 360;
          currentAngle = endAngle;

          const pathD = describeArc(cx, cy, r, startAngle, endAngle);
          const isHovered = hovered === i;

          return (
            <path
              key={i}
              d={pathD}
              fill={isHovered ? item.colorHover : item.color}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                cursor: "pointer",
                transition: "fill 0.15s ease",
              }}
            />
          );
        })}
        <circle cx={cx} cy={cy} r={r * 0.6} fill="rgb(12, 8, 24)" />
        <text x={cx} y={cy - 8} textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="12" fontWeight="600">
          {total.toLocaleString("en-US")}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(156,163,175,1)" fontSize="11">
          $NUMS
        </text>
      </svg>
      </div>
      <div className="docs-pie-chart__legend">
        {data.map((item, i) => {
          const isHovered = hovered === i;
          const pct = ((item.value / total) * 100).toFixed(1);
          return (
            <div
              key={i}
              className={`docs-pie-chart__legend-item ${isHovered ? "docs-pie-chart__legend-item--active" : ""}`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="docs-pie-chart__legend-dot" style={{ background: isHovered ? item.colorHover : item.color }} />
              <div className="docs-pie-chart__legend-content">
                <div className="docs-pie-chart__legend-row">
                  <span className="docs-pie-chart__legend-label">{item.label}</span>
                  <span className="docs-pie-chart__legend-value">
                    {item.value.toLocaleString("en-US")} ({pct}%)
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
