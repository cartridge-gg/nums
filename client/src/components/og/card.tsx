import React from "react";
import { Score, ScoreProps } from "./score";
import { Reward, RewardProps } from "./reward";
import { Info, InfoProps } from "./info";
import { BrandLogo } from "./brand-logo";
import { BACKGROUND, FONT_NAME } from "./asset";

interface CardProps {
  scoreProps: ScoreProps;
  rewardProps: RewardProps;
  infoProps: InfoProps;
}

export const Card: React.FC<CardProps> = ({
  scoreProps,
  rewardProps,
  infoProps,
}) => {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        height: "100%",
        backgroundImage: `url(${BACKGROUND})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#4218B7",
        userSelect: "none",
        paddingLeft: "47px",
        paddingRight: "106px",
        fontFamily: FONT_NAME,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "160px",
          height: "160px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <BrandLogo style={{ width: "63px" }} />
      </div>
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "490px",
          height: "490px",
          marginTop: "auto",
          marginBottom: "auto",
        }}
      >
        <Score
          {...scoreProps}
          style={{
            alignSelf: "flex-end",
            transform: "rotate(-7deg)",
            position: "absolute",
            top: 16,
            right: 16,
          }}
        />
        <Reward
          {...rewardProps}
          style={{
            alignSelf: "flex-start",
            transform: "rotate(8deg)",
            position: "absolute",
            bottom: 16,
            left: 16,
          }}
        />
      </div>
      <Info {...infoProps} />
    </div>
  );
};
