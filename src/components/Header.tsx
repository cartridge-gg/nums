import { HStack, Spacer, Text } from "@chakra-ui/react";
import { Button } from "./Button";
import ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { LogoIcon } from "./icons/Logo";
import { HomeIcon } from "./icons/Home";
import { useEffect, useState } from "react";
import { ControllerIcon } from "./icons/Controller";
import { DisconnectIcon } from "./icons/Disconnect";
import { useNavigate } from "react-router-dom";
import Balance from "./Balance";
import { useAudio } from "@/context/audio";
import { SoundOffIcon } from "./icons/SoundOff";
import { SoundOnIcon } from "./icons/SoundOn";

const Header = ({ showHome }: { showHome?: boolean; hideChain?: boolean }) => {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();
  const { address, connector } = useAccount();
  const { isMuted, toggleMute } = useAudio();
  const [username, setUsername] = useState<string | null>(null);

  const controllerConnector = connector as never as ControllerConnector;

  useEffect(() => {
    if (controllerConnector) {
      controllerConnector.username()?.then((username) => {
        setUsername(username);
      });
    }
  }, [controllerConnector]);

  const height = ["48px", "48px", "48px"];
  const width = ["48px", "48px", "auto"];

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
          display={["none", "none", "block"]}
        >
          NUMS.GG
        </Text>
        <Spacer maxW="20px" />
        {showHome && (
          <Button
            visual="transparent"
            h={height}
            w={width}
            onClick={() => navigate("/")}
          >
            <HomeIcon />
          </Button>
        )}
        <Spacer />
        <Button
          visual="transparent"
          h={height}
          w={width}
          onClick={() => toggleMute()}
        >
          {isMuted ? <SoundOffIcon /> : <SoundOnIcon />}
        </Button>

        {address ? (
          <>
            <Balance />
            <Button
              visual="transparent"
              h={height}
              w={width}
              onClick={async () => {
                (connector as ControllerConnector)?.controller.openProfile(
                  "achievements",
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
