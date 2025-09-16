import { defineRecipe } from "@chakra-ui/react";

export const buttonRecipe = defineRecipe({
  base: {
    display: "flex",
  },
  variants: {
    visual: {
      primary: {
        gap: "10px",
        alignItems: "center",
        bg: "orange.50",
        color: "white",
        // height: "36px",
        fontSize: "16px",
        fontFamily: "Ekamai",
        borderRadius: "8px",
        justifyContent: "center",
        textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)",
        transition: "all 0.2s ease-in-out",
        textTransform: "uppercase",
        padding: "6px 12px",
        _hover: {
          cursor: "pointer",
          bg: "orange.100",
        },
      },
      secondary: {
        gap: "10px",
        alignItems: "center",
        bg: "green.100",
        color: "white",
        // height: "36px",
        fontSize: "16px",
        fontFamily: "Ekamai",
        borderRadius: "8px",
        justifyContent: "center",
        textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)",
        transition: "all 0.2s ease-in-out",
        textTransform: "uppercase",
        padding: "6px 12px",
        _disabled: {
          cursor: "not-allowed",
          opacity: 0.3,
        },
        _hover: {
          cursor: "pointer",
          bg: "green.50",
        },
      },
      transparent: {
        gap: "10px",
        alignItems: "center",
        // height: "36px",
        fontSize: "16px",
        borderRadius: "8px",
        justifyContent: "center",
        fontFamily: "Ekamai",
        textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)",
        textTransform: "uppercase",
        padding: "6px 12px",
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
