import { SchemaType } from "@dojoengine/sdk";
import { useDojoSDK } from "@dojoengine/sdk/react";
import { setupWorld } from "../bindings";

export const useDojoSdk = () => {
  return useDojoSDK<typeof setupWorld, SchemaType>();
};
