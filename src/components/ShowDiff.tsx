import { useConfig } from "@/context/config";
import { Box, Text } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { useEffect, useMemo, useRef, useState } from "react";

const floatUpSlow = keyframes`
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  50% {
    transform: translateY(-5px);
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-50px);
  }
`;

export const ShowDiff = ({
  obj,
  x,
  y,
}: {
  obj: { value: number };
  x: string;
  y: string;
}) => {
  const [anim, setAnim] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    console.log("firstRender.current", firstRender.current);
    if (!firstRender.current) {
      setAnim(true);
      setTimeout(() => setAnim(false), 3_000);
    } else {
      firstRender.current = false;
    }
  }, [obj]);

  return (
    <Box
      position="absolute"
      left={x}
      top={y}
      // transform="translate(-50%, -50%)"
      animation={anim ? `${floatUpSlow} 3s forwards` : "none"}
      animationStyle="slide-fade-out"
      opacity={anim ? 1 : 0}
      pointerEvents="none"
      minW="120px"
    >
      <Text
        color={obj.value > 0 ? "green.50" : "red"}
        fontSize="16px"
        textShadow="2px 2px 0 rgba(0, 0, 0, 0.25)"
      >
        {obj.value > 0 && "+"}
        {obj.value.toLocaleString()}
      </Text>
    </Box>
  );
};
