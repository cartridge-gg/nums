import React from "react";

export interface RewardProps {
  reward: number;
  style?: React.CSSProperties;
}

export const Reward: React.FC<RewardProps> = ({ reward, style }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        justifyContent: "center",
        alignItems: "center",
        padding: "48px",
        backgroundColor: "#23794B",
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
          color: "#48F0957A",
          transform: "translateY(4px)",
        }}
      >
        $NUMS EARNED
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
          color: "#48F095",
          textShadow: "8px 8px 24px rgba(0, 0, 0, 0.16)",
          transform: "translateY(12px)",
        }}
      >
        {reward.toLocaleString("en-US")}
      </div>
    </div>
  );
};
