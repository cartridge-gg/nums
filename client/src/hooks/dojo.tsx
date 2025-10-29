import type { SchemaType } from "@dojoengine/sdk";
import { useDojoSDK } from "@dojoengine/sdk/react";
import type { setupWorld } from "../bindings";

export const useDojoSdk = () => {
  return useDojoSDK<typeof setupWorld, SchemaType>();
};
