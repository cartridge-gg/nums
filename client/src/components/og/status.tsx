import React from "react";

export interface StatusProps {
  over: boolean;
  style?: React.CSSProperties;
}

const asteriskStyle = {
  display: "flex" as const,
  transform: "translateY(6px)",
};

export const Status: React.FC<StatusProps> = ({ over, style }) => {
  const label = over ? "Final Board" : "In Progress";
  const color = over ? "#FFC800" : "#48F095";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "12px",
          fontFamily: "PixelGame, monospace",
          fontSize: "32px",
          lineHeight: "22px",
          textTransform: "uppercase",
          color,
        }}
      >
        <span style={asteriskStyle}>*</span>
        <span style={{ letterSpacing: "0.04em" }}>{label}</span>
        <span style={asteriskStyle}>*</span>
      </div>
    </div>
  );
};
