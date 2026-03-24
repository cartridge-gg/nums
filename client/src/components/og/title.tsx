import React from "react";
import { Status, type StatusProps } from "./status";

interface TitleProps extends StatusProps {
  style?: React.CSSProperties;
}

export const Title: React.FC<TitleProps> = ({ over, style }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "83px",
        justifyContent: "space-between",
        ...style,
      }}
    >
      <h1
        style={{
          display: "flex",
          fontFamily: "PixelGame, monospace",
          fontWeight: 400,
          fontStyle: "normal",
          fontSize: "72px",
          lineHeight: "8px",
          letterSpacing: "0%",
          verticalAlign: "middle",
          textTransform: "uppercase",
          color: "#FFFFFF",
          textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)",
        }}
      >
        NUMS.gg
      </h1>
      <Status over={over} />
    </div>
  );
};
