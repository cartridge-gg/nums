import React from "react";
import { getPlaceholder } from "./asset";

export const Placeholder: React.FC = () => {
  const placeholderUrl = getPlaceholder();
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        height: "100%",
        ...(placeholderUrl && { backgroundImage: `url(${placeholderUrl})` }),
        ...(placeholderUrl && {
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }),
        backgroundColor: "#4218B7",
        userSelect: "none",
        paddingLeft: "47px",
        paddingRight: "106px",
      }}
    />
  );
};
