import type { Meta, StoryObj } from "@storybook/react-vite";
import { ReferralLink } from "./referral-link";

const meta = {
  title: "Elements/Referral Link",
  component: ReferralLink,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    link: {
      control: "text",
      description: "The referral link to copy",
    },
    variant: {
      control: "select",
      options: ["default"],
      description: "Visual variant",
    },
  },
} satisfies Meta<typeof ReferralLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    link: "https://nums.gg?ref=mataleone",
  },
};
