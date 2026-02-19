import { Toaster as Sonner } from "sonner";
import { useTheme } from "next-themes";
import { useMediaQuery } from "usehooks-ts";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ position, toastOptions, offset, mobileOffset, ...props }: ToasterProps) => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Header height: mobile = 64px (min-h-16), desktop = 96px (md:min-h-24)
  // Add 24px offset on top of header height
  const defaultOffset = { top: 120 }; // 96px (header) + 24px
  const defaultMobileOffset = { top: 88 }; // 64px (header) + 24px

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position={position || (isMobile ? "top-center" : "top-left")}
      offset={offset || defaultOffset}
      mobileOffset={mobileOffset || defaultMobileOffset}
      toastOptions={{
        classNames: {
          toast:
            "justify-between !bg-[#180840] !border-0 group toast group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg overflow-hidden after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-1 after:w-full after:bg-black-500 after:z-0 before:content-[''] before:absolute before:bottom-0 before:left-0 before:h-1 before:w-full before:bg-mauve-100 before:origin-left before:animate-toast-progress before:z-10",
          content: "!gap-1",
          ...toastOptions?.classNames,
        },
        ...toastOptions,
      }}
      {...props}
    />
  );
};

export { Toaster };
