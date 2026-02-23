import React from "react";
import { Score, ScoreProps } from "./score";
import { Reward, RewardProps } from "./reward";
import { Info, InfoProps } from "./info";
import { BrandLogo } from "./brand-logo";

interface CardProps {
  scoreProps: ScoreProps;
  rewardProps: RewardProps;
  infoProps: InfoProps;
  baseUrl?: string;
  useInlineLogo?: boolean;
  logoUrl?: string;
  backgroundUrl?: string;
}

const BACKGROUND = "/assets/numbers.svg";
const LOGO = "/assets/brand.svg";

export const Card: React.FC<CardProps> = ({
  scoreProps,
  rewardProps,
  infoProps,
  baseUrl = "",
  useInlineLogo = false,
  logoUrl: logoUrlOverride,
  backgroundUrl: backgroundUrlOverride,
}) => {
  const bgUrl =
    backgroundUrlOverride ?? (baseUrl ? `${baseUrl}${BACKGROUND}` : BACKGROUND);
  const logoUrl = logoUrlOverride ?? (baseUrl ? `${baseUrl}${LOGO}` : LOGO);

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        height: "100%",
        ...(bgUrl && { backgroundImage: `url(${bgUrl})` }),
        ...(bgUrl && {
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }),
        backgroundColor: "#4218B7",
        userSelect: "none",
        paddingLeft: "47px",
        paddingRight: "106px",
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
        {useInlineLogo ? (
          <BrandLogo style={{ width: "63px" }} />
        ) : (
          logoUrl && (
            <img
              src={logoUrl}
              alt="Logo"
              width={63}
              height={96}
              style={{ width: "63px", objectFit: "contain" }}
            />
          )
        )}
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
