import { HStack, Spacer, Text, VStack } from "@chakra-ui/react";
import { Button } from "./Button";
import ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useConnect } from "@starknet-react/core";
import { LogoIcon } from "./icons/Logo";
import { useEffect, useState } from "react";
import { ControllerIcon } from "./icons/Controller";
import { useNavigate } from "react-router-dom";
import { useAudio } from "@/context/audio";
import { SoundOffIcon } from "./icons/SoundOff";
import { SoundOnIcon } from "./icons/SoundOn";
import { TokenBalance } from "./TokenBalance";
import useChain from "@/hooks/chain";
import { getNumsAddress, MAINNET_CHAIN_ID } from "@/config";
import { useMintNums } from "@/hooks/useMintNums";
import { num } from "starknet";
import { GiftIcon } from "./icons/Gift";

const Header = () => {
  const { connectAsync, connectors } = useConnect();
  const navigate = useNavigate();
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
  const isClaimOpen = Date.now() < (1758931200 * 1_000)

  return (
    <>
      <HStack
        w="full"
        position="absolute"
        zIndex="99"
        top="0"
        left="0"
        p="4px 12px"
        bg="linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)"
        backdropFilter="blur(8px)"
        borderBottom="1px solid rgba(255, 255, 255, 0.12)"
        boxShadow="0 1px 0 0 rgba(0, 0, 0, 0.08)"
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
            <TokenBalance contractAddress={numsAddress} showIcon={false} />
          </Button>
        )}
        {connector && isClaimOpen && (
          <Button
            visual="transparent"
            h={height}
            w={width}
            bg="green.100"
            onClick={() => {
              const controllerConnector =
                connectors[0] as unknown as ControllerConnector;

              controllerConnector.controller.openStarterPack(
                "nums-starterpack-sepolia"
              );
            }}
          >
            <GiftIcon />
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
          </>
        ) : (
          <Button
            h={["40px", "48px"]}
            onClick={async () => {
              await connectAsync({ connector: connectors[0] });
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
