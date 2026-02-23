import React from "react";
import { Slot } from "./slot";

export interface GridProps {
  values: number[];
  style?: React.CSSProperties;
}

const ROWS = 5;
const GAP = 16;

export const Grid: React.FC<GridProps> = ({ values, style }) => {
  const slots = [
    { value: 1, locked: true },
    ...values.map((v) => ({ value: v === 0 ? undefined : v, locked: false })),
    { value: 999, locked: true },
  ];

  const columnCount = Math.ceil(slots.length / ROWS);
  const columns: (typeof slots)[] = [];
  for (let i = 0; i < columnCount; i++) {
    columns.push(slots.slice(i * ROWS, (i + 1) * ROWS));
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: GAP,
        ...style,
      }}
    >
      {columns.map((column, colIndex) => (
        <div
          key={colIndex}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: GAP,
          }}
        >
          {column.map((slot, index) => (
            <Slot key={index} value={slot.value} locked={slot.locked} />
          ))}
        </div>
      ))}
    </div>
  );
};
