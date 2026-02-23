import React from "react";
import { Title } from "./title";
import { Grid } from "./grid";

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
