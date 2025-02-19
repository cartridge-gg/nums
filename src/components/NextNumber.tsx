import { Box, Flex, VStack } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { useState, useEffect } from "react";

const spin = keyframes`
  from { transform: translateY(0); }
  to { transform: translateY(-1em); }
`;

const SpinningDigit = ({
  digit,
  delay,
  isLoading,
}: {
  digit: number;
  delay: number;
  isLoading: boolean;
}) => {
  const [displayDigit, setDisplayDigit] = useState(digit);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    setIsSpinning(true);
    const spinInterval = setInterval(() => {
      setDisplayDigit((prev) => (prev + 1) % 10);
    }, 100);

    if (!isLoading) {
      const stopTimeout = setTimeout(() => {
        clearInterval(spinInterval);
        setIsSpinning(false);
        setDisplayDigit(digit);
      }, delay);

      return () => {
        clearInterval(spinInterval);
        clearTimeout(stopTimeout);
      };
    }

    return () => clearInterval(spinInterval);
  }, [digit, delay, isLoading]);

  const spinningNumbers = Array.from(
    { length: 10 },
    (_, i) => (displayDigit + i) % 10,
  );

  return (
    <Box
      w={["40px", "40px", "60px"]}
      animation={isSpinning ? `${spin} 0.1s infinite` : undefined}
      transition="transform 0.1s ease-out"
      transform={isSpinning ? "translateY(-0.1em)" : "translateY(0)"}
    >
      {spinningNumbers.map((num, index) => (
        <Box key={index}>{num}</Box>
      ))}
    </Box>
  );
};

const NextNumber = ({
  number,
  isLoading = false,
}: {
  number: number | null;
  isLoading?: boolean;
}) => {
  if (!number) return null;

  const digits = isLoading
    ? number.toString().padStart(3, "0").split("").map(Number)
    : number.toString().split("").map(Number);

  const delays = digits.map((_, i) => i * 250);

  return (
    <VStack
      overflowY="hidden"
      h={["60px", "60px", "100px"]}
      align="center"
      lineHeight={["60px", "60px", "100px"]}
      position="relative"
    >
      <Flex>
        {digits.map((digit, index) => (
          <SpinningDigit
            key={index}
            digit={digit}
            delay={delays[index]}
            isLoading={isLoading}
          />
        ))}
      </Flex>
    </VStack>
  );
};

export default NextNumber;
