import type { Meta, StoryObj } from "@storybook/react-vite";
import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

function Typography(props: PropsWithChildren) {
  return <div className="flex gap-4" {...props} />;
}

function Title({
  name,
  label,
  className,
}: {
  name: string;
  label: string;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-end gap-16">
        <p className="text-[9px]/[9px] tracking-widest uppercase font-mono text-purple">
          {name}
        </p>
        <p className={cn("uppercase", className)}>{label}</p>
      </div>
      <div className="w-full h-px bg-white opacity-15" />
    </div>
  );
}

const meta: Meta<typeof Typography> = {
  title: "Styles/Typography",
  component: Typography,

  parameters: {
    layout: "padded",
    backgrounds: {
      default: "dark",
      values: [{ name: "dark", value: "#0F1410" }],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Typography>;

export const Primary: Story = {
  args: {
    children: (
      <div className="flex gap-4 w-full overflow-hidden max-h-screen">
        <div className="flex flex-col gap-4 text-white w-full overflow-y-scroll h-full" style={{ scrollbarWidth: "none" }}>
          <Title
            name="Text 10XL"
            label="PixelGame - Regular - 136pt"
            className="font-primary text-10xl"
          />
          <Title
            name="Text 9XL"
            label="PixelGame - Regular - 128pt"
            className="font-primary text-9xl"
          />
          <Title
            name="Text 8XL"
            label="PixelGame - Regular - 96pt"
            className="font-primary text-8xl"
          />
          <Title
            name="Text 7XL"
            label="PixelGame - Regular - 72pt"
            className="font-primary text-7xl"
          />
          <Title
            name="Text 6XL"
            label="PixelGame - Regular - 60pt"
            className="font-primary text-6xl"
          />
          <Title
            name="Text 5XL"
            label="PixelGame - Regular - 48pt"
            className="font-primary text-5xl"
          />
          <Title
            name="Text 4XL"
            label="PixelGame - Regular - 36pt"
            className="font-primary text-4xl"
          />
          <Title
            name="Text 3XL"
            label="PixelGame - Regular - 30pt"
            className="font-primary text-3xl"
          />
          <Title
            name="Text 2XL"
            label="PixelGame - Regular - 24pt"
            className="font-primary text-2xl"
          />
          <Title
            name="Text XL"
            label="PixelGame - Regular - 20pt"
            className="font-primary text-xl"
          />
          <Title
            name="Text L"
            label="PixelGame - Regular - 18pt"
            className="font-primary text-lg"
          />
          <Title
            name="Text M"
            label="PixelGame - Regular - 16pt"
            className="font-primary text-base"
          />
          <Title
            name="Text SM"
            label="PixelGame - Regular - 14pt"
            className="font-primary text-sm"
          />
          <Title
            name="Text XS"
            label="PixelGame - Regular - 12pt"
            className="font-primary text-xs"
          />
          <Title
            name="Text XXS"
            label="PixelGame - Regular - 10pt"
            className="font-primary text-2xs"
          />
        </div>
      </div>
    ),
  },
};

export const Secondary: Story = {
  args: {
    children: (
      <div className="flex gap-4 w-full">
        <div className="flex flex-col gap-4 text-white w-full">
          <Title
            name="Text XXL"
            label="PPNeueBit - Bold - 24pt"
            className="font-secondary text-2xl"
          />
          <Title
            name="Text XL"
            label="PPNeueBit - Bold - 20pt"
            className="font-secondary text-xl"
          />
          <Title
            name="Text L"
            label="PPNeueBit - Bold - 18pt"
            className="font-secondary text-lg"
          />
          <Title
            name="Text M"
            label="PPNeueBit - Bold - 16pt"
            className="font-secondary text-base"
          />
          <Title
            name="Text SM"
            label="PPNeueBit - Bold - 14pt"
            className="font-secondary text-sm"
          />
          <Title
            name="Text XS"
            label="PPNeueBit - Bold - 12pt"
            className="font-secondary text-xs"
          />
          <Title
            name="Text XXS"
            label="PPNeueBit - Bold - 10pt"
            className="font-secondary text-2xs"
          />
        </div>
      </div>
    ),
  },
};

export const Tertiary: Story = {
  args: {
    children: (
      <div className="flex gap-4 w-full">
        <div className="flex flex-col gap-4 text-white w-full">
          <Title
            name="Text XXL"
            label="DMMono - Regular - 24pt"
            className="font-tertiary text-2xl"
          />
          <Title
            name="Text XL"
            label="DMMono - Regular - 20pt"
            className="font-tertiary text-xl"
          />
          <Title
            name="Text L"
            label="DMMono - Regular - 18pt"
            className="font-tertiary text-lg"
          />
          <Title
            name="Text M"
            label="DMMono - Regular - 16pt"
            className="font-tertiary text-base"
          />
          <Title
            name="Text SM"
            label="DMMono - Regular - 14pt"
            className="font-tertiary text-sm"
          />
          <Title
            name="Text XS"
            label="DMMono - Regular - 12pt"
            className="font-tertiary text-xs"
          />
          <Title
            name="Text XXS"
            label="DMMono - Regular - 10pt"
            className="font-tertiary text-2xs"
          />
        </div>
      </div>
    ),
  },
};
