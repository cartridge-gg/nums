import type { Preview } from "@storybook/react-vite";
import "../src/index.css";
import "./preview.css";

const preview: Preview = {
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
