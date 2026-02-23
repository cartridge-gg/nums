import React from "react";

interface SlotProps {
  value?: number;
  locked: boolean;
}

const TEXT_STYLE_BASE = {
  display: "flex" as const,
  fontFamily: "PixelGame, monospace",
  fontWeight: 400,
  fontStyle: "normal" as const,
  fontSize: "48px",
  leadingTrim: "cap-height" as const,
  lineHeight: "100%",
  letterSpacing: "0%",
  verticalAlign: "middle" as const,
  textTransform: "uppercase" as const,
  alignItems: "center" as const,
  justifyContent: "center" as const,
};

export const Slot: React.FC<SlotProps> = ({ value, locked }) => {
  const hasValue = value !== undefined;

  const containerStyle = {
    width: 96,
    height: 64,
    borderRadius: "12px",
    background: hasValue || locked ? "#0000000A" : "#00000014",
  };

  const textStyle = locked
    ? {
        ...TEXT_STYLE_BASE,
        color: "#FFFFFF52",
      }
    : hasValue
      ? {
          ...TEXT_STYLE_BASE,
          color: "#FFFFFF",
          textShadow: "2px 2px 0px rgba(0, 0, 0, 0.5)",
        }
      : {
          ...TEXT_STYLE_BASE,
          color: "#FFFFFF7A",
          textShadow: "2px 2px 0px rgba(0, 0, 0, 0.5)",
        };

  const displayText = hasValue ? String(value) : "-";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...containerStyle,
      }}
    >
      <div style={{ ...textStyle, transform: "translateY(3px)" }}>
        {displayText}
      </div>
    </div>
  );
};
