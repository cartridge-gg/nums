import { Box, Text } from "@chakra-ui/react";
import { Button } from "./Button";
import { useAccount } from "@starknet-react/core";
import { useEffect, useState } from "react";
import { graphql } from "gql.tada";
import { useQuery } from "urql";
import { useInterval } from "usehooks-ts";
import { keyframes } from "@emotion/react";

const floatUp = keyframes`
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-100px);
  }
`;

const TotalsQuery = graphql(`
  query TotalsQuery($player: ContractAddress) {
    numsTotalsModels(where: { playerEQ: $player }) {
      edges {
        node {
          rewards_earned
        }
      }
    }
  }
`);

const Balance = () => {
  const [totalRewards, setTotalRewards] = useState<number>(0);
  const [difference, setDifference] = useState<number>(0);
  const { address, account } = useAccount();

  const [totalsResult, reexecuteQuery] = useQuery({
    query: TotalsQuery,
    variables: {
      player: address,
    },
    requestPolicy: account ? "network-only" : "cache-and-network",
  });

  useInterval(() => {
    reexecuteQuery();
  }, 1000);

  useEffect(() => {
    // @ts-ignore
    const totalsModel = totalsResult.data?.numsTotalsModels?.edges?.[0]?.node;
    if (totalsModel) {
      const newRewards = totalsModel?.rewards_earned || 0;
      if (totalRewards === 0) {
        setDifference(0);
        setTotalRewards(newRewards);
        return;
      }

      const difference = newRewards - totalRewards;
      setDifference(difference);
      setTotalRewards(newRewards);
    }
  }, [totalsResult]);

  return (
    <>
      <Button position="relative" visual="transparent" h="48px" disabled>
        <Text color="purple.50">BALANCE:</Text>
        <Text>{totalRewards.toLocaleString()} NUMS</Text>
        <Box
          position="absolute"
          bottom="-50px"
          left="50%"
          transform="translateX(-50%)"
          animation={difference > 0 ? `${floatUp} 3s forwards` : "none"}
          key={difference}
          opacity={difference > 0 ? 1 : 0}
        >
          <Text color="green.50" fontSize="24px">
            +{difference.toLocaleString()} NUMS
          </Text>
        </Box>
      </Button>
    </>
  );
};

export default Balance;
