import { getChecksumAddress } from "starknet";

const MERKLE_TREE = "MerkleTree";
const MERKLE_CLAIM = "MerkleClaim";
const MERKLE_PROOFS = "MerkleProofs";

export interface RawMerkleTree {
  root: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  end: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
}

export interface RawMerkleClaim {
  root: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  leaf: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  claimed: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
}

export interface RawMerkleProofs {
  root: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  leaf: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  recipient: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  proofs: {
    type: "array";
    type_name: "Array<felt252>";
    value: {
      type: "primitive";
      type_name: "felt252";
      value: string;
      key: boolean;
    }[];
    key: boolean;
  };
  data: {
    type: "array";
    type_name: "Array<felt252>";
    value: {
      type: "primitive";
      type_name: "felt252";
      value: string;
      key: boolean;
    }[];
    key: boolean;
  };
}

export class MerkleTree {
  type = MERKLE_TREE;

  constructor(
    public root: string,
    public end: number,
  ) {
    this.root = root;
    this.end = end;
  }

  static getModelName(): string {
    return MERKLE_TREE;
  }

  static from(data: RawMerkleTree): MerkleTree {
    return MerkleTree.parse(data);
  }

  static parse(data: RawMerkleTree): MerkleTree {
    return new MerkleTree(data.root.value, parseInt(data.end.value, 10));
  }

  static deduplicate(items: MerkleTree[]): MerkleTree[] {
    return items.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.root === item.root),
    );
  }

  hasExpired(): boolean {
    if (this.end === 0) return false;
    return this.end < Math.floor(Date.now() / 1000);
  }
}

export class MerkleClaim {
  type = MERKLE_CLAIM;

  constructor(
    public root: string,
    public leaf: string,
    public claimed: number,
  ) {
    this.root = root;
    this.leaf = leaf;
    this.claimed = claimed;
  }

  static getModelName(): string {
    return MERKLE_CLAIM;
  }

  static from(data: RawMerkleClaim): MerkleClaim {
    return MerkleClaim.parse(data);
  }

  static parse(data: RawMerkleClaim): MerkleClaim {
    return new MerkleClaim(
      data.root.value,
      data.leaf.value,
      parseInt(data.claimed.value, 10),
    );
  }

  static deduplicate(items: MerkleClaim[]): MerkleClaim[] {
    return items.filter(
      (item, index, self) =>
        index ===
        self.findIndex((t) => t.root === item.root && t.leaf === item.leaf),
    );
  }

  isClaimed(): boolean {
    return this.claimed > 0;
  }
}

export class MerkleProofs {
  type = MERKLE_PROOFS;

  constructor(
    public root: string,
    public leaf: string,
    public recipient: string,
    public proofs: string[],
    public data: string[],
  ) {
    this.root = root;
    this.leaf = leaf;
    this.recipient = recipient;
    this.proofs = proofs;
    this.data = data;
  }

  static getModelName(): string {
    return MERKLE_PROOFS;
  }

  static from(data: RawMerkleProofs): MerkleProofs {
    return MerkleProofs.parse(data);
  }

  static parse(data: RawMerkleProofs): MerkleProofs {
    return new MerkleProofs(
      data.root.value,
      data.leaf.value,
      getChecksumAddress(`0x${BigInt(data.recipient.value).toString(16)}`),
      data.proofs.value.map((p) => p.value),
      data.data.value.map((d) => d.value),
    );
  }

  static deduplicate(items: MerkleProofs[]): MerkleProofs[] {
    return items.filter(
      (item, index, self) =>
        index ===
        self.findIndex((t) => t.root === item.root && t.leaf === item.leaf),
    );
  }
}
