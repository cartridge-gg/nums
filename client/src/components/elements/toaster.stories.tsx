import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Toaster,
  ToastTitle,
  ToastDescription,
  ToastAction,
} from "@/components/elements";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BrowserRouter } from "react-router-dom";

const meta = {
  title: "Elements/Toaster",
  component: Toaster,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story: React.ComponentType) => (
      <BrowserRouter>
        <div className="min-h-screen p-8">
          <Story />
          <Button
            onClick={() =>
              toast(<ToastTitle title="Bal7hazar" />, {
                description: <ToastDescription multiplier={10} />,
                action: <ToastAction to="/" />,
                duration: Infinity,
              })
            }
          >
            Toast!
          </Button>
        </div>
      </BrowserRouter>
    ),
  ],
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
