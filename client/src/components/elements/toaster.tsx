import { Toaster as Sonner } from "sonner";
import { useTheme } from "next-themes";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({
  position = "top-left",
  toastOptions,
  offset,
  mobileOffset,
  ...props
}: ToasterProps) => {
  const { theme } = useTheme();

  // Header height: mobile = 64px (min-h-16), desktop = 96px (md:min-h-24)
  // Add 24px offset on top of header height
  const defaultOffset = { top: 144, left: 16, right: 16 }; // 96px (header) + 32px (events) + 12px
  const defaultMobileOffset = { top: 104 }; // 64px (header) + 32px (events) + 8px

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position={position}
      offset={offset || defaultOffset}
      mobileOffset={mobileOffset || defaultMobileOffset}
      swipeDirections={["top", "right", "left"]}
      toastOptions={{
        classNames: {
          toast:
            "w-full !bg-transparent !p-0 !border-0 !shadow-[0_4px_4px_0px_rgba(0,0,0,0.25)]",
          content: "w-full",
          ...toastOptions?.classNames,
        },
        ...toastOptions,
      }}
      {...props}
    />
  );
};

export { Toaster };
