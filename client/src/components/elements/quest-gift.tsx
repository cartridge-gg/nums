import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GiftIcon } from "@/components/icons";

export interface QuestGiftProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof questGiftVariants> {
  direction?: "left" | "right";
}

const questGiftVariants = cva("select-none flex items-center cursor-pointer", {
  variants: {
    variant: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const ExpandedContent = ({ expanded }: { expanded: boolean }) => (
  <AnimatePresence mode="wait">
    {expanded ? (
      <motion.p
        key="text"
        className="font-primary text-[22px]/[18px] tracking-[0.03em] text-green-100 whitespace-nowrap !translate-y-0.5"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.15 }}
      >
        FREE GAME 1x
      </motion.p>
    ) : (
      <motion.div
        key="icon"
        className="flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.15 }}
      >
        <GiftIcon size="sm" className="text-green-100" />
      </motion.div>
    )}
  </AnimatePresence>
);

export const QuestGift = ({
  direction = "right",
  variant,
  className,
  ...props
}: QuestGiftProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn(questGiftVariants({ variant, className }))}
      onPointerDown={() => setExpanded(true)}
      onPointerUp={() => setExpanded(false)}
      onPointerLeave={() => setExpanded(false)}
      {...props}
    >
      {direction === "left" && (
        <div
          style={{
            width: 0,
            height: 0,
            borderTop: "8px solid transparent",
            borderBottom: "8px solid transparent",
            borderRight: "8px solid var(--green-700)",
          }}
        />
      )}
      {direction === "left" ? (
        <div className="relative" style={{ width: 40, height: 40 }}>
          <motion.div
            className={cn(
              "absolute top-0 right-0 z-10 flex items-center justify-center h-10 rounded-lg overflow-hidden bg-green-700 ",
              expanded && "bg-[#0D1831] md:bg-green-700",
            )}
            initial={false}
            animate={{ width: expanded ? 160 : 40 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <ExpandedContent expanded={expanded} />
          </motion.div>
        </div>
      ) : (
        <motion.div
          className={cn(
            "flex items-center justify-center h-10 rounded-lg overflow-hidden bg-green-700 ",
            expanded && "bg-[#0D1831] md:bg-green-700",
          )}
          initial={false}
          animate={{ width: expanded ? 160 : 40 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <ExpandedContent expanded={expanded} />
        </motion.div>
      )}
      {direction === "right" && (
        <div
          style={{
            width: 0,
            height: 0,
            borderTop: "8px solid transparent",
            borderBottom: "8px solid transparent",
            borderLeft: "8px solid var(--green-700)",
          }}
        />
      )}
    </div>
  );
};
