import { cn } from "@/lib/utils";

export interface NotificationPingProps
  extends React.HTMLAttributes<HTMLSpanElement> {}

export const NotificationPing = ({
  className,
  ...props
}: NotificationPingProps) => {
  return (
    <span
      className={cn("absolute -top-1 -left-1 flex h-3 w-3", className)}
      {...props}
    >
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-100 opacity-75" />
      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-100" />
    </span>
  );
};
