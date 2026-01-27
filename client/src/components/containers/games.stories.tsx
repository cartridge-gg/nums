import type { Meta, StoryObj } from "@storybook/react-vite";
import { Games } from "./games";
import { fn } from "storybook/test";
import { useState } from "react";

const meta = {
  title: "Containers/Games",
  component: Games,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof Games>;

export default meta;
type Story = StoryObj<typeof meta>;

const Wrapper = (args: Parameters<typeof Games>[0]) => {
  const [gameId, setGameId] = useState<number | undefined>(args.gameId);
  return <Games {...args} gameId={gameId} setGameId={setGameId} />;
};

export const Default: Story = {
  render: (args) => <Wrapper {...args} />,
  args: {
    games: [
      {
        gameId: 1144,
        score: 10,
        breakEven: "14",
        payout: "$100",
      },
      {
        gameId: 1145,
        score: 25,
        breakEven: "20",
        payout: "$150",
      },
      {
        gameId: 1146,
        breakEven: "15",
        payout: "$120",
      },
    ],
    gameId: 1144,
    setGameId: fn(),
  },
};

export const Empty: Story = {
  render: (args) => <Wrapper {...args} />,
  args: {
    games: [],
    gameId: 0,
    setGameId: fn(),
  },
};

export const Single: Story = {
  render: (args) => <Wrapper {...args} />,
  args: {
    games: [
      {
        gameId: 1144,
        score: 10,
        breakEven: "14",
        payout: "$100",
      },
    ],
    gameId: 1144,
    setGameId: fn(),
  },
};

export const Many: Story = {
  render: (args) => <Wrapper {...args} />,
  args: {
    games: [
      {
        gameId: 1144,
        score: 10,
        breakEven: "14",
        payout: "$100",
      },
      {
        gameId: 1145,
        score: 25,
        breakEven: "20",
        payout: "$150",
      },
      {
        gameId: 1146,
        breakEven: "15",
        payout: "$120",
      },
      {
        gameId: 1147,
        score: 50,
        breakEven: "30",
        payout: "$200",
      },
      {
        gameId: 1148,
        score: 15,
        breakEven: "18",
        payout: "$110",
      },
      {
        gameId: 1149,
        breakEven: "12",
        payout: "$90",
      },
    ],
    gameId: 1147,
    setGameId: fn(),
  },
};

export const NewCardActive: Story = {
  render: (args) => <Wrapper {...args} />,
  args: {
    games: [
      {
        gameId: 1144,
        score: 10,
        breakEven: "14",
        payout: "$100",
      },
      {
        gameId: 1145,
        score: 25,
        breakEven: "20",
        payout: "$150",
      },
    ],
    gameId: 0,
    setGameId: fn(),
  },
};
