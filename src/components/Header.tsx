import {
  HStack,
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
  Spacer,
  Text,
} from "@chakra-ui/react";
import { Button } from "./Button";
import ControllerConnector from "@cartridge/connector/controller";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useNetwork,
  useSwitchChain,
} from "@starknet-react/core";
import { capitalize } from "../utils";
import { constants, num } from "starknet";
import { LogoIcon } from "./icons/Logo";
import { HomeIcon } from "./icons/Home";
import { useEffect, useState } from "react";
import { ControllerIcon } from "./icons/Controller";
import { DisconnectIcon } from "./icons/Disconnect";
import { useNavigate } from "react-router-dom";
import { graphql } from "gql.tada";
import { useQuery } from "urql";
import { useInterval } from "usehooks-ts";

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

const Header = ({
  showHome,
  hideChain,
}: {
  showHome?: boolean;
  hideChain?: boolean;
}) => {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();
  const { chain, chains } = useNetwork();
  const { account, address, connector } = useAccount();
  const [totalRewards, setTotalRewards] = useState<number>(0);
  const [username, setUsername] = useState<string | null>(null);
  const { switchChain } = useSwitchChain({
    params: {
      chainId: constants.StarknetChainId.SN_SEPOLIA,
    },
  });
  const controllerConnector = connector as never as ControllerConnector;

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
    if (totalsResult) {
      setTotalRewards(totalsModel?.rewards_earned || 0);
    }
  }, [totalsResult]);

  useEffect(() => {
    if (controllerConnector) {
      controllerConnector.username()?.then((username) => {
        setUsername(username);
      });
    }
  }, [controllerConnector]);

  return (
    <>
      <HStack
        w="full"
        position="absolute"
        top="0"
        left="0"
        p="12px"
        bg="linear-gradient(0deg, rgba(0, 0, 0, 0.24) 0%, rgba(0, 0, 0, 0.16) 100%), {colors.purple.100}"
      >
        <LogoIcon />
        <Text
          color="white"
          fontSize="48px"
          textShadow="2px 2px 0 rgba(0, 0, 0, 0.25)"
          fontWeight="400"
          fontFamily="Ekamai"
          letterSpacing="0.01em"
        >
          NUMS.GG
        </Text>
        <Spacer maxW="20px" />
        {showHome && (
          <Button visual="transparent" h="48px" onClick={() => navigate("/")}>
            <HomeIcon /> Home
          </Button>
        )}
        <Spacer />
        {account && !hideChain && (
          <MenuRoot>
            <MenuTrigger asChild>
              <Button>{capitalize(chain.network)}</Button>
            </MenuTrigger>

            <MenuContent>
              {chains.map((c) => (
                <MenuItem
                  value={c.network}
                  onClick={() => {
                    switchChain({ chainId: num.toHex(c.id) });
                  }}
                >
                  {capitalize(c.network)}
                </MenuItem>
              ))}
            </MenuContent>
          </MenuRoot>
        )}
        {address ? (
          <>
            <Button visual="transparent" h="48px" disabled>
              <Text color="purple.50">BALANCE:</Text>
              <Text>{totalRewards.toLocaleString()} NUMS</Text>
            </Button>
            <Button visual="transparent" h="48px">
              {address && <ControllerIcon />}
              {username}
            </Button>
            <Button visual="transparent" h="48px" onClick={() => disconnect()}>
              <DisconnectIcon />
            </Button>
          </>
        ) : (
          <Button
            onClick={() => {
              connect({ connector: connectors[0] });
            }}
          >
            Connect
          </Button>
        )}
      </HStack>
    </>
  );
};

export default Header;
