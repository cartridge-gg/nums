import React from "react";

export interface ScoreProps {
  score: number;
  style?: React.CSSProperties;
}

export const Score: React.FC<ScoreProps> = ({ score, style }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        justifyContent: "center",
        alignItems: "center",
        padding: "48px",
        background: "#A67556",
        backdropFilter: "blur(23px)",
        borderRadius: "25px",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          fontFamily: "PixelGame, monospace",
          fontWeight: 400,
          fontStyle: "normal",
          fontSize: "32px",
          lineHeight: "22px",
          letterSpacing: "8%",
          textAlign: "center",
          verticalAlign: "middle",
          color: "#FFC8007A",
          transform: "translateY(4px)",
        }}
      >
        my score
      </div>
      <div
        style={{
          display: "flex",
          fontFamily: "PixelGame, monospace",
          fontWeight: 400,
          fontStyle: "normal",
          fontSize: "168px",
          lineHeight: "114px",
          letterSpacing: "0%",
          verticalAlign: "middle",
          textTransform: "uppercase",
          color: "#FFC800",
          textShadow: "8px 8px 24px rgba(0, 0, 0, 0.16)",
          transform: "translateY(12px)",
        }}
      >
        {score.toLocaleString()}
      </div>
    </div>
  );
};
