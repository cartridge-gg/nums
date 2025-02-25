import { useGlobal } from "@/hooks/global";
import { HStack, Stack, Text, VStack } from "@chakra-ui/react";
import Play from "./Play";
import { useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { Button } from "./Button";

type RiskFactor = "Critical" | "High" | "Medium" | "Low";

export const VrfRisk = () => {
  const navigate = useNavigate();
  const { gamesPlayed, maxGames, isActive } = useGlobal();
  const [riskFactor, setRiskFactor] = useState<RiskFactor>("Low");

  const isPaused = useMemo(() => {
    return !isActive || gamesPlayed >= maxGames;
  }, [gamesPlayed, maxGames, isActive]);

  const getRiskColor = (percentage: number) => {
    if (isPaused) return "red";

    if (percentage <= 25) return "green.50"; // #78BD98 - Low risk
    if (percentage <= 50) return "yellow"; // #43B3C0 - Medium risk
    if (percentage <= 75) return "orange.50"; // #fc945a - High risk
    return "red"; // #F77272 - Critical risk
  };

  useEffect(() => {
    if (isPaused) return setRiskFactor("Critical");

    const percentage = (gamesPlayed / maxGames) * 100;
    if (percentage <= 25) setRiskFactor("Low");
    else if (percentage <= 50) setRiskFactor("Medium");
    else if (percentage <= 75) setRiskFactor("High");
    else setRiskFactor("Critical");
  }, [gamesPlayed, maxGames, isPaused]);

  return (
    <VStack w="full" align="flex-start">
      <Stack
        w="full"
        gap={["25px", "25px", "50px"]}
        justify="space-between"
        align="end"
        direction={["column", "column", "row"]}
      >
        <VStack w={["100%", "100%", "200px"]}>
          <HStack w="full" justify="space-between">
            <Text fontSize="16px" color="rgba(255,255,255,0.5)">
              VRF Risk Factor:
            </Text>
            <Text
              fontSize="16px"
              fontWeight="500"
              color={getRiskColor((gamesPlayed / maxGames) * 100)}
            >
              {riskFactor.toUpperCase()}
            </Text>
          </HStack>
          <HStack
            h="50px"
            w="full"
            layerStyle="transparent"
            borderRadius="32px"
            p="12px"
          >
            <HStack
              w="full"
              backgroundColor="rgba(255,255,255,0.04)"
              h="full"
              borderRadius="16px"
              overflow="hidden"
              position="relative"
            >
              <HStack
                position="absolute"
                h="full"
                w={isPaused ? "100%" : `${(gamesPlayed / maxGames) * 100}%`}
                backgroundColor={getRiskColor((gamesPlayed / maxGames) * 100)}
                transition="width 0.3s ease-in-out"
              />
            </HStack>
          </HStack>
        </VStack>
        {!isPaused ? (
          <Play
            onReady={(gameId) => navigate(`/${gameId}`)}
            w={["100%", "100%", "auto"]}
          />
        ) : (
          <Button visual="transparent" disabled color="rgba(255,255,255,0.5)">
            Paused!
          </Button>
        )}
      </Stack>
    </VStack>
  );
};
