import { useControllers } from "@/hooks/controllers";
import { shortAddress } from "@/utils/address";
import { useEffect, useState } from "react";

export function MaybeController({
  address,
  className,
  ...props
}: {
  address: string;
  className?: string;
}) {
  const { findController } = useControllers();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const controller = findController(address);

    if (controller) {
      setUsername(`${controller.username} (${shortAddress(address)})`);
    } else {
      let short = address;
      try {
        short = shortAddress(address);
      } catch (e: any) {}

      setUsername(`${short}`);
    }
  }, [address]);

  return (
    <div className={className} {...props}>
      {username}
    </div>
  );
}
