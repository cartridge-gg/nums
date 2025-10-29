import { ArrowLeft, ArrowRight, MoreHorizontal } from "lucide-react";
import * as React from "react";
import type { ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("list-none", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
  isDisabled?: boolean;
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">;

const PaginationLink = ({
  className,
  isActive,
  isDisabled,
  size = "icon",
  ...props
}: PaginationLinkProps) => {
  const baseStyles =
    "flex items-center justify-center rounded-lg font-[PixelGame] text-2xl";

  if (isActive) {
    return (
      <a
        aria-current="page"
        className={cn(baseStyles, "w-12 h-10 p-3 bg-purple-300", className)}
        style={{
          boxShadow:
            "1px 1px 0px 0px rgba(255, 255, 255, 0.08) inset, 1px 1px 0px 0px rgba(0, 0, 0, 0.12)",
          textShadow: "2px 2px 0px rgba(0, 0, 0, 1)",
        }}
        {...props}
      />
    );
  }

  return (
    <a
      className={cn(baseStyles, "w-12 h-10 p-3 bg-purple-600", className)}
      style={{
        boxShadow:
          "1px 1px 0px 0px rgba(255, 255, 255, 0.12) inset, 1px 1px 0px 0px rgba(0, 0, 0, 0.12)",
        textShadow: "2px 2px 0px rgba(0, 0, 0, 1)",
      }}
      {...props}
    />
  );
};
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({
  className,
  isDisabled,
  ...props
}: { isDisabled?: boolean } & React.ComponentProps<"a">) => {
  const baseStyles =
    "flex items-center justify-center rounded-lg w-10 h-10 p-2";

  return (
    <a
      aria-label="Go to previous page"
      className={cn(
        baseStyles,
        isDisabled ? "bg-purple-700" : "bg-purple-600",
        className,
      )}
      style={{
        boxShadow: isDisabled
          ? "1px 1px 0px 0px rgba(255, 255, 255, 0.04) inset, 1px 1px 0px 0px rgba(0, 0, 0, 0.04)"
          : "1px 1px 0px 0px rgba(255, 255, 255, 0.12) inset, 1px 1px 0px 0px rgba(0, 0, 0, 0.12)",
      }}
      {...props}
    >
      <ArrowLeft
        className="h-4 w-4"
        style={{
          filter: isDisabled
            ? "drop-shadow(2px 2px 0px rgba(0, 0, 0, 0.48))"
            : "drop-shadow(2px 2px 0px rgba(0, 0, 0, 0.95))",
          color: isDisabled
            ? "rgba(255, 255, 255, 0.48)"
            : "rgba(255, 255, 255, 1)",
        }}
      />
    </a>
  );
};
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
  className,
  isDisabled,
  ...props
}: { isDisabled?: boolean } & React.ComponentProps<"a">) => {
  const baseStyles =
    "flex items-center justify-center rounded-lg w-10 h-10 p-2";

  return (
    <a
      aria-label="Go to next page"
      className={cn(
        baseStyles,
        isDisabled ? "bg-purple-700" : "bg-purple-600",
        className,
      )}
      style={{
        boxShadow: isDisabled
          ? "1px 1px 0px 0px rgba(255, 255, 255, 0.04) inset, 1px 1px 0px 0px rgba(0, 0, 0, 0.04)"
          : "1px 1px 0px 0px rgba(255, 255, 255, 0.12) inset, 1px 1px 0px 0px rgba(0, 0, 0, 0.12)",
      }}
      {...props}
    >
      <ArrowRight
        className="h-4 w-4"
        style={{
          filter: isDisabled
            ? "drop-shadow(2px 2px 0px rgba(0, 0, 0, 0.48))"
            : "drop-shadow(2px 2px 0px rgba(0, 0, 0, 0.95))",
          color: isDisabled
            ? "rgba(255, 255, 255, 0.48)"
            : "rgba(255, 255, 255, 1)",
        }}
      />
    </a>
  );
};
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex w-12 h-10 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
