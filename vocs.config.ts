import React from "react";
import { defineConfig } from "vocs";

const baseUrl = "https://docs.nums.gg/";
const ogImage = `${baseUrl}/logo.png`;
const ogDescription =
  "Complete documentation of the NUMS game - Number Challenge onchain. Game rules, tokenomics, staking, governance, referral program.";

function ogMetaPlugin() {
  return {
    name: "og-meta-inject",
    transformIndexHtml(html: string) {
      const ogMeta = [
        `<meta property="og:description" content="${ogDescription.replace(/"/g, "&quot;")}"/>`,
        `<meta property="og:image" content="${ogImage}"/>`,
        `<meta name="twitter:description" content="${ogDescription.replace(/"/g, "&quot;")}"/>`,
        `<meta name="twitter:image" content="${ogImage}"/>`,
      ].join("");
      return html.replace("</head>", `${ogMeta}</head>`);
    },
  };
}

export default defineConfig({
  title: "Nums",
  rootDir: "docs",
  baseUrl,
  description:
    "Complete documentation of the NUMS game - Number Challenge onchain",
  ogImageUrl: ogImage,
  vite: {
    plugins: [ogMetaPlugin()],
  },
  head: React.createElement(
    React.Fragment,
    null,
    React.createElement("meta", {
      key: "description",
      name: "description",
      content:
        "Complete documentation of the NUMS game - Number Challenge onchain. Game rules, tokenomics, staking, governance, referral program.",
    }),
    React.createElement("meta", {
      key: "og-type",
      property: "og:type",
      content: "website",
    }),
    React.createElement("meta", {
      key: "og-title",
      property: "og:title",
      content: "Nums – Documentation",
    }),
    React.createElement("meta", {
      key: "og-url",
      property: "og:url",
      content: baseUrl,
    }),
    React.createElement("meta", {
      key: "og-desc",
      property: "og:description",
      content:
        "Complete documentation of the NUMS game - Number Challenge onchain. Game rules, tokenomics, staking, governance, referral program.",
    }),
    React.createElement("meta", {
      key: "og-image",
      property: "og:image",
      content: ogImage,
    }),
    React.createElement("meta", {
      key: "tw-card",
      name: "twitter:card",
      content: "summary_large_image",
    }),
    React.createElement("meta", {
      key: "tw-title",
      name: "twitter:title",
      content: "Nums – Documentation",
    }),
    React.createElement("meta", {
      key: "tw-desc",
      name: "twitter:description",
      content:
        "Complete documentation of the NUMS game - Number Challenge onchain.",
    }),
    React.createElement("meta", {
      key: "tw-image",
      name: "twitter:image",
      content: ogImage,
    }),
  ),
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
    {
      text: "Governance",
      link: "/governance",
      items: [
        { text: "Staking", link: "/governance/staking" },
        { text: "Votes", link: "/governance/votes" },
        { text: "Treasury", link: "/governance/treasury" },
      ],
    },
    { text: "Referral program", link: "/referral-program" },
    { text: "Airdrop", link: "/airdrop" },
    { text: "Contracts", link: "/contracts" },
    { text: "FAQ", link: "/faq" },
  ],
  theme: {},
});
