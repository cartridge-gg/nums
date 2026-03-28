import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const settingThemeVariants = cva(
  "h-8 w-8 p-1 rounded-full bg-white-800 cursor-pointer transition-colors data-[selected=true]:bg-white-100",
  {
    variants: {
      variant: {
        compliant: "text-purple-100 hover:text-mauve-100",
        rebellion: "text-crimson-100 hover:text-blush-100",
      },
    },
  },
);

export interface SettingThemeProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof settingThemeVariants> {
  selected?: boolean;
}

export const SettingTheme = ({
  variant,
  selected = false,
  className,
  ...props
}: SettingThemeProps) => (
  <button
    type="button"
    data-selected={selected}
    className={cn(settingThemeVariants({ variant, className }))}
    {...props}
  >
    <div className="h-6 w-6 rounded-full bg-current" />
  </button>
);
