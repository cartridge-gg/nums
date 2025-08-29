// import { useCallback, useState } from "react";
// import { CallData, Provider } from "starknet";
// import { useInterval } from "usehooks-ts";

// type Message = Record<string, boolean>;

// export const useMessage = () => {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [hashes, setHashes] = useState<string[]>([]);
//   const provider = new Provider({
//     nodeUrl: import.meta.env.VITE_MOCK_STARKNET_RPC_URL,
//   });

//   const status = useCallback(
//     async (hash: string) => {
//       const res = await provider.callContract({
//         contractAddress: import.meta.env.VITE_CONSUMER_CONTRACT,
//         entrypoint: "appchain_to_sn_messages",
//         calldata: CallData.compile({
//           message_hash: hash,
//         }),
//       });
//       console.log("appchain_to_sn_messages", res);
//       return res;
//     },
//     [provider],
//   );

//   useInterval(() => {
//     if (hashes.length === 0) return;

//     const checkHash = async (index: number) => {
//       if (index >= hashes.length) return;

//       const hash = hashes[index];
//       const res = await status(hash);
//       setMessages((prev) => ({ ...prev, [hash]: res }));

//       setTimeout(() => checkHash(index + 1), 500);
//     };

//     checkHash(0);
//   }, 5000);

//   // useEffect(() => {
//   //     if (hashes.length === 0) return;

//   //     hashes.forEach(async (hash) => {
//   //         const res = await status(hash);
//   //         setMessages((prev) => ({ ...prev, [hash]: res }));
//   //     });
//   // }, [hashes]);

//   return {
//     messages,
//     setHashes,
//   };
// };
