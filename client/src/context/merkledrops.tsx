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
import { useAtomValue } from "jotai";
import type * as torii from "@dojoengine/torii-wasm";
import { MerkleTree, MerkleClaim, MerkleProofs } from "@/models";
import { useAccount } from "@starknet-react/core";
import { Merkledrop as MerkledropApi, subscribeEntities } from "@/api";
import { toriiClientAtom } from "@/atoms";
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

export function MerkledropsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { address } = useAccount();
  const client = useAtomValue(toriiClientAtom);
  const treeSubscriptionRef = useRef<torii.Subscription | null>(null);
  const proofsSubscriptionRef = useRef<torii.Subscription | null>(null);
  const claimSubscriptionRef = useRef<torii.Subscription[]>([]);
  const treeSubscriptionKeyRef = useRef<string>();
  const proofsSubscriptionKeyRef = useRef<string>();
  const claimSubscriptionKeyRef = useRef<string>();
  const [trees, setTrees] = useState<MerkleTree[]>([]);
  const [proofs, setProofs] = useState<MerkleProofs[]>([]);
  const [claims, setClaims] = useState<MerkleClaim[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading",
  );

  const onTreeUpdate = useCallback((entities: torii.Entity[]) => {
    if (!entities.length) return;

    const parsedTrees = MerkledropApi.parseTrees(entities);
    if (parsedTrees.length) {
      setTrees((prev) => MerkleTree.deduplicate([...parsedTrees, ...prev]));
    }
  }, []);
  const onTreeUpdateRef = useRef(onTreeUpdate);
  onTreeUpdateRef.current = onTreeUpdate;

  const onProofsUpdate = useCallback((entities: torii.Entity[]) => {
    if (!entities.length) return;

    const parsedProofs = MerkledropApi.parseProofs(entities);
    if (parsedProofs.length) {
      setProofs((prev) => MerkleProofs.deduplicate([...parsedProofs, ...prev]));
    }
  }, []);
  const onProofsUpdateRef = useRef(onProofsUpdate);
  onProofsUpdateRef.current = onProofsUpdate;

  const onClaimUpdate = useCallback((entities: torii.Entity[]) => {
    if (!entities.length) return;

    const parsedClaims = MerkledropApi.parseClaims(entities);
    if (parsedClaims.length) {
      setClaims((prev) => MerkleClaim.deduplicate([...parsedClaims, ...prev]));
    }
  }, []);
  const onClaimUpdateRef = useRef(onClaimUpdate);
  onClaimUpdateRef.current = onClaimUpdate;

  const handleTreeUpdate = useCallback((entities: torii.Entity[]) => {
    onTreeUpdateRef.current(entities);
  }, []);

  const handleProofsUpdate = useCallback((entities: torii.Entity[]) => {
    onProofsUpdateRef.current(entities);
  }, []);

  const handleClaimUpdate = useCallback((entities: torii.Entity[]) => {
    onClaimUpdateRef.current(entities);
  }, []);

  const refresh = useCallback(async () => {
    if (!NAMESPACE || !client) return;

    const treesQuery = MerkledropApi.treesQuery();

    await client
      .getEntities(treesQuery.build())
      .then((result) => handleTreeUpdate(result.items));

    if (!address) return;

    const proofsQuery = MerkledropApi.proofsQuery(address);
    await client
      .getEventMessages(proofsQuery.build())
      .then((result) => handleProofsUpdate(result.items));
  }, [NAMESPACE, client, address, handleTreeUpdate, handleProofsUpdate]);

  const fetchTrees = useCallback(async () => {
    if (!NAMESPACE || !client) return;
    const treesQuery = MerkledropApi.treesQuery();
    await client
      .getEntities(treesQuery.build())
      .then((result) => handleTreeUpdate(result.items));
  }, [NAMESPACE, client, handleTreeUpdate]);

  const setupTreeSubscription = useCallback(async () => {
    if (!NAMESPACE || !client) return;

    const treeClause = MerkledropApi.treesQuery().build().clause;
    const treeKey = JSON.stringify(treeClause);

    if (
      treeSubscriptionKeyRef.current === treeKey &&
      treeSubscriptionRef.current
    ) {
      return;
    }

    if (treeSubscriptionRef.current) {
      treeSubscriptionRef.current.cancel();
      treeSubscriptionRef.current = null;
    }

    treeSubscriptionRef.current = await subscribeEntities(
      client,
      treeClause,
      handleTreeUpdate,
    );
    treeSubscriptionKeyRef.current = treeKey;
  }, [NAMESPACE, client, handleTreeUpdate]);

  const fetchProofs = useCallback(async () => {
    if (!NAMESPACE || !client || !address) return;
    const proofsQuery = MerkledropApi.proofsQuery(address);
    await client
      .getEventMessages(proofsQuery.build())
      .then((result) => handleProofsUpdate(result.items));
  }, [NAMESPACE, client, address, handleProofsUpdate]);

  const setupProofsSubscription = useCallback(async () => {
    if (!NAMESPACE || !client || !address) return;

    const proofsClause = MerkledropApi.proofsQuery(address).build().clause;
    const proofsKey = JSON.stringify(proofsClause);

    if (
      proofsSubscriptionKeyRef.current === proofsKey &&
      proofsSubscriptionRef.current
    ) {
      return;
    }

    if (proofsSubscriptionRef.current) {
      proofsSubscriptionRef.current.cancel();
      proofsSubscriptionRef.current = null;
    }

    proofsSubscriptionRef.current = await subscribeEntities(
      client,
      proofsClause,
      handleProofsUpdate,
    );
    proofsSubscriptionKeyRef.current = proofsKey;
  }, [NAMESPACE, client, address, handleProofsUpdate]);

  const fetchClaims = useCallback(async () => {
    if (!client || !proofs.length) return;

    await Promise.all(
      proofs.map((proof) =>
        client
          .getEntities(MerkledropApi.claimQuery(proof.root, proof.leaf).build())
          .then((result) => handleClaimUpdate(result.items)),
      ),
    );
  }, [client, proofs, handleClaimUpdate]);

  const setupClaimSubscriptions = useCallback(async () => {
    if (!client || !proofs.length) return;

    const claimKey = JSON.stringify(
      [...proofs]
        .map((proof) => `${proof.root}:${proof.leaf}`)
        .sort((a, b) => a.localeCompare(b)),
    );

    if (
      claimSubscriptionKeyRef.current === claimKey &&
      claimSubscriptionRef.current.length
    ) {
      return;
    }

    for (const subscription of claimSubscriptionRef.current) {
      subscription.cancel();
    }
    claimSubscriptionRef.current = [];

    claimSubscriptionRef.current = await Promise.all(
      proofs.map((proof) =>
        subscribeEntities(
          client,
          MerkledropApi.claimQuery(proof.root, proof.leaf).build().clause,
          handleClaimUpdate,
        ),
      ),
    );

    claimSubscriptionKeyRef.current = claimKey;
  }, [client, proofs, handleClaimUpdate]);

  useEffect(() => {
    if (!NAMESPACE || !client) return;
    let cancelled = false;

    setStatus("loading");

    const run = async () => {
      await fetchTrees();
      await setupTreeSubscription();
    };

    run()
      .then(() => {
        if (!cancelled) {
          setStatus("success");
        }
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) {
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
      if (treeSubscriptionRef.current) {
        treeSubscriptionRef.current.cancel();
        treeSubscriptionRef.current = null;
      }
      treeSubscriptionKeyRef.current = undefined;
    };
  }, [NAMESPACE, client, fetchTrees, setupTreeSubscription]);

  useEffect(() => {
    if (!NAMESPACE || !client || !address) return;
    let cancelled = false;

    setStatus("loading");

    const run = async () => {
      await fetchProofs();
      await setupProofsSubscription();
    };

    run()
      .then(() => {
        if (!cancelled) {
          setStatus("success");
        }
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) {
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
      if (proofsSubscriptionRef.current) {
        proofsSubscriptionRef.current.cancel();
        proofsSubscriptionRef.current = null;
      }
      proofsSubscriptionKeyRef.current = undefined;
    };
  }, [NAMESPACE, client, address, fetchProofs, setupProofsSubscription]);

  useEffect(() => {
    if (!client || !proofs.length) return;
    let cancelled = false;

    setStatus("loading");

    const fetchAndSubscribeClaims = async () => {
      await fetchClaims();
      await setupClaimSubscriptions();
    };

    fetchAndSubscribeClaims()
      .then(() => {
        if (!cancelled) {
          setStatus("success");
        }
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) {
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
      for (const subscription of claimSubscriptionRef.current) {
        subscription.cancel();
      }
      claimSubscriptionRef.current = [];
      claimSubscriptionKeyRef.current = undefined;
    };
  }, [client, proofs, fetchClaims, setupClaimSubscriptions]);

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
