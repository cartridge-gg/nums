import React from "react";
import { Grid } from "./grid";
import { Title } from "./title";

export interface InfoProps {
  over: boolean;
  values: number[];
  style?: React.CSSProperties;
}

export const Info: React.FC<InfoProps> = ({ over, values, style }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "48px",
        ...style,
      }}
    >
      <Title over={over} />
      <Grid values={values} />
    </div>
  );
};
