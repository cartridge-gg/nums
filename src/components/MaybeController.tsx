import { useControllers } from "@/context/controllers";
import { shortAddress } from "@/utils/address";
import { Box } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export function MaybeController({ address, ...props }: { address: string }) {
  const { findController } = useControllers();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const controller = findController(address);

    if (controller) {
      // setUsername(`${controller.username} (${shortAddress(address)})`);
      setUsername(`${controller.username}`);
    } else {
      let short = address;
      try {
        short = shortAddress(address);
      } catch (e: any) {}

      setUsername(`${short}`);
    }
  }, [address]);

  return (
    <Box {...props} whiteSpace="nowrap" maxW={["130px", "200px"]} textOverflow="ellipsis" overflow="hidden">
      {username}
    </Box>
  );
}
