import * as torii from "@dojoengine/torii-wasm";
import { ToriiGrpcClient } from "@dojoengine/grpc";
import { dojoConfigs, PLAY_CHAIN_ID } from "@/config";

const wasmClients = new Map<string, Promise<torii.ToriiClient>>();

export function getToriiClient(
  chainId: string = PLAY_CHAIN_ID,
): Promise<torii.ToriiClient> {
  const existing = wasmClients.get(chainId);
  if (existing) return existing;

  const cfg = dojoConfigs[chainId];
  if (!cfg) {
    throw new Error(`No dojo config registered for chain ${chainId}`);
  }

  const promise = Promise.resolve(
    new torii.ToriiClient({
      toriiUrl: cfg.toriiUrl,
      worldAddress: "0x0",
    }),
  );
  wasmClients.set(chainId, promise);
  return promise;
}

export const initToriiClient = () => getToriiClient(PLAY_CHAIN_ID);

const grpcClients = new Map<string, ToriiGrpcClient>();

export function getGrpcClient(
  chainId: string = PLAY_CHAIN_ID,
): ToriiGrpcClient {
  let client = grpcClients.get(chainId);
  if (client) return client;

  const cfg = dojoConfigs[chainId];
  if (!cfg) {
    throw new Error(`No dojo config registered for chain ${chainId}`);
  }

  client = new ToriiGrpcClient({
    toriiUrl: cfg.toriiUrl,
    worldAddress: "0x0",
  });
  grpcClients.set(chainId, client);
  return client;
}

export const initGrpcClient = () => getGrpcClient(PLAY_CHAIN_ID);
