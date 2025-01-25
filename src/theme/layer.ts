import { defineLayerStyles } from "@chakra-ui/react";

export const layerStyles = defineLayerStyles({
  transparent: {
    value: {
      borderRadius: "8px",
      boxShadow:
        "1px 1px 0px rgba(0, 0, 0, 0.12), inset 1px 1px 0px rgba(255, 255, 255, 0.12)",
      padding: "16px",
    },
  },
});
