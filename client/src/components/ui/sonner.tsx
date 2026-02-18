import { Toaster as Sonner } from "sonner";
import { useTheme } from "next-themes";
import { useMediaQuery } from "usehooks-ts";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ position, toastOptions, ...props }: ToasterProps) => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position={position || (isMobile ? "top-center" : "bottom-right")}
      toastOptions={{
        classNames: {
          toast:
            "!bg-black-300 !border-0 group toast group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg relative overflow-hidden after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-1 after:w-full after:bg-black-500 after:z-0 before:content-[''] before:absolute before:bottom-0 before:left-0 before:h-1 before:w-full before:bg-mauve-100 before:origin-left before:animate-toast-progress before:z-10",
          title: "!text-white-100 font-primary",
          description: "!text-white-200 font-sans",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          ...toastOptions?.classNames,
        },
        ...toastOptions,
      }}
      {...props}
    />
  );
};

export { Toaster };
