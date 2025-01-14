import { ArrowBackIcon, ChevronDownIcon } from "@chakra-ui/icons";
import {
  Button,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
} from "@chakra-ui/react";
import ControllerConnector from "@cartridge/connector/controller";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useNetwork,
  useSwitchChain,
} from "@starknet-react/core";
import { capitalize, formatAddress } from "../utils";
import { constants, num } from "starknet";

const Header = ({
  showBack,
  hideChain,
}: {
  showBack?: boolean;
  hideChain?: boolean;
}) => {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { chain, chains } = useNetwork();
  const { account, address, connector } = useAccount();
  const { switchChain } = useSwitchChain({
    params: {
      chainId: constants.StarknetChainId.SN_SEPOLIA,
    },
  });
  const controllerConnector = connector as never as ControllerConnector;

  return (
    <HStack w="full" position="absolute" top="0" left="0" p="20px">
      {showBack && (
        <ArrowBackIcon
          position="absolute"
          top="20px"
          left="20px"
          boxSize="24px"
          cursor="pointer"
          onClick={() => {
            window.history.back();
          }}
        />
      )}
      <Spacer />
      {account && !hideChain && (
        <Menu autoSelect={false}>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            {capitalize(chain.network)}
          </MenuButton>
          <MenuList>
            {chains.map((c) => (
              <MenuItem
                onClick={() => {
                  switchChain({ chainId: num.toHex(c.id) });
                }}
              >
                {capitalize(c.network)}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      )}
      {address ? (
        <Menu autoSelect={false}>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            <strong>{formatAddress(address)}</strong>
          </MenuButton>
          <MenuList>
            <MenuItem
              onClick={() => controllerConnector.controller.openProfile()}
            >
              Profile
            </MenuItem>
            <MenuItem
              onClick={() => controllerConnector.controller.openSettings()}
            >
              Settings
            </MenuItem>
            <MenuItem onClick={() => disconnect()}>Disconnect</MenuItem>
          </MenuList>
        </Menu>
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
  );
};

export default Header;
