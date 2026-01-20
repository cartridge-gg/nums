import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import SlotCounter from "react-slot-counter";

export interface NumberProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof numberVariants> {
  value?: number;
  invalid?: boolean;
}

const numberVariants = cva(
  "select-none relative rounded-lg flex items-center justify-center px-2 py-1",
  {
    variants: {
      variant: {
        default:
          "bg-mauve-700 text-white-100 data-[invalid=true]:bg-mauve-700 data-[invalid=true]:text-red-100 text-[80px]/[54px] xs:text-[96px]/[63px] md:text-[136px]/[89px] font-normal [&_span]:translate-y-[1.5px] xs:[&_span]:translate-y-[2px] md:[&_span]:translate-y-[3px]  shadow-[1px_1px_0px_0px_rgba(255,255,255,0.12)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
        secondary:
          "bg-black-800 text-mauve-100 text-[40px]/[30px] xs:text-[56px]/[38px] md:text-[88px]/[58px] font-normal [&_span]:translate-y-[1px] xs:[&_span]:translate-y-[1.5px] md:[&_span]:translate-y-[2.5px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const Num = ({
  value = 0,
  invalid = false,
  variant,
  className,
  style,
  ...props
}: NumberProps) => {
  return (
    <div
      data-invalid={invalid}
      className={cn(numberVariants({ variant, className }))}
      style={{
        textShadow: `4px 4px 0px rgba(28, 3, 101, ${variant === "secondary" ? 0.5 : 1})`,
        ...style,
      }}
      {...props}
    >
      <div className="overflow-clip h-full">
        <SlotCounter
          value={!value ? "???" : value.toString().padStart(3, "0")}
          startValueOnce
          duration={1.5}
          dummyCharacters={"0123456789".split("")}
          animateOnVisible={false}
          useMonospaceWidth
        />
      </div>
    </div>
  );
};
