import type { Meta, StoryObj } from "@storybook/react-vite";
import { Events } from "@/components/containers/events";
import type { EventProps } from "@/components/elements/event";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const meta = {
  title: "Containers/Events",
  component: Events,
  parameters: {
    layout: "fullscreen",
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
  },
} satisfies Meta<typeof Events>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleEvents: EventProps[] = [
  {
    username: "Bal7hazar",
    multiplier: 2,
    timestamp: 0,
    id: "1",
  },
  {
    username: "Kitten",
    multiplier: 5,
    timestamp: 0,
    id: "2",
  },
  {
    username: "Jazz",
    earning: 1000,
    timestamp: 0,
    id: "3",
  },
  {
    username: "Guitar",
    multiplier: 10,
    timestamp: 0,
    id: "4",
  },
  {
    username: "Makino",
    earning: 2500,
    timestamp: 0,
    id: "5",
  },
  {
    username: "Jacky",
    earning: 5000,
    timestamp: 0,
    id: "6",
  },
  {
    username: "Liam",
    earning: 1,
    timestamp: 0,
    id: "7",
  },
  {
    username: "Max",
    earning: 10,
    timestamp: 0,
    id: "8",
  },
  {
    username: "Jill",
    earning: 25000,
    timestamp: 0,
    id: "9",
  },
  {
    username: "Jack",
    earning: 30000,
    timestamp: 0,
    id: "10",
  },
  {
    username: "Jill",
    earning: 25000,
    timestamp: 0,
    id: "11",
  },
  {
    username: "Jack",
    earning: 30000,
    timestamp: 0,
    id: "12",
  },
  {
    username: "Jill",
    earning: 25000,
    timestamp: 0,
    id: "13",
  },
  {
    username: "Jack",
    earning: 30000,
    timestamp: 0,
    id: "12",
  },
];

export const Default: Story = {
  args: {
    events: sampleEvents,
  },
  decorators: [
    (Story) => (
      <div className="w-full">
        <Story />
      </div>
    ),
  ],
};

export const Empty: Story = {
  args: {
    events: [],
  },
  decorators: [
    (Story) => (
      <div className="w-full">
        <Story />
      </div>
    ),
  ],
};

// Interactive wrapper component
const InteractiveEvents = () => {
  const [events, setEvents] = useState<EventProps[]>(sampleEvents.slice(0, 10));
  const eventCounterRef = useRef(0);

  const addEvent = () => {
    const newEvent: EventProps = {
      username: `User${eventCounterRef.current + 1}`,
      multiplier: Math.floor(Math.random() * 10) + 1,
      timestamp: Date.now(),
      id: `new-${eventCounterRef.current + 1}`,
    };
    eventCounterRef.current += 1;
    setEvents((prev) => [newEvent, ...prev].slice(0, 10));
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-center p-4">
        <Button onClick={addEvent}>Add Event</Button>
      </div>
      <Events events={events} />
    </div>
  );
};

export const Interactive: Story = {
  args: {
    events: [],
  },
  render: () => <InteractiveEvents />,
  decorators: [
    (Story) => (
      <div className="w-full">
        <Story />
      </div>
    ),
  ],
};
