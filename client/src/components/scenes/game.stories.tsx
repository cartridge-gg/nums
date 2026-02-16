import type { Meta, StoryObj } from "@storybook/react-vite";
import { GameScene } from "./game";
import { Power, PowerType } from "@/types/power";
import { Trap, TrapType } from "@/types/trap";
import { Game as GameModel } from "@/models/game";

const meta = {
  title: "Scenes/Game",
  component: GameScene,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "purple",
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default"],
      description: "The visual variant",
    },
    size: {
      control: "select",
      options: ["md"],
      description: "The size variant",
    },
  },
} satisfies Meta<typeof GameScene>;

export default meta;
type Story = StoryObj<typeof meta>;

const createMockGame = (
  number: number,
  nextNumber: number,
  reward: number,
  slots: number[],
  selectedPowers: Power[],
  disabledPowers: boolean[],
): GameModel => {
  return new GameModel(
    1, // id
    false, // claimed
    100, // multiplier
    0, // level
    18, // slot_count
    1, // slot_min
    999, // slot_max
    number, // number
    nextNumber, // next_number
    [], // selectable_powers
    selectedPowers, // selected_powers
    disabledPowers, // enabled_powers
    Array(18).fill(false), // disabled_traps
    reward, // reward
    0, // over
    0, // expiration
    Array(18).fill(new Trap(TrapType.None)), // traps
    slots, // slots
    1n, // supply
  );
};

export const Default: Story = {
  args: {
    game: createMockGame(
      162, // currentNumber
      679, // nextNumber
      375, // reward
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // slots
      [
        new Power(PowerType.Reroll),
        new Power(PowerType.High),
        new Power(PowerType.Low),
      ], // selected_powers
      [false, true, false], // enabled_powers (second is used)
    ),
    powers: [
      { power: new Power(PowerType.Reroll) },
      { power: new Power(PowerType.High), status: "lock" as const },
      { power: new Power(PowerType.Low) },
    ],
    slots: [
      { value: 0 },
      { value: 0, trap: new Trap(TrapType.Lucky) },
      { value: 0 },
      { value: 0 },
      { value: 0, trap: new Trap(TrapType.Windy) },
      { value: 0 },
      { value: 0 },
      { value: 0, trap: new Trap(TrapType.Magnet) },
      { value: 0 },
      { value: 0 },
      { value: 0, trap: new Trap(TrapType.Bomb) },
      { value: 0 },
      { value: 0 },
      { value: 0, trap: new Trap(TrapType.UFO) },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
    ],
    stages: [
      {},
      {},
      {},
      { gem: true },
      {},
      {},
      {},
      {},
      {},
      { gem: true },
      {},
      { breakeven: true },
      { breakeven: true },
      { breakeven: true },
      { breakeven: true },
      { breakeven: true, gem: true },
      { breakeven: true },
      { breakeven: true, crown: true },
    ],
    className: "h-[calc(100vh-32px)] md:h-full",
  },
};

export const Rescuable: Story = {
  args: {
    game: createMockGame(
      313, // currentNumber
      314, // nextNumber
      375, // reward
      [0, 0, 0, 300, 312, 315, 330, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // slots
      [
        new Power(PowerType.Reroll),
        new Power(PowerType.Swap),
        new Power(PowerType.None),
      ], // selected_powers
      [false, false, false], // enabled_powers
    ),
    powers: [
      { power: new Power(PowerType.Reroll), highlighted: true },
      { power: new Power(PowerType.Swap) },
      {},
    ],
    slots: [
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 300 },
      { value: 312 },
      { value: 315 },
      { value: 330 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
    ],
    stages: [
      {},
      { gem: true },
      {},
      {},
      {},
      { gem: true },
      {},
      {},
      {},
      { gem: true },
      {},
      { breakeven: true },
      { breakeven: true },
      { breakeven: true, gem: true },
      { breakeven: true },
      { breakeven: true },
      { breakeven: true },
      { breakeven: true, crown: true },
    ],
    className: "h-[calc(100vh-32px)] md:h-full",
  },
};

export const GameOver: Story = {
  args: {
    game: createMockGame(
      313, // currentNumber
      679, // nextNumber
      375, // reward
      [0, 0, 0, 300, 312, 315, 330, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // slots
      [
        new Power(PowerType.None),
        new Power(PowerType.None),
        new Power(PowerType.None),
      ], // selected_powers
      [false, false, false], // enabled_powers
    ),
    powers: [{}, {}, {}],
    slots: [
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 300 },
      { value: 312 },
      { value: 315 },
      { value: 330 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
    ],
    stages: [
      {},
      { gem: true },
      {},
      {},
      {},
      { gem: true },
      {},
      {},
      {},
      { gem: true },
      {},
      { breakeven: true },
      { breakeven: true },
      { breakeven: true, gem: true },
      { breakeven: true },
      { breakeven: true },
      { breakeven: true },
      { breakeven: true, crown: true },
    ],
    className: "h-[calc(100vh-32px)] md:h-full",
  },
};
