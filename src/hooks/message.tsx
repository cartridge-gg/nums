import { useCallback, useEffect, useState } from "react";
import { CallData, RpcProvider } from "starknet";

type Message = Record<string, boolean>;

export const useMessage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [hashes, setHashes] = useState<string[]>([]);
  const provider = new RpcProvider({
    nodeUrl: import.meta.env.MOCK_STARKNET_RPC_URL,
  });

  const status = useCallback(
    async (hash: string) => {
      const res = await provider.callContract({
        contractAddress: import.meta.env.VITE_CONSUMER_CONTRACT,
        entrypoint: "appchain_to_sn_messages",
        calldata: CallData.compile({
          message_hash: hash,
        }),
      });
      console.log("appchain_to_sn_messages", res);
      return res;
    },
    [provider],
  );

  useEffect(() => {
    if (hashes.length === 0) return;

    hashes.forEach(async (hash) => {
      const res = await status(hash);
      setMessages((prev) => ({ ...prev, [hash]: res }));
    });
  }, [hashes]);

  return {
    messages,
    setHashes,
  };
};
