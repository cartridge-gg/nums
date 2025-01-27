import { defineRecipe } from "@chakra-ui/react";

export const buttonRecipe = defineRecipe({
  base: {
    display: "flex",
  },
  variants: {
    visual: {
      primary: {
        bg: "orange.50",
        color: "white",
        height: "48px",
        fontSize: "24px",
        fontFamily: "Ekamai",
        borderRadius: "8px",
        textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)",
        transition: "all 0.2s ease-in-out",
        textTransform: "uppercase",
        padding: "8px 16px",
        _hover: {
          cursor: "pointer",
          bg: "orange.100",
        },
      },
      transparent: {
        alignItems: "center",
        fontSize: "24px",
        borderRadius: "8px",
        fontFamily: "Ekamai",
        textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)",
        textTransform: "uppercase",
        padding: "8px 24px",
        bg: "rgba(255, 255, 255, 0.08)",
        transition: "all 0.2s ease-in-out",
        boxShadow:
          "1px 1px 0px rgba(0, 0, 0, 0.12), inset 1px 1px 0px rgba(255, 255, 255, 0.12)",
        _hover: {
          cursor: "pointer",
          bg: "rgba(255, 255, 255, 0.25)",
        },
      },
    },
  },
  defaultVariants: {
    visual: "primary",
  },
});
