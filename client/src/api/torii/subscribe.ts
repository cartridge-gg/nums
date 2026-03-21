import type * as torii from "@dojoengine/torii-wasm";

export type EntityUpdateCallback = (entities: torii.Entity[]) => void;

function normalizeEntities(data: Record<string, unknown>): torii.Entity[] {
  const asAny = data as { data?: torii.Entity[]; error?: Error };
  if (asAny.error) return [];
  if (Array.isArray(asAny.data)) return asAny.data;
  if (data && typeof data === "object" && "hashed_keys" in data) {
    return [data as unknown as torii.Entity];
  }
  return [];
}

export async function subscribeEntities(
  client: torii.ToriiClient,
  clause: torii.Clause | undefined,
  callback: EntityUpdateCallback,
): Promise<torii.Subscription> {
  return client.onEntityUpdated(clause, [], (raw: Record<string, unknown>) => {
    const entities = normalizeEntities(raw);
    if (entities.length > 0) callback(entities);
  });
}

export async function subscribeEvents(
  client: torii.ToriiClient,
  clause: torii.Clause | undefined,
  callback: EntityUpdateCallback,
): Promise<torii.Subscription> {
  return client.onEventMessageUpdated(
    clause,
    [],
    (raw: Record<string, unknown>) => {
      const entities = normalizeEntities(raw);
      if (entities.length > 0) callback(entities);
    },
  );
}
