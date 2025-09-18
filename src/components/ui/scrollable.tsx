import { ScrollArea, ScrollAreaRootProps } from "@chakra-ui/react";
import { ReactNode } from "react";

export const Scrollable = ({
  // maxH,
  children,
  ...props
}: {
  // maxH?: string;
  children: ReactNode;
} & ScrollAreaRootProps) => {
  return (
    <ScrollArea.Root overflow="visible" w="full" {...props}>
      <ScrollArea.Viewport>
        <ScrollArea.Content
        //  paddingStart="6" paddingEnd="6"
        >
          {children}
        </ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar right="-10px !important">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
      <ScrollArea.Corner />
    </ScrollArea.Root>
  );
};
