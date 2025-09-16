import { HStack, Spacer, Text, VStack } from "@chakra-ui/react";
import { Button } from "./Button";
import ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { LogoIcon } from "./icons/Logo";
import { useEffect, useMemo, useState } from "react";
import { ControllerIcon } from "./icons/Controller";
import { DisconnectIcon } from "./icons/Disconnect";
import { useNavigate, useParams } from "react-router-dom";
import { useAudio } from "@/context/audio";
import { SoundOffIcon } from "./icons/SoundOff";
import { SoundOnIcon } from "./icons/SoundOn";
import { TokenBalance } from "./TokenBalance";
import useChain from "@/hooks/chain";
import { getNumsAddress, MAINNET_CHAIN_ID } from "@/config";
import { useMintNums } from "@/hooks/useMintNums";
import { num } from "starknet";

const Header = () => {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();
  const { gameId } = useParams();
  const { address, connector } = useAccount();
  const { isMuted, toggleMute } = useAudio();
  const [username, setUsername] = useState<string | null>(null);

  const controllerConnector = connector as never as ControllerConnector;

  const { chain } = useChain();
  const numsAddress = getNumsAddress(chain.id);
  const { mintMockNums } = useMintNums();
  const isMainnet = chain.id === num.toBigInt(MAINNET_CHAIN_ID);

  useEffect(() => {
    if (controllerConnector) {
      controllerConnector.username()?.then((username) => {
        setUsername(username);
      });
    }
  }, [controllerConnector]);

  const height = ["40px", "48px", "48px"];
  const width = ["40px", "48px", "auto"];

  return (
    <>
      <HStack
        w="full"
        position="absolute"
        zIndex="99"
        top="0"
        left="0"
        p="4px 12px"
        bg="linear-gradient(0deg, rgba(0, 0, 0, 0.24) 0%, rgba(0, 0, 0, 0.16) 100%), {colors.purple.100}"
      >
        <HStack
          cursor="pointer"
          onClick={() => navigate("/")}
          color="white"
          _hover={{
            opacity: 0.5,
          }}
        >
          <LogoIcon />
          <Text
            fontSize="48px"
            textShadow="2px 2px 0 rgba(0, 0, 0, 0.25)"
            fontWeight="400"
            fontFamily="Ekamai"
            letterSpacing="0.01em"
            display={["none", "none", "block"]}
          >
            NUMS.GG
          </Text>
        </HStack>
        <Spacer maxW="20px" />

        <Spacer />
        <Button
          visual="transparent"
          h={height}
          w={width}
          onClick={() => toggleMute()}
        >
          {isMuted ? <SoundOffIcon /> : <SoundOnIcon />}
        </Button>

        {address && (
          <Button
            visual="transparent"
            position="relative"
            h={height}
            w="auto"
            cursor={!isMainnet ? "pointer" : "default"}
            onClick={() => {
              if (!isMainnet) {
                mintMockNums();
              }
            }}
          >

            <TokenBalance contractAddress={numsAddress} />
            {!isMainnet && <Text position="absolute" fontSize="10px" bottom="2px" right="16px">Mint</Text>}
          </Button>
        )}
        {address ? (
          <>
            <Button
              visual="transparent"
              h={height}
              w={width}
              onClick={async () => {
                (connector as ControllerConnector)?.controller.openProfile(
                  "achievements"
                );
              }}
            >
              {address && <ControllerIcon />}
              <Text display={["none", "none", "block"]}>{username}</Text>
            </Button>
            <Button
              visual="transparent"
              h={height}
              w={width}
              onClick={() => disconnect()}
            >
              <DisconnectIcon />
            </Button>
          </>
        ) : (
          <Button
          h={["40px", "48px"]}
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
