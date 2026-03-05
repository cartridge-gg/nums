const VAULT_INFO_MODEL = "VaultInfo";
const VAULT_POSITION_MODEL = "VaultPosition";
const VAULT_CLAIMED_EVENT = "VaultClaimed";

// ---------------------------------------------------------------------------
// Raw interfaces — shape of data coming from Torii/Dojo
// ---------------------------------------------------------------------------

export interface RawVaultClaimed {
  user: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  amount: {
    type: "primitive";
    type_name: "u256";
    value: string;
    key: boolean;
  };
  time: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
}

export interface RawVaultInfo {
  world_resource: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  open: {
    type: "primitive";
    type_name: "bool";
    value: boolean;
    key: boolean;
  };
  total_reward: {
    type: "primitive";
    type_name: "u256";
    value: string;
    key: boolean;
  };
}

export interface RawVaultPosition {
  user: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  time_lock: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  current_reward: {
    type: "primitive";
    type_name: "u256";
    value: string;
    key: boolean;
  };
  pending_reward: {
    type: "primitive";
    type_name: "u256";
    value: string;
    key: boolean;
  };
}

// ---------------------------------------------------------------------------
// Model classes
// ---------------------------------------------------------------------------

/**
 * Global vault state — keyed by world_resource (felt252).
 * One instance per world.
 */
export class VaultInfo {
  readonly type = VAULT_INFO_MODEL;

  constructor(
    public world_resource: string,
    /** Whether the vault is currently accepting deposits */
    public open: boolean,
    /** Total accumulated rewards across all stakers (18 decimals) */
    public total_reward: bigint,
  ) {}

  static getModelName(): string {
    return VAULT_INFO_MODEL;
  }

  static parse(data: RawVaultInfo): VaultInfo {
    return new VaultInfo(
      data.world_resource.value,
      data.open.value,
      BigInt(data.total_reward.value),
    );
  }

  exists(): boolean {
    return this.world_resource !== "0x0";
  }
}

/**
 * Per-user staking position — keyed by user (felt252 address).
 */
export class VaultPosition {
  readonly type = VAULT_POSITION_MODEL;

  constructor(
    public user: string,
    /** Unix timestamp until which the position is locked */
    public time_lock: bigint,
    /** Rewards already distributed to this user (18 decimals) */
    public current_reward: bigint,
    /** Rewards accrued but not yet distributed (18 decimals) */
    public pending_reward: bigint,
  ) {}

  static getModelName(): string {
    return VAULT_POSITION_MODEL;
  }

  static parse(data: RawVaultPosition): VaultPosition {
    return new VaultPosition(
      data.user.value,
      BigInt(data.time_lock.value),
      BigInt(data.current_reward.value),
      BigInt(data.pending_reward.value),
    );
  }

  exists(): boolean {
    return this.user !== "0x0";
  }

  /**
   * Claimable reward for this position, mirroring `PositionTrait::claimable` in position.cairo:
   *
   *   raw = pending_reward + shares × (vault.total_reward − current_reward)
   *   amount = raw / 10^18
   *
   * @param shares   - User's current vNUMS balance (18-decimal bigint)
   * @param vaultTotalReward - VaultInfo.total_reward (accumulated reward-per-share × 10^18)
   */
  claimable(shares: bigint, vaultTotalReward: bigint): bigint {
    const TEN_POW_36 = 10n ** 36n;
    // Guard against underflow if state is stale
    const delta =
      vaultTotalReward >= this.current_reward
        ? vaultTotalReward - this.current_reward
        : 0n;
    const raw = this.pending_reward + shares * delta;
    return raw / TEN_POW_36;
  }

  /** Whether the position is still time-locked */
  isLocked(): boolean {
    return BigInt(Math.floor(Date.now() / 1000)) < this.time_lock;
  }
}

/**
 * VaultClaimed event — emitted when a user claims their staking rewards.
 * Keyed by user (felt252 address).
 */
export class VaultClaimed {
  readonly type = VAULT_CLAIMED_EVENT;

  constructor(
    public user: string,
    /** Claimed USDC amount (6 decimals) */
    public amount: bigint,
    /** Block timestamp of the claim */
    public time: bigint,
  ) {}

  static getModelName(): string {
    return VAULT_CLAIMED_EVENT;
  }

  static parse(data: RawVaultClaimed): VaultClaimed {
    return new VaultClaimed(
      data.user.value,
      BigInt(data.amount.value),
      BigInt(data.time.value),
    );
  }

  exists(): boolean {
    return this.user !== "0x0";
  }

  /** Claimed amount in USDC (human-readable, 6 decimals) */
  claimedAmount(): number {
    return Number(this.amount) / 1e6;
  }

  /** Claim timestamp in milliseconds (for JS Date) */
  claimedAt(): number {
    return Number(this.time);
  }
}
