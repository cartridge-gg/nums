import type React from "react";
import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ClauseBuilder,
  type SubscriptionCallbackArgs,
  ToriiQueryBuilder,
} from "@dojoengine/sdk";
import type * as torii from "@dojoengine/torii-wasm";
import {
  MerkleTree,
  MerkleClaim,
  MerkleProofs,
  type RawMerkleTree,
  type RawMerkleClaim,
  type RawMerkleProofs,
} from "@/models";
import { useAccount } from "@starknet-react/core";
import { useEntities } from "./entities";
import { NAMESPACE } from "@/constants";

export type Merkledrop = {
  root: string;
  end: number;
  expired: boolean;
  leaf: string;
  proofs: string[];
  data: string[];
  claimed: boolean;
};

interface MerkledropsContextType {
  merkledrops: Merkledrop[];
  status: "loading" | "error" | "success";
  refresh: () => Promise<void>;
}

const MerkledropsContext = createContext<MerkledropsContextType | undefined>(
  undefined,
);

const getTreeEntityQuery = (namespace: string) => {
  const tree: `${string}-${string}` = `${namespace}-${MerkleTree.getModelName()}`;
  const clauses = new ClauseBuilder().keys([tree], [undefined], "FixedLen");
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
};

const getProofsEventQuery = (namespace: string, playerId: string) => {
  const model = `${namespace}-${MerkleProofs.getModelName()}`;
  const clauses = new ClauseBuilder().where(
    model as any,
    "recipient" as any,
    "Eq",
    { type: "Felt252", value: playerId },
  );
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
};

const getClaimEntityQuery = (namespace: string, root: string, leaf: string) => {
  const claim: `${string}-${string}` = `${namespace}-${MerkleClaim.getModelName()}`;
  const clauses = new ClauseBuilder().keys([claim], [root, leaf], "FixedLen");
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
};

export function MerkledropsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { address } = useAccount();
  const { client } = useEntities();
  const claimSubscriptionRef = useRef<torii.Subscription | null>(null);
  const [trees, setTrees] = useState<MerkleTree[]>([]);
  const [proofs, setProofs] = useState<MerkleProofs[]>([]);
  const [claims, setClaims] = useState<MerkleClaim[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading",
  );

  const onTreeUpdate = useCallback(
    (data: SubscriptionCallbackArgs<torii.Entity[], Error>) => {
      if (!data || data.error) return;
      (data.data || [data] || []).forEach((entity) => {
        if (entity.models[`${NAMESPACE}-${MerkleTree.getModelName()}`]) {
          const model = entity.models[
            `${NAMESPACE}-${MerkleTree.getModelName()}`
          ] as unknown as RawMerkleTree;
          setTrees((prev) =>
            MerkleTree.deduplicate([MerkleTree.parse(model), ...prev]),
          );
        }
      });
    },
    [],
  );

  const onProofsUpdate = useCallback(
    (data: SubscriptionCallbackArgs<torii.Entity[], Error>) => {
      if (!data || data.error) return;
      (data.data || [data] || []).forEach((entity) => {
        if (entity.models[`${NAMESPACE}-${MerkleProofs.getModelName()}`]) {
          const model = entity.models[
            `${NAMESPACE}-${MerkleProofs.getModelName()}`
          ] as unknown as RawMerkleProofs;
          setProofs((prev) =>
            MerkleProofs.deduplicate([MerkleProofs.parse(model), ...prev]),
          );
        }
      });
    },
    [],
  );

  const onClaimUpdate = useCallback(
    (data: SubscriptionCallbackArgs<torii.Entity[], Error>) => {
      if (!data || data.error) return;
      (data.data || [data] || []).forEach((entity) => {
        if (entity.models[`${NAMESPACE}-${MerkleClaim.getModelName()}`]) {
          const model = entity.models[
            `${NAMESPACE}-${MerkleClaim.getModelName()}`
          ] as unknown as RawMerkleClaim;
          setClaims((prev) =>
            MerkleClaim.deduplicate([MerkleClaim.parse(model), ...prev]),
          );
        }
      });
    },
    [],
  );

  const refresh = useCallback(async () => {
    if (!NAMESPACE || !client || !address) return;

    const treeQuery = getTreeEntityQuery(NAMESPACE);
    const proofsQuery = getProofsEventQuery(NAMESPACE, address);

    await Promise.all([
      client
        .getEntities(treeQuery.build())
        .then((result) =>
          onTreeUpdate({ data: result.items, error: undefined }),
        ),
      client
        .getEventMessages(proofsQuery.build())
        .then((result) =>
          onProofsUpdate({ data: result.items, error: undefined }),
        ),
    ]);
  }, [NAMESPACE, client, address, onTreeUpdate, onProofsUpdate]);

  useEffect(() => {
    setStatus("loading");
    refresh()
      .then(() => setStatus("success"))
      .catch((error) => {
        console.error(error);
        setStatus("error");
      });
  }, [refresh, client]);

  useEffect(() => {
    if (!client || !proofs.length) return;

    if (claimSubscriptionRef.current) {
      claimSubscriptionRef.current = null;
    }

    const fetchAndSubscribeClaims = async () => {
      await Promise.all(
        proofs.map((proof) =>
          client
            .getEntities(
              getClaimEntityQuery(NAMESPACE, proof.root, proof.leaf).build(),
            )
            .then((result) =>
              onClaimUpdate({ data: result.items, error: undefined }),
            ),
        ),
      );

      const claim: `${string}-${string}` = `${NAMESPACE}-${MerkleClaim.getModelName()}`;
      const clauses = new ClauseBuilder().keys(
        proofs.map(() => claim),
        proofs.map((p) => p.root),
        "VariableLen",
      );
      client
        .onEntityUpdated(clauses.build(), [], onClaimUpdate)
        .then((response) => {
          claimSubscriptionRef.current = response;
        });
    };

    fetchAndSubscribeClaims();

    return () => {
      if (claimSubscriptionRef.current) {
        claimSubscriptionRef.current.cancel();
        claimSubscriptionRef.current = null;
      }
    };
  }, [client, proofs, onClaimUpdate]);

  const merkledrops: Merkledrop[] = useMemo(() => {
    return proofs.map((proof) => {
      const tree = trees.find((t) => t.root === proof.root);
      const claim = claims.find(
        (c) => c.root === proof.root && c.leaf === proof.leaf,
      );
      return {
        root: proof.root,
        end: tree?.end || 0,
        expired: tree?.hasExpired() || false,
        leaf: proof.leaf,
        proofs: proof.proofs,
        data: proof.data,
        claimed: claim?.isClaimed() || false,
      };
    });
  }, [trees, proofs, claims]);

  const value: MerkledropsContextType = {
    merkledrops,
    status,
    refresh,
  };

  return (
    <MerkledropsContext.Provider value={value}>
      {children}
    </MerkledropsContext.Provider>
  );
}

export function useMerkledrops() {
  const context = useContext(MerkledropsContext);
  if (!context) {
    throw new Error("useMerkledrops must be used within a MerkledropsProvider");
  }
  return context;
}
