import { createSystem, defaultConfig } from "@chakra-ui/react";
import { buttonRecipe } from "./receipes/button.receipt";
import { layerStyles } from "./layer";
import { textStyles } from "./text";
const theme = createSystem(defaultConfig, {
  globalCss: {
    "html, body": {
      background: `
        linear-gradient(180deg, rgba(0, 0, 0, 0.32) 0%, rgba(0, 0, 0, 0.12) 100%),
        {colors.purple.100}
      `,
      color: "white",
    },
  },
  theme: {
    layerStyles,
    textStyles,
    recipes: {
      button: buttonRecipe,
    },
    tokens: {
      fonts: {
        heading: { value: `'Ekamai', monospace` },
        body: { value: `'CircularLL', monospace` },
      },
      colors: {
        purple: {
          50: { value: "#bbaaee" },
          100: { value: "#9e84e9" },
        },
        orange: {
          50: { value: "#fc945a" },
          100: { value: "#d47c4c" },
        },
        green: {
          50: { value: "#78BD98" },
          100: { value: "#57AD7F" },
        },
        teal: { value: "#43B3C0" },
      },
    },
  },
});

export default theme;
