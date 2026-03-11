import type { Preview } from "@storybook/react-vite";
import { createElement } from "react";
import { TooltipProvider } from "../src/components/ui/tooltip";
import "../src/index.css";
import "./preview.css";

const preview: Preview = {
  decorators: [
    (Story) => createElement(TooltipProvider, { delayDuration: 300 }, createElement(Story)),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      options: {
        dark: {
          name: "dark",
          value: "#444444",
        },
        purple: {
          name: "purple",
          value: "#4419C5",
        },
        modal: {
          name: "modal",
          value: "#0D0525",
        },
      },
    },
  },
  initialGlobals: {
    backgrounds: {
      value: "purple",
    },
  },
};

export default preview;
