import { useCallback, useId } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { ShareIcon, ShadowEffect, LinkIcon, XIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toast } from "./toast";
import { toast } from "sonner";
import { useMediaQuery } from "usehooks-ts";

export interface ShareProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof shareVariants> {
  username?: string | null;
  disabled?: boolean;
}

const shareVariants = cva(
  "select-none relative flex justify-center items-center rounded-lg p-2",
  {
    variants: {
      variant: {
        default:
          "bg-black-800 hover:bg-black-700 hover:cursor-pointer transition-colors duration-150 text-mauve-100",
      },
      size: {
        md: "h-10 w-10 md:h-12 md:w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export const Share = ({
  variant,
  size,
  className,
  username,
  disabled,
  ...props
}: ShareProps) => {
  const filterId = useId();

  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleShareOnX = useCallback(() => {
    if (!username) return;
    const url = new URL(window.location.href);
    const baseUrl = url.origin + url.pathname;
    const linkToShare = username
      ? `${baseUrl}?ref=${encodeURIComponent(username)}`
      : baseUrl;
    const text = `Numbers have been sorted.\nCheck and play now on Nums\n${linkToShare}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }, [username]);

  const handleCopyLink = useCallback(async () => {
    if (!username) return;
    const url = new URL(window.location.href);
    const baseUrl = url.origin + url.pathname;
    const linkToCopy = username
      ? `${baseUrl}?ref=${encodeURIComponent(username)}`
      : baseUrl;
    await navigator.clipboard.writeText(linkToCopy);
    toast(
      <Toast
        descriptionProps={{
          content: "Copied to clipboard",
        }}
        thumbnailProps={{
          type: "copy",
        }}
        duration={1500}
      />,
      {
        position: isMobile ? "bottom-center" : "bottom-right",
        duration: 1500,
      },
    );
  }, [username]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          disabled={disabled}
          variant="ghost"
          className={cn(shareVariants({ variant, size, className }))}
          {...props}
        >
          <ShadowEffect filterId={filterId} />
          <ShareIcon
            className="h-6 w-6 md:h-8 md:w-8"
            style={{ filter: `url(#${filterId})` }}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="rounded-2xl overflow-hidden p-0 text-white-300 bg-black-300">
        <DropdownMenuItem className="cursor-pointer p-0 hover:text-white-100">
          <Button
            variant="ghost"
            className="w-full justify-start p-2 hover:bg-black-700 gap-0.5"
            onClick={handleShareOnX}
          >
            <XIcon size="xs" />
            <p className="text-[16px]/[11px] px-1 translate-y-[1px] tracking-wider">
              Share on X
            </p>
          </Button>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer p-0 hover:text-white-100">
          <Button
            variant="ghost"
            className="w-full justify-start p-2 hover:bg-black-700 gap-0.5"
            onClick={handleCopyLink}
          >
            <LinkIcon size="sm" />
            <p className="text-[16px]/[11px] px-1 translate-y-[1px] tracking-wider">
              Copy Link
            </p>
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
