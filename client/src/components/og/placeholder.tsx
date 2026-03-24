import React from "react";
import { PLACEHOLDER } from "./asset";

export const Placeholder: React.FC = () => {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        height: "100%",
        backgroundImage: `url(${PLACEHOLDER})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#4218B7",
        userSelect: "none",
        paddingLeft: "47px",
        paddingRight: "106px",
      }}
    />
  );
};
