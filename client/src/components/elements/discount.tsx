import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { useRef, useEffect, useState, useId } from "react";

const TRIANGLE_HEIGHT = 7;

const discountVariants = cva(
  "relative rounded-t-sm rounded-b overflow-hidden h-9 w-[52px]",
  {
    variants: {
      variant: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface DiscountProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof discountVariants> {
  label: string;
}

export function Discount({
  label,
  variant,
  className,
  ...props
}: DiscountProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const clipId = useId();

  useEffect(() => {
    if (contentRef.current) {
      const updateDimensions = () => {
        if (contentRef.current) {
          setDimensions({
            width: contentRef.current.offsetWidth,
            height: contentRef.current.offsetHeight,
          });
        }
      };
      updateDimensions();
      const resizeObserver = new ResizeObserver(updateDimensions);
      resizeObserver.observe(contentRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  return (
    <div className={cn(discountVariants({ variant, className }))} {...props}>
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
        style={{ height: "100%" }}
      >
        <defs>
          <clipPath id={clipId}>
            {dimensions.width > 0 && dimensions.height > 0 && (
              <polygon
                points={`0,0 ${dimensions.width},0 ${dimensions.width},${dimensions.height} ${dimensions.width / 2 + 1},${dimensions.height - TRIANGLE_HEIGHT} ${dimensions.width / 2 - 1},${dimensions.height - TRIANGLE_HEIGHT} 0,${dimensions.height}`}
              />
            )}
          </clipPath>
        </defs>
      </svg>
      <div
        ref={contentRef}
        className="h-full bg-green-100 flex items-start pt-[5px] justify-center shadow-[1px_1px_0px_0px_rgba(255,255,255,0.12)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]"
        style={{
          clipPath:
            dimensions.width > 0 && dimensions.height > 0
              ? `url(#${clipId})`
              : undefined,
        }}
      >
        <span className="text-sm text-gray-100 font-circular font-medium">
          {label}
        </span>
      </div>
    </div>
  );
}
