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
    key: "bal7hazar-1001",
    username: "Bal7hazar",
    multiplier: 2,
    timestamp: 0,
    id: "1001",
  },
  {
    key: "kitten-1002",
    username: "Kitten",
    multiplier: 5,
    timestamp: 0,
    id: "1002",
  },
  {
    key: "jazz-1003",
    username: "Jazz",
    earning: 1000,
    timestamp: 0,
    id: "1003",
  },
  {
    key: "guitar-1004",
    username: "Guitar",
    multiplier: 10,
    timestamp: 0,
    id: "1004",
  },
  {
    key: "makino-1005",
    username: "Makino",
    earning: 2500,
    timestamp: 0,
    id: "1005",
  },
  {
    key: "jacky-1006",
    username: "Jacky",
    earning: 5000,
    timestamp: 0,
    id: "1006",
  },
  {
    key: "liam-1007",
    username: "Liam",
    earning: 1,
    timestamp: 0,
    id: "1007",
  },
  {
    key: "max-1008",
    username: "Max",
    earning: 10,
    timestamp: 0,
    id: "1008",
  },
  {
    key: "jill-1009",
    username: "Jill",
    earning: 25000,
    timestamp: 0,
    id: "1009",
  },
  {
    key: "jack-1010",
    username: "Jack",
    earning: 30000,
    timestamp: 0,
    id: "1010",
  },
  {
    key: "jill-1011",
    username: "Jill",
    earning: 25000,
    timestamp: 0,
    id: "1011",
  },
  {
    key: "jack-1012",
    username: "Jack",
    earning: 30000,
    timestamp: 0,
    id: "1012",
  },
  {
    key: "jill-1013",
    username: "Jill",
    earning: 25000,
    timestamp: 0,
    id: "1013",
  },
  {
    key: "jack-1014",
    username: "Jack",
    earning: 30000,
    timestamp: 0,
    id: "1014",
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
      key: `user${eventCounterRef.current + 1}-${Date.now()}`,
      username: `User${eventCounterRef.current + 1}`,
      multiplier: Math.floor(Math.random() * 10) + 1,
      timestamp: Date.now(),
      id: `${2000 + eventCounterRef.current + 1}`,
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
