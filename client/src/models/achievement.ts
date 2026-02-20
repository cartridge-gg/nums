import { getChecksumAddress, shortString } from "starknet";

export const ACHIEVEMENT_DEFINITION = "AchievementDefinition";
export const ACHIEVEMENT_COMPLETION = "AchievementCompletion";
export const ACHIEVEMENT_ADVANCEMENT = "AchievementAdvancement";
export const ACHIEVEMENT_ASSOCIATION = "AchievementAssociation";
export const ACHIEVEMENT_CREATION = "TrophyCreation";
export const ACHIEVEMENT_PROGRESSION = "TrophyProgression";
export const ACHIEVEMENT_COMPLETED = "AchievementCompleted";
export const ACHIEVEMENT_CLAIMED = "AchievementClaimed";

export interface RawDefinition {
  id: {
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
  tasks: {
    type: "array";
    type_name: "Array<Task>";
    value: {
      type: "struct";
      type_name: "Task";
      value: RawTask;
      key: boolean;
    }[];
    key: boolean;
  };
  start: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  rewarder: {
    type: "primitive";
    type_name: "ContractAddress";
    value: string;
    key: boolean;
  };
}

export interface RawCompletion {
  player_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  achievement_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  timestamp: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  unclaimed: {
    type: "primitive";
    type_name: "bool";
    value: boolean;
    key: boolean;
  };
}

export interface RawAdvancement {
  player_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  achievement_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  task_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  count: {
    type: "primitive";
    type_name: "u128";
    value: string;
    key: boolean;
  };
  timestamp: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
}

export interface RawAssociation {
  task_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  achievements: {
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

export interface RawCreation {
  id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  hidden: {
    type: "primitive";
    type_name: "bool";
    value: boolean;
    key: boolean;
  };
  index: {
    type: "primitive";
    type_name: "u8";
    value: string;
    key: boolean;
  };
  points: {
    type: "primitive";
    type_name: "u16";
    value: string;
    key: boolean;
  };
  start: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  end: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  group: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  icon: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  title: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  description: {
    type: "bytearray";
    type_name: "ByteArray";
    value: string;
    key: boolean;
  };
  tasks: {
    type: "array";
    type_name: "Array<Task>";
    value: {
      type: "struct";
      type_name: "Task";
      value: RawTask;
      key: boolean;
    }[];
    key: boolean;
  };
  data: {
    type: "bytearray";
    type_name: "ByteArray";
    value: string;
    key: boolean;
  };
}

export interface RawProgression {
  player_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  task_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  count: {
    type: "primitive";
    type_name: "u128";
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

export interface RawCompleted {
  player_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  achievement_id: {
    type: "primitive";
    type_name: "felt252";
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

export interface RawClaimed {
  player_id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  achievement_id: {
    type: "primitive";
    type_name: "felt252";
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

export interface RawTask {
  total: {
    type: "primitive";
    type_name: "u128";
    value: string;
    key: boolean;
  };
  id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  description: {
    type: "bytearray";
    type_name: "ByteArray";
    value: string;
    key: boolean;
  };
}

export class AchievementTask {
  id: string;
  description: string;
  total: bigint;

  constructor(id: string, description: string, total: bigint) {
    this.id = shortString.decodeShortString(`0x${BigInt(id).toString(16)}`);
    this.description = description;
    this.total = BigInt(total);
  }

  static from(data: RawTask): AchievementTask {
    return AchievementTask.parse(data);
  }

  static parse(data: RawTask): AchievementTask {
    return new AchievementTask(
      data.id.value,
      data.description.value,
      BigInt(data.total.value),
    );
  }
}

export class AchievementDefinition {
  id: string;
  rewarder: string;
  start: number;
  end: number;
  tasks: AchievementTask[];

  constructor(
    id: string,
    rewarder: string,
    start: number,
    end: number,
    tasks: AchievementTask[],
  ) {
    this.id = id;
    this.rewarder = rewarder;
    this.start = start;
    this.end = end;
    this.tasks = tasks;
  }

  static getModelName(): string {
    return ACHIEVEMENT_DEFINITION;
  }

  static from(data: RawDefinition): AchievementDefinition {
    return AchievementDefinition.parse(data);
  }

  static parse(data: RawDefinition): AchievementDefinition {
    const props = {
      id: shortString.decodeShortString(
        `0x${BigInt(data.id.value).toString(16)}`,
      ),
      rewarder: getChecksumAddress(
        `0x${BigInt(data.rewarder.value).toString(16)}`,
      ),
      start: parseInt(data.start.value, 10),
      end: parseInt(data.end.value, 10),
      tasks: data.tasks.value.map((task) => AchievementTask.parse(task.value)),
    };
    return new AchievementDefinition(
      props.id,
      props.rewarder,
      props.start,
      props.end,
      props.tasks,
    );
  }

  static deduplicate(items: AchievementDefinition[]): AchievementDefinition[] {
    return items.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id),
    );
  }

  static now(): number {
    return Math.floor(Date.now() / 1000);
  }

  hasStarted(): boolean {
    const now = AchievementDefinition.now();
    return this.start === 0 || (now >= this.start && this.start !== 0);
  }

  hasEnded(): boolean {
    const now = AchievementDefinition.now();
    return now >= this.end && this.end !== 0;
  }

  isActive(): boolean {
    if (!this.hasStarted() || this.hasEnded()) return false;
    const now = AchievementDefinition.now();
    return now >= this.start && now <= this.end;
  }
}

export class AchievementCompletion {
  player_id: string;
  achievement_id: string;
  timestamp: number;
  unclaimed: boolean;

  constructor(
    player_id: string,
    achievement_id: string,
    timestamp: number,
    unclaimed: boolean,
  ) {
    this.player_id = player_id;
    this.achievement_id = achievement_id;
    this.timestamp = timestamp;
    this.unclaimed = unclaimed;
  }

  static getModelName(): string {
    return ACHIEVEMENT_COMPLETION;
  }

  static from(data: RawCompletion): AchievementCompletion {
    return AchievementCompletion.parse(data);
  }

  static parse(data: RawCompletion): AchievementCompletion {
    const props = {
      player_id: getChecksumAddress(
        `0x${BigInt(data.player_id.value).toString(16)}`,
      ),
      achievement_id: shortString.decodeShortString(
        `0x${BigInt(data.achievement_id.value).toString(16)}`,
      ),
      timestamp: parseInt(data.timestamp.value, 10),
      unclaimed: data.unclaimed.value,
    };
    return new AchievementCompletion(
      props.player_id,
      props.achievement_id,
      props.timestamp,
      props.unclaimed,
    );
  }

  static deduplicate(items: AchievementCompletion[]): AchievementCompletion[] {
    return items.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.player_id === item.player_id &&
            t.achievement_id === item.achievement_id,
        ),
    );
  }
}

export class AchievementAdvancement {
  player_id: string;
  achievement_id: string;
  task_id: string;
  timestamp: number;
  count: bigint;

  constructor(
    player_id: string,
    achievement_id: string,
    task_id: string,
    timestamp: number,
    count: bigint,
  ) {
    this.player_id = player_id;
    this.achievement_id = achievement_id;
    this.task_id = task_id;
    this.timestamp = timestamp;
    this.count = count;
  }

  static getModelName(): string {
    return ACHIEVEMENT_ADVANCEMENT;
  }

  static from(data: RawAdvancement): AchievementAdvancement {
    return AchievementAdvancement.parse(data);
  }

  static parse(data: RawAdvancement): AchievementAdvancement {
    const props = {
      player_id: getChecksumAddress(
        `0x${BigInt(data.player_id.value).toString(16)}`,
      ),
      achievement_id: shortString.decodeShortString(
        `0x${BigInt(data.achievement_id.value).toString(16)}`,
      ),
      task_id: shortString.decodeShortString(
        `0x${BigInt(data.task_id.value).toString(16)}`,
      ),
      timestamp: parseInt(data.timestamp.value, 10),
      count: BigInt(data.count.value),
    };
    return new AchievementAdvancement(
      props.player_id,
      props.achievement_id,
      props.task_id,
      props.timestamp,
      props.count,
    );
  }

  static deduplicate(
    items: AchievementAdvancement[],
  ): AchievementAdvancement[] {
    return items.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.player_id === item.player_id &&
            t.achievement_id === item.achievement_id &&
            t.task_id === item.task_id,
        ),
    );
  }
}

export class AchievementAssociation {
  task_id: string;
  achievements: string[];

  constructor(task_id: string, achievements: string[]) {
    this.task_id = task_id;
    this.achievements = achievements;
  }

  static getModelName(): string {
    return ACHIEVEMENT_ASSOCIATION;
  }

  static from(data: RawAssociation): AchievementAssociation {
    return AchievementAssociation.parse(data);
  }

  static parse(data: RawAssociation): AchievementAssociation {
    const props = {
      task_id: shortString.decodeShortString(
        `0x${BigInt(data.task_id.value).toString(16)}`,
      ),
      achievements: data.achievements.value.map((achievement) =>
        shortString.decodeShortString(
          `0x${BigInt(achievement.value).toString(16)}`,
        ),
      ),
    };
    return new AchievementAssociation(props.task_id, props.achievements);
  }

  static deduplicate(
    items: AchievementAssociation[],
  ): AchievementAssociation[] {
    return items.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.task_id === item.task_id),
    );
  }
}

export class AchievementCreation {
  id: string;
  hidden: boolean;
  index: number;
  points: number;
  start: number;
  end: number;
  group: string;
  icon: string;
  title: string;
  description: string;
  tasks: AchievementTask[];
  data: string;

  constructor(
    id: string,
    hidden: boolean,
    index: number,
    points: number,
    start: number,
    end: number,
    group: string,
    icon: string,
    title: string,
    description: string,
    tasks: AchievementTask[],
    data: string,
  ) {
    this.id = id;
    this.hidden = hidden;
    this.index = index;
    this.points = points;
    this.start = start;
    this.end = end;
    this.group = group;
    this.icon = icon;
    this.title = title;
    this.description = description;
    this.tasks = tasks;
    this.data = data;
  }

  static getModelName(): string {
    return ACHIEVEMENT_CREATION;
  }

  static from(data: RawCreation): AchievementCreation {
    return AchievementCreation.parse(data);
  }

  static parse(data: RawCreation): AchievementCreation {
    const props = {
      id: shortString.decodeShortString(
        `0x${BigInt(data.id.value).toString(16)}`,
      ),
      hidden: data.hidden.value,
      index: parseInt(data.index.value, 10),
      points: parseInt(data.points.value, 10),
      start: parseInt(data.start.value, 10),
      end: parseInt(data.end.value, 10),
      group: shortString.decodeShortString(
        `0x${BigInt(data.group.value).toString(16)}`,
      ),
      icon: shortString.decodeShortString(
        `0x${BigInt(data.icon.value).toString(16)}`,
      ),
      title: shortString.decodeShortString(
        `0x${BigInt(data.title.value).toString(16)}`,
      ),
      description: data.description.value,
      tasks: data.tasks.value.map((task) => AchievementTask.parse(task.value)),
      data: data.data.value,
    };
    return new AchievementCreation(
      props.id,
      props.hidden,
      props.index,
      props.points,
      props.start,
      props.end,
      props.group,
      props.icon,
      props.title,
      props.description,
      props.tasks,
      props.data,
    );
  }

  static deduplicate(items: AchievementCreation[]): AchievementCreation[] {
    return items.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id),
    );
  }
}

export class AchievementProgression {
  player_id: string;
  task_id: string;
  timestamp: number;
  count: bigint;

  constructor(
    player_id: string,
    task_id: string,
    timestamp: number,
    count: bigint,
  ) {
    this.player_id = player_id;
    this.task_id = task_id;
    this.timestamp = timestamp;
    this.count = count;
  }

  static getModelName(): string {
    return ACHIEVEMENT_PROGRESSION;
  }

  static from(data: RawProgression): AchievementProgression {
    return AchievementProgression.parse(data);
  }

  static parse(data: RawProgression): AchievementProgression {
    const props = {
      player_id: getChecksumAddress(
        `0x${BigInt(data.player_id.value).toString(16)}`,
      ),
      task_id: shortString.decodeShortString(
        `0x${BigInt(data.task_id.value).toString(16)}`,
      ),
      timestamp: parseInt(data.time.value, 10),
      count: BigInt(data.count.value),
    };
    return new AchievementProgression(
      props.player_id,
      props.task_id,
      props.timestamp,
      props.count,
    );
  }

  static deduplicate(
    items: AchievementProgression[],
  ): AchievementProgression[] {
    return items.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) => t.player_id === item.player_id && t.task_id === item.task_id,
        ),
    );
  }
}

export class AchievementCompleted {
  player_id: string;
  achievement_id: string;
  time: number;

  constructor(player_id: string, achievement_id: string, time: number) {
    this.player_id = player_id;
    this.achievement_id = achievement_id;
    this.time = time;
  }

  static getModelName(): string {
    return ACHIEVEMENT_COMPLETED;
  }

  static from(data: RawCompleted): AchievementCompleted {
    return AchievementCompleted.parse(data);
  }

  static parse(data: RawCompleted): AchievementCompleted {
    const props = {
      player_id: getChecksumAddress(
        `0x${BigInt(data.player_id.value).toString(16)}`,
      ),
      achievement_id: shortString.decodeShortString(
        `0x${BigInt(data.achievement_id.value).toString(16)}`,
      ),
      time: parseInt(data.time.value, 10),
    };
    return new AchievementCompleted(
      props.player_id,
      props.achievement_id,
      props.time,
    );
  }

  static deduplicate(items: AchievementCompleted[]): AchievementCompleted[] {
    return items.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.player_id === item.player_id &&
            t.achievement_id === item.achievement_id,
        ),
    );
  }

  static getId(item: AchievementCompleted): string {
    return `${item.player_id}-${item.achievement_id}`;
  }

  hasExpired(): boolean {
    return this.time + 30 < Math.floor(Date.now() / 1000);
  }
}

export class AchievementClaimed {
  player_id: string;
  achievement_id: string;
  time: number;

  constructor(player_id: string, achievement_id: string, time: number) {
    this.player_id = player_id;
    this.achievement_id = achievement_id;
    this.time = time;
  }

  static getModelName(): string {
    return ACHIEVEMENT_CLAIMED;
  }

  static from(data: RawClaimed): AchievementClaimed {
    return AchievementClaimed.parse(data);
  }

  static parse(data: RawClaimed): AchievementClaimed {
    const props = {
      player_id: getChecksumAddress(
        `0x${BigInt(data.player_id.value).toString(16)}`,
      ),
      achievement_id: shortString.decodeShortString(
        `0x${BigInt(data.achievement_id.value).toString(16)}`,
      ),
      time: parseInt(data.time.value, 10),
    };
    return new AchievementClaimed(
      props.player_id,
      props.achievement_id,
      props.time,
    );
  }

  static deduplicate(items: AchievementClaimed[]): AchievementClaimed[] {
    return items.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.player_id === item.player_id &&
            t.achievement_id === item.achievement_id,
        ),
    );
  }
}
