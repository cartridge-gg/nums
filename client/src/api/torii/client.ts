import * as torii from "@dojoengine/torii-wasm";
import { DEFAULT_CHAIN_ID, dojoConfigs } from "@/config";

let clientInstance: torii.ToriiClient | null = null;
let clientPromise: Promise<torii.ToriiClient> | null = null;

export async function initToriiClient(): Promise<torii.ToriiClient> {
  if (clientInstance) return clientInstance;
  if (clientPromise) return clientPromise;

  const toriiUrl = dojoConfigs[DEFAULT_CHAIN_ID].toriiUrl;

  clientPromise = (async () => {
    const client = await new torii.ToriiClient({
      toriiUrl,
      worldAddress: "0x0",
    });
    clientInstance = client;
    return client;
  })();

  return clientPromise;
}
