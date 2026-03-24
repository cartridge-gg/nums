// ---------------------------------------------------------------------------
// Raw interfaces — shape of data coming from Torii/Dojo
// ---------------------------------------------------------------------------

// --- Models ---

export interface RawBundle {
  id: {
    type: "primitive";
    type_name: "u32";
    value: string;
    key: boolean;
  };
  referral_percentage: {
    type: "primitive";
    type_name: "u8";
    value: string;
    key: boolean;
  };
  reissuable: {
    type: "primitive";
    type_name: "bool";
    value: boolean;
    key: boolean;
  };
  price: {
    type: "primitive";
    type_name: "u256";
    value: string;
    key: boolean;
  };
  payment_token: {
    type: "primitive";
    type_name: "ContractAddress";
    value: string;
    key: boolean;
  };
  payment_receiver: {
    type: "primitive";
    type_name: "ContractAddress";
    value: string;
    key: boolean;
  };
  total_issued: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  created_at: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  metadata: {
    type: "primitive";
    type_name: "ByteArray";
    value: string;
    key: boolean;
  };
  contract: {
    type: "primitive";
    type_name: "ContractAddress";
    value: string;
    key: boolean;
  };
  allower: {
    type: "primitive";
    type_name: "ContractAddress";
    value: string;
    key: boolean;
  };
}

export interface RawBundleIssuance {
  bundle_id: {
    type: "primitive";
    type_name: "u32";
    value: string;
    key: boolean;
  };
  recipient: {
    type: "primitive";
    type_name: "ContractAddress";
    value: string;
    key: boolean;
  };
  issued_at: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
}

export interface RawBundleReferral {
  id: {
    type: "primitive";
    type_name: "ContractAddress";
    value: string;
    key: boolean;
  };
  total_fees: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  total_referrals: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
}

export interface RawBundleGroup {
  id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  total_fees: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  total_referrals: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
}

export interface RawBundleVoucher {
  key: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  recipient: {
    type: "primitive";
    type_name: "ContractAddress";
    value: string;
    key: boolean;
  };
}

// --- Events ---

export interface RawBundleRegistered {
  bundle_id: {
    type: "primitive";
    type_name: "u32";
    value: string;
    key: boolean;
  };
  referral_percentage: {
    type: "primitive";
    type_name: "u8";
    value: string;
    key: boolean;
  };
  reissuable: {
    type: "primitive";
    type_name: "bool";
    value: boolean;
    key: boolean;
  };
  time: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  payment_receiver: {
    type: "primitive";
    type_name: "ContractAddress";
    value: string;
    key: boolean;
  };
}

export interface RawBundleUpdated {
  bundle_id: {
    type: "primitive";
    type_name: "u32";
    value: string;
    key: boolean;
  };
  referral_percentage: {
    type: "primitive";
    type_name: "u8";
    value: string;
    key: boolean;
  };
  reissuable: {
    type: "primitive";
    type_name: "bool";
    value: boolean;
    key: boolean;
  };
  price: {
    type: "primitive";
    type_name: "u256";
    value: string;
    key: boolean;
  };
  payment_token: {
    type: "primitive";
    type_name: "ContractAddress";
    value: string;
    key: boolean;
  };
  metadata: {
    type: "primitive";
    type_name: "ByteArray";
    value: string;
    key: boolean;
  };
  time: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  payment_receiver: {
    type: "primitive";
    type_name: "ContractAddress";
    value: string;
    key: boolean;
  };
}

export interface RawBundleIssued {
  recipient: {
    type: "primitive";
    type_name: "ContractAddress";
    value: string;
    key: boolean;
  };
  bundle_id: {
    type: "primitive";
    type_name: "u32";
    value: string;
    key: boolean;
  };
  payment_token: {
    type: "primitive";
    type_name: "ContractAddress";
    value: string;
    key: boolean;
  };
  amount: {
    type: "primitive";
    type_name: "u256";
    value: string;
    key: boolean;
  };
  quantity: {
    type: "primitive";
    type_name: "u32";
    value: string;
    key: boolean;
  };
  referrer: {
    type: "enum";
    type_name: "Option<ContractAddress>";
    value: {
      option: "Some" | "None";
      value?: {
        type: "primitive";
        type_name: "ContractAddress";
        value: string;
      };
    };
    key: boolean;
  };
  referrer_group: {
    type: "enum";
    type_name: "Option<felt252>";
    value: {
      option: "Some" | "None";
      value?: {
        type: "primitive";
        type_name: "felt252";
        value: string;
      };
    };
    key: boolean;
  };
  time: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
}

// ---------------------------------------------------------------------------
// Helper — parse Option<T> enums from Torii
// ---------------------------------------------------------------------------

function parseOptionValue(raw: {
  value: {
    option: "Some" | "None";
    value?: { value: string };
  };
}): string | undefined {
  if (raw.value.option === "Some" && raw.value.value) {
    return raw.value.value.value;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Model classes
// ---------------------------------------------------------------------------

const BUNDLE_MODEL = "Bundle";

export class Bundle {
  readonly type = BUNDLE_MODEL;

  constructor(
    public id: number,
    public referral_percentage: number,
    public reissuable: boolean,
    public price: bigint,
    public payment_token: string,
    public payment_receiver: string,
    public total_issued: number,
    public created_at: number,
    public metadata: string,
    public contract: string,
    public allower: string,
  ) {}

  static getModelName(): string {
    return BUNDLE_MODEL;
  }

  static from(data: RawBundle): Bundle {
    return Bundle.parse(data);
  }

  static parse(data: RawBundle): Bundle {
    return new Bundle(
      Number(data.id.value),
      Number(data.referral_percentage.value),
      !!data.reissuable.value,
      BigInt(data.price.value),
      data.payment_token.value,
      data.payment_receiver.value,
      Number(data.total_issued.value),
      Number(data.created_at.value),
      data.metadata.value,
      data.contract.value,
      data.allower.value,
    );
  }

  exists(): boolean {
    return BigInt(this.payment_token) !== 0n;
  }

  static dedupe(items: Bundle[]): Bundle[] {
    return items.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id),
    );
  }
}

// ---------------------------------------------------------------------------

const BUNDLE_ISSUANCE_MODEL = "BundleIssuance";

export class BundleIssuance {
  readonly type = BUNDLE_ISSUANCE_MODEL;

  constructor(
    public bundle_id: number,
    public recipient: string,
    public issued_at: number,
  ) {}

  static getModelName(): string {
    return BUNDLE_ISSUANCE_MODEL;
  }

  static from(data: RawBundleIssuance): BundleIssuance {
    return BundleIssuance.parse(data);
  }

  static parse(data: RawBundleIssuance): BundleIssuance {
    return new BundleIssuance(
      Number(data.bundle_id.value),
      data.recipient.value,
      Number(data.issued_at.value),
    );
  }

  exists(): boolean {
    return this.issued_at > 0;
  }

  static dedupe(items: BundleIssuance[]): BundleIssuance[] {
    return items.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.bundle_id === item.bundle_id && t.recipient === item.recipient,
        ),
    );
  }
}

// ---------------------------------------------------------------------------

const BUNDLE_REFERRAL_MODEL = "BundleReferral";

export class BundleReferral {
  readonly type = BUNDLE_REFERRAL_MODEL;

  constructor(
    public id: string,
    public total_fees: bigint,
    public total_referrals: number,
  ) {}

  static getModelName(): string {
    return BUNDLE_REFERRAL_MODEL;
  }

  static from(data: RawBundleReferral): BundleReferral {
    return BundleReferral.parse(data);
  }

  static parse(data: RawBundleReferral): BundleReferral {
    return new BundleReferral(
      data.id.value,
      BigInt(data.total_fees.value),
      Number(data.total_referrals.value),
    );
  }

  exists(): boolean {
    return BigInt(this.id) !== 0n;
  }

  static dedupe(items: BundleReferral[]): BundleReferral[] {
    return items.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id),
    );
  }
}

// ---------------------------------------------------------------------------

const BUNDLE_GROUP_MODEL = "BundleGroup";

export class BundleGroup {
  readonly type = BUNDLE_GROUP_MODEL;

  constructor(
    public id: string,
    public total_fees: bigint,
    public total_referrals: number,
  ) {}

  static getModelName(): string {
    return BUNDLE_GROUP_MODEL;
  }

  static from(data: RawBundleGroup): BundleGroup {
    return BundleGroup.parse(data);
  }

  static parse(data: RawBundleGroup): BundleGroup {
    return new BundleGroup(
      data.id.value,
      BigInt(data.total_fees.value),
      Number(data.total_referrals.value),
    );
  }

  exists(): boolean {
    return BigInt(this.id) !== 0n;
  }

  static dedupe(items: BundleGroup[]): BundleGroup[] {
    return items.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id),
    );
  }
}

// ---------------------------------------------------------------------------

const BUNDLE_VOUCHER_MODEL = "BundleVoucher";

export class BundleVoucher {
  readonly type = BUNDLE_VOUCHER_MODEL;

  constructor(
    public key: string,
    public recipient: string,
  ) {}

  static getModelName(): string {
    return BUNDLE_VOUCHER_MODEL;
  }

  static from(data: RawBundleVoucher): BundleVoucher {
    return BundleVoucher.parse(data);
  }

  static parse(data: RawBundleVoucher): BundleVoucher {
    return new BundleVoucher(data.key.value, data.recipient.value);
  }

  exists(): boolean {
    return BigInt(this.key) !== 0n;
  }

  static dedupe(items: BundleVoucher[]): BundleVoucher[] {
    return items.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.key === item.key),
    );
  }
}

// ---------------------------------------------------------------------------
// Event classes
// ---------------------------------------------------------------------------

const BUNDLE_REGISTERED_EVENT = "BundleRegistered";

export class BundleRegistered {
  readonly type = BUNDLE_REGISTERED_EVENT;

  constructor(
    public bundle_id: number,
    public referral_percentage: number,
    public reissuable: boolean,
    public time: number,
    public payment_receiver: string,
  ) {}

  static getModelName(): string {
    return BUNDLE_REGISTERED_EVENT;
  }

  static from(data: RawBundleRegistered): BundleRegistered {
    return BundleRegistered.parse(data);
  }

  static parse(data: RawBundleRegistered): BundleRegistered {
    return new BundleRegistered(
      Number(data.bundle_id.value),
      Number(data.referral_percentage.value),
      !!data.reissuable.value,
      Number(data.time.value),
      data.payment_receiver.value,
    );
  }

  static dedupe(items: BundleRegistered[]): BundleRegistered[] {
    return items.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) => t.bundle_id === item.bundle_id && t.time === item.time,
        ),
    );
  }

  static getId(item: BundleRegistered): string {
    return `${item.bundle_id}-${item.time}`;
  }
}

// ---------------------------------------------------------------------------

const BUNDLE_UPDATED_EVENT = "BundleUpdated";

export class BundleUpdated {
  readonly type = BUNDLE_UPDATED_EVENT;

  constructor(
    public bundle_id: number,
    public referral_percentage: number,
    public reissuable: boolean,
    public price: bigint,
    public payment_token: string,
    public metadata: string,
    public time: number,
    public payment_receiver: string,
  ) {}

  static getModelName(): string {
    return BUNDLE_UPDATED_EVENT;
  }

  static from(data: RawBundleUpdated): BundleUpdated {
    return BundleUpdated.parse(data);
  }

  static parse(data: RawBundleUpdated): BundleUpdated {
    return new BundleUpdated(
      Number(data.bundle_id.value),
      Number(data.referral_percentage.value),
      !!data.reissuable.value,
      BigInt(data.price.value),
      data.payment_token.value,
      data.metadata.value,
      Number(data.time.value),
      data.payment_receiver.value,
    );
  }

  static dedupe(items: BundleUpdated[]): BundleUpdated[] {
    return items.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) => t.bundle_id === item.bundle_id && t.time === item.time,
        ),
    );
  }

  static getId(item: BundleUpdated): string {
    return `${item.bundle_id}-${item.time}`;
  }
}

// ---------------------------------------------------------------------------

const BUNDLE_ISSUED_EVENT = "BundleIssued";

export class BundleIssued {
  readonly type = BUNDLE_ISSUED_EVENT;

  constructor(
    public recipient: string,
    public bundle_id: number,
    public payment_token: string,
    public amount: bigint,
    public quantity: number,
    public referrer: string | undefined,
    public referrer_group: string | undefined,
    public time: number,
  ) {}

  static getModelName(): string {
    return BUNDLE_ISSUED_EVENT;
  }

  static from(data: RawBundleIssued): BundleIssued {
    return BundleIssued.parse(data);
  }

  static parse(data: RawBundleIssued): BundleIssued {
    return new BundleIssued(
      data.recipient.value,
      Number(data.bundle_id.value),
      data.payment_token.value,
      BigInt(data.amount.value),
      Number(data.quantity.value),
      parseOptionValue(data.referrer),
      parseOptionValue(data.referrer_group),
      Number(data.time.value),
    );
  }

  static dedupe(items: BundleIssued[]): BundleIssued[] {
    return items.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.recipient === item.recipient &&
            t.bundle_id === item.bundle_id &&
            t.time === item.time,
        ),
    );
  }

  static getId(item: BundleIssued): string {
    return `${item.recipient}-${item.bundle_id}-${item.time}`;
  }
}
