import { defineConfig } from "vocs";

export default defineConfig({
  title: "NUMS",
  rootDir: "docs",
  description:
    "Complete documentation of the NUMS game - Number Challenge onchain",
  logoUrl: {
    light: "/logo-light.svg",
    dark: "/logo-dark.svg",
  },
  iconUrl: "/favicon.ico",
  socials: [
    {
      icon: "github",
      link: "https://github.com/cartridge-gg/nums",
    },
    {
      icon: "x",
      link: "https://x.com/numsgg",
    },
  ],
  sidebar: [
    { text: "Overview", link: "/" },
    {
      text: "Game rules",
      link: "/game-rules",
      items: [
        { text: "Power ups", link: "/game-rules/power-ups" },
        { text: "Traps", link: "/game-rules/traps" },
        { text: "Practice", link: "/game-rules/practice" },
        { text: "Rewards", link: "/game-rules/rewards" },
        { text: "Randomness", link: "/game-rules/randomness" },
      ],
    },
    { text: "Token", link: "/token" },
    { text: "Staking", link: "/staking" },
    { text: "Governance", link: "/governance" },
    { text: "Referral program", link: "/referral-program" },
    { text: "Contracts", link: "/contracts" },
    { text: "FAQ", link: "/faq" },
  ],
  theme: {},
});
