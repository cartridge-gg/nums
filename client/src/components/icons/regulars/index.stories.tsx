import type { Meta, StoryObj } from "@storybook/react-vite";
import * as Icons from "@/components/icons/regulars";

const meta = {
  title: "Icons/Regulars",
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Icônes sans variant
const regularIcons = [
  { name: "AddIcon", component: Icons.AddIcon },
  { name: "ArrowLeftIcon", component: Icons.ArrowLeftIcon },
  { name: "ArrowRightIcon", component: Icons.ArrowRightIcon },
  { name: "AsteriskIcon", component: Icons.AsteriskIcon },
  { name: "BrandIcon", component: Icons.BrandIcon },
  { name: "CalendarDayIcon", component: Icons.CalendarDayIcon },
  { name: "CalendarWeekIcon", component: Icons.CalendarWeekIcon },
  { name: "CartridgeIcon", component: Icons.CartridgeIcon },
  { name: "CheckIcon", component: Icons.CheckIcon },
  { name: "CheckboxCheckedIcon", component: Icons.CheckboxCheckedIcon },
  { name: "CheckboxUncheckedIcon", component: Icons.CheckboxUncheckedIcon },
  { name: "CircleInfoIcon", component: Icons.CircleInfoIcon },
  { name: "CircleQuestionIcon", component: Icons.CircleQuestionIcon },
  { name: "ControllerIcon", component: Icons.ControllerIcon },
  { name: "CopyIcon", component: Icons.CopyIcon },
  { name: "CrownIcon", component: Icons.CrownIcon },
  { name: "DiamondIcon", component: Icons.DiamondIcon },
  { name: "EyeIcon", component: Icons.EyeIcon },
  { name: "LaurelIcon", component: Icons.LaurelIcon },
  { name: "LinkIcon", component: Icons.LinkIcon },
  { name: "PlayIcon", component: Icons.PlayIcon },
  { name: "PlusIcon", component: Icons.PlusIcon },
  { name: "QuestIcon", component: Icons.QuestIcon },
  { name: "RefreshIcon", component: Icons.RefreshIcon },
  { name: "SignOutIcon", component: Icons.SignOutIcon },
  { name: "SpinnerIcon", component: Icons.SpinnerIcon },
  { name: "SpinnerPxIcon", component: Icons.SpinnerPxIcon },
  { name: "StarIcon", component: Icons.StarIcon },
  { name: "TimerIcon", component: Icons.TimerIcon },
] as const;

export const Default: Story = {
  render: () => (
    <div className="grid grid-cols-[repeat(15,minmax(0,1fr))] gap-4 text-white">
      {regularIcons.map(({ name, component: Icon }) => (
        <Icon key={name} size="xl" />
      ))}
    </div>
  ),
};
