import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toaster } from "./sonner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GiftIcon } from "../icons";

const meta = {
  title: "UI/Sonner",
  component: Toaster,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div className="min-h-screen p-8">
        <Story />
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Toast Examples</h2>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() =>
                toast("Halfway Hero", {
                  description: "Fill 10 slots within a single game",
                  action: (
                    <Button className="self-right">
                      <GiftIcon />
                    </Button>
                  ),
                  duration: 4000,
                })
              }
            >
              Quest
            </Button>
            <Button
              onClick={() =>
                toast("Halfway Hero", {
                  description: "Fill 10 slots within a single game",
                  duration: Infinity,
                })
              }
            >
              Infinite Toast
            </Button>
          </div>
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
